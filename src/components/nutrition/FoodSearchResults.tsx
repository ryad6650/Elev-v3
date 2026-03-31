import { Plus } from 'lucide-react';
import type { NutritionAliment } from '@/lib/nutrition-utils';

interface Props {
  results: NutritionAliment[];
  onSelect: (aliment: NutritionAliment) => void;
  loading: boolean;
  emptyMessage?: string;
}

export default function FoodSearchResults({
  results,
  onSelect,
  loading,
  emptyMessage = 'Aucun résultat',
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {results.map((a, i) => (
        <button
          key={a.id || `off-${i}`}
          onClick={() => onSelect(a)}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-left transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Avatar monogramme */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent-text)' }}
          >
            {a.nom.charAt(0).toUpperCase()}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {a.nom}
              </span>
              {a.source === 'openfoodfacts' && (
                <span
                  className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  OFT
                </span>
              )}
            </div>
            {a.marque && (
              <p className="text-[11px] truncate mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {a.marque}
              </p>
            )}
            <div className="flex gap-1.5">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}>
                P&nbsp;{a.proteines ?? 0}g
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(234,179,8,0.15)', color: '#FDE047' }}>
                G&nbsp;{a.glucides ?? 0}g
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5' }}>
                L&nbsp;{a.lipides ?? 0}g
              </span>
            </div>
          </div>

          {/* Calories + bouton + */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-right">
              <span className="text-[19px] font-extrabold leading-none" style={{ color: 'var(--accent-text)' }}>
                {a.calories}
              </span>
              <span className="block text-[9px]" style={{ color: 'var(--text-muted)' }}>kcal/100g</span>
            </div>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-bg)' }}
            >
              <Plus size={13} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
