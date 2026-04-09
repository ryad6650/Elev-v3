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
      className="flex items-center gap-2.5 active:opacity-70 transition-opacity"
      style={{
        cursor: onClick ? "pointer" : undefined,
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        padding: "8px 0",
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div
        className="shrink-0"
        style={{
          width: 4,
          height: 32,
          borderRadius: 2,
          background: color,
          alignSelf: "center",
        }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {entry.aliment.nom}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          {qtyLabel}
        </div>
      </div>
      <span
        className="shrink-0"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {n.calories} kcal
      </span>
    </div>
  );
});
