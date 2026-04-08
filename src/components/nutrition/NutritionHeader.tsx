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
    <div className="flex flex-col gap-[3px]">
      <div className="flex justify-between items-baseline">
        <span
          className="text-[8px] font-bold uppercase"
          style={{ color, letterSpacing: "0.1em" }}
        >
          {label}
        </span>
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
          {Math.round(value)}g / {max}g
        </span>
      </div>
      <div
        className="w-full h-[3px] rounded-full overflow-hidden"
        style={{ background: "rgba(74,55,40,0.1)" }}
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
    <div className="flex items-center gap-0" style={{ marginBottom: 16 }}>
      {/* Gauche — calories */}
      <div
        className="flex flex-col pr-4 shrink-0"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <span
          className="text-[8px] font-bold uppercase mb-1"
          style={{ color: "var(--text-secondary)", letterSpacing: "0.12em" }}
        >
          Aujourd&apos;hui
        </span>
        <div
          className="leading-none"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 32,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {totalCalories.toLocaleString("fr-FR")}
        </div>
        <span
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          kcal
        </span>
        <span
          className="text-[10px] font-semibold mt-1.5"
          style={{ color: "var(--accent-text)" }}
        >
          {restantes.toLocaleString("fr-FR")} restantes
        </span>
      </div>

      {/* Droite — macros */}
      <div className="flex-1 flex flex-col gap-2 pl-4">
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
