'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CaloriesRing from '@/components/dashboard/CaloriesRing';
import type { NutritionProfile } from '@/lib/nutrition-utils';

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MacroBar({ label, value, max, color }: MacroBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max * 1.05;
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span
          className="text-xs font-semibold"
          style={{ color: isOver ? 'var(--danger)' : 'var(--text-secondary)' }}
        >
          {value}g
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-right text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
        / {max}g
      </p>
    </div>
  );
}

interface Props {
  date: string;
  totalCalories: number;
  totalProteines: number;
  totalGlucides: number;
  totalLipides: number;
  profile: NutritionProfile;
}

export default function NutritionHeader({
  date,
  totalCalories,
  totalProteines,
  totalGlucides,
  totalLipides,
  profile,
}: Props) {
  const router = useRouter();

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
    const next = d.toISOString().split('T')[0];
    router.push(`/nutrition?date=${next}`);
  }

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
    >
      {/* Navigation date */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full"
          style={{ background: 'var(--bg-card)' }}
        >
          <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          {formatLabel(date)}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-full"
          style={{ background: 'var(--bg-card)' }}
        >
          <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Anneau + macros */}
      <div className="flex items-center gap-5">
        <CaloriesRing consumed={totalCalories} objective={profile.objectif_calories} />
        <div className="flex-1 flex flex-col gap-3">
          <MacroBar
            label="Protéines"
            value={totalProteines}
            max={profile.objectif_proteines ?? 150}
            color="var(--color-protein)"
          />
          <MacroBar
            label="Glucides"
            value={totalGlucides}
            max={profile.objectif_glucides ?? 250}
            color="var(--color-carbs)"
          />
          <MacroBar
            label="Lipides"
            value={totalLipides}
            max={profile.objectif_lipides ?? 70}
            color="var(--color-fat)"
          />
        </div>
      </div>
    </div>
  );
}
