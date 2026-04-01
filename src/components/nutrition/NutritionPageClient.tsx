'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import NutritionHeader from './NutritionHeader';
import MealSection from './MealSection';
import AddFoodModal from './AddFoodModal';
import { sumEntries } from '@/lib/nutrition-utils';
import type { NutritionPageData } from '@/lib/nutrition-utils';
import { fetchNutritionData } from '@/lib/nutrition';
import { createClient } from '@/lib/supabase/client';
import { getCached, setCache } from '@/lib/pageCache';

const REPAS_ORDER = ['petit-dejeuner', 'dejeuner', 'diner', 'snacks'] as const;
type Repas = (typeof REPAS_ORDER)[number];

function cacheKey(date: string) { return `nutrition:${date}`; }

export default function NutritionPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split('T')[0];
  const date = searchParams.get('date') ?? today;

  const [data, setData] = useState<NutritionPageData | null>(getCached<NutritionPageData>(cacheKey(date)));
  const [modalRepas, setModalRepas] = useState<Repas | null>(null);
  const supabaseRef = createClient();

  function refreshData() {
    fetchNutritionData(supabaseRef, date).then((d) => {
      setData(d);
      setCache(cacheKey(date), d);
    }).catch(console.error);
  }

  useEffect(() => {
    const cached = getCached<NutritionPageData>(cacheKey(date));
    if (cached) setData(cached);
    else setData(null);

    fetchNutritionData(supabaseRef, date).then((d) => {
      setData(d);
      setCache(cacheKey(date), d);
    }).catch(console.error);
  }, [date]);

  if (!data) return (
    <main className="px-4 pt-6" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="flex items-center justify-center" style={{ height: '50vh' }}>
        <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    </main>
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
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split('T')[0]}`);
  }

  const total = sumEntries(data.entries);

  const entriesByRepas = REPAS_ORDER.reduce(
    (acc, repas) => {
      acc[repas] = data.entries.filter((e) => e.repas === repas);
      return acc;
    },
    {} as Record<Repas, typeof data.entries>
  );

  return (
    <>
      <main className="px-4 pt-6 pb-28 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-3xl leading-tight"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            Nutrition
          </h1>
          <div className="flex items-center rounded-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <button onClick={() => navigate(-1)} className="p-2" aria-label="Jour précédent">
              <ChevronLeft size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <span className="text-xs font-medium px-1" style={{ color: 'var(--text-primary)' }}>
              {formatLabel(date)}
            </span>
            <button onClick={() => navigate(1)} className="p-2" aria-label="Jour suivant">
              <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          KCALORIES
        </p>

        <NutritionHeader
          totalCalories={total.calories}
          totalProteines={total.proteines}
          totalGlucides={total.glucides}
          totalLipides={total.lipides}
          profile={data.profile}
        />

        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
          REPAS
        </p>

        {REPAS_ORDER.map((repas) => (
          <MealSection
            key={repas}
            repas={repas}
            entries={entriesByRepas[repas]}
            onAdd={() => setModalRepas(repas)}
            onEntryDeleted={(id) => {
              setData(prev => prev ? { ...prev, entries: prev.entries.filter(e => e.id !== id) } : prev);
            }}
          />
        ))}

        <div className="rounded-2xl p-4 mt-1" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>AJOUTER</p>
              <p className="text-xl leading-tight" style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                Nouveau repas
              </p>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }} aria-label="Ajouter un repas">
              <Plus size={18} color="white" />
            </button>
          </div>
        </div>
      </main>

      {modalRepas && (
        <AddFoodModal
          repas={modalRepas}
          date={data.date}
          onClose={() => {
            setModalRepas(null);
            refreshData();
          }}
        />
      )}
    </>
  );
}
