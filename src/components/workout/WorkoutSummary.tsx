"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, Zap, Check, Star } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import type { ActiveWorkout } from "@/store/workoutStore";
import { saveWorkout } from "@/app/actions/workout";

interface Props {
  workout: ActiveWorkout;
  totalPausedMs?: number;
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m} min`;
}

export default function WorkoutSummary({ workout, totalPausedMs = 0 }: Props) {
  const router = useRouter();
  const clearWorkout = useWorkoutStore((s) => s.clearWorkout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const [duration] = useState(
    () => Date.now() - workout.debutAt - totalPausedMs,
  );
  const completedSets = workout.exercises.flatMap((e) =>
    e.sets.filter((s) => s.completed),
  );
  const volume = completedSets.reduce(
    (acc, s) => acc + (s.poids ?? 0) * (s.reps ?? 0),
    0,
  );
  const exercicesRealises = workout.exercises.filter((e) =>
    e.sets.some((s) => s.completed),
  );

  // PRs : série complétée avec poids > poidsRef (même logique que ExerciseCard)
  const prs = exercicesRealises
    .map((ex) => {
      const prSet = ex.sets
        .filter(
          (s) =>
            s.completed &&
            s.poids != null &&
            s.poidsRef != null &&
            s.poids > s.poidsRef,
        )
        .reduce<{ poids: number; reps: number } | null>((best, s) => {
          const val = (s.poids ?? 0) * (s.reps ?? 0);
          return val > (best ? best.poids * best.reps : 0)
            ? { poids: s.poids!, reps: s.reps ?? 0 }
            : best;
        }, null);
      return prSet ? { nom: ex.nom, ...prSet } : null;
    })
    .filter(
      (p): p is { nom: string; poids: number; reps: number } => p !== null,
    );

  const handleSave = async () => {
    setSaving(true);
    const result = await saveWorkout(
      workout.exercises,
      workout.debutAt,
      workout.routineId,
      totalPausedMs,
    );
    if (result.success) {
      setSaved(true);
      // Rafraîchir les données serveur pendant l'animation "Enregistré !"
      router.refresh();
      setTimeout(() => clearWorkout(), 800);
    } else {
      setSaving(false);
      alert("Erreur lors de la sauvegarde. Réessaie.");
    }
  };

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex flex-col px-4 overflow-y-auto"
      style={{ background: "var(--bg-gradient)" }}
    >
      <div className="w-full max-w-sm mx-auto space-y-5 py-10">
        {/* Titre */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-bg)" }}
          >
            <Trophy size={32} style={{ color: "var(--accent)" }} />
          </div>
          <h2
            className="text-2xl leading-tight"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Séance terminée !
          </h2>
          {workout.routineName && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {workout.routineName}
            </p>
          )}
        </div>

        {/* Stats durée + volume */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-4 rounded-2xl border text-center"
            style={{
              background: "rgba(255,255,255,0.5)",
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Clock
              size={20}
              className="mx-auto mb-1"
              style={{ color: "var(--accent)" }}
            />
            <p
              className="text-xl font-bold"
              style={{ color: "var(--accent-text)" }}
            >
              {formatDuration(duration)}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Durée
            </p>
          </div>
          <div
            className="p-4 rounded-2xl border text-center"
            style={{
              background: "rgba(255,255,255,0.5)",
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Zap
              size={20}
              className="mx-auto mb-1"
              style={{ color: "var(--accent)" }}
            />
            <p
              className="text-xl font-bold"
              style={{ color: "var(--accent-text)" }}
            >
              {volume > 0 ? `${Math.round(volume)} kg` : "—"}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Volume total
            </p>
          </div>
        </div>

        {/* Records battus */}
        {prs.length > 0 && (
          <div
            className="p-4 rounded-2xl border"
            style={{
              background: "rgba(234,179,8,0.06)",
              borderColor: "rgba(234,179,8,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star
                size={14}
                fill="currentColor"
                style={{ color: "#EAB308" }}
              />
              <p className="text-sm font-semibold" style={{ color: "#EAB308" }}>
                {prs.length} record{prs.length > 1 ? "s" : ""} battu
                {prs.length > 1 ? "s" : ""} 🎉
              </p>
            </div>
            <div className="space-y-2">
              {prs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {pr.nom}
                  </p>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#CA8A04" }}
                  >
                    {pr.poids} kg × {pr.reps} reps
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercices réalisés */}
        {exercicesRealises.length > 0 && (
          <div className="space-y-2">
            {exercicesRealises.map((ex) => {
              const doneSets = ex.sets.filter((s) => s.completed);
              const maxPoids = Math.max(
                0,
                ...doneSets.map((s) => s.poids ?? 0),
              );
              const exVolume = doneSets.reduce(
                (acc, s) => acc + (s.poids ?? 0) * (s.reps ?? 0),
                0,
              );
              const isPR = prs.some((pr) => pr.nom === ex.nom);
              return (
                <div
                  key={ex.uid}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    borderColor: isPR
                      ? "rgba(234,179,8,0.35)"
                      : "rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {ex.nom}
                      </p>
                      {isPR && (
                        <Star
                          size={11}
                          fill="currentColor"
                          style={{ color: "#EAB308", flexShrink: 0 }}
                        />
                      )}
                    </div>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {maxPoids > 0
                        ? `Max ${maxPoids} kg`
                        : ex.groupeMusculaire}
                      {exVolume > 0 ? ` · ${Math.round(exVolume)} kg vol.` : ""}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold ml-3 shrink-0"
                    style={{ color: "var(--success)" }}
                  >
                    {doneSets.length} série{doneSets.length > 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: saved ? "var(--success)" : "var(--accent)",
              color: "white",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? (
              <>
                <Check size={18} /> Enregistré !
              </>
            ) : saving ? (
              "Sauvegarde..."
            ) : (
              "Enregistrer la séance"
            )}
          </button>
          <button
            onClick={() => setShowCancel(true)}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Annuler la séance
          </button>
        </div>
      </div>

      {/* Confirmation annulation */}
      {showCancel && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowCancel(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl space-y-4"
            style={{
              background: "linear-gradient(to bottom, #e8e6e2, #f3f0ea)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Annuler la séance ?
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              La séance ne sera pas enregistrée et les données seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  color: "var(--text-primary)",
                  borderColor: "rgba(0,0,0,0.06)",
                }}
              >
                Retour
              </button>
              <button
                onClick={() => {
                  clearWorkout();
                  setShowCancel(false);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#c94444", color: "white" }}
              >
                Annuler quand même
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
