import { memo } from "react";
import { Plus, Heart } from "lucide-react";
import type { NutritionAliment } from "@/lib/nutrition-utils";

function dominantType(a: NutritionAliment): "prot" | "gluc" | "lip" {
  const p = a.proteines ?? 0,
    g = a.glucides ?? 0,
    l = a.lipides ?? 0;
  if (p >= g && p >= l) return "prot";
  if (g >= l) return "gluc";
  return "lip";
}

const AVATAR: Record<string, { bg: string; color: string }> = {
  prot: { bg: "rgba(116,191,122,0.18)", color: "#2d6b30" },
  gluc: { bg: "rgba(155,107,58,0.15)", color: "#7A5428" },
  lip: { bg: "rgba(192,120,88,0.15)", color: "#8B4F35" },
};

const TAG: Record<string, { bg: string; color: string }> = {
  p: { bg: "rgba(116,191,122,0.12)", color: "#3D7A42" },
  g: { bg: "rgba(155,107,58,0.12)", color: "#7A5428" },
  l: { bg: "rgba(192,120,88,0.12)", color: "#8B4F35" },
};

interface Props {
  results: NutritionAliment[];
  onSelect: (aliment: NutritionAliment) => void;
  onToggleFavorite?: (aliment: NutritionAliment) => void;
  favoriteIds?: Set<string>;
  loading: boolean;
  emptyMessage?: string;
}

export default memo(function FoodSearchResults({
  results,
  onSelect,
  onToggleFavorite,
  favoriteIds,
  loading,
  emptyMessage = "Aucun résultat",
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--accent)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p
        className="text-center py-4 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {results.map((a, i) => {
        const dt = dominantType(a);
        const av = AVATAR[dt];
        const isFav = !!a.id && !!favoriteIds?.has(a.id);

        return (
          <button
            key={a.id || `off-${i}`}
            onClick={() => onSelect(a)}
            className="relative flex items-center gap-2.5 w-full rounded-[14px] text-left active:opacity-80 transition-opacity"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "10px 12px",
            }}
          >
            {/* Avatar */}
            <div
              className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 text-base font-bold"
              style={{
                background: av.bg,
                color: av.color,
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
              }}
            >
              {a.nom.charAt(0).toUpperCase()}
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[5px] mb-0.5">
                <span
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {a.nom}
                </span>
                {a.source === "openfoodfacts" && (
                  <span
                    className="shrink-0 text-[7px] font-bold px-1 py-px rounded-sm"
                    style={{
                      background: "rgba(92,138,60,0.12)",
                      color: "#5C8A3C",
                    }}
                  >
                    OFF
                  </span>
                )}
              </div>
              {a.marque && (
                <p
                  className="text-[9px] truncate mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {a.marque}
                </p>
              )}
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { k: "g", v: a.glucides },
                    { k: "p", v: a.proteines },
                    { k: "l", v: a.lipides },
                  ] as const
                ).map(({ k, v }) => (
                  <span
                    key={k}
                    className="text-[8px] font-bold rounded px-[5px] py-0.5"
                    style={{ background: TAG[k].bg, color: TAG[k].color }}
                  >
                    {k.toUpperCase()} {v ?? 0}g
                  </span>
                ))}
              </div>
            </div>

            {/* Right — kcal + add */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div>
                <span
                  className="text-[13px] font-bold leading-none"
                  style={{ color: "var(--text-primary)" }}
                >
                  {a.calories}
                </span>{" "}
                <span
                  className="text-[8px] font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  kcal
                </span>
              </div>
              <div
                className="w-[26px] h-[26px] rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <Plus size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
            </div>

            {/* Fav heart */}
            {onToggleFavorite && a.id && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(a);
                }}
                className="absolute top-2 right-2.5 text-[11px]"
                style={{
                  color: isFav ? "#C07858" : "var(--text-muted)",
                  opacity: isFav ? 1 : 0.4,
                }}
              >
                {isFav ? (
                  <Heart size={11} fill="#C07858" color="#C07858" />
                ) : (
                  <Heart size={11} />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
