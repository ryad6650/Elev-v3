'use client';

import { Plus } from 'lucide-react';
import FoodItem from './FoodItem';
import { sumEntries } from '@/lib/nutrition-utils';
import type { NutritionEntry } from '@/lib/nutrition-utils';

const REPAS_LABELS: Record<string, string> = {
  'petit-dejeuner': '🌅 Petit-déjeuner',
  'dejeuner': '☀️ Déjeuner',
  'diner': '🌙 Dîner',
  'snacks': '🍎 Collations',
};

interface Props {
  repas: 'petit-dejeuner' | 'dejeuner' | 'diner' | 'snacks';
  entries: NutritionEntry[];
  onAdd: () => void;
}

export default function MealSection({ repas, entries, onAdd }: Props) {
  const total = sumEntries(entries);

  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* En-tête repas */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {REPAS_LABELS[repas]}
          </h3>
          {entries.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {total.calories} kcal · P {total.proteines}g · G {total.glucides}g · L {total.lipides}g
            </p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          <Plus size={13} />
          Ajouter
        </button>
      </div>

      {/* Liste aliments */}
      {entries.length === 0 ? (
        <p className="text-xs py-1" style={{ color: 'var(--text-muted)' }}>
          Aucun aliment enregistré
        </p>
      ) : (
        <div>
          {entries.map((e) => (
            <FoodItem key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
