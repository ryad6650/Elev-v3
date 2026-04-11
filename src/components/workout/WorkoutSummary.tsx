"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ImagePlus, X } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import type { ActiveWorkout } from "@/store/workoutStore";
import { useUiStore } from "@/store/uiStore";
import { saveWorkout } from "@/app/actions/workout";

interface Props {
  workout: ActiveWorkout;
  totalPausedMs?: number;
  onBack?: () => void;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`;
  return `${m}min`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkoutSummary({
  workout,
  totalPausedMs = 0,
  onBack,
}: Props) {
  const router = useRouter();
  const clearWorkout = useWorkoutStore((s) => s.clearWorkout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [notes, setNotes] = useState("");

  const setFullscreenModal = useUiStore((s) => s.setFullscreenModal);
  useEffect(() => {
    setFullscreenModal(true);
    return () => setFullscreenModal(false);
  }, [setFullscreenModal]);

  const [duration] = useState(
    () => Date.now() - workout.debutAt - totalPausedMs,
  );
  const { completedSets, volume } = useMemo(() => {
    const sets = workout.exercises.flatMap((e) =>
      e.sets.filter((s) => s.completed),
    );
    const vol = sets.reduce(
      (acc, s) => acc + (s.poids ?? 0) * (s.reps ?? 0),
      0,
    );
    return { completedSets: sets, volume: vol };
  }, [workout.exercises]);

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
      clearWorkout();
      router.refresh();
    } else {
      setSaving(false);
      alert(`Erreur lors de la sauvegarde.\n${result.error ?? ""}`);
    }
  };

  const goBack = () => onBack?.();

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex flex-col overflow-y-auto"
      style={{ background: "#000" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pb-3"
        style={{
          background: "#262220",
          paddingTop: "calc(env(safe-area-inset-top) + 12px)",
        }}
      >
        <button onClick={goBack} className="p-2 -ml-2 active:opacity-60">
          <span className="text-white text-2xl leading-none">←</span>
        </button>
        <span className="text-white font-medium text-base">Enregistrer</span>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="px-5 py-2 rounded-full text-sm font-semibold active:scale-95 transition-all"
          style={{
            background: "#1E9D4C",
            color: "#fff",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saved ? "Enregistré !" : saving ? "..." : "Enregistrer"}
        </button>
      </div>

      <div className="flex-1 px-4 pb-12">
        {/* Titre */}
        <div className="flex items-start justify-between mt-2 mb-5">
          <h1 className="text-[22px] font-bold text-white leading-tight">
            {workout.routineName ?? "Séance libre"}
          </h1>
          <button
            onClick={goBack}
            className="w-8 h-8 rounded-full flex items-center justify-center ml-3 mt-0.5 flex-shrink-0 active:opacity-60"
            style={{ background: "#3A3A3C" }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0 mb-5">
          {[
            { label: "Durée", value: formatDuration(duration), blue: true },
            {
              label: "Volume",
              value: volume > 0 ? `${Math.round(volume)} kg` : "0 kg",
              blue: false,
            },
            {
              label: "Séries",
              value: String(completedSets.length),
              blue: false,
            },
          ].map(({ label, value, blue }) => (
            <div key={label}>
              <p className="text-xs mb-0.5" style={{ color: "#8E8E93" }}>
                {label}
              </p>
              <p
                className="text-base font-semibold"
                style={{ color: blue ? "#74BF7A" : "#fff" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="h-px" style={{ background: "#2C2C2E" }} />

        {/* When */}
        <div className="py-4">
          <p className="text-xs mb-1" style={{ color: "#8E8E93" }}>
            When
          </p>
          <p className="text-sm font-medium" style={{ color: "#74BF7A" }}>
            {formatDate(workout.debutAt)}
          </p>
        </div>

        <div className="h-px" style={{ background: "#2C2C2E" }} />

        {/* Photo */}
        <div className="flex items-center gap-4 py-4">
          <div
            className="w-[110px] h-[80px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ border: "1.5px dashed #3A3A3C" }}
          >
            <ImagePlus size={24} color="#636366" />
          </div>
          <p className="text-sm" style={{ color: "#EBEBF5", opacity: 0.6 }}>
            Ajouter une photo/vidéo
          </p>
        </div>

        <div className="h-px" style={{ background: "#2C2C2E" }} />

        {/* Description */}
        <div className="py-4">
          <p className="text-xs mb-2" style={{ color: "#8E8E93" }}>
            Description
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              "Comment s'est passé votre entraînement ? Laissez quelques notes ici..."
            }
            rows={3}
            className="w-full bg-transparent text-sm resize-none outline-none"
            style={{ color: "#fff", caretColor: "#74BF7A" }}
          />
        </div>

        <div className="h-px" style={{ background: "#2C2C2E" }} />

        {/* Rows */}
        {[
          { label: "Visibilité", right: "Tout le monde" },
          { label: "Paramètres de Routine", right: null },
          { label: "Synchroniser avec", right: "Apple Health" },
        ].map(({ label, right }) => (
          <div key={label}>
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-medium text-white">{label}</span>
              <div
                className="flex items-center gap-1"
                style={{ color: "#8E8E93" }}
              >
                {right && <span className="text-sm">{right}</span>}
                <ChevronRight size={16} />
              </div>
            </div>
            <div className="h-px" style={{ background: "#2C2C2E" }} />
          </div>
        ))}

        {/* Abandonner */}
        <button
          onClick={() => setShowCancel(true)}
          className="w-full text-center py-5 text-sm font-medium active:opacity-60"
          style={{ color: "#FF6347" }}
        >
          Abandonner l&apos;Entraînement
        </button>
      </div>

      {/* Modale abandon */}
      {showCancel && (
        <div
          className="fixed inset-0 z-10 flex items-end justify-center px-4 pb-8"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowCancel(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl space-y-4"
            style={{ background: "#262220" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-white">Abandonner la séance ?</p>
            <p className="text-sm" style={{ color: "#8E8E93" }}>
              La séance ne sera pas enregistrée et les données seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "#3A3A3C", color: "#fff" }}
              >
                Retour
              </button>
              <button
                onClick={() => {
                  clearWorkout();
                  setShowCancel(false);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "#FF3B30", color: "#fff" }}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
