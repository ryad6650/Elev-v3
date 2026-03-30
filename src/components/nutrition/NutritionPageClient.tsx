'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import NutritionHeader from './NutritionHeader';
import MealSection from './MealSection';
import AddFoodModal from './AddFoodModal';
import { sumEntries } from '@/lib/nutrition-utils';
import type { NutritionPageData } from '@/lib/nutrition-utils';

const REPAS_ORDER = ['petit-dejeuner', 'dejeuner', 'diner', 'snacks'] as const;
type Repas = (typeof REPAS_ORDER)[number];

interface Props {
  data: NutritionPageData;
}

export default function NutritionPageClient({ data }: Props) {
  const [modalRepas, setModalRepas] = useState<Repas | null>(null);
  const router = useRouter();
  const total = sumEntries(data.entries);

  const entriesByRepas = REPAS_ORDER.reduce(
    (acc, repas) => {
      acc[repas] = data.entries.filter((e) => e.repas === repas);
      return acc;
    },
    {} as Record<Repas, typeof data.entries>
  );

  function formatLabel(d: string) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (d === today) return "Aujourd'hui";
    if (d === yesterday) return 'Hier';
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  function navigate(delta: number) {
    const d = new Date(data.date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split('T')[0]}`);
  }

  return (
    <main className="px-4 pt-6 pb-28 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Ligne titre + navigation date */}
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
          }}
        >
          Nutrition
        </h1>
        <div
          className="flex items-center rounded-full"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label="Jour précédent"
          >
            <ChevronLeft size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="text-xs font-medium px-1" style={{ color: 'var(--text-primary)' }}>
            {formatLabel(data.date)}
          </span>
          <button
            onClick={() => navigate(1)}
            className="p-2"
            aria-label="Jour suivant"
          >
            <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      <NutritionHeader
        totalCalories={total.calories}
        totalProteines={total.proteines}
        totalGlucides={total.glucides}
        totalLipides={total.lipides}
        profile={data.profile}
      />

      {/* Label section */}
      <p
        className="text-xs font-semibold mb-3"
        style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
      >
        REPAS
      </p>

      {REPAS_ORDER.map((repas) => (
        <MealSection
          key={repas}
          repas={repas}
          entries={entriesByRepas[repas]}
          onAdd={() => setModalRepas(repas)}
        />
      ))}

      {/* Nouveau repas */}
      <div
        className="rounded-2xl p-4 mt-1"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}
            >
              AJOUTER
            </p>
            <p
              className="text-xl leading-tight"
              style={{
                fontFamily: 'var(--font-dm-serif)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
              }}
            >
              Nouveau repas
            </p>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)' }}
            aria-label="Ajouter un repas"
          >
            <Plus size={18} color="white" />
          </button>
        </div>
      </div>

      {modalRepas && (
        <AddFoodModal
          repas={modalRepas}
          date={data.date}
          onClose={() => setModalRepas(null)}
        />
      )}
    </main>
  );
}
