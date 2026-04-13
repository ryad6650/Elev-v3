"use client";

import type { NutritionProfile } from "@/lib/nutrition-utils";

function SideRing({ pct }: { pct: number }) {
  const r = 18;
  const sw = 4;
  const size = r * 2 + sw + 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const trackArc = 0.7 * circ;
  const gapArc = circ - trackArc;
  const progress = Math.min(pct, 1) * trackArc;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#3a3532"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${trackArc} ${gapArc}`}
        transform={`rotate(144 ${cx} ${cy})`}
      />
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#74BF7A"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ - progress}`}
          transform={`rotate(144 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      )}
    </svg>
  );
}

function SideCard({
  value,
  label,
  pct,
}: {
  value: number;
  label: string;
  pct: number;
}) {
  return (
    <div
      style={{
        background: "#262220",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "8px 10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          lineHeight: 1,
          color: "#E0E0E0",
          fontFamily:
            "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
        }}
      >
        {value.toLocaleString("fr-FR")}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontWeight: 400,
          fontFamily:
            "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
        }}
      >
        {label}
      </div>
      <SideRing pct={pct} />
    </div>
  );
}

function CalorieRing({ eaten, total }: { eaten: number; total: number }) {
  const rOuter = 72;
  const rInner = 62;
  const sw = 6;
  const size = (rOuter + sw / 2) * 2 + 4;
  const cx = size / 2;
  const cy = size / 2;
  const circOuter = 2 * Math.PI * rOuter;
  const circInner = 2 * Math.PI * rInner;
  const half = total / 2;
  const diff = eaten - total;

  // Inner = first 50%, Outer = second 50%
  const innerPct = Math.min(eaten / half, 1);
  const outerPct = eaten > half ? Math.min((eaten - half) / half, 1) : 0;
  const progressInner = innerPct * circInner;

  // Si dépassé : portion rouge sur l'extérieur
  const overPct = eaten > total ? Math.min((eaten - total) / total, 1) : 0;
  const overArc = overPct * circOuter;
  // Le vert s'arrête à 100% de l'extérieur quand atteint
  const greenOuterPct = eaten > total ? 1 : outerPct;
  const greenOuterArc = greenOuterPct * circOuter;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Progression calories"
      >
        <defs>
          <filter
            id="ring-glow"
            filterUnits="userSpaceOnUse"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer track + green progress */}
        <circle
          cx={cx}
          cy={cy}
          r={rOuter}
          fill="none"
          stroke="#3a3532"
          strokeWidth={sw}
        />
        {greenOuterArc > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="none"
            stroke="#74BF7A"
            strokeWidth={sw}
            strokeLinecap="round"
            filter="url(#ring-glow)"
            strokeDasharray={`${greenOuterArc} ${circOuter - greenOuterArc}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        )}
        {/* Outer red overflow */}
        {overArc > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="none"
            stroke="#EF4444"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${overArc} ${circOuter - overArc}`}
            strokeDashoffset={-greenOuterArc}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: "stroke-dasharray 1s ease, stroke-dashoffset 1s ease",
            }}
          />
        )}
        {/* Inner track + progress */}
        <circle
          cx={cx}
          cy={cy}
          r={rInner}
          fill="none"
          stroke="#3a3532"
          strokeWidth={sw}
        />
        {progressInner > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={rInner}
            fill="none"
            stroke="#74BF7A"
            opacity={0.4}
            strokeWidth={sw}
            strokeLinecap="round"
            filter="url(#ring-glow)"
            strokeDasharray={`${progressInner} ${circInner - progressInner}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        )}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <span
          style={{
            fontSize: 17,
            color: "var(--text-primary)",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          Calories
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1,
            color: "var(--text-primary)",
            fontFamily:
              "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
          }}
        >
          {eaten.toLocaleString("fr-FR")} / {total.toLocaleString("fr-FR")}
        </span>
        <span
          style={{
            fontSize: 11,
            lineHeight: 1,
            fontWeight: 600,
            color: "#74BF7A",
          }}
        >
          {diff > 0
            ? `Surplus: +${diff} kcal`
            : `Encore: ${Math.abs(diff)} kcal`}
        </span>
      </div>
    </div>
  );
}

function MacroArc({
  pct,
  color,
  side,
}: {
  pct: number;
  color: string;
  side: "left" | "right";
}) {
  const r = 32;
  const sw = 5.5;
  const size = r * 2 + sw + 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const arcLen = 0.3 * circ;
  const progress = Math.min(pct, 1) * arcLen;
  const startAngle = side === "left" ? 126 : -54;
  const cropW = Math.ceil(r * 0.42 + sw / 2 + 2);
  const vb =
    side === "left"
      ? `0 0 ${cropW} ${size}`
      : `${size - cropW} 0 ${cropW} ${size}`;

  return (
    <svg width={cropW} height={size} viewBox={vb} style={{ flexShrink: 0 }}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#3a3532"
        strokeWidth={sw}
        strokeDasharray={`${arcLen} ${circ - arcLen}`}
        transform={`rotate(${startAngle} ${cx} ${cy})`}
      />
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circ - progress}`}
          strokeDashoffset={side === "right" ? -(arcLen - progress) : 0}
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          style={{
            transition:
              "stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease",
          }}
        />
      )}
    </svg>
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
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div style={{ flexShrink: 0, marginRight: -3 }}>
        <MacroArc pct={pct} color={color} side="left" />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            paddingBottom: 2,
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "var(--text-primary)",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {label}
          </span>
        </div>
        <div
          style={{
            width: "35%",
            height: 5,
            borderRadius: 99,
            background: "#3a3532",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: `${Math.min(pct, 1) * 100}%`,
              height: "100%",
              borderRadius: 99,
              background: color,
              transition: "width 700ms ease",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
            paddingTop: 4,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "var(--text-primary)",
              textAlign: "center",
            }}
          >
            {Math.round(value)} / {max} g
          </span>
          <span
            style={{
              fontSize: 11,
              textAlign: "center",
              color: value >= max ? "#74BF7A" : "var(--text-muted)",
            }}
          >
            {value >= max
              ? `Atteint (+${Math.round(value - max)}g)`
              : `Encore ${Math.round(max - value)}g`}
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0, marginLeft: -3 }}>
        <MacroArc pct={pct} color={color} side="right" />
      </div>
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

  return (
    <div
      style={{
        background: "#262220",
        borderRadius: 16,
        border: "none",
        padding: "20px 16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
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
        <SideCard
          value={totalCalories}
          label="Mangées"
          pct={objectif > 0 ? totalCalories / objectif : 0}
        />

        <CalorieRing eaten={totalCalories} total={objectif} />

        <SideCard value={objectif} label="Objectif" pct={1} />
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
          color="#ECC761"
        />
        <MacroCol
          label="Protéines"
          value={totalProteines}
          max={profile.objectif_proteines ?? 150}
          color="#C85F57"
        />
        <MacroCol
          label="Lipides"
          value={totalLipides}
          max={profile.objectif_lipides ?? 70}
          color="#5F94C6"
        />
      </div>
    </div>
  );
}
