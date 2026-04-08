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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span
          className="text-[9px] font-semibold uppercase"
          style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}
        >
          {label}
        </span>
        <span
          className="text-[11px] font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {Math.round(value)}g
          <span className="font-normal" style={{ color: "var(--text-muted)" }}>
            /{max}g
          </span>
        </span>
      </div>
      <div
        className="w-full h-1 rounded-sm overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-sm transition-all duration-500"
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
    <div className="flex items-center gap-0 py-3.5 px-5 mb-1">
      {/* Gauche — calories */}
      <div
        className="flex flex-col gap-1 pr-[18px] shrink-0"
        style={{ borderRight: "1px solid var(--border)" }}
      >
        <span
          className="text-[9px] font-bold uppercase"
          style={{ color: "var(--text-muted)", letterSpacing: "0.15em" }}
        >
          Aujourd&apos;hui
        </span>
        <div className="flex items-baseline gap-1">
          <span
            className="leading-none tracking-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              fontSize: 36,
              color: "var(--text-primary)",
            }}
          >
            {totalCalories.toLocaleString("fr-FR")}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            kcal
          </span>
        </div>
        <span
          className="text-[10px] font-semibold"
          style={{ color: "var(--accent-text)" }}
        >
          {restantes.toLocaleString("fr-FR")} restantes
        </span>
      </div>

      {/* Droite — macros */}
      <div className="flex-1 flex flex-col gap-[7px] pl-[18px]">
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
