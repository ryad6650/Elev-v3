"use client";

import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import ExerciseGif from "./ExerciseGif";
import { getGroupeColor } from "./exerciseColors";

export interface RoutineExercise {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  gifUrl: string | null;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
}

interface Props {
  ex: RoutineExercise;
  index: number;
  total: number;
  onUpdateSeries: (index: number, delta: number) => void;
  onUpdateReps: (index: number, value: string) => void;
  onUpdateRepsMax: (index: number, value: string) => void;
  onToggleRepsMode: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  extraActions?: React.ReactNode;
}

export default function RoutineExerciseCard({
  ex,
  index,
  total,
  onUpdateSeries,
  onUpdateReps,
  onUpdateRepsMax,
  onToggleRepsMode,
  onMove,
  onRemove,
  extraActions,
}: Props) {
  const gColor = getGroupeColor(ex.groupeMusculaire);

  return (
    <div
      className="rounded-2xl relative"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="h-1 rounded-t-2xl" style={{ background: gColor.text }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <ExerciseGif gifUrl={ex.gifUrl} nom={ex.nom} size="md" />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {ex.nom}
              </p>
              <p
                className="text-[11px] capitalize mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {ex.groupeMusculaire}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 relative">
            {extraActions}
            <div className="flex flex-col">
              <button
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                className="p-0.5 disabled:opacity-20"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => onMove(index, 1)}
                disabled={index === total - 1}
                className="p-0.5 disabled:opacity-20"
                style={{ color: "var(--text-muted)" }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg"
              style={{ color: "var(--danger)" }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Séries / Reps */}
        <div className="flex gap-3 mb-2">
          <div
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            <span
              className="text-[10px] uppercase tracking-wide font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Séries
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateSeries(index, -1)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                }}
              >
                −
              </button>
              <span
                className="text-sm font-bold tabular-nums w-4 text-center"
                style={{ color: "var(--accent-text)" }}
              >
                {ex.seriesCible}
              </span>
              <button
                onClick={() => onUpdateSeries(index, 1)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                }}
              >
                +
              </button>
            </div>
          </div>
          <div
            className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            <span
              className="text-[10px] uppercase tracking-wide font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              Reps
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                value={ex.repsCible || ""}
                onChange={(e) => onUpdateReps(index, e.target.value)}
                className="w-10 text-sm font-bold tabular-nums outline-none rounded-lg py-1 [appearance:textfield]"
                style={{
                  color: "var(--accent-text)",
                  background: "var(--bg-card)",
                  textAlign: "center",
                }}
              />
              {ex.repsCibleMax !== null && (
                <>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    –
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ex.repsCibleMax || ""}
                    onChange={(e) => onUpdateRepsMax(index, e.target.value)}
                    className="w-10 text-sm font-bold tabular-nums outline-none rounded-lg py-1 [appearance:textfield]"
                    style={{
                      color: "var(--accent-text)",
                      background: "var(--bg-card)",
                      textAlign: "center",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toggle rep unique / fourchette */}
        <button
          onClick={() => onToggleRepsMode(index)}
          className="w-full py-1.5 rounded-lg text-[10px] uppercase tracking-wide font-semibold transition-all active:scale-[0.98]"
          style={{
            background:
              ex.repsCibleMax !== null
                ? "rgba(232,134,12,0.1)"
                : "var(--bg-elevated)",
            color:
              ex.repsCibleMax !== null
                ? "var(--accent-text)"
                : "var(--text-muted)",
            border:
              ex.repsCibleMax !== null
                ? "1px solid rgba(232,134,12,0.2)"
                : "1px solid var(--border)",
          }}
        >
          {ex.repsCibleMax !== null ? "Fourchette de reps" : "Rep unique"}
        </button>
      </div>
    </div>
  );
}
