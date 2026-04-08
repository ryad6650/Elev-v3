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

export default memo(function FoodItem({ entry, onClick }: Props) {
  const n = calcNutrients(entry.aliment, entry.quantite_g);
  const color = dominantColor(entry);

  const qtyLabel =
    entry.quantite_portion != null
      ? `${entry.quantite_portion} ${entry.aliment.portion_nom ?? "portion"}`
      : `${entry.quantite_g}g`;

  return (
    <div
      className="flex items-center gap-2 active:opacity-70 transition-opacity"
      style={{
        cursor: onClick ? "pointer" : undefined,
        borderBottom: "1px solid rgba(74,55,40,0.05)",
        padding: "6px 0",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div
        className="w-[3px] rounded-sm shrink-0"
        style={{ background: color, height: 28, alignSelf: "center" }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-semibold truncate"
          style={{ color: "var(--text-primary)", lineHeight: 1.3 }}
        >
          {entry.aliment.nom}
        </div>
        <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>
          {qtyLabel}
        </div>
      </div>
      <span
        className="text-[10px] font-bold shrink-0"
        style={{ color: "var(--text-primary)" }}
      >
        {n.calories} kcal
      </span>
    </div>
  );
});
