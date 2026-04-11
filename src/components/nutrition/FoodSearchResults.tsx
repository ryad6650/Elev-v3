import { memo, useState, useCallback } from "react";
import { Plus, Check } from "lucide-react";
import type { NutritionAliment } from "@/lib/nutrition-utils";

interface Props {
  results: NutritionAliment[];
  onSelect: (aliment: NutritionAliment) => void;
  onQuickAdd?: (aliment: NutritionAliment) => void;
  onToggleFavorite?: (aliment: NutritionAliment) => void;
  favoriteIds?: Set<string>;
  loading: boolean;
  emptyMessage?: string;
}

export default memo(function FoodSearchResults({
  results,
  onSelect,
  onQuickAdd,
  loading,
  emptyMessage = "Aucun résultat",
}: Props) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleQuickAdd = useCallback(
    (a: NutritionAliment) => {
      const key = a.id || a.nom;
      setAddedIds((prev) => new Set(prev).add(key));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 600);
      onQuickAdd ? onQuickAdd(a) : onSelect(a);
    },
    [onQuickAdd, onSelect],
  );
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "#74BF7A", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p
        className="text-center py-8 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {results.map((a, i) => {
        const portion =
          a.taille_portion_g != null ? `${a.taille_portion_g} g` : "100 g";
        const subtitle = [a.marque, portion].filter(Boolean).join(", ");

        return (
          <div
            key={a.id || `item-${i}`}
            className="flex items-center gap-3 py-3.5 active:opacity-70 transition-opacity"
            style={{
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
            }}
            onClick={() => onSelect(a)}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-medium truncate"
                style={
                  {
                    color: "#D1D5DB",
                    fontFamily: "var(--font-sans)",
                    WebkitFontSmoothing: "antialiased",
                  } as React.CSSProperties
                }
              >
                {a.nom}
              </p>
              {subtitle && (
                <p
                  className="text-[13px] truncate mt-0.5"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="text-[14px] font-medium"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {a.calories} kcal
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(a);
                }}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  background: addedIds.has(a.id || a.nom)
                    ? "#74BF7A"
                    : "transparent",
                  border: "2px solid #74BF7A",
                  transform: addedIds.has(a.id || a.nom)
                    ? "scale(1.15)"
                    : "scale(1)",
                }}
              >
                {addedIds.has(a.id || a.nom) ? (
                  <Check size={18} color="#fff" strokeWidth={2.5} />
                ) : (
                  <Plus size={18} color="#74BF7A" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});
