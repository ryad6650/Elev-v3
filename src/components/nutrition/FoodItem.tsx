'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteNutritionEntry } from '@/app/actions/nutrition';
import { calcNutrients } from '@/lib/nutrition-utils';
import type { NutritionEntry } from '@/lib/nutrition-utils';

interface Props {
  entry: NutritionEntry;
}

export default function FoodItem({ entry }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const n = calcNutrients(entry.aliment, entry.quantite_g);

  function handleDelete() {
    startTransition(async () => {
      await deleteNutritionEntry(entry.id);
      router.refresh();
    });
  }

  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {entry.aliment.nom}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {entry.quantite_g}g · P&nbsp;{n.proteines}g · G&nbsp;{n.glucides}g · L&nbsp;{n.lipides}g
        </p>
      </div>
      <span
        className="text-sm font-bold shrink-0"
        style={{ color: 'var(--accent-text)' }}
      >
        {n.calories} kcal
      </span>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="p-1.5 rounded-lg transition-opacity"
        style={{ background: 'var(--bg-card)', opacity: pending ? 0.4 : 1 }}
        aria-label="Supprimer"
      >
        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
      </button>
    </div>
  );
}
