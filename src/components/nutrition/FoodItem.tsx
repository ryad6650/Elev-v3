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
      className="flex items-center gap-2 py-2.5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <p className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
        {entry.aliment.nom}{' '}
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({entry.quantite_g}g)</span>
      </p>
      <p className="text-xs shrink-0 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
        P&nbsp;{n.proteines}g&ensp;G&nbsp;{n.glucides}g&ensp;L&nbsp;{n.lipides}g
      </p>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="p-1 rounded-lg shrink-0 transition-opacity"
        style={{ opacity: pending ? 0.3 : 0.5 }}
        aria-label="Supprimer"
      >
        <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}
