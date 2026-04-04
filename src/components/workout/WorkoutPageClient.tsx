"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Search } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import WorkoutHub from "./WorkoutHub";
import ActiveWorkout from "./ActiveWorkout";
import WorkoutProgrammesSection from "./WorkoutProgrammesSection";
import type { WorkoutPageData } from "@/lib/workout";
import type { ProgrammesPageData } from "@/lib/programmes";

const CreateRoutineModal = dynamic(() => import("./CreateRoutineModal"), {
  ssr: false,
});
const ExerciseSearch = dynamic(() => import("./ExerciseSearch"), {
  ssr: false,
});

function getDateFr(): string {
  return new Date()
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function getLastSessionLabel(
  historique: WorkoutPageData["historique"],
): string {
  if (!historique.length) return "aucune séance récente";
  const diffDays = Math.floor(
    (Date.now() - new Date(historique[0].date).getTime()) / 86400000,
  );
  if (diffDays === 0) return "dernière séance aujourd'hui";
  if (diffDays === 1) return "dernière séance hier";
  return `dernière séance il y a ${diffDays} jours`;
}

interface Props {
  initialWorkoutData: WorkoutPageData;
  initialProgrammesData: ProgrammesPageData;
}

export default function WorkoutPageClient({
  initialWorkoutData,
  initialProgrammesData,
}: Props) {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const isMinimized = useWorkoutStore((s) => s.isMinimized);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [showCreate, setShowCreate] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showProgrammes, setShowProgrammes] = useState(false);

  if (activeWorkout && !isMinimized) return <ActiveWorkout />;

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
            {getDateFr()} · {getLastSessionLabel(initialWorkoutData.historique)}
          </p>
          <h1
            className="text-3xl leading-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            Séances
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <Search size={17} style={{ color: "var(--text-secondary)" }} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <Plus
              size={20}
              strokeWidth={2.5}
              style={{ color: "var(--text-primary)" }}
            />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => startWorkout({ routineId: null, routineName: null })}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            background: "var(--bg-card)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            color: "var(--accent-text)",
          }}
        >
          ⚡ Séance libre
        </button>
        <button
          onClick={() => setShowProgrammes((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            background: "var(--bg-card)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
            color: "var(--accent-text)",
          }}
        >
          📋 Programme
        </button>
      </div>

      {showProgrammes && (
        <WorkoutProgrammesSection data={initialProgrammesData} />
      )}
      <WorkoutHub data={initialWorkoutData} />

      {showCreate && (
        <CreateRoutineModal onClose={() => setShowCreate(false)} />
      )}
      {showSearch && (
        <ExerciseSearch
          onClose={() => setShowSearch(false)}
          title="Rechercher un exercice"
        />
      )}
    </main>
  );
}
