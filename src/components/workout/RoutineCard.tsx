"use client";

import { ChevronDown, MoreVertical, Play, ArrowRight } from "lucide-react";
import type { Routine } from "@/lib/workout";
import type { RoutineExerciseData } from "@/app/actions/routines";
import ExerciseGif from "./ExerciseGif";

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

function formatDerniereSeance(date: string | null): string {
  if (!date) return "Jamais effectuée";
  const jours = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return "Hier";
  return `il y a ${jours}j`;
}

export default function RoutineCard({
  routine,
  onToggle,
  onOptions,
  onStart,
  expanded,
  exercises,
  loadingExpanded,
}: Props) {
  return (
    <div
      className="w-full overflow-hidden transition-all relative"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: expanded
          ? "1px solid rgba(116,191,122,0.2)"
          : "1px solid var(--glass-border)",
        borderRadius: 18,
      }}
    >
      {/* Barre verticale gauche */}
      <div
        className="absolute rounded-sm"
        style={{
          left: 10,
          top: 10,
          bottom: 10,
          width: 2,
          background: "#4A3728",
        }}
      />

      {/* Zone principale cliquable */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle();
        }}
        className="flex items-center gap-2.5 text-left transition-all active:scale-[0.98] cursor-pointer"
        style={{ padding: "13px 14px 13px 22px" }}
      >
        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {routine.nom}
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {routine.exercisesCount} exercice
            {routine.exercisesCount !== 1 ? "s" : ""}
            {" \u00B7 ~"}
            {routine.dureeEstimee} min
          </p>
          {routine.groupes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {routine.groupes.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="text-[8px] font-semibold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.06)",
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
              color: "var(--text-muted)",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOptions();
            }}
            className="p-1 rounded-lg transition-opacity active:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreVertical size={16} />
          </button>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.06)",
            }}
          >
            <ArrowRight
              size={11}
              strokeWidth={2.5}
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>
      </div>

      {/* Section depliante */}
      {expanded && (
        <div
          className="px-4 pb-4 border-t"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div className="pt-3 mb-3">
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
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <ExerciseGif gifUrl={ex.gifUrl} nom={ex.nom} size="sm" />
                    <span
                      className="flex-1 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {ex.nom}
                    </span>
                    <span
                      className="text-xs font-semibold tabular-nums shrink-0"
                      style={{ color: "var(--text-muted)" }}
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
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="btn-accent w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
          >
            <Play size={14} fill="white" />
            Démarrer la séance
          </button>
        </div>
      )}
    </div>
  );
}
