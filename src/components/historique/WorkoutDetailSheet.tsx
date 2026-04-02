"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Pencil, Check } from "lucide-react";
import type { WorkoutDetail } from "@/app/actions/historique";
import { deleteWorkout, updateWorkoutSet } from "@/app/actions/historique";
import { getGroupeColor } from "@/components/workout/exerciseColors";

interface Props {
  workout: WorkoutDetail;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: (w: WorkoutDetail) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function WorkoutDetailSheet({
  workout,
  onClose,
  onDeleted,
  onUpdated,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(workout);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      await deleteWorkout(workout.id);
      onDeleted();
    });
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: "poids" | "reps",
    value: string,
  ) => {
    const v = value === "" ? null : Number(value);
    setDraft((prev) => {
      const exercises = prev.exercises.map((ex, ei) =>
        ei !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si !== setIdx ? s : { ...s, [field]: v },
              ),
            },
      );
      return { ...prev, exercises };
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      // Sauvegarder chaque set modifié
      for (let ei = 0; ei < draft.exercises.length; ei++) {
        for (let si = 0; si < draft.exercises[ei].sets.length; si++) {
          const orig = workout.exercises[ei]?.sets[si];
          const curr = draft.exercises[ei].sets[si];
          if (orig && (orig.poids !== curr.poids || orig.reps !== curr.reps)) {
            await updateWorkoutSet(curr.id, {
              poids: curr.poids,
              reps: curr.reps,
            });
          }
        }
      }
      setEditing(false);
      onUpdated(draft);
    });
  };

  const sheet = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-3xl p-5 overflow-y-auto"
        style={{
          background: "var(--bg-secondary)",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2
            className="text-lg font-bold truncate"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            {workout.routineNom ?? "Séance libre"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full shrink-0"
            style={{ background: "var(--bg-card)" }}
          >
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <p
          className="text-xs mb-4 capitalize"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDate(workout.date)}
          {workout.duree_minutes != null && ` · ${workout.duree_minutes} min`}
        </p>

        {/* Exercices */}
        <div className="space-y-3 mb-5">
          {draft.exercises.map((ex, exIdx) => {
            const color = getGroupeColor(ex.groupeMusculaire);
            return (
              <div
                key={ex.exerciseId}
                className="rounded-2xl p-3"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color.text }}
                  />
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ex.nom}
                  </span>
                </div>

                {/* Tableau séries */}
                <div className="grid grid-cols-3 gap-1 text-center">
                  <span
                    className="text-[10px] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Série
                  </span>
                  <span
                    className="text-[10px] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Poids
                  </span>
                  <span
                    className="text-[10px] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Reps
                  </span>
                  {ex.sets
                    .filter((s) => !s.isWarmup)
                    .map((s, si) => (
                      <SetRow
                        key={s.id}
                        s={s}
                        si={si}
                        exIdx={exIdx}
                        editing={editing}
                        onChange={updateSet}
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {editing ? (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Check size={16} />
              {isPending ? "Sauvegarde…" : "Enregistrer"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              <Pencil size={16} />
              Modifier
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm active:scale-95 transition-all"
            style={{
              background: confirmDelete
                ? "var(--danger, #EF4444)"
                : "rgba(239,68,68,0.1)",
              color: confirmDelete ? "#fff" : "#EF4444",
            }}
          >
            <Trash2 size={16} />
            {confirmDelete ? "Confirmer" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}

function SetRow({
  s,
  si,
  exIdx,
  editing,
  onChange,
}: {
  s: {
    id: string;
    numSerie: number;
    poids: number | null;
    reps: number | null;
    completed: boolean;
  };
  si: number;
  exIdx: number;
  editing: boolean;
  onChange: (
    exIdx: number,
    setIdx: number,
    field: "poids" | "reps",
    value: string,
  ) => void;
}) {
  const muted = !s.completed;
  const style = {
    fontSize: "0.8rem",
    color: muted ? "var(--text-muted)" : "var(--text-primary)",
  };

  if (!editing) {
    return (
      <>
        <span style={style}>{si + 1}</span>
        <span style={style}>{s.poids != null ? `${s.poids} kg` : "—"}</span>
        <span style={style}>{s.reps ?? "—"}</span>
      </>
    );
  }

  return (
    <>
      <span style={style}>{si + 1}</span>
      <input
        type="number"
        step="0.5"
        value={s.poids ?? ""}
        onChange={(e) => onChange(exIdx, si, "poids", e.target.value)}
        className="w-full text-center rounded-lg px-1 py-0.5"
        style={{
          fontSize: "0.8rem",
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      />
      <input
        type="number"
        value={s.reps ?? ""}
        onChange={(e) => onChange(exIdx, si, "reps", e.target.value)}
        className="w-full text-center rounded-lg px-1 py-0.5"
        style={{
          fontSize: "0.8rem",
          background: "var(--bg-elevated)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      />
    </>
  );
}
