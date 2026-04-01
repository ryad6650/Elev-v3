'use client';

import type { NutritionProfile } from '@/lib/nutrition-utils';

interface MacroCardProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MacroCard({ label, value, max, color }: MacroCardProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      className="flex-1 rounded-2xl px-3 py-3 flex flex-col gap-1.5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <span className="text-lg font-bold leading-none" style={{ color }}>
        {value}g
      </span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface Props {
  totalCalories: number;
  totalProteines: number;
  totalGlucides: number;
  totalLipides: number;
  profile: NutritionProfile;
}

export default function NutritionHeader({
  totalCalories,
  totalProteines,
  totalGlucides,
  totalLipides,
  profile,
}: Props) {
  const objectif = profile.objectif_calories ?? 2000;
  const pct = objectif > 0 ? Math.round((totalCalories / objectif) * 100) : 0;
  const restantes = Math.max(0, objectif - totalCalories);

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* Calories + restantes */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold leading-none" style={{ color: 'var(--text-primary)', fontSize: 36 }}>
            {totalCalories.toLocaleString('fr-FR')}{' '}
            <span style={{ fontSize: 20, fontWeight: 600 }}>kcal</span>
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            sur {objectif.toLocaleString('fr-FR')} kcal
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-bold" style={{ fontSize: 24, color: 'var(--accent-text)' }}>
            {restantes.toLocaleString('fr-FR')}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>restantes</span>
        </div>
      </div>

      {/* Barre de progression calories */}
      <div className="mb-3">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-bg)' }}>
          <div
            className="h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(Math.min(pct, 100), 3)}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* 3 cartes macros */}
      <div className="flex gap-2">
        <MacroCard
          label="Glucides"
          value={totalGlucides}
          max={profile.objectif_glucides ?? 250}
          color="var(--color-carbs)"
        />
        <MacroCard
          label="Protéines"
          value={totalProteines}
          max={profile.objectif_proteines ?? 150}
          color="var(--color-protein)"
        />
        <MacroCard
          label="Lipides"
          value={totalLipides}
          max={profile.objectif_lipides ?? 70}
          color="#C084FC"
        />
      </div>
    </div>
  );
}
