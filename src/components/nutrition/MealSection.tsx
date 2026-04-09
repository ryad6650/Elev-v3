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

  // Suppress unused var warning
  void onEntryDeleted;

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: "18px 20px",
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-2.5 select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-[20px]">{meta.emoji}</span>
        <span
          className="flex-1 text-left"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: isEmpty ? "var(--text-muted)" : "var(--text-primary)",
          }}
        >
          {meta.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          {total.calories} kcal
        </span>
        <span
          className="text-[12px] inline-block transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Content — expanded only */}
      {expanded && !isEmpty && (
        <>
          {/* Split bar */}
          <div
            className="flex overflow-hidden"
            style={{
              height: 5,
              borderRadius: 99,
              background: "rgba(0,0,0,0.04)",
              gap: 2,
              margin: "12px 0 10px",
            }}
          >
            <div
              className="rounded-full"
              style={{
                flex: pcts.g,
                background: "var(--color-carbs)",
              }}
            />
            <div
              className="rounded-full"
              style={{
                flex: pcts.p,
                background: "var(--color-protein)",
              }}
            />
            <div
              className="rounded-full"
              style={{
                flex: pcts.l,
                background: "var(--color-fat)",
              }}
            />
          </div>

          {/* Macro legend */}
          <div className="flex gap-3.5" style={{ marginBottom: 12 }}>
            {[
              { l: "G", v: total.glucides, c: "var(--color-carbs)" },
              { l: "P", v: total.proteines, c: "var(--color-protein)" },
              { l: "L", v: total.lipides, c: "var(--color-fat)" },
            ].map((m) => (
              <div key={m.l} className="flex items-center gap-[5px]">
                <div
                  className="rounded-full shrink-0"
                  style={{
                    width: 7,
                    height: 7,
                    background: m.c,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  {m.l}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {Math.round(m.v)}g
                </span>
              </div>
            ))}
          </div>

          {/* Food items */}
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
        </>
      )}

      {/* Add button — always visible when expanded */}
      {expanded && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 active:opacity-60 transition-opacity"
          style={{
            padding: "10px 0 2px",
            marginTop: isEmpty ? 10 : 4,
          }}
        >
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 22,
              height: 22,
              background: "var(--green-dim)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--green)",
            }}
          >
            +
          </div>
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--green)",
            }}
          >
            Ajouter un aliment
          </span>
        </button>
      )}
    </div>
  );
});
