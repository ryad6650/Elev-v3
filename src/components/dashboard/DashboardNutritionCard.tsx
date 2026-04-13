"use client";

/* ── Demi-arc gauche (180°) pour les macros ── */
function HalfArc({
  size,
  strokeWidth,
  pct,
  color,
}: {
  size: number;
  strokeWidth: number;
  pct: number;
  color: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const fill = Math.min(pct, 1) * half;
  const c = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(90deg)" }}
    >
      {/* Track demi-cercle gauche */}
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${half} ${half}`}
        strokeLinecap="round"
      />
      {/* Progression */}
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${fill} ${circ - fill}`}
        style={{ transition: "stroke-dasharray 800ms ease" }}
      />
    </svg>
  );
}

function MacroItem({
  emoji,
  label,
  value,
  max,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? value / max : 0;
  const diff = max - value;
  const subText =
    diff > 0
      ? `Encore ${Math.round(diff)}g`
      : `Atteint (+${Math.abs(Math.round(diff))}g)`;
  const arcSize = 48;

  return (
    <div className="flex items-center" style={{ gap: 0 }}>
      {/* Demi-arc + emoji */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: arcSize, height: arcSize }}
      >
        <HalfArc size={arcSize} strokeWidth={5} pct={pct} color={color} />
        <span className="absolute" style={{ fontSize: 20, lineHeight: 1 }}>
          {emoji}
        </span>
      </div>
      {/* Texte */}
      <div className="flex flex-col" style={{ minWidth: 0, marginLeft: -8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          {value}/{max}g
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {subText}
        </span>
      </div>
    </div>
  );
}

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
  const pct = objectif > 0 ? Math.min(calories / objectif, 1) : 0;
  const pctDisplay = Math.round(pct * 100);
  const surplus = calories - objectif;

  /* Grand cercle de progression */
  const bigSize = 100;
  const bigStroke = 8;
  const bigR = (bigSize - bigStroke) / 2;
  const bigCirc = 2 * Math.PI * bigR;
  const bigOffset = bigCirc * (1 - pct);

  /* Cercle interieur (proteines) */
  const innerSize = 74;
  const innerStroke = 6;
  const innerR = (innerSize - innerStroke) / 2;
  const innerCirc = 2 * Math.PI * innerR;
  const protPct =
    objectifProteines > 0 ? Math.min(proteines / objectifProteines, 1) : 0;
  const innerOffset = innerCirc * (1 - protPct);

  return (
    <div
      style={{
        background: "rgba(38,34,32,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        padding: 22,
      }}
    >
      {/* Top: double ring + info */}
      <div className="flex items-center gap-5" style={{ marginBottom: 20 }}>
        {/* Double ring */}
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{ width: bigSize, height: bigSize }}
        >
          {/* Outer ring (calories) */}
          <svg
            width={bigSize}
            height={bigSize}
            viewBox={`0 0 ${bigSize} ${bigSize}`}
            className="absolute inset-0"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={bigSize / 2}
              cy={bigSize / 2}
              r={bigR}
              fill="none"
              stroke="rgba(239,98,52,0.2)"
              strokeWidth={bigStroke}
            />
            <circle
              cx={bigSize / 2}
              cy={bigSize / 2}
              r={bigR}
              fill="none"
              stroke="#ef6234"
              strokeWidth={bigStroke}
              strokeLinecap="round"
              strokeDasharray={bigCirc}
              strokeDashoffset={bigOffset}
              style={{ transition: "stroke-dashoffset 800ms ease" }}
            />
          </svg>

          {/* Inner ring (proteines) */}
          <svg
            width={innerSize}
            height={innerSize}
            viewBox={`0 0 ${innerSize} ${innerSize}`}
            className="absolute"
            style={{
              transform: "rotate(-90deg)",
              left: (bigSize - innerSize) / 2,
              top: (bigSize - innerSize) / 2,
            }}
          >
            <circle
              cx={innerSize / 2}
              cy={innerSize / 2}
              r={innerR}
              fill="none"
              stroke="rgba(116,191,122,0.2)"
              strokeWidth={innerStroke}
            />
            <circle
              cx={innerSize / 2}
              cy={innerSize / 2}
              r={innerR}
              fill="none"
              stroke="#74BF7A"
              strokeWidth={innerStroke}
              strokeLinecap="round"
              strokeDasharray={innerCirc}
              strokeDashoffset={innerOffset}
              style={{ transition: "stroke-dashoffset 800ms ease" }}
            />
          </svg>

          {/* Pourcentage au centre */}
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text-primary)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {pctDisplay}%
          </span>
        </div>

        {/* Info texte */}
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {calories.toLocaleString("fr-FR")}{" "}
            <span
              style={{
                fontSize: 16,
                color: "var(--text-muted)",
                fontFamily: "var(--font-nunito), sans-serif",
              }}
            >
              / {objectif.toLocaleString("fr-FR")}
            </span>
          </div>
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            calories consommées
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#74BF7A",
              marginTop: 6,
            }}
          >
            {surplus > 0
              ? `Surplus: +${surplus.toLocaleString("fr-FR")} kcal`
              : surplus === 0
                ? "Objectif atteint"
                : `${Math.abs(surplus).toLocaleString("fr-FR")} kcal restantes`}
          </div>
        </div>
      </div>

      {/* Macros avec demi-arcs */}
      <div className="flex">
        <div style={{ flex: "1 1 0%", minWidth: 0, marginLeft: -6 }}>
          <MacroItem
            emoji="🍝"
            label="Glucides"
            value={glucides}
            max={objectifGlucides}
            color="#eab308"
          />
        </div>
        <div style={{ flex: "1 1 0%", minWidth: 0, paddingLeft: 28 }}>
          <MacroItem
            emoji="🍗"
            label="Protéines"
            value={proteines}
            max={objectifProteines}
            color="#ef4444"
          />
        </div>
        <div style={{ flex: "1 1 0%", minWidth: 0, paddingLeft: 30 }}>
          <MacroItem
            emoji="🥑"
            label="Lipides"
            value={lipides}
            max={objectifLipides}
            color="#3b82f6"
          />
        </div>
      </div>
    </div>
  );
}
