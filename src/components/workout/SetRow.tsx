"use client";

import { memo, useCallback } from "react";
import { Check, Trash2 } from "lucide-react";
import type { WorkoutSet } from "@/store/workoutStore";

interface Props {
  set: WorkoutSet;
  isActive: boolean;
  onUpdate: (
    setId: string,
    field: "reps" | "poids",
    value: number | null,
  ) => void;
  onToggle: (set: WorkoutSet) => void;
  onRemove: (setId: string) => void;
}

function SetRow({ set, isActive, onUpdate, onToggle, onRemove }: Props) {
  const repsPlaceholder =
    set.repsCible > 0
      ? set.repsCibleMax
        ? `${set.repsCible}-${set.repsCibleMax}`
        : `${set.repsCible}`
      : "—";

  const numLabel = set.isWarmup ? `W${set.numSerie}` : `${set.numSerie}`;

  const precStr =
    set.poidsRef != null
      ? set.repsRef != null
        ? `${set.poidsRef}×${set.repsRef}`
        : `${set.poidsRef}kg`
      : "—";

  const inputBg = isActive ? "rgba(196,168,130,0.08)" : "rgba(255,255,255,0.5)";
  const inputBorder = isActive
    ? "1px solid var(--bar-to)"
    : "1px solid rgba(74,55,40,0.1)";

  return (
    <div
      className="grid items-center gap-1 px-3.5 py-1"
      style={{
        gridTemplateColumns: "28px 1fr 1fr 1fr 32px",
        borderBottom: "1px solid rgba(74,55,40,0.05)",
        opacity: set.isWarmup ? 0.55 : 1,
      }}
    >
      {/* # */}
      <div className="flex items-center justify-start">
        <span
          className="text-[10px] font-bold"
          style={{
            color: set.isWarmup ? "var(--text-secondary)" : "var(--text-muted)",
          }}
        >
          {numLabel}
        </span>
      </div>

      {/* Poids */}
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          placeholder={set.poidsRef != null ? `${set.poidsRef}` : "0"}
          value={set.poids ?? ""}
          onChange={(e) =>
            onUpdate(
              set.id,
              "poids",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          className="w-[48px] h-[26px] text-center text-[11px] font-semibold rounded-lg outline-none"
          style={{
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
            fontFamily: "var(--font-dm-sans)",
          }}
        />
      </div>

      {/* Reps */}
      <div>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={repsPlaceholder}
          value={set.reps ?? ""}
          onChange={(e) =>
            onUpdate(
              set.id,
              "reps",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          className="w-[48px] h-[26px] text-center text-[11px] font-semibold rounded-lg outline-none mx-auto block"
          style={{
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
            fontFamily: "var(--font-dm-sans)",
          }}
        />
      </div>

      {/* Préc. */}
      <div className="text-center">
        <span className="text-[9px]" style={{ color: "var(--text-secondary)" }}>
          {precStr}
        </span>
      </div>

      {/* Check */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => onToggle(set)}
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: set.completed
              ? "rgba(116,191,122,0.15)"
              : "transparent",
            border: set.completed
              ? "2px solid #74bf7a"
              : "2px solid rgba(74,55,40,0.15)",
          }}
        >
          {set.completed && <Check size={10} strokeWidth={3} color="#74bf7a" />}
        </button>
      </div>
    </div>
  );
}

export default memo(
  SetRow,
  (prev, next) => prev.set === next.set && prev.isActive === next.isActive,
);
