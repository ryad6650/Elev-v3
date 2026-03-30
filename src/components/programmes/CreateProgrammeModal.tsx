'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import SemaineVisuelle from './SemaineVisuelle';
import { createProgramme } from '@/app/actions/programmes';

const DIFFICULTES = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
] as const;

interface Props {
  routinesDisponibles: { id: string; nom: string }[];
  onClose: () => void;
}

export default function CreateProgrammeModal({ routinesDisponibles, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nom, setNom] = useState('');
  const [difficulte, setDifficulte] = useState<'debutant' | 'intermediaire' | 'avance'>('intermediaire');
  const [durée, setDuree] = useState<number | null>(null);
  const [jours, setJours] = useState<number[]>([0, 2, 4]);
  const [routinesParJour, setRoutinesParJour] = useState<Record<number, string>>({});

  function toggleJour(jour: number) {
    setJours((prev) => prev.includes(jour) ? prev.filter((j) => j !== jour) : [...prev, jour].sort((a, b) => a - b));
  }

  function handleSubmit() {
    if (!nom.trim()) return;
    startTransition(async () => {
      await createProgramme({ nom: nom.trim(), difficulte, duree_semaines: durée, jours, routinesParJour });
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
      <div className="rounded-t-3xl flex flex-col" style={{ background: 'var(--bg-secondary)', maxHeight: '88vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nouveau programme · Étape {step}/3
          </p>
          <button onClick={onClose} className="p-1">
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="px-5 pb-8 overflow-y-auto flex flex-col gap-4">

          {/* ─── Étape 1 : infos générales ─── */}
          {step === 1 && (
            <>
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                Infos générales
              </h3>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Nom du programme *
                </label>
                <input
                  autoFocus
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : PPL Printemps"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>
                  Niveau
                </label>
                <div className="flex gap-2">
                  {DIFFICULTES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDifficulte(value)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={difficulte === value
                        ? { border: '1.5px solid var(--accent)', background: 'rgba(232,134,12,0.1)', color: 'var(--accent-text)' }
                        : { border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Durée (semaines)
                </label>
                <div className="flex gap-2 items-center">
                  <div
                    className="flex-1 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: durée === null ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: durée === null ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    }}
                  >
                    {durée === null ? 'Sans limite' : `${durée} semaine${durée > 1 ? 's' : ''}`}
                  </div>
                  {durée === null ? (
                    <button
                      type="button"
                      onClick={() => setDuree(8)}
                      className="px-3 py-3 rounded-xl text-xs font-medium whitespace-nowrap"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--accent-text)', border: '1px solid var(--border)' }}
                    >
                      + Ajouter une durée
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        value={durée}
                        min={1}
                        max={52}
                        onChange={(e) => setDuree(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-3 py-3 rounded-xl text-sm outline-none text-center"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setDuree(null)}
                        className="px-3 py-3 rounded-xl text-xs font-medium whitespace-nowrap"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      >
                        Retirer
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!nom.trim()}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                style={{ background: 'var(--accent)', opacity: nom.trim() ? 1 : 0.4 }}
              >
                Choisir les jours →
              </button>
            </>
          )}

          {/* ─── Étape 2 : jours ─── */}
          {step === 2 && (
            <>
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                Jours d&apos;entraînement
              </h3>
              <p className="text-sm -mt-2" style={{ color: 'var(--text-secondary)' }}>
                Appuie sur un jour pour l&apos;activer.
              </p>
              <SemaineVisuelle joursActifs={jours} interactive onToggle={toggleJour} />
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                {jours.length} jour{jours.length > 1 ? 's' : ''} sélectionné{jours.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-medium"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'transparent' }}
                >
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={jours.length === 0}
                  className="flex-[2] py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                  style={{ background: 'var(--accent)', opacity: jours.length > 0 ? 1 : 0.4 }}
                >
                  Assigner les routines →
                </button>
              </div>
            </>
          )}

          {/* ─── Étape 3 : routines par jour ─── */}
          {step === 3 && (
            <>
              <h3 className="text-2xl" style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                Routines par jour
              </h3>
              {jours.map((jour) => {
                const NOMS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                return (
                  <div key={jour} className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      {NOMS[jour]}
                    </p>
                    <select
                      value={routinesParJour[jour] ?? ''}
                      onChange={(e) => setRoutinesParJour((prev) => ({ ...prev, [jour]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                      <option value="">— Choisir une routine —</option>
                      {routinesDisponibles.map((r) => (
                        <option key={r.id} value={r.id}>{r.nom}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 rounded-xl text-sm font-medium"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', background: 'transparent' }}
                >
                  ← Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={pending}
                  className="flex-[2] py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                  style={{ background: 'var(--accent)', opacity: pending ? 0.6 : 1 }}
                >
                  {pending ? 'Création...' : 'Créer le programme ✓'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
