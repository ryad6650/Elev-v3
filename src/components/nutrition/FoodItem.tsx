"use client";

import { memo } from "react";
import { calcNutrients } from "@/lib/nutrition-utils";
import type { NutritionEntry } from "@/lib/nutrition-utils";

function dominantColor(entry: NutritionEntry): string {
  const n = calcNutrients(entry.aliment, entry.quantite_g);
  if (n.proteines >= n.glucides && n.proteines >= n.lipides)
    return "var(--color-protein)";
  if (n.lipides >= n.glucides) return "var(--color-fat)";
  return "var(--color-carbs)";
}

interface Props {
  entry: NutritionEntry;
  mealCalories: number;
  onClick?: () => void;
}

export default memo(function FoodItem({ entry, mealCalories, onClick }: Props) {
  const n = calcNutrients(entry.aliment, entry.quantite_g);
  const color = dominantColor(entry);
  const pct = mealCalories > 0 ? (n.calories / mealCalories) * 100 : 0;

  const qtyLabel =
    entry.quantite_portion != null
      ? `${entry.quantite_portion} ${entry.aliment.portion_nom ?? "portion"}`
      : `${entry.quantite_g}g`;

  return (
    <div
      className="flex items-center gap-2 active:opacity-70 transition-opacity"
      style={{ cursor: onClick ? "pointer" : undefined }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div
        className="w-[3px] self-stretch rounded-sm shrink-0"
        style={{ background: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className="text-xs font-semibold truncate mr-2"
            style={{ color: "var(--text-primary)" }}
          >
            {entry.aliment.nom}{" "}
            <span
              className="font-normal text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              · {qtyLabel}
            </span>
          </span>
          <span
            className="text-[10px] font-bold shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            {n.calories} kcal
          </span>
        </div>
        <div
          className="w-full h-1 rounded-sm overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{ width: `${pct}%`, background: color, opacity: 0.6 }}
          />
        </div>
      </div>
    </div>
  );
});
