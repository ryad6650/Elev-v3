"use client";

import type { NutritionProfile } from "@/lib/nutrition-utils";

function CalorieRing({
  eaten,
  remaining,
  total,
}: {
  eaten: number;
  remaining: number;
  total: number;
}) {
  const r = 63;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const trackArc = (270 / 360) * circ;
  const gapArc = circ - trackArc;
  const pct = total > 0 ? Math.min(eaten / total, 1) : 0;
  const progressArc = pct * trackArc;
  const dotAngleRad = (225 + pct * 270 - 90) * (Math.PI / 180);
  const dotX = cx + r * Math.cos(dotAngleRad);
  const dotY = cy + r * Math.sin(dotAngleRad);

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track 270° */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${trackArc} ${gapArc}`}
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* Progression */}
        {pct > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#00FFC3"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progressArc} ${circ - progressArc}`}
            transform={`rotate(135 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        )}
        {/* Point */}
        <circle cx={dotX} cy={dotY} r="5" fill="#00FFC3" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1,
            color: "var(--text-primary)",
            fontFamily:
              "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
          }}
        >
          {remaining.toLocaleString("fr-FR")}
        </span>
        <span
          style={{
            fontSize: 12,
            lineHeight: 1,
            color: "var(--text-muted)",
            fontFamily:
              "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
            fontWeight: 400,
          }}
        >
          Restantes
        </span>
      </div>
    </div>
  );
}

function MacroCol({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          fontWeight: 500,
          fontFamily: "var(--font-sans)",
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: "100%",
          height: 6,
          borderRadius: 99,
          background: "var(--bg-elevated)",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            borderRadius: 99,
            background: color,
            transition: "width 700ms ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          fontFamily: "var(--font-sans)",
          textAlign: "center",
        }}
      >
        {Math.round(value)} / {max} g
      </span>
    </div>
  );
}

interface Props {
  totalCalories: number;
  totalProteines: number;
  totalGlucides: number;
  totalLipides: number;
  caloriesBrulees: number;
  profile: NutritionProfile;
}

export default function NutritionHeader({
  totalCalories,
  totalProteines,
  totalGlucides,
  totalLipides,
  caloriesBrulees,
  profile,
}: Props) {
  const objectif = profile.objectif_calories ?? 2000;
  const restantes = Math.max(0, objectif - totalCalories);

  return (
    <div
      style={{
        background: "#1C1C1E",
        borderRadius: 16,
        border: "2px solid #595F60",
        padding: "20px 16px",
      }}
    >
      {/* Mangées | Anneau | Objectif */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1,
              color: "#E0E0E0",
              fontFamily:
                "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
            }}
          >
            {totalCalories.toLocaleString("fr-FR")}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily:
                "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
            }}
          >
            Mangées
          </div>
        </div>

        <CalorieRing
          eaten={totalCalories}
          remaining={restantes}
          total={objectif}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1,
              color: "#E0E0E0",
              fontFamily:
                "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
            }}
          >
            {objectif.toLocaleString("fr-FR")}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily:
                "-apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
            }}
          >
            Objectif
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div
        style={{
          height: 1,
          background: "var(--border)",
          margin: "0 -16px 16px",
        }}
      />

      {/* Colonnes macros */}
      <div style={{ display: "flex", gap: 12 }}>
        <MacroCol
          label="Glucides"
          value={totalGlucides}
          max={profile.objectif_glucides ?? 250}
          color="#00FFC3"
        />
        <MacroCol
          label="Protéines"
          value={totalProteines}
          max={profile.objectif_proteines ?? 150}
          color="#00FFC3"
        />
        <MacroCol
          label="Lipides"
          value={totalLipides}
          max={profile.objectif_lipides ?? 70}
          color="#00FFC3"
        />
      </div>
    </div>
  );
}
