'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SemaineVisuelle from './SemaineVisuelle';
import { activerProgramme, deleteProgramme } from '@/app/actions/programmes';
import type { Programme } from '@/lib/programmes';

const DIFFICULTE_STYLE = {
  debutant:     { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', label: 'Débutant' },
  intermediaire:{ bg: 'rgba(232,134,12,0.15)', text: '#FDBA74', label: 'Intermédiaire' },
  avance:       { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', label: 'Avancé' },
};

interface Props {
  programme: Programme;
  estActif: boolean;
  onClose: () => void;
}

export default function ProgrammeDetail({ programme, estActif, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const diff = DIFFICULTE_STYLE[programme.difficulte] ?? DIFFICULTE_STYLE.intermediaire;
  const nbSeances = programme.jours.length;

  function handleActiver() {
    startTransition(async () => {
      await activerProgramme(programme.id);
      router.refresh();
      onClose();
    });
  }

  function handleSupprimer() {
    if (!confirm(`Supprimer "${programme.nom}" ?`)) return;
    startTransition(async () => {
      await deleteProgramme(programme.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-t-3xl overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', maxHeight: '88vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--bg-elevated)' }} />
        </div>

        <div className="px-5 pb-10">
          {/* En-tête */}
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 mt-3" style={{ color: 'var(--text-muted)' }}>
            Programme
          </p>
          <h2
            className="text-3xl leading-tight mb-2"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            {programme.nom}
          </h2>
          {programme.description && (
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {programme.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: diff.bg, color: diff.text }}>
              {diff.label}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              {programme.duree_semaines} semaines
            </span>
            {nbSeances > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                {nbSeances}j / sem
              </span>
            )}
          </div>

          {/* Planning */}
          {programme.jours.length > 0 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Planning
              </p>
              <SemaineVisuelle joursActifs={programme.jours} />
              <p className="text-xs mt-2 mb-5" style={{ color: 'var(--text-muted)' }}>
                {nbSeances} séance{nbSeances > 1 ? 's' : ''} · repos les autres jours
              </p>
            </>
          )}

          {/* Routines */}
          {programme.routines.length > 0 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Routines
              </p>
              <div className="space-y-2 mb-6">
                {programme.routines.map((r) => (
                  <div
                    key={r.jour}
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-muted)' }}>
                        {r.label}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.nom}</p>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.nbExercices} exos</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            {estActif ? (
              <div
                className="w-full py-3.5 rounded-xl text-center text-sm font-semibold"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
              >
                Programme actif ✓
              </div>
            ) : (
              <button
                onClick={handleActiver}
                disabled={pending}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                style={{ background: 'var(--accent)', opacity: pending ? 0.6 : 1 }}
              >
                Activer ce programme →
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'transparent' }}
            >
              Fermer
            </button>
            <button
              onClick={handleSupprimer}
              disabled={pending}
              className="w-full py-2 text-xs transition-opacity"
              style={{ color: 'var(--danger)', opacity: pending ? 0.5 : 1 }}
            >
              Supprimer ce programme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
