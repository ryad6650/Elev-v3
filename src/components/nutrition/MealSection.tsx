"use client";

import { memo, useState } from "react";
import FoodItem from "./FoodItem";
import { sumEntries, calcNutrients } from "@/lib/nutrition-utils";
import type { Meal, NutritionEntry } from "@/lib/nutrition-utils";

const MEAL_META: Record<number, { emoji: string; name: string }> = {
  1: { emoji: "☀️", name: "Petit-déjeuner" },
  2: { emoji: "🌤", name: "Déjeuner" },
  3: { emoji: "🍎", name: "Collation" },
  4: { emoji: "🌙", name: "Dîner" },
};

function macroPercents(entries: NutritionEntry[]) {
  let gKcal = 0,
    pKcal = 0,
    lKcal = 0;
  for (const e of entries) {
    const n = calcNutrients(e.aliment, e.quantite_g);
    gKcal += n.glucides * 4;
    pKcal += n.proteines * 4;
    lKcal += n.lipides * 9;
  }
  const total = gKcal + pKcal + lKcal || 1;
  return {
    g: Math.round((gKcal / total) * 100),
    p: Math.round((pKcal / total) * 100),
    l: Math.round((lKcal / total) * 100),
  };
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
  const [expanded, setExpanded] = useState(false);
  const total = sumEntries(meal.entries);
  const meta = MEAL_META[meal.meal_number] ?? {
    emoji: "🍽️",
    name: `Repas ${meal.meal_number}`,
  };
  const isEmpty = meal.entries.length === 0;
  const pcts = isEmpty ? { g: 0, p: 0, l: 0 } : macroPercents(meal.entries);

  return (
    <div>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between mb-[7px] select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-[5px]">
          <span className="text-[13px]">{meta.emoji}</span>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: isEmpty ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {meta.name}
          </span>
        </div>
        <div className="flex items-center gap-[5px]">
          <span
            className="text-[10px] font-bold"
            style={{
              color: isEmpty ? "var(--text-muted)" : "var(--text-secondary)",
            }}
          >
            {total.calories} kcal
          </span>
          <span
            className="text-[9px] inline-block transition-transform duration-200"
            style={{
              color: "var(--text-muted)",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▾
          </span>
        </div>
      </button>

      {/* Contenu déplié */}
      {expanded && (
        <>
          {/* Macro bar */}
          {isEmpty ? (
            <div
              className="h-[5px] rounded-[3px] mb-1"
              style={{
                background: "var(--border)",
                border: "1px dashed var(--text-muted)",
                opacity: 0.4,
              }}
            />
          ) : (
            <>
              <div className="flex h-[5px] rounded-[3px] overflow-hidden mb-1.5">
                <div
                  style={{ flex: pcts.g, background: "var(--color-carbs)" }}
                />
                <div
                  style={{
                    flex: pcts.p,
                    background: "var(--color-protein)",
                    marginLeft: 1,
                  }}
                />
                <div
                  style={{
                    flex: pcts.l,
                    background: "var(--color-fat)",
                    marginLeft: 1,
                  }}
                />
              </div>

              {/* Macro legend */}
              <div className="flex gap-2.5 mb-2.5">
                {[
                  {
                    l: "G",
                    v: total.glucides,
                    p: pcts.g,
                    c: "var(--color-carbs)",
                  },
                  {
                    l: "P",
                    v: total.proteines,
                    p: pcts.p,
                    c: "var(--color-protein)",
                  },
                  {
                    l: "L",
                    v: total.lipides,
                    p: pcts.l,
                    c: "var(--color-fat)",
                  },
                ].map((m) => (
                  <div key={m.l} className="flex items-center gap-1">
                    <div
                      className="w-[7px] h-[7px] rounded-sm shrink-0"
                      style={{ background: m.c }}
                    />
                    <span
                      className="text-[9px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {m.l} <b>{Math.round(m.v)}g</b>
                    </span>
                    <span
                      className="text-[8px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {m.p}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Food items */}
          <div className="flex flex-col gap-2.5">
            {meal.entries.map((e) => (
              <FoodItem
                key={e.id}
                entry={e}
                mealCalories={total.calories}
                onClick={() => onFoodClick?.(e)}
              />
            ))}
          </div>

          {/* Add button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 mt-0.5 active:opacity-60 transition-opacity"
          >
            <div
              className="w-[3px] h-5 rounded-sm shrink-0"
              style={{ background: "var(--border)" }}
            />
            <span
              className="text-[11px] italic"
              style={{ color: "var(--text-muted)" }}
            >
              + Ajouter un aliment
            </span>
          </button>
        </>
      )}
    </div>
  );
});
