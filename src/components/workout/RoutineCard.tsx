"use client";

import { ChevronDown, MoreVertical, Play } from "lucide-react";
import type { Routine } from "@/lib/workout";
import type { RoutineExerciseData } from "@/app/actions/routines";
import ExerciseGif from "./ExerciseGif";

const ACCENT_COLORS = [
  "var(--green)",
  "var(--color-protein)",
  "var(--color-carbs)",
  "#9B7EC8",
  "var(--color-fat)",
];

interface Props {
  routine: Routine;
  index: number;
  onToggle: () => void;
  onOptions: () => void;
  onStart: () => void;
  expanded: boolean;
  exercises: RoutineExerciseData[];
  loadingExpanded: boolean;
}

export default function RoutineCard({
  routine,
  index,
  onToggle,
  onOptions,
  onStart,
  expanded,
  exercises,
  loadingExpanded,
}: Props) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
      {/* Row principale */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="flex items-center gap-3 py-3.5 cursor-pointer active:opacity-80 transition-opacity"
      >
        {/* Barre accent */}
        <div
          className="shrink-0 rounded-sm"
          style={{ width: 4, height: 54, background: accentColor }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: 3,
            }}
          >
            {routine.nom}
          </p>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              {routine.exercisesCount} exercice
              {routine.exercisesCount !== 1 ? "s" : ""} · ~
              {routine.dureeEstimee} min
            </span>
          </div>
          {routine.groupes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {routine.groupes.slice(0, 3).map((g) => (
                <span
                  key={g}
                  style={{
                    fontFamily: "var(--font-nunito), sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.04)",
                    color: "var(--text-muted)",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">
          <ChevronDown
            size={16}
            className="transition-transform duration-200"
            style={{
              color: "var(--text-muted)",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOptions();
            }}
            className="p-1 active:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreVertical size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--green)" }}
          >
            <span className="text-[14px] text-white ml-[1px]">▶</span>
          </button>
        </div>
      </div>

      {/* Section dépliante */}
      {expanded && (
        <div className="pl-5 pr-2 pb-3 pt-1">
          {loadingExpanded ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: "var(--text-muted)" }}
            >
              Chargement...
            </p>
          ) : exercises.length === 0 ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: "var(--text-muted)" }}
            >
              Aucun exercice défini
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <ExerciseGif gifUrl={ex.gifUrl} nom={ex.nom} size="sm" />
                  <span
                    className="flex-1 text-sm"
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {ex.nom}
                  </span>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{
                      fontFamily: "var(--font-nunito), sans-serif",
                      color: "var(--text-muted)",
                    }}
                  >
                    {ex.seriesCible}&times;
                    {ex.repsCibleMax
                      ? `${ex.repsCible}-${ex.repsCibleMax}`
                      : ex.repsCible}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-transform"
            style={{
              background: "var(--green)",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            <Play size={14} fill="white" />
            Démarrer la séance
          </button>
        </div>
      )}
    </div>
  );
}
