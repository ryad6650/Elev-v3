"use client";

import { memo, useState, useCallback } from "react";
import { Timer, MoreVertical } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { useShallow } from "zustand/react/shallow";
import type { WorkoutSet } from "@/store/workoutStore";
import { saveExerciseRest, saveExerciseNote } from "@/app/actions/routines";
import SwipeableSetRow from "./SwipeableSetRow";
import SetsHeader from "./SetsHeader";
import RestDurationPicker from "./RestDurationPicker";
import ExerciseMenuSheet from "./ExerciseMenu";
import ExerciseGif from "./ExerciseGif";

function formatRest(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return s % 60 === 0 ? `${m} min` : `${m} min ${s % 60}s`;
}

interface Props {
  uid: string;
  isOpen: boolean;
  onOpen: (uid: string) => void;
  onPR?: (exerciseName: string, poids: number, reps: number) => void;
  onReplace?: (uid: string) => void;
}

function ExerciseCard({ uid, isOpen, onOpen, onPR, onReplace }: Props) {
  const {
    exercise,
    addSet,
    removeSet,
    removeExercise,
    updateSet,
    toggleComplete,
    setExerciseRestDuration,
    setExerciseNote,
    addWarmupSets,
  } = useWorkoutStore(
    useShallow((s) => ({
      exercise: s.activeWorkout?.exercises.find((e) => e.uid === uid),
      addSet: s.addSet,
      removeSet: s.removeSet,
      removeExercise: s.removeExercise,
      updateSet: s.updateSet,
      toggleComplete: s.toggleComplete,
      setExerciseRestDuration: s.setExerciseRestDuration,
      setExerciseNote: s.setExerciseNote,
      addWarmupSets: s.addWarmupSets,
    })),
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
    (setId: string, field: "reps" | "poids", value: number | null) =>
      updateSet(uid, setId, field, value),
    [uid, updateSet],
  );

  const handleRemoveSet = useCallback(
    (setId: string) => removeSet(uid, setId),
    [uid, removeSet],
  );

  if (!exercise) return null;

  const workingSets = exercise.sets.filter((s) => !s.isWarmup);
  const totalSets = workingSets.length;
  const completedWork = workingSets.filter((s) => s.completed).length;
  const allDone = totalSets > 0 && completedWork === totalSets;
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed);

  if (!isOpen) {
    return (
      <ClosedCard
        nom={exercise.nom}
        gifUrl={exercise.gifUrl ?? null}
        completedWork={completedWork}
        totalSets={totalSets}
        allDone={allDone}
        onOpen={() => onOpen(uid)}
      />
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: 4,
      }}
    >
      {/* Header : thumbnail + nom + menu */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <ExerciseGif
          gifUrl={exercise.gifUrl ?? null}
          nom={exercise.nom}
          size="sm"
          circle
          priority
        />
        <span
          className="flex-1 min-w-0 text-[17px] font-bold truncate"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            color: "#1E9D4C",
          }}
        >
          {exercise.nom}
        </span>
        <button
          onClick={() => setShowMenu(true)}
          className="p-1.5 rounded-lg transition-opacity active:opacity-70"
          style={{ color: "var(--text-muted)" }}
          aria-label="Options de l'exercice"
        >
          <MoreVertical size={18} />
        </button>
        {showMenu && (
          <ExerciseMenuSheet
            onReorganize={() => {}}
            onReplace={() => onReplace?.(uid)}
            onAddSuperset={() => {}}
            onAddWarmup={() => addWarmupSets(uid)}
            onDelete={() => removeExercise(uid)}
            onClose={() => setShowMenu(false)}
          />
        )}
      </div>

      {/* Notes */}
      <input
        type="text"
        placeholder="Ajouter des notes ici..."
        value={exercise.notes ?? ""}
        onChange={(e) => setExerciseNote(uid, e.target.value)}
        onBlur={(e) =>
          saveExerciseNote(exercise.exerciseId, e.target.value.trim())
        }
        className="w-full bg-transparent border-none outline-none text-[14px] px-4 pb-1"
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-nunito), sans-serif",
        }}
      />

      {/* Repos */}
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-2 px-4 pb-3 active:opacity-70"
      >
        <Timer size={14} style={{ color: "#1E9D4C" }} />
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#1E9D4C",
          }}
        >
          Repos:{" "}
          {exercise.restDuration != null
            ? formatRest(exercise.restDuration)
            : "DÉSACTIVÉ"}
        </span>
      </button>

      {/* Tableau séries */}
      <SetsHeader />
      {exercise.sets.map((set, i) => (
        <SwipeableSetRow
          key={set.id}
          set={set}
          index={i}
          isActive={exercise.sets.indexOf(set) === firstIncompleteIdx}
          onUpdate={handleUpdateSet}
          onToggle={handleToggle}
          onRemove={handleRemoveSet}
        />
      ))}

      {/* Ajouter une Série */}
      <div className="px-4 pt-3 pb-4">
        <button
          onClick={() => addSet(uid)}
          className="w-full py-1.5 rounded-xl flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition-transform"
          style={{
            background: "#262220",
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            color: "var(--text-primary)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          + Ajouter une Série
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

function ClosedCard({
  nom,
  gifUrl,
  completedWork,
  totalSets,
  allDone,
  onOpen,
}: {
  nom: string;
  gifUrl: string | null;
  completedWork: number;
  totalSets: number;
  allDone: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3 active:opacity-80"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        opacity: allDone ? 0.6 : 1,
      }}
    >
      <ExerciseGif gifUrl={gifUrl} nom={nom} size="sm" circle />
      <span
        className="flex-1 text-left text-[16px] font-bold truncate"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          color: "#1E9D4C",
        }}
      >
        {nom}
      </span>
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: "rgba(27,46,29,0.35)", color: "#1E9D4C" }}
      >
        {completedWork}/{totalSets}
      </span>
    </button>
  );
}

export default memo(
  ExerciseCard,
  (prev, next) => prev.uid === next.uid && prev.isOpen === next.isOpen,
);
