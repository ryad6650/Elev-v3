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

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(consumed / objective, 1);
  const dashOffset = circumference * (1 - (animated ? ratio : 0));
  const remaining = objective - consumed;

  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="relative" style={{ width: 136, height: 136 }}>
        <svg width={136} height={136} className="-rotate-90">
          {/* Track */}
          <circle
            cx={68}
            cy={68}
            r={radius}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={10}
          />
          {/* Progression */}
          <circle
            cx={68}
            cy={68}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: "var(--accent-text)" }}>
            {consumed}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            kcal
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        {remaining > 0 ? (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="font-semibold" style={{ color: "var(--accent-text)" }}>
              {remaining}
            </span>{" "}
            restants
          </p>
        ) : (
          <p className="text-xs font-semibold" style={{ color: "var(--danger)" }}>
            Objectif dépassé
          </p>
        )}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          / {objective} kcal
        </p>
      </div>
    </div>
  );
}
