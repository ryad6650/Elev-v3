"use client";

import { useEffect, useState } from "react";

interface Props {
  consumed: number;
  objective: number;
}

export default function CaloriesRing({ consumed, objective }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(consumed / objective, 1);
  const dashOffset = circumference * (1 - (animated ? ratio : 0));
  const remaining = Math.max(objective - consumed, 0);
  const percent = Math.round(ratio * 100);

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Grand chiffre à gauche */}
      <div className="flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Calories aujourd'hui
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="leading-none"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              fontSize: 54,
              color: "var(--accent-text)",
              letterSpacing: "-0.02em",
            }}
          >
            {consumed.toLocaleString("fr-FR")}
          </span>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>kcal</span>
        </div>
      </div>

      {/* Mini anneau + meta à droite */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative" style={{ width: 76, height: 76 }}>
          <svg width={76} height={76} className="-rotate-90">
            <circle cx={38} cy={38} r={radius} fill="none" stroke="rgba(232,134,12,0.15)" strokeWidth={6} />
            <circle
              cx={38} cy={38} r={radius} fill="none"
              stroke="url(#cal-grad)" strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <defs>
              <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C8622E" />
                <stop offset="100%" stopColor="#E8860C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {percent}%
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-base font-bold leading-none" style={{ color: "var(--text-secondary)" }}>
              {objective.toLocaleString("fr-FR")}
            </p>
            <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>
              Objectif
            </p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold leading-none" style={{ color: "var(--accent)" }}>
              {remaining.toLocaleString("fr-FR")}
            </p>
            <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>
              Restant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
