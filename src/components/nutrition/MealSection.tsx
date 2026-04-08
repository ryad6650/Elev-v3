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
  const [expanded, setExpanded] = useState(true);
  const total = sumEntries(meal.entries);
  const meta = MEAL_META[meal.meal_number] ?? {
    emoji: "🍽️",
    name: `Repas ${meal.meal_number}`,
  };
  const isEmpty = meal.entries.length === 0;
  const pcts = isEmpty ? { g: 0, p: 0, l: 0 } : macroPercents(meal.entries);

  return (
    <div style={{ marginBottom: 14 }}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-2 select-none"
        style={{ marginBottom: 8 }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-[16px]">{meta.emoji}</span>
        <span
          className="text-[15px] flex-1 text-left"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: isEmpty ? "var(--text-muted)" : "var(--text-primary)",
          }}
        >
          {meta.name}
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{
            color: "var(--text-muted)",
          }}
        >
          {total.calories} kcal
        </span>
        <span
          className="text-[10px] inline-block transition-transform duration-200"
          style={{
            color: "var(--text-secondary)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Macro bar — toujours visible */}
      {isEmpty ? (
        <div
          className="rounded-full"
          style={{
            height: 4,
            border: "1px dashed rgba(74,55,40,0.15)",
            marginBottom: 6,
          }}
        />
      ) : (
        <>
          <div
            className="flex h-[5px] rounded-full overflow-hidden"
            style={{
              marginBottom: 6,
              background: "rgba(74,55,40,0.1)",
              gap: 1,
            }}
          >
            <div
              className="rounded-full"
              style={{ flex: pcts.g, background: "var(--color-carbs)" }}
            />
            <div
              className="rounded-full"
              style={{ flex: pcts.p, background: "var(--color-protein)" }}
            />
            <div
              className="rounded-full"
              style={{ flex: pcts.l, background: "var(--color-fat)" }}
            />
          </div>

          {/* Macro legend */}
          <div className="flex gap-2.5" style={{ marginBottom: 8 }}>
            {[
              {
                l: "G",
                v: total.glucides,
                c: "var(--color-carbs)",
              },
              {
                l: "P",
                v: total.proteines,
                c: "var(--color-protein)",
              },
              {
                l: "L",
                v: total.lipides,
                c: "var(--color-fat)",
              },
            ].map((m) => (
              <div key={m.l} className="flex items-center gap-1">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: m.c }}
                />
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {m.l}
                </span>
                <span
                  className="text-[9px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {Math.round(m.v)}g
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Aliments — dépliés uniquement */}
      {expanded && (
        <>
          <div className="flex flex-col">
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
            className="flex items-center gap-[5px] active:opacity-60 transition-opacity"
            style={{ padding: "6px 0", marginTop: 2 }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{
                background: "rgba(116,191,122,0.12)",
                color: "var(--accent-text)",
              }}
            >
              +
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: "var(--accent-text)" }}
            >
              Ajouter un aliment
            </span>
          </button>
        </>
      )}
    </div>
  );
});
