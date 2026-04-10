"use client";

import { memo } from "react";

interface MacroProps {
  value: number;
  objective: number;
  color: string;
  label: string;
}

function MacroCol({ value, objective, color, label }: MacroProps) {
  const percent = objective > 0 ? Math.min((value / objective) * 100, 100) : 0;

  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <span
        className="text-lg font-bold leading-none"
        style={{ color: "#FAFAF9", letterSpacing: "-0.01em" }}
      >
        {value}g
      </span>
      <div
        className="w-full h-[3px] rounded-sm overflow-hidden"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: `${percent}%`,
            background: color,
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <span
        className="text-[9px] font-semibold tracking-[0.05em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface Props {
  proteines: { consumed: number; objective: number };
  glucides: { consumed: number; objective: number };
  lipides: { consumed: number; objective: number };
}

export default memo(function MacrosCard({
  proteines,
  glucides,
  lipides,
}: Props) {
  return (
    <div
      className="rounded-2xl py-5 px-4 flex items-center"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <MacroCol
        value={glucides.consumed}
        objective={glucides.objective}
        color="#936A4F"
        label="Glucides"
      />
      <div
        className="w-px h-8 mx-2"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <MacroCol
        value={proteines.consumed}
        objective={proteines.objective}
        color="#0589D6"
        label="Proteines"
      />
      <div
        className="w-px h-8 mx-2"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <MacroCol
        value={lipides.consumed}
        objective={lipides.objective}
        color="#C07858"
        label="Lipides"
      />
    </div>
  );
});
