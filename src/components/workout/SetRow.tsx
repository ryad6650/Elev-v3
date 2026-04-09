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

  const inputBg = isActive ? "rgba(42,157,110,0.08)" : "rgba(0,0,0,0.03)";
  const inputBorder = isActive ? "1.5px solid var(--green)" : "none";

  return (
    <div
      className="grid items-center px-[18px] py-1"
      style={{
        gridTemplateColumns: "32px 1fr 1fr 1fr 36px",
        gap: "4px 6px",
        opacity: set.isWarmup ? 0.55 : 1,
      }}
    >
      {/* # */}
      <div className="flex items-center justify-center">
        <span
          className="text-[12px] font-bold"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            color: isActive ? "var(--green)" : "var(--text-muted)",
            fontWeight: isActive ? 800 : 700,
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
          className="w-full text-center text-[14px] font-bold rounded-[8px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          style={{
            padding: "8px 4px",
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
            fontFamily: "var(--font-nunito), sans-serif",
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
          className="w-full text-center text-[14px] font-bold rounded-[8px] outline-none block [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          style={{
            padding: "8px 4px",
            background: inputBg,
            color: "var(--text-primary)",
            border: inputBorder,
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        />
      </div>

      {/* Préc. */}
      <div className="text-center">
        <span
          className="text-[11px] font-medium"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            color: "var(--text-muted)",
          }}
        >
          {precStr}
        </span>
      </div>

      {/* Check */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => onToggle(set)}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: set.completed ? "var(--green)" : "rgba(0,0,0,0.06)",
          }}
        >
          {set.completed ? (
            <Check size={14} strokeWidth={3} color="#fff" />
          ) : (
            <div
              className="w-3 h-3 rounded-full"
              style={{ border: "2px solid var(--text-muted)" }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export default memo(
  SetRow,
  (prev, next) => prev.set === next.set && prev.isActive === next.isActive,
);
