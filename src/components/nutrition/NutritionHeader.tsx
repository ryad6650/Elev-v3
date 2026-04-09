"use client";

import type { NutritionProfile } from "@/lib/nutrition-utils";

interface MacroRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MacroRow({ label, value, max, color }: MacroRowProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex justify-between items-baseline">
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          {Math.round(value)}g / {max}g
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{
          height: 5,
          borderRadius: 99,
          background: "rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface Props {
  totalCalories: number;
  totalProteines: number;
  totalGlucides: number;
  totalLipides: number;
  profile: NutritionProfile;
}

export default function NutritionHeader({
  totalCalories,
  totalProteines,
  totalGlucides,
  totalLipides,
  profile,
}: Props) {
  const objectif = profile.objectif_calories ?? 2000;
  const restantes = Math.max(0, objectif - totalCalories);

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 24,
        marginBottom: 16,
      }}
    >
      {/* Calories */}
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase" as const,
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        Aujourd&apos;hui
      </div>
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 42,
          fontWeight: 500,
          color: "var(--text-primary)",
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}
      >
        {totalCalories.toLocaleString("fr-FR")}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          marginTop: 4,
        }}
      >
        / {objectif.toLocaleString("fr-FR")} kcal
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--green)",
          marginTop: 8,
          marginBottom: 20,
        }}
      >
        {restantes.toLocaleString("fr-FR")} restantes
      </div>

      {/* Macros bars */}
      <div className="flex flex-col gap-3">
        <MacroRow
          label="Glucides"
          value={totalGlucides}
          max={profile.objectif_glucides ?? 250}
          color="var(--color-carbs)"
        />
        <MacroRow
          label="Protéines"
          value={totalProteines}
          max={profile.objectif_proteines ?? 150}
          color="var(--color-protein)"
        />
        <MacroRow
          label="Lipides"
          value={totalLipides}
          max={profile.objectif_lipides ?? 70}
          color="var(--color-fat)"
        />
      </div>
    </div>
  );
}
