"use client";

import { memo, useState, useCallback } from "react";
import {
  Plus,
  ChevronRight,
  Timer,
  ChevronDown,
  Flame,
  MoreVertical,
  ArrowLeftRight,
  Trash2,
} from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import type { WorkoutSet } from "@/store/workoutStore";
import { saveExerciseRest } from "@/app/actions/routines";
import SetRow from "./SetRow";
import RestDurationPicker from "./RestDurationPicker";
import ExerciseGif from "./ExerciseGif";

function formatRest(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m} min` : `${m} min ${r}s`;
}

interface Props {
  uid: string;
  isOpen: boolean;
  onOpen: (uid: string) => void;
  onPR?: (exerciseName: string, poids: number, reps: number) => void;
  onReplace?: (uid: string) => void;
}

function ExerciseCard({ uid, isOpen, onOpen, onPR, onReplace }: Props) {
  const exercise = useWorkoutStore((s) =>
    s.activeWorkout?.exercises.find((e) => e.uid === uid),
  );
  const addSet = useWorkoutStore((s) => s.addSet);
  const addWarmupSets = useWorkoutStore((s) => s.addWarmupSets);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleComplete = useWorkoutStore((s) => s.toggleComplete);
  const setExerciseRestDuration = useWorkoutStore(
    (s) => s.setExerciseRestDuration,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = useCallback(
    (set: WorkoutSet) => {
      if (
        !set.completed &&
        set.poids &&
        set.reps &&
        set.poidsRef &&
        set.poids > set.poidsRef
      ) {
        onPR?.(exercise?.nom ?? "", set.poids, set.reps);
      }
      toggleComplete(uid, set.id);
    },
    [uid, exercise?.nom, onPR, toggleComplete],
  );

  const handleUpdateSet = useCallback(
    (setId: string, field: "reps" | "poids", value: number | null) => {
      updateSet(uid, setId, field, value);
    },
    [uid, updateSet],
  );

  const handleRemoveSet = useCallback(
    (setId: string) => {
      removeSet(uid, setId);
    },
    [uid, removeSet],
  );

  if (!exercise) return null;

  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const allDone =
    exercise.sets.length > 0 && completedCount === exercise.sets.length;
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed);
  const hasWarmup = exercise.sets.some((s) => s.isWarmup);

  // Vue condensée (exercice fermé)
  if (!isOpen) {
    return (
      <button
        onClick={() => onOpen(uid)}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-opacity active:opacity-70"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
        }}
      >
        <ExerciseGif
          gifUrl={exercise.gifUrl ?? null}
          nom={exercise.nom}
          size="sm"
        />

        <span
          className="flex-1 font-semibold text-sm"
          style={{
            color: allDone ? "var(--text-secondary)" : "var(--text-primary)",
          }}
        >
          {exercise.nom}
        </span>

        {allDone ? (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{
              background: "rgba(34,197,94,0.12)",
              color: "var(--success)",
            }}
          >
            Terminé
          </span>
        ) : (
          <span
            className="text-xs shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {completedCount}/{exercise.sets.length} séries
          </span>
        )}

        <ChevronRight
          size={16}
          style={{ color: "var(--text-muted)" }}
          className="shrink-0"
        />
      </button>
    );
  }

  // Vue ouverte (exercice actif, bordure orange)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        border: "1.5px solid var(--accent)",
      }}
    >
      {/* En-tête exercice */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <ExerciseGif
          gifUrl={exercise.gifUrl ?? null}
          nom={exercise.nom}
          size="md"
        />
        <span
          className="flex-1 font-semibold text-base"
          style={{ color: "var(--text-primary)" }}
        >
          {exercise.nom}
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: "rgba(59,130,246,0.15)", color: "#93C5FD" }}
        >
          {exercise.groupeMusculaire}
        </span>
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg transition-opacity active:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 z-[60] w-52 rounded-xl py-1 shadow-lg"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onReplace?.(uid);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold transition-opacity active:opacity-70"
                  style={{ color: "var(--text-primary)" }}
                >
                  <ArrowLeftRight
                    size={14}
                    style={{ color: "var(--accent)" }}
                  />
                  Remplacer l&apos;exercice
                </button>
                <div
                  className="mx-3 h-px"
                  style={{ background: "var(--border)" }}
                />
                <button
                  onClick={() => {
                    setShowMenu(false);
                    removeExercise(uid);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold transition-opacity active:opacity-70"
                  style={{ color: "var(--danger, #EF4444)" }}
                >
                  <Trash2 size={14} />
                  Supprimer l&apos;exercice
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bouton minuteur repos */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity active:opacity-70"
          style={{
            background: "var(--bg-elevated)",
            color:
              exercise.restDuration != null
                ? "var(--accent)"
                : "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <Timer size={12} />
          {exercise.restDuration != null
            ? formatRest(exercise.restDuration)
            : "Aucun minuteur"}
          <ChevronDown size={11} />
        </button>
      </div>

      {/* En-têtes colonnes */}
      <div
        className="flex items-center gap-2 px-3 pb-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span
          className="w-6 text-center"
          style={{
            color: "var(--text-muted)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          #
        </span>
        <div className="flex flex-1 gap-2">
          <span
            className="flex-1 text-center"
            style={{
              color: "var(--text-muted)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            POIDS
          </span>
          <span
            className="flex-1 text-center"
            style={{
              color: "var(--text-muted)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            REPS
          </span>
        </div>
        <span
          className="w-11 text-center"
          style={{
            color: "var(--text-muted)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          PRÉC.
        </span>
        <span className="w-8" />
        <span className="w-7" />
      </div>

      {/* Lignes séries */}
      <div className="px-1 pt-1 pb-1 space-y-0.5">
        {(() => {
          const warmupSets = exercise.sets.filter((s) => s.isWarmup);
          const workingSets = exercise.sets.filter((s) => !s.isWarmup);
          const allWarmupDone =
            warmupSets.length > 0 && warmupSets.every((s) => s.completed);

          return (
            <>
              {allWarmupDone ? (
                <div
                  className="flex items-center gap-2 px-3 py-2 mx-1 rounded-xl text-xs font-medium"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <Flame size={13} />
                  <span>
                    Échauffement :{" "}
                    {warmupSets.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && (
                          <span style={{ color: "var(--text-muted)" }}>
                            {" "}
                            ·{" "}
                          </span>
                        )}
                        {s.poids != null ? `${s.poids}kg` : "—"}×{s.reps ?? "—"}
                      </span>
                    ))}
                  </span>
                </div>
              ) : (
                warmupSets.map((set) => {
                  const globalIdx = exercise.sets.indexOf(set);
                  return (
                    <SetRow
                      key={set.id}
                      set={set}
                      isActive={globalIdx === firstIncompleteIdx}
                      onUpdate={handleUpdateSet}
                      onToggle={handleToggle}
                      onRemove={handleRemoveSet}
                    />
                  );
                })
              )}
              {workingSets.map((set) => {
                const globalIdx = exercise.sets.indexOf(set);
                return (
                  <SetRow
                    key={set.id}
                    set={set}
                    isActive={globalIdx === firstIncompleteIdx}
                    onUpdate={handleUpdateSet}
                    onToggle={handleToggle}
                    onRemove={handleRemoveSet}
                  />
                );
              })}
            </>
          );
        })()}
      </div>

      {/* Ajouter une série + Échauffement */}
      <div className="flex border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => addSet(uid)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          <Plus size={15} />
          Ajouter une série
        </button>
        <div style={{ width: "1px", background: "var(--border)" }} />
        <button
          onClick={() => addWarmupSets(uid)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm transition-opacity hover:opacity-70"
          style={{ color: hasWarmup ? "var(--accent)" : "var(--text-muted)" }}
        >
          <Flame size={15} />
          Échauffement
        </button>
      </div>

      {showPicker && (
        <RestDurationPicker
          current={exercise.restDuration}
          onSelect={(d) => {
            setExerciseRestDuration(uid, d);
            saveExerciseRest(exercise.exerciseId, d);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default memo(ExerciseCard);
