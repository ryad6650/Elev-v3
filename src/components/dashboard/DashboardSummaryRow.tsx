"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import SleepModal from "./SleepModal";

function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

/* ── Arc SVG avec ouverture en bas ── */
const GAP_DEG = 80;
const ARC_DEG = 360 - GAP_DEG;
const ARC_RATIO = ARC_DEG / 360;

function ProgressRing({
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
  const arcLen = circ * ARC_RATIO;
  const gapLen = circ - arcLen;
  const fillLen = Math.min(pct, 1) * arcLen;
  const center = size / 2;
  /* Rotation : place le debut de l'arc juste apres l'ouverture bas-gauche */
  const rotDeg = 90 + GAP_DEG / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: `rotate(${rotDeg}deg)` }}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${arcLen} ${gapLen}`}
        strokeLinecap="round"
      />
      {/* Progression */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${fillLen} ${circ - fillLen}`}
        style={{ transition: "stroke-dasharray 800ms ease" }}
      />
    </svg>
  );
}

interface Props {
  calories: number;
  objectifCalories: number;
  poids: number | null;
  sommeilMinutes: number | null;
}

export default function DashboardSummaryRow({
  calories,
  objectifCalories,
  poids,
  sommeilMinutes,
}: Props) {
  const [sleepOpen, setSleepOpen] = useState(false);
  const [localSommeil, setLocalSommeil] = useState(sommeilMinutes);

  const calPct = objectifCalories > 0 ? calories / objectifCalories : 0;
  const sommeilPct = localSommeil != null ? localSommeil / 480 : 0;
  const poidsPct = poids != null ? 0.88 : 0;

  const today = new Date().toISOString().split("T")[0];
  const ringSize = 96;
  const ringStroke = 7;

  const items = [
    {
      key: "kcal",
      title: "Kcal",
      value: calories.toLocaleString("fr-FR"),
      sub: `kcal / ${objectifCalories.toLocaleString("fr-FR")}`,
      pct: calPct,
      color: "#74BF7A",
      trend: "up" as const,
    },
    {
      key: "kg",
      title: "Kg",
      value: poids != null ? poids.toString() : "—",
      sub: poids != null ? `kg / ${poids.toFixed(0)}.0` : "kg",
      pct: poidsPct,
      color: "#74BF7A",
      trend: "down" as const,
    },
    {
      key: "sommeil",
      title: "Sommeil",
      value: localSommeil != null ? formatSleep(localSommeil) : "—",
      sub: "/ 8h",
      pct: sommeilPct,
      color: "#a78bfa",
      trend: "up" as const,
    },
  ];

  return (
    <>
      <div className="flex gap-3">
        {items.map((item) => {
          const isSommeil = item.key === "sommeil";
          const Tag = isSommeil ? "button" : "div";
          const TrendIcon = item.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <Tag
              key={item.key}
              className="flex-1 flex flex-col items-center"
              style={{
                background: "#262220",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: "8px 8px 8px",
                cursor: isSommeil ? "pointer" : "default",
              }}
              {...(isSommeil ? { onClick: () => setSleepOpen(true) } : {})}
            >
              {/* Titre + trend */}
              <div
                className="flex items-center justify-between w-full"
                style={{ marginBottom: 8, padding: "0 4px" }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.title}
                </span>
                <TrendIcon size={16} strokeWidth={2.5} color={item.color} />
              </div>

              {/* Cercle de progression */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: ringSize, height: ringSize }}
              >
                <ProgressRing
                  size={ringSize}
                  strokeWidth={ringStroke}
                  pct={item.pct}
                  color={item.color}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ lineHeight: 1 }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    {item.sub}
                  </span>
                </div>
              </div>
            </Tag>
          );
        })}
      </div>

      {sleepOpen && (
        <SleepModal
          date={today}
          initialMinutes={localSommeil}
          onClose={() => setSleepOpen(false)}
          onSaved={(m) => setLocalSommeil(m)}
        />
      )}
    </>
  );
}
