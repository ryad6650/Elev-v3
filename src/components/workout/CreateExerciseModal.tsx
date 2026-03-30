'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { createExercise } from '@/app/actions/workout';

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: (ex: Exercise) => void;
}

const GROUPES = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets',
];

const EQUIPEMENTS = [
  'Barre', 'Haltères', 'Machine', 'Poulie / Câble',
  'Poids du corps', 'Corde', 'Kettlebell', 'Smith machine', 'Bande élastique',
];

export default function CreateExerciseModal({ onClose, onCreated }: Props) {
  const [nom, setNom] = useState('');
  const [groupe, setGroupe] = useState('');
  const [equipement, setEquipement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = nom.trim().length >= 2 && groupe !== '';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const ex = await createExercise({
        nom: nom.trim(),
        groupe_musculaire: groupe,
        equipement: equipement || null,
      });
      onCreated(ex);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-2xl px-4 pt-5 pb-8 space-y-5"
        style={{ background: 'var(--bg-secondary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Nouvel exercice
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Nom de l&apos;exercice *
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Ex : Curl incliné haltères"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Groupe musculaire */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Groupe musculaire *
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUPES.map((g) => (
              <button
                key={g}
                onClick={() => setGroupe(g === groupe ? '' : g)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: groupe === g ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: groupe === g ? 'white' : 'var(--text-secondary)',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Équipement */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Équipement <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EQUIPEMENTS.map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipement(eq === equipement ? '' : eq)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: equipement === eq ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: equipement === eq ? 'white' : 'var(--text-secondary)',
                }}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
        )}

        {/* Bouton valider */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: canSubmit && !loading ? 'var(--accent)' : 'var(--bg-elevated)',
            color: canSubmit && !loading ? 'white' : 'var(--text-muted)',
            cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? (
            'Création...'
          ) : (
            <>
              <Check size={16} />
              Créer l&apos;exercice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
