"use client";

import { memo } from "react";
import { sumEntries } from "@/lib/nutrition-utils";
import type { Meal } from "@/lib/nutrition-utils";

const MEAL_META: Record<number, { emoji: string; name: string; pct: number }> =
  {
    1: { emoji: "☕", name: "Petit déjeuner", pct: 0.3 },
    2: { emoji: "🥘", name: "Déjeuner", pct: 0.29 },
    3: { emoji: "🍎", name: "En-cas", pct: 0.12 },
    4: { emoji: "🥗", name: "Dîner", pct: 0.29 },
  };

function MealRing({ pct }: { pct: number }) {
  const size = 58;
  const r = 26;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(pct, 1) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth="4.5"
      />
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#00FFC3"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ - progress}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      )}
    </svg>
  );
}

interface Props {
  meal: Meal;
  calorieObjectif: number;
  onAdd: () => void;
  onMealClick: () => void;
}

export default memo(function MealSection({
  meal,
  calorieObjectif,
  onAdd,
  onMealClick,
}: Props) {
  const total = sumEntries(meal.entries);
  const meta = MEAL_META[meal.meal_number] ?? {
    emoji: "🍽️",
    name: `Repas ${meal.meal_number}`,
    pct: 0.25,
  };
  const mealTarget = Math.round(calorieObjectif * meta.pct);
  const ringPct = mealTarget > 0 ? total.calories / mealTarget : 0;

  return (
    <div className="flex items-center gap-3" style={{ padding: "14px 16px" }}>
      {/* Icône avec anneau de progression */}
      <div
        style={{ position: "relative", width: 58, height: 58, flexShrink: 0 }}
      >
        <MealRing pct={ringPct} />
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            right: 6,
            bottom: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {meta.emoji}
        </div>
      </div>

      {/* Texte — clic pour ouvrir le détail */}
      <button
        className="flex-1 text-left active:opacity-70 transition-opacity"
        onClick={onMealClick}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily:
              "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
          }}
        >
          {meta.name}{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>→</span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginTop: 2,
            fontFamily:
              "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
          }}
        >
          {Math.round(total.calories)} / {mealTarget} kcal
        </div>
      </button>

      {/* Bouton + */}
      <button
        onClick={onAdd}
        className="active:scale-95 transition-transform flex items-center justify-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "white",
          flexShrink: 0,
          fontSize: 20,
          fontWeight: 300,
          color: "black",
          lineHeight: 1,
          boxShadow: "0 0 14px rgba(255,255,255,0.35)",
        }}
        aria-label="Ajouter un aliment"
      >
        +
      </button>
    </div>
  );
});
