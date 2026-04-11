"use client";

import { memo } from "react";

interface Props {
  consumed: number;
  objective: number;
  glucides: number;
  proteines: number;
  lipides: number;
  objectifGlucides: number;
  objectifProteines: number;
  objectifLipides: number;
}

export default memo(function CaloriesCard({
  consumed,
  objective,
  glucides,
  proteines,
  lipides,
  objectifGlucides,
  objectifProteines,
  objectifLipides,
}: Props) {
  const ratio = objective > 0 ? Math.min(consumed / objective, 1) : 0;
  const remaining = Math.max(objective - consumed, 0);
  const pct = Math.round(ratio * 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - ratio);

  const macros = [
    {
      label: "Gluc",
      value: Math.round(glucides),
      max: objectifGlucides,
      color: "var(--color-carbs)",
      cls: "carbs",
    },
    {
      label: "Prot",
      value: Math.round(proteines),
      max: objectifProteines,
      color: "#74BF7A",
      cls: "protein",
    },
    {
      label: "Lip",
      value: Math.round(lipides),
      max: objectifLipides,
      color: "var(--color-fat)",
      cls: "fat",
    },
  ];

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: 24,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 20 }}
      >
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          Calories du jour
        </span>
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#74BF7A",
            background: "rgba(116,191,122,0.12)",
            padding: "5px 14px",
            borderRadius: "var(--radius-pill)",
          }}
        >
          En cours
        </span>
      </div>

      {/* Ring + Numbers */}
      <div className="flex items-center gap-5" style={{ marginBottom: 20 }}>
        <div className="relative shrink-0" style={{ width: 96, height: 96 }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 96 96"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="5"
            />
            <circle
              cx="48"
              cy="48"
              r={r}
              fill="none"
              stroke="#74BF7A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              style={{
                fontFamily: "var(--font-lora), serif",
                fontStyle: "italic",
                fontSize: 24,
                fontWeight: 600,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {pct}%
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontStyle: "italic",
              fontSize: 42,
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            {consumed.toLocaleString("fr-FR")}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            / {objective.toLocaleString("fr-FR")} kcal
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#74BF7A",
              marginTop: 8,
            }}
          >
            {remaining.toLocaleString("fr-FR")} kcal restantes
          </div>
        </div>
      </div>

      {/* Macros grid */}
      <div className="flex gap-2.5">
        {macros.map((m) => {
          const barPct = m.max > 0 ? Math.min((m.value / m.max) * 100, 100) : 0;
          return (
            <div
              key={m.cls}
              className="flex-1 text-center"
              style={{
                background: "var(--bg-inner)",
                backdropFilter: "var(--glass-blur-sm)",
                WebkitBackdropFilter: "var(--glass-blur-sm)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: m.color,
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                / {m.max}g
              </div>
              <div
                className="overflow-hidden"
                style={{
                  height: 4,
                  borderRadius: 99,
                  background: "rgba(0,0,0,0.06)",
                  marginTop: 10,
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${barPct}%`,
                    background: m.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
