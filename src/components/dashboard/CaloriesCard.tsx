"use client";

import { memo } from "react";

interface Props {
  consumed: number;
  objective: number;
}

export default memo(function CaloriesCard({ consumed, objective }: Props) {
  const ratio = objective > 0 ? Math.min(consumed / objective, 1) : 0;
  const remaining = Math.max(objective - consumed, 0);

  return (
    <div
      className="rounded-[20px] p-4 px-[18px]"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <p
        className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2.5"
        style={{ color: "#FAFAF9", opacity: 0.65 }}
      >
        Calories aujourd&apos;hui
      </p>

      <div className="flex items-end gap-1.5 mb-3">
        <span
          className="leading-none"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 52,
            color: "#FAFAF9",
            letterSpacing: "-0.02em",
          }}
        >
          {consumed.toLocaleString("fr-FR")}
        </span>
        <span
          className="text-[15px] font-medium pb-2"
          style={{ color: "var(--text-muted)" }}
        >
          kcal
        </span>
      </div>

      {/* Barre de progression */}
      <div
        className="h-[5px] rounded-[3px] overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-[3px]"
          style={{
            width: `${ratio * 100}%`,
            background: "linear-gradient(to right, #1B2E1D, #74BF7A)",
            transition: "width 0.7s ease",
          }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {remaining.toLocaleString("fr-FR")} kcal restantes
        </span>
        <span className="text-xs" style={{ color: "#74BF7A", opacity: 0.8 }}>
          / {objective.toLocaleString("fr-FR")}
        </span>
      </div>
    </div>
  );
});
