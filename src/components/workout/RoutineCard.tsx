"use client";

import { ChevronDown, MoreVertical, Play } from "lucide-react";
import type { Routine } from "@/lib/workout";
import type { RoutineExerciseData } from "@/app/actions/routines";
import ExerciseGif from "./ExerciseGif";

const ACCENT_GRADIENTS = [
  "linear-gradient(180deg, #c4a882, #a0785c)",
  "linear-gradient(180deg, #a0785c, #4A3728)",
  "linear-gradient(180deg, #74bf7a, #2d6a32)",
  "linear-gradient(180deg, #6BA3D6, #3b5998)",
  "linear-gradient(180deg, #c07858, #8b4513)",
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
  const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];

  return (
    <div style={{ borderBottom: "1px solid rgba(74,55,40,0.08)" }}>
      {/* Row principale */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="flex items-center gap-2.5 py-2.5 cursor-pointer active:opacity-80 transition-opacity"
      >
        {/* Barre accent */}
        <div
          className="w-1 rounded-sm shrink-0"
          style={{ background: gradient, height: 42 }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] leading-tight mb-[3px]"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "#4A3728",
            }}
          >
            {routine.nom}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[9px]" style={{ color: "#78716C" }}>
              {routine.exercisesCount} exercice
              {routine.exercisesCount !== 1 ? "s" : ""}
            </span>
            <span className="text-[9px]" style={{ color: "#78716C" }}>
              ·
            </span>
            <span className="text-[9px]" style={{ color: "#78716C" }}>
              ~{routine.dureeEstimee} min
            </span>
          </div>
          {routine.groupes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-[5px]">
              {routine.groupes.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-[7px] font-bold tracking-[0.04em] uppercase px-1.5 py-[2px] rounded-md"
                  style={{
                    background: "rgba(74,55,40,0.06)",
                    color: "#78716C",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ChevronDown
            size={14}
            className="transition-transform duration-200"
            style={{
              color: "#78716C",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOptions();
            }}
            className="p-1 active:opacity-70"
            style={{ color: "#78716C" }}
          >
            <MoreVertical size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
          >
            <span className="text-[12px] text-white ml-[1px]">▶</span>
          </button>
        </div>
      </div>

      {/* Section dépliante */}
      {expanded && (
        <div className="pl-4 pr-2 pb-3 pt-1">
          {loadingExpanded ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: "#78716C" }}
            >
              Chargement...
            </p>
          ) : exercises.length === 0 ? (
            <p
              className="text-xs text-center py-2"
              style={{ color: "#78716C" }}
            >
              Aucun exercice défini
            </p>
          ) : (
            <div className="space-y-2 mb-3">
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <ExerciseGif gifUrl={ex.gifUrl} nom={ex.nom} size="sm" />
                  <span className="flex-1 text-sm" style={{ color: "#78716C" }}>
                    {ex.nom}
                  </span>
                  <span
                    className="text-xs font-semibold tabular-nums shrink-0"
                    style={{ color: "#A8A29E" }}
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
          >
            <Play size={14} fill="white" />
            Démarrer la séance
          </button>
        </div>
      )}
    </div>
  );
}
