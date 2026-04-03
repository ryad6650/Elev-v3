"use client";

import type { NutritionAliment } from "@/lib/nutrition-utils";

interface Props {
  aliment: NutritionAliment;
  showDetails: boolean;
  onToggleDetails: () => void;
  onEdit?: () => void;
  hasPortion: boolean;
}

export default function FoodNutritionCard({
  aliment,
  showDetails,
  onToggleDetails,
  onEdit,
  hasPortion,
}: Props) {
  const calP = (aliment.proteines ?? 0) * 4;
  const calG = (aliment.glucides ?? 0) * 4;
  const calL = (aliment.lipides ?? 0) * 9;
  const calTotal = calP + calG + calL || 1;
  const pPct = (calP / calTotal) * 100;
  const gPct = (calG / calTotal) * 100;
  const lPct = (calL / calTotal) * 100;

  return (
    <>
      {/* Ring + breakdown */}
      <div
        className="rounded-2xl p-4 mb-3 relative"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <button
            onClick={onToggleDetails}
            className="px-2 py-1 rounded-lg text-[10px] font-semibold"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--accent-text)",
              border: "1px solid var(--border)",
            }}
          >
            {showDetails ? "− Moins" : "+ d'infos"}
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--accent-text)",
                border: "1px solid var(--border)",
              }}
            >
              {hasPortion ? "Modifier la portion" : "Définir une portion"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-extrabold leading-none"
                style={{ color: "var(--accent-text)" }}
              >
                {aliment.calories}
              </span>
              <span
                className="text-[9px] uppercase tracking-wide mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                kcal
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              {
                dot: "#3B82F6",
                label: "Protéines",
                val: aliment.proteines,
                pct: Math.round(pPct),
              },
              {
                dot: "#EAB308",
                label: "Glucides",
                val: aliment.glucides,
                pct: Math.round(gPct),
              },
              {
                dot: "#EF4444",
                label: "Lipides",
                val: aliment.lipides,
                pct: Math.round(lPct),
              },
              {
                dot: "#22C55E",
                label: "Fibres",
                val: aliment.fibres ?? null,
                pct: null,
              },
            ].map(({ dot, label, val, pct }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: dot }}
                />
                <span
                  className="text-[11px] w-14 shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {val ?? 0}g
                </span>
                {pct !== null && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Macro bar + cards */}
      <div className="mb-3">
        <div
          className="h-2.5 rounded-full flex gap-0.5 mb-3 overflow-hidden"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pPct}%`, background: "#3B82F6", opacity: 0.85 }}
          />
          <div
            className="h-full rounded-full"
            style={{ width: `${gPct}%`, background: "#EAB308", opacity: 0.85 }}
          />
          <div
            className="h-full rounded-full"
            style={{ width: `${lPct}%`, background: "#EF4444", opacity: 0.85 }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Protéines", v: aliment.proteines ?? 0, c: "#93C5FD" },
            { label: "Glucides", v: aliment.glucides ?? 0, c: "#FDE047" },
            { label: "Lipides", v: aliment.lipides ?? 0, c: "#FCA5A5" },
          ].map(({ label, v, c }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-lg font-extrabold leading-none"
                style={{ color: c }}
              >
                {v}
                <span className="text-xs font-medium">g</span>
              </p>
              <p
                className="text-[10px] mt-1.5 font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Détails nutrition */}
      {showDetails && (
        <>
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Valeurs pour 100g
          </p>
          <div
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              { label: "Énergie", val: `${aliment.calories} kcal`, hl: true },
              { label: "Protéines", val: `${aliment.proteines ?? 0} g` },
              { label: "Glucides", val: `${aliment.glucides ?? 0} g` },
              {
                label: "dont sucres",
                val: aliment.sucres != null ? `${aliment.sucres} g` : "—",
                sub: true,
              },
              { label: "Lipides", val: `${aliment.lipides ?? 0} g` },
              {
                label: "Fibres",
                val: aliment.fibres != null ? `${aliment.fibres} g` : "—",
              },
              {
                label: "Sel",
                val: aliment.sel != null ? `${aliment.sel} g` : "—",
              },
            ].map(({ label, val, hl, sub }, i, a) => (
              <div
                key={label}
                className="flex justify-between items-center"
                style={{
                  padding: sub ? "10px 16px 10px 32px" : "10px 16px",
                  borderBottom:
                    i < a.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: sub ? "var(--text-muted)" : "var(--text-secondary)",
                  }}
                >
                  {label}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: hl
                      ? "var(--accent-text)"
                      : sub
                        ? "var(--text-secondary)"
                        : "var(--text-primary)",
                    fontWeight: hl ? 700 : 600,
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
