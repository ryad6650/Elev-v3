'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import FoodItem from './FoodItem';
import { sumEntries } from '@/lib/nutrition-utils';
import type { NutritionEntry } from '@/lib/nutrition-utils';

const REPAS_CONFIG: Record<string, { label: string; emoji: string }> = {
  'petit-dejeuner': { label: 'Petit-déjeuner', emoji: '🌅' },
  dejeuner: { label: 'Déjeuner', emoji: '☀️' },
  diner: { label: 'Dîner', emoji: '🌙' },
  snacks: { label: 'Collation', emoji: '🍎' },
};

interface Props {
  repas: 'petit-dejeuner' | 'dejeuner' | 'diner' | 'snacks';
  entries: NutritionEntry[];
  onAdd: () => void;
}

export default function MealSection({ repas, entries, onAdd }: Props) {
  const config = REPAS_CONFIG[repas];
  const [expanded, setExpanded] = useState(repas === 'petit-dejeuner');
  const total = sumEntries(entries);

  return (
    <div
      className="rounded-2xl mb-3 overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="flex">
        {/* Barre accent gauche */}
        <div className="w-1 shrink-0" style={{ background: 'var(--accent)' }} />

        {/* Contenu */}
        <div className="flex-1 p-4">
          {/* En-tête cliquable */}
          <button
            className="w-full flex items-center gap-3 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <span className="text-xl shrink-0">{config.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {config.label}
              </p>
              {entries.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {total.calories} kcal · P {total.proteines}g · G {total.glucides}g · L {total.lipides}g
                </p>
              )}
            </div>
            {expanded ? (
              <ChevronDown size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight size={16} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>

          {/* Liste aliments + bouton ajouter (déplié) */}
          {expanded && (
            <div className="mt-3">
              {entries.map((e) => (
                <FoodItem key={e.id} entry={e} />
              ))}
              <button
                onClick={onAdd}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-opacity active:opacity-70"
                style={{
                  border: '1.5px dashed var(--accent)',
                  color: 'var(--accent)',
                  background: 'transparent',
                }}
              >
                + Ajouter un aliment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
