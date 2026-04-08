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

  const inputBg = isActive ? "var(--accent-bg)" : "var(--glass-subtle)";
  const inputBorder = isActive
    ? "1px solid rgba(116,191,122,0.3)"
    : "1px solid var(--glass-border)";

  return (
    <div
      className="grid items-center gap-1 px-3.5 py-1"
      style={{
        gridTemplateColumns: "28px 1fr 1fr 1fr 32px",
        background: set.completed ? "rgba(116,191,122,0.06)" : "transparent",
        opacity: set.isWarmup ? 0.55 : 1,
      }}
    >
      {/* # ou ✓ */}
      <div className="flex items-center justify-start">
        {set.completed ? (
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--accent-text)" }}
          >
            ✓
          </span>
        ) : (
          <span
            className="text-[11px] font-bold"
            style={{
              color: set.isWarmup ? "var(--accent-text)" : "var(--text-muted)",
            }}
          >
            {numLabel}
          </span>
        )}
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
          className="w-full h-[30px] text-center text-[13px] font-semibold rounded-lg outline-none"
          style={{
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
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
          className="w-full h-[30px] text-center text-[13px] font-semibold rounded-lg outline-none"
          style={{
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
          }}
        />
      </div>

      {/* Préc. */}
      <div className="text-center">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {precStr}
        </span>
      </div>

      {/* Check */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => onToggle(set)}
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: set.completed ? "#4A9B54" : "var(--glass-subtle)",
            border: set.completed ? "none" : "1.5px solid var(--glass-border)",
          }}
        >
          {set.completed && <Check size={10} strokeWidth={3} color="#fff" />}
        </button>
      </div>
    </div>
  );
}

export default memo(
  SetRow,
  (prev, next) => prev.set === next.set && prev.isActive === next.isActive,
);
