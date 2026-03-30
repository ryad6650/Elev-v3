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
    <div className="flex flex-col gap-1.5">
      {results.map((a, i) => (
        <button
          key={a.id || `off-${i}`}
          onClick={() => onSelect(a)}
          className="flex items-center justify-between w-full px-3 py-3 rounded-xl text-left"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {a.nom}
              </p>
              {a.source === 'openfoodfacts' && (
                <span
                  className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  OFT
                </span>
              )}
            </div>
            {a.marque && (
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {a.marque}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              P&nbsp;{a.proteines ?? 0}g · G&nbsp;{a.glucides ?? 0}g · L&nbsp;{a.lipides ?? 0}g
              &nbsp;/ 100g
            </p>
          </div>
          <span
            className="text-sm font-semibold ml-3 shrink-0"
            style={{ color: 'var(--accent-text)' }}
          >
            {a.calories} kcal
          </span>
        </button>
      ))}
    </div>
  );
}
