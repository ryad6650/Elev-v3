"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import type { WorkoutSet } from "@/store/workoutStore";

interface Props {
  set: WorkoutSet;
  isActive: boolean;
  index?: number;
  onUpdate: (
    setId: string,
    field: "reps" | "poids",
    value: number | null,
  ) => void;
  onToggle: (set: WorkoutSet) => void;
  onRemove: (setId: string) => void;
}

function SetRow({ set, isActive, index = 0, onUpdate, onToggle }: Props) {
  const repsPlaceholder =
    set.repsCible > 0
      ? set.repsCibleMax
        ? `${set.repsCible}-${set.repsCibleMax}`
        : `${set.repsCible}`
      : "—";

  const numLabel = set.isWarmup ? `W${set.numSerie}` : `${set.numSerie}`;

  const precStr =
    set.poidsRef != null && set.repsRef != null
      ? `${set.poidsRef}kg x ${set.repsRef}`
      : set.poidsRef != null
        ? `${set.poidsRef}kg`
        : "—";

  const inputBase: React.CSSProperties = {
    padding: "8px 4px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-nunito), sans-serif",
    fontSize: 15,
    fontWeight: 400,
    background: "transparent",
    border: "none",
    borderRadius: 8,
    outline: "none",
    width: "100%",
    textAlign: "center" as const,
  };

  return (
    <div
      className="grid items-center px-4 py-2"
      style={{
        gridTemplateColumns: "40px 1fr 80px 70px 40px",
        gap: "0 8px",
        borderTop: "none",
        background: index % 2 === 1 ? "#1C1C1E" : "transparent",
        opacity: set.isWarmup ? 0.55 : 1,
      }}
    >
      {/* Série # */}
      <span
        className="text-center text-[17px] font-bold"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          color: "var(--text-primary)",
        }}
      >
        {numLabel}
      </span>

      {/* Précédent */}
      <span
        className="text-[15px] truncate text-center"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          color: "var(--text-muted)",
        }}
      >
        {precStr}
      </span>

      {/* KG input */}
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
        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        style={inputBase}
      />

      {/* Réps input */}
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
        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        style={inputBase}
      />

      {/* Checkbox carré */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => onToggle(set)}
          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: set.completed ? "#3A3A3C" : "#2C2C2E",
            border: set.completed ? "none" : "1.5px solid #48484A",
          }}
        >
          {set.completed && <Check size={11} strokeWidth={3} color="#fff" />}
        </button>
      </div>
    </div>
  );
}

export default memo(
  SetRow,
  (prev, next) =>
    prev.set === next.set &&
    prev.isActive === next.isActive &&
    prev.index === next.index,
);
