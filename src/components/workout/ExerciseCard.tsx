"use client";

import { memo, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Flame, Timer } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import type { WorkoutSet } from "@/store/workoutStore";
import { saveExerciseRest, saveExerciseNote } from "@/app/actions/routines";
import SetRow from "./SetRow";
import SetsHeader from "./SetsHeader";
import RestDurationPicker from "./RestDurationPicker";
import ExerciseMenu from "./ExerciseMenu";
import { ExerciseNotesButton, ExerciseNotesArea } from "./ExerciseNotes";

function formatRest(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m} min` : `${m} min ${r}s`;
}

const GROUP_COLORS: Record<string, string> = {
  pectoraux: "var(--color-protein)",
  dos: "var(--color-carbs)",
  épaules: "var(--color-fat)",
  biceps: "var(--color-protein)",
  triceps: "var(--color-carbs)",
  jambes: "var(--color-fat)",
  abdominaux: "var(--color-protein)",
  mollets: "var(--color-carbs)",
};

function dotColor(group: string): string {
  return GROUP_COLORS[group.toLowerCase()] ?? "var(--text-muted)";
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
    (setId: string, field: "reps" | "poids", value: number | null) =>
      updateSet(uid, setId, field, value),
    [uid, updateSet],
  );

  const handleRemoveSet = useCallback(
    (setId: string) => removeSet(uid, setId),
    [uid, removeSet],
  );

  if (!exercise) return null;

  const totalSets = exercise.sets.filter((s) => !s.isWarmup).length;
  const completedWork = exercise.sets.filter(
    (s) => s.completed && !s.isWarmup,
  ).length;
  const allDone = totalSets > 0 && completedWork === totalSets;
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed);
  const hasWarmup = exercise.sets.some((s) => s.isWarmup);

  if (!isOpen) {
    return (
      <ClosedCard
        nom={exercise.nom}
        groupe={exercise.groupeMusculaire}
        completedWork={completedWork}
        totalSets={totalSets}
        allDone={allDone}
        onOpen={() => onOpen(uid)}
      />
    );
  }

  const warmupSets = exercise.sets.filter((s) => s.isWarmup);
  const workingSets = exercise.sets.filter((s) => !s.isWarmup);
  const allWarmupDone =
    warmupSets.length > 0 && warmupSets.every((s) => s.completed);

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1.5px solid var(--green)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-[18px] py-3">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: dotColor(exercise.groupeMusculaire) }}
        />
        <span
          className="flex-1 min-w-0 text-[15px] font-semibold leading-tight truncate"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            color: "var(--text-primary)",
          }}
        >
          {exercise.nom}
        </span>
        <span
          className="text-[10px] font-bold tracking-[0.02em] rounded-full px-2 py-[3px] shrink-0"
          style={{ background: "var(--green-dim)", color: "var(--green)" }}
        >
          {completedWork}/{totalSets}
        </span>
        <ExerciseMenu
          onReplace={() => onReplace?.(uid)}
          onDelete={() => removeExercise(uid)}
        />
        <ChevronUp
          size={12}
          style={{ color: "var(--text-muted)", opacity: 0.5 }}
          className="shrink-0"
        />
      </div>

      {/* Sets */}
      <div style={{ borderTop: "1px solid var(--glass-border)" }}>
        <SetsHeader />
        {allWarmupDone ? (
          <WarmupCollapsed sets={warmupSets} />
        ) : (
          warmupSets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              isActive={exercise.sets.indexOf(set) === firstIncompleteIdx}
              onUpdate={handleUpdateSet}
              onToggle={handleToggle}
              onRemove={handleRemoveSet}
            />
          ))
        )}
        {workingSets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            isActive={exercise.sets.indexOf(set) === firstIncompleteIdx}
            onUpdate={handleUpdateSet}
            onToggle={handleToggle}
            onRemove={handleRemoveSet}
          />
        ))}
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 px-[18px] py-2.5"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <button
          onClick={() => addSet(uid)}
          className="flex-1 text-[13px] font-semibold py-2 rounded-[10px] text-center transition-opacity active:opacity-70"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            background: "rgba(0,0,0,0.03)",
            color: "var(--text-muted)",
          }}
        >
          + Série
        </button>
        <ExerciseNotesButton
          note={exercise.notes ?? ""}
          isOpen={showNotes}
          onToggle={() => setShowNotes((v) => !v)}
          hasInitialNote={!!exercise.notes}
        />
        <button
          onClick={() => addWarmupSets(uid)}
          className="flex-1 text-[13px] font-semibold py-2 rounded-[10px] text-center transition-opacity active:opacity-70"
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            background: "rgba(0,0,0,0.03)",
            color: hasWarmup ? "var(--green)" : "var(--text-muted)",
          }}
        >
          Échauffement
        </button>
      </div>

      {showNotes && (
        <ExerciseNotesArea
          note={exercise.notes ?? ""}
          onChange={(n) => {
            setExerciseNote(uid, n);
            saveExerciseNote(exercise.exerciseId, n);
          }}
        />
      )}

      {exercise.restDuration != null && (
        <div
          className="px-[18px] py-2"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-[0.03em] transition-opacity active:opacity-70"
            style={{ background: "rgba(0,0,0,0.04)", color: "var(--green)" }}
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

function ClosedCard({
  nom,
  groupe,
  completedWork,
  totalSets,
  allDone,
  onOpen,
}: {
  nom: string;
  groupe: string;
  completedWork: number;
  totalSets: number;
  allDone: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-2.5 rounded-[20px] px-[18px] py-4"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        opacity: allDone ? 0.6 : 1,
      }}
    >
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: allDone ? "var(--green)" : dotColor(groupe) }}
      />
      <span
        className="flex-1 text-left text-[15px] font-semibold truncate"
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          color: "var(--text-primary)",
          opacity: allDone ? 0.7 : 1,
        }}
      >
        {nom}
      </span>
      <span
        className="text-[10px] font-bold tracking-[0.02em] rounded-full px-2 py-[3px] shrink-0"
        style={{ background: "var(--green-dim)", color: "var(--green)" }}
      >
        {completedWork}/{totalSets}
      </span>
      <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
        ›
      </span>
    </button>
  );
}

function WarmupCollapsed({ sets }: { sets: WorkoutSet[] }) {
  return (
    <div
      className="px-[18px] py-1.5"
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
