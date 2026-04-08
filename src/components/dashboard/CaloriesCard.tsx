"use client";

import { memo } from "react";

const C = {
  text: "#4A3728",
  muted: "#78716C",
  secondary: "#A8A29E",
  track: "rgba(74,55,40,0.1)",
} as const;

interface Props {
  consumed: number;
  objective: number;
}

export default memo(function CaloriesCard({ consumed, objective }: Props) {
  const ratio = objective > 0 ? Math.min(consumed / objective, 1) : 0;
  const remaining = Math.max(objective - consumed, 0);
  const pct = Math.round(ratio * 100);
  const r = 27;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - ratio);

  return (
    <div>
      <p
        className="uppercase"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: C.secondary,
          marginBottom: 12,
        }}
      >
        Calories du jour
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5 mb-3.5">
            <span
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontSize: 28,
                color: C.text,
                letterSpacing: "-0.02em",
              }}
            >
              {consumed.toLocaleString("fr-FR")}
            </span>
            <span style={{ fontSize: 13, color: C.muted }}>
              / {objective.toLocaleString("fr-FR")} kcal
            </span>
          </div>

          {/* Barre */}
          <div
            className="overflow-hidden"
            style={{
              height: 6,
              borderRadius: 999,
              background: C.track,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #c4a882, #a0785c)",
                width: `${pct}%`,
                transition: "width 0.8s ease",
              }}
            />
          </div>

          <div className="flex justify-end mt-2">
            <span style={{ fontSize: 12, color: C.muted }}>
              {remaining.toLocaleString("fr-FR")} kcal restantes
            </span>
          </div>
        </div>

        {/* Anneau */}
        <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 64 64"
            style={{ transform: "rotate(-90deg)" }}
          >
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c4a882" />
                <stop offset="100%" stopColor="#a0785c" />
              </linearGradient>
            </defs>
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke={C.track}
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="url(#calGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontSize: 14,
                color: C.text,
                lineHeight: 1,
              }}
            >
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
