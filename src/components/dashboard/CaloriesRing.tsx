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

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(consumed / objective, 1);
  const dashOffset = circumference * (1 - (animated ? ratio : 0));
  const remaining = Math.max(objective - consumed, 0);

  return (
    <div className="flex items-center gap-5">
      {/* Anneau SVG */}
      <div className="relative shrink-0" style={{ width: 92, height: 92 }}>
        <svg width={92} height={92} className="-rotate-90">
          <circle
            cx={46} cy={46} r={radius}
            fill="none" stroke="rgba(232, 134, 12, 0.18)" strokeWidth={9}
          />
          <circle
            cx={46} cy={46} r={radius}
            fill="none" stroke="#C8622E" strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none" style={{ color: "var(--text-primary)" }}>
            {consumed}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>kcal</span>
        </div>
      </div>

      {/* Colonne droite */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Calories aujourd'hui
        </p>
        <div className="flex gap-6">
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: "#C8622E" }}>
              {objective}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Objectif</p>
          </div>
          <div>
            <p className="text-lg font-bold leading-none" style={{ color: "#F5A623" }}>
              {remaining}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Restant</p>
          </div>
        </div>
      </div>
    </div>
  );
}
