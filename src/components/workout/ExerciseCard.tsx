"use client";

import { memo, useState, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Flame,
  MoreVertical,
  ArrowLeftRight,
  Trash2,
  Timer,
} from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import type { WorkoutSet } from "@/store/workoutStore";
import { saveExerciseRest, saveExerciseNote } from "@/app/actions/routines";
import SetRow from "./SetRow";
import RestDurationPicker from "./RestDurationPicker";
import ExerciseGif from "./ExerciseGif";
import { ExerciseNotesButton, ExerciseNotesArea } from "./ExerciseNotes";

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
  const setExerciseNote = useWorkoutStore((s) => s.setExerciseNote);
  const [showPicker, setShowPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

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
  const totalSets = exercise.sets.filter((s) => !s.isWarmup).length;
  const completedWork = exercise.sets.filter(
    (s) => s.completed && !s.isWarmup,
  ).length;
  const allDone = totalSets > 0 && completedWork === totalSets;
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed);
  const hasWarmup = exercise.sets.some((s) => s.isWarmup);

  // Card fermée
  if (!isOpen) {
    return (
      <button
        onClick={() => onOpen(uid)}
        className="w-full rounded-[18px] overflow-hidden transition-opacity"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--glass-border)",
          opacity: allDone ? 0.6 : 1,
        }}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <ExerciseGif
            gifUrl={exercise.gifUrl ?? null}
            nom={exercise.nom}
            size="sm"
          />
          <div className="flex-1 min-w-0 text-left">
            <p
              className="text-[13px] font-bold leading-tight truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {exercise.nom}
            </p>
            <p
              className="text-[9px] font-semibold mt-0.5"
              style={{ color: "var(--accent-text)", opacity: 0.8 }}
            >
              {exercise.groupeMusculaire}
            </p>
          </div>
          {allDone ? (
            <span
              className="text-[8px] font-bold tracking-[0.04em] rounded-[10px] px-2 py-1 shrink-0"
              style={{ color: "#fff", background: "#4A9B54" }}
            >
              Terminé
            </span>
          ) : (
            <span
              className="text-[8px] font-bold tracking-[0.04em] rounded-[10px] px-2 py-1 shrink-0"
              style={{
                color: "var(--accent-text)",
                background: "rgba(116,191,122,0.12)",
              }}
            >
              {completedWork}/{totalSets}
            </span>
          )}
          <ChevronDown
            size={12}
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
            className="shrink-0"
          />
        </div>

        {/* Warmup résumé si terminé */}
        {allDone && hasWarmup && (
          <WarmupCollapsed sets={exercise.sets.filter((s) => s.isWarmup)} />
        )}
      </button>
    );
  }

  // Card ouverte (active)
  return (
    <div
      className="rounded-[18px] overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(116,191,122,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <ExerciseGif
          gifUrl={exercise.gifUrl ?? null}
          nom={exercise.nom}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {exercise.nom}
          </p>
          <p
            className="text-[9px] font-semibold mt-0.5"
            style={{ color: "var(--accent-text)", opacity: 0.8 }}
          >
            {exercise.groupeMusculaire}
          </p>
        </div>
        <span
          className="text-[8px] font-bold tracking-[0.04em] rounded-[10px] px-2 py-1 shrink-0"
          style={{
            color: "var(--accent-text)",
            background: "rgba(116,191,122,0.12)",
          }}
        >
          {completedWork}/{totalSets}
        </span>

        {/* Menu contextuel */}
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
                    style={{ color: "var(--accent-text)" }}
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

        <ChevronUp
          size={12}
          style={{ color: "var(--text-muted)", opacity: 0.5 }}
          className="shrink-0"
        />
      </div>

      {/* Sets area */}
      <div style={{ borderTop: "1px solid var(--glass-border)" }}>
        {/* En-têtes colonnes */}
        <div
          className="grid gap-1 px-3.5 pt-2 pb-1"
          style={{ gridTemplateColumns: "28px 1fr 1fr 1fr 32px" }}
        >
          <span
            className="text-[8px] font-bold uppercase tracking-[0.1em] text-left"
            style={{ color: "var(--text-muted)" }}
          >
            #
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.1em] text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Poids
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.1em] text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Reps
          </span>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.1em] text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Préc.
          </span>
          <span />
        </div>

        {/* Lignes séries */}
        {(() => {
          const warmupSets = exercise.sets.filter((s) => s.isWarmup);
          const workingSets = exercise.sets.filter((s) => !s.isWarmup);
          const allWarmupDone =
            warmupSets.length > 0 && warmupSets.every((s) => s.completed);

          return (
            <>
              {allWarmupDone ? (
                <WarmupCollapsed sets={warmupSets} />
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

      {/* Actions : + Série | Notes | Échauff. */}
      <div
        className="flex"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <button
          onClick={() => addSet(uid)}
          className="flex-1 flex items-center justify-center gap-[5px] py-[9px] text-[10px] font-semibold transition-opacity active:opacity-70"
          style={{
            color: "var(--text-muted)",
            borderRight: "1px solid var(--glass-border)",
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Série
        </button>
        <ExerciseNotesButton
          note={exercise.notes ?? ""}
          isOpen={showNotes}
          onToggle={() => setShowNotes((v) => !v)}
          hasInitialNote={!!exercise.notes}
        />
        <button
          onClick={() => addWarmupSets(uid)}
          className="flex-1 flex items-center justify-center gap-[5px] py-[9px] text-[10px] font-semibold transition-opacity active:opacity-70"
          style={{
            color: hasWarmup ? "var(--accent-text)" : "var(--text-muted)",
            borderLeft: "1px solid var(--glass-border)",
          }}
        >
          <Flame size={12} />
          Échauff.
        </button>
      </div>

      {/* Zone de texte notes — pleine largeur sous les actions */}
      {showNotes && (
        <ExerciseNotesArea
          note={exercise.notes ?? ""}
          onChange={(n) => {
            setExerciseNote(uid, n);
            saveExerciseNote(exercise.exerciseId, n);
          }}
        />
      )}

      {/* Bouton minuteur repos */}
      {exercise.restDuration != null && (
        <div
          className="px-3.5 py-2"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-opacity active:opacity-70"
            style={{
              background: "var(--glass-subtle)",
              color: "var(--accent-text)",
            }}
          >
            <Timer size={10} />
            {formatRest(exercise.restDuration)}
            <ChevronDown size={9} />
          </button>
        </div>
      )}

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

/** Pill résumant l'échauffement terminé */
function WarmupCollapsed({ sets }: { sets: WorkoutSet[] }) {
  return (
    <div
      className="px-3.5 py-1.5"
      style={{ borderTop: "1px solid var(--glass-border)" }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] font-semibold"
        style={{
          background: "var(--glass-subtle)",
          color: "var(--text-muted)",
        }}
      >
        <Flame size={11} />
        <span>
          Échauff:{" "}
          {sets.map((s, i) => (
            <span key={s.id}>
              {i > 0 && " · "}
              {s.poids != null ? `${s.poids}kg` : "—"}×{s.reps ?? "—"}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

export default memo(ExerciseCard);
