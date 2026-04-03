"use client";

import { memo, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import FoodItem from "./FoodItem";
import { sumEntries } from "@/lib/nutrition-utils";
import type { Meal, NutritionEntry } from "@/lib/nutrition-utils";

function formatMealTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}

interface Props {
  meal: Meal;
  onAdd: () => void;
  onEntryDeleted?: (id: string) => void;
  onFoodClick?: (entry: NutritionEntry) => void;
}

export default memo(function MealSection({
  meal,
  onAdd,
  onEntryDeleted,
  onFoodClick,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const total = sumEntries(meal.entries);

  return (
    <div
      className="rounded-2xl mb-3 overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex">
        {/* Barre accent gauche */}
        <div className="w-1 shrink-0" style={{ background: "var(--accent)" }} />

        {/* Contenu */}
        <div className="flex-1 min-w-0 p-4">
          {/* En-tête cliquable */}
          <button
            className="w-full flex items-center gap-3 text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "var(--accent-bg)",
                color: "var(--accent)",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {meal.meal_number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Repas {meal.meal_number}
                </p>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-muted)",
                  }}
                >
                  {formatMealTime(meal.meal_time)}
                </span>
              </div>
              {meal.entries.length > 0 && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {total.calories} kcal · P {total.proteines}g · G{" "}
                  {total.glucides}g · L {total.lipides}g
                </p>
              )}
            </div>
            {expanded ? (
              <ChevronDown
                size={16}
                className="shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            ) : (
              <ChevronRight
                size={16}
                className="shrink-0"
                style={{ color: "var(--text-muted)" }}
              />
            )}
          </button>

          {/* Liste aliments + bouton ajouter (déplié) */}
          {expanded && (
            <div className="mt-3">
              {meal.entries.map((e, i) => (
                <div
                  key={e.id}
                  style={
                    i === 0
                      ? { borderTop: "1px solid var(--border)" }
                      : undefined
                  }
                >
                  <FoodItem
                    entry={e}
                    onDeleted={(id) => onEntryDeleted?.(id)}
                    onClick={() => onFoodClick?.(e)}
                  />
                </div>
              ))}
              <button
                onClick={onAdd}
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-opacity active:opacity-70"
                style={{
                  border: "1.5px dashed var(--accent)",
                  color: "var(--accent)",
                  background: "transparent",
                }}
              >
                + Ajouter un aliment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
