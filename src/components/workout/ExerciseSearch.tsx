'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, ChevronDown, PenLine } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import CreateExerciseModal from './CreateExerciseModal';

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
}

interface Props {
  onClose: () => void;
  onSelect?: (ex: Exercise) => void;
}

const GROUPES = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets',
];

const EQUIPEMENTS = [
  'Barre', 'Haltères', 'Machine', 'Poulie / Câble',
  'Poids du corps', 'Corde', 'Kettlebell', 'Smith machine', 'Bande élastique',
];

// Badge couleur par équipement
const EQUIPEMENT_COLOR: Record<string, string> = {
  'Barre': '#6366F1',
  'Haltères': '#3B82F6',
  'Machine': '#8B5CF6',
  'Poulie / Câble': '#06B6D4',
  'Poids du corps': '#22C55E',
  'Corde': '#F59E0B',
  'Kettlebell': '#EF4444',
  'Smith machine': '#EC4899',
  'Bande élastique': '#14B8A6',
};

export default function ExerciseSearch({ onClose, onSelect }: Props) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [groupe, setGroupe] = useState('');
  const [equipement, setEquipement] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEquipement, setShowEquipement] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce saisie texte
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  // Fetch exercices
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (groupe) params.set('groupe', groupe);
    if (equipement) params.set('equipement', equipement);
    setLoading(true);
    fetch(`/api/exercises?${params}`)
      .then((r) => r.json())
      .then((data: Exercise[]) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, groupe, equipement]);

  const handleAdd = (ex: Exercise) => {
    if (onSelect) {
      onSelect(ex);
    } else {
      addExercise({
        exerciseId: ex.id,
        nom: ex.nom,
        groupeMusculaire: ex.groupe_musculaire,
        ordre: 0,
        seriesCible: 3,
        repsCible: 10,
        repsCibleMax: null,
      });
      onClose();
    }
  };

  const handleCreated = (ex: Exercise) => {
    setShowCreate(false);
    handleAdd(ex);
  };

  const activeFilters = [groupe, equipement].filter(Boolean).length;

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[55] flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-4 border-b"
        style={{ borderColor: 'var(--border)', paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <X size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <h2 className="text-lg font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
          Ajouter un exercice
        </h2>
        {activeFilters > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            {activeFilters} filtre{activeFilters > 1 ? 's' : ''}
          </span>
        )}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent-text)' }}
        >
          <PenLine size={13} />
          Créer
        </button>
      </div>

      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Recherche texte avec autocomplete */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher un exercice..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          {q && (
            <button onClick={() => setQ('')}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Filtre groupe musculaire */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['Tout', ...GROUPES].map((g) => {
            const active = g === 'Tout' ? !groupe : groupe === g;
            return (
              <button
                key={g}
                onClick={() => setGroupe(g === 'Tout' ? '' : g)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Filtre équipement (accordion) */}
        <button
          onClick={() => setShowEquipement(!showEquipement)}
          className="flex items-center gap-2 text-xs font-semibold"
          style={{ color: equipement ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <ChevronDown
            size={14}
            style={{ transform: showEquipement ? 'rotate(180deg)' : 'none', transition: '200ms' }}
          />
          {equipement || 'Filtrer par équipement'}
          {equipement && (
            <span
              onClick={(e) => { e.stopPropagation(); setEquipement(''); }}
              className="ml-1 px-1.5 py-0.5 rounded-full text-white"
              style={{ background: 'var(--accent)', fontSize: '10px' }}
            >
              ×
            </span>
          )}
        </button>

        {showEquipement && (
          <div className="flex flex-wrap gap-2 pb-1">
            {EQUIPEMENTS.map((eq) => {
              const active = equipement === eq;
              const color = EQUIPEMENT_COLOR[eq] ?? 'var(--text-secondary)';
              return (
                <button
                  key={eq}
                  onClick={() => { setEquipement(active ? '' : eq); setShowEquipement(false); }}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? color : 'var(--bg-elevated)',
                    color: active ? 'white' : 'var(--text-secondary)',
                    border: active ? 'none' : `1px solid ${color}40`,
                  }}
                >
                  {eq}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
        {/* Compteur résultats */}
        {!loading && results.length > 0 && (
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {results.length} exercice{results.length > 1 ? 's' : ''}
          </p>
        )}

        {loading && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Chargement...
          </p>
        )}
        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center gap-4 mt-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun exercice trouvé
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-text)', border: '1px solid var(--accent)' }}
            >
              <PenLine size={15} />
              Créer &quot;{q || 'un exercice personnalisé'}&quot;
            </button>
          </div>
        )}

        {results.map((ex) => {
          const badgeColor = EQUIPEMENT_COLOR[ex.equipement ?? ''] ?? 'var(--text-muted)';
          return (
            <button
              key={ex.id}
              onClick={() => handleAdd(ex)}
              className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-opacity active:opacity-70"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {ex.nom}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {ex.groupe_musculaire}
                  </span>
                  {ex.equipement && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${badgeColor}20`, color: badgeColor }}
                    >
                      {ex.equipement}
                    </span>
                  )}
                </div>
              </div>
              <Plus size={18} className="shrink-0 ml-3" style={{ color: 'var(--accent)' }} />
            </button>
          );
        })}
      </div>

      {showCreate && (
        <CreateExerciseModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
