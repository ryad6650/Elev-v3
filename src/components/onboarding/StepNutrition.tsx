"use client";

import type { OnboardingData } from "./OnboardingClient";

type Props = {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

function MacroRow({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span
        className="flex-1 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          className="w-20 text-right text-sm font-semibold outline-none rounded-lg px-2 py-2"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <span className="text-xs w-4" style={{ color: "var(--text-muted)" }}>
          g
        </span>
      </div>
    </div>
  );
}

export default function StepNutrition({ data, update, onNext, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col page-enter">
      <button
        onClick={onBack}
        className="text-2xl mb-8 -ml-1 self-start"
        style={{
          color: "var(--text-muted)",
          background: "none",
          border: "none",
        }}
      >
        ←
      </button>

      <div className="flex-1">
        <h2
          className="text-4xl mb-3"
          style={{
            fontFamily: "var(--font-lora)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Nutrition
        </h2>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          Valeurs calculées selon ton objectif — modifie si besoin.
        </p>

        {/* Calories */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            Calories / jour
          </p>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={data.objectif_calories}
              onChange={(e) =>
                update({ objectif_calories: Number(e.target.value) || 2000 })
              }
              className="text-5xl font-bold outline-none w-40"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-text)",
              }}
            />
            <span className="text-base" style={{ color: "var(--text-muted)" }}>
              kcal
            </span>
          </div>
        </div>

        {/* Macros */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Macronutriments
          </p>
          <MacroRow
            label="Protéines"
            value={data.objectif_proteines}
            onChange={(v) => update({ objectif_proteines: v })}
            color="var(--color-protein)"
          />
          <MacroRow
            label="Glucides"
            value={data.objectif_glucides}
            onChange={(v) => update({ objectif_glucides: v })}
            color="var(--color-carbs)"
          />
          <MacroRow
            label="Lipides"
            value={data.objectif_lipides}
            onChange={(v) => update({ objectif_lipides: v })}
            color="var(--color-fat)"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="btn-accent w-full py-4 mt-6 text-base font-semibold rounded-xl transition-transform active:scale-95"
      >
        Continuer →
      </button>
    </div>
  );
}
