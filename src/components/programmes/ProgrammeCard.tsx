'use client';

import { ChevronRight } from 'lucide-react';
import type { Programme } from '@/lib/programmes';

const DIFFICULTE_STYLE = {
  debutant:     { bg: 'rgba(34,197,94,0.15)',  text: '#22C55E', label: 'Débutant' },
  intermediaire:{ bg: 'rgba(232,134,12,0.15)', text: '#FDBA74', label: 'Intermédiaire' },
  avance:       { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444', label: 'Avancé' },
};

interface Props {
  programme: Programme;
  estActif: boolean;
  onClick: () => void;
}

export default function ProgrammeCard({ programme, estActif, onClick }: Props) {
  const diff = DIFFICULTE_STYLE[programme.difficulte] ?? DIFFICULTE_STYLE.intermediaire;
  const nbJours = programme.jours.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-4 mb-3 transition-all active:scale-[0.99]"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: estActif ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <h3
          className="text-xl leading-tight"
          style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
        >
          {programme.nom}
        </h3>
        <ChevronRight size={16} className="shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
      </div>

      {programme.description && (
        <p className="text-sm mb-3 truncate" style={{ color: 'var(--text-secondary)' }}>
          {programme.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: diff.bg, color: diff.text }}>
          {diff.label}
        </span>
        {nbJours > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            · {nbJours}j / sem
          </span>
        )}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          · {programme.duree_semaines} semaines
        </span>
        {estActif && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md ml-auto" style={{ background: 'rgba(232,134,12,0.15)', color: 'var(--accent)' }}>
            En cours
          </span>
        )}
      </div>

      {estActif && programme.progres && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>Progression</span>
            <span>Semaine {programme.progres.semaine_actuelle} / {programme.progres.total_semaines}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                background: 'var(--accent)',
                width: `${Math.round(((programme.progres.semaine_actuelle - 1) / programme.progres.total_semaines) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </button>
  );
}
