"use client";

interface Props {
  calories: number;
  objectif: number;
  glucides: number;
  proteines: number;
  lipides: number;
  objectifGlucides: number;
  objectifProteines: number;
  objectifLipides: number;
}

function MacroBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="flex-1">
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#74BF7A",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        {value} / {max}g
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: "#74BF7A",
            width: `${pct}%`,
            transition: "width 700ms ease",
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardNutritionCard({
  calories,
  objectif,
  glucides,
  proteines,
  lipides,
  objectifGlucides,
  objectifProteines,
  objectifLipides,
}: Props) {
  const remaining = Math.max(0, objectif - calories);
  const pct = objectif > 0 ? Math.min(calories / objectif, 1) : 0;
  const pctDisplay = Math.round(pct * 100);

  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div
      style={{
        background: "#262220",
        border: "2px solid #595F60",
        borderRadius: 20,
        padding: 22,
      }}
    >
      {/* Top: ring + info */}
      <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: 78, height: 78 }}>
          <svg
            width="78"
            height="78"
            viewBox="0 0 78 78"
            role="img"
            aria-label="Répartition macronutriments"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="39"
              cy="39"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="7"
            />
            <circle
              cx="39"
              cy="39"
              r={r}
              fill="none"
              stroke="#74BF7A"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 800ms ease" }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            {pctDisplay}%
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: 32,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {calories.toLocaleString("fr-FR")}{" "}
            <span
              style={{
                fontSize: 18,
                color: "var(--text-muted)",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              / {objectif.toLocaleString("fr-FR")}
            </span>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            calories consommees
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1E9D4C",
              marginTop: 6,
            }}
          >
            {remaining.toLocaleString("fr-FR")} kcal restantes
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="flex gap-3">
        <MacroBar label="Glucides" value={glucides} max={objectifGlucides} />
        <MacroBar label="Proteines" value={proteines} max={objectifProteines} />
        <MacroBar label="Lipides" value={lipides} max={objectifLipides} />
      </div>
    </div>
  );
}
