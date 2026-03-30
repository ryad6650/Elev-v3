'use client';

import { useState } from 'react';
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
  const total = sumEntries(data.entries);

  const entriesByRepas = REPAS_ORDER.reduce(
    (acc, repas) => {
      acc[repas] = data.entries.filter((e) => e.repas === repas);
      return acc;
    },
    {} as Record<Repas, typeof data.entries>
  );

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: '0 auto' }}
    >
      <h1
        className="text-3xl leading-tight mb-5"
        style={{
          fontFamily: 'var(--font-dm-serif)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
        }}
      >
        Nutrition
      </h1>

      <NutritionHeader
        date={data.date}
        totalCalories={total.calories}
        totalProteines={total.proteines}
        totalGlucides={total.glucides}
        totalLipides={total.lipides}
        profile={data.profile}
      />

      {REPAS_ORDER.map((repas) => (
        <MealSection
          key={repas}
          repas={repas}
          entries={entriesByRepas[repas]}
          onAdd={() => setModalRepas(repas)}
        />
      ))}

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
