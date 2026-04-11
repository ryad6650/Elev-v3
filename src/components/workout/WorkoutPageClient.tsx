"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useWorkoutStore } from "@/store/workoutStore";
import WorkoutHub from "./WorkoutHub";
import ActiveWorkout from "./ActiveWorkout";
import ProgrammeActiveView from "@/components/programmes/ProgrammeActiveView";
import { getRoutineExercises } from "@/app/actions/routines";
import type { WorkoutPageData } from "@/lib/workout";
import type { ProgrammesPageData } from "@/lib/programmes";
import { ChevronDown, Plus } from "lucide-react";

const CreateRoutineModal = dynamic(() => import("./CreateRoutineModal"), {
  ssr: false,
});
const ExerciseSearch = dynamic(() => import("./ExerciseSearch"), {
  ssr: false,
});

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

  const handleStartRoutine = async (routineId: string, routineNom: string) => {
    try {
      const exercises = await getRoutineExercises(routineId);
      startWorkout({ routineId, routineName: routineNom, exercises });
    } catch {
      startWorkout({ routineId, routineName: routineNom });
    }
    setShowProgrammes(false);
  };

  if (activeWorkout && !isMinimized) return <ActiveWorkout />;

  if (showProgrammes && initialProgrammesData.programmeActif) {
    return (
      <ProgrammeActiveView
        programme={initialProgrammesData.programmeActif}
        onBack={() => setShowProgrammes(false)}
        onStartRoutine={handleStartRoutine}
      />
    );
  }

  return (
    <main
      className="page-enter"
      style={{
        maxWidth: 430,
        margin: "0 auto",
        padding: "28px 16px",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
        background: "#1B1715",
        minHeight: "100dvh",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-7">
        <h1
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}
        >
          Entraînement
        </h1>
        <ChevronDown size={22} style={{ color: "var(--text-primary)" }} />
      </div>

      {/* Démarrer un Entraînement Vide */}
      <button
        onClick={() => startWorkout({ routineId: null, routineName: null })}
        className="w-full flex items-center gap-3 active:scale-[0.98] transition-transform mb-6"
        style={{
          background: "#151312",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 20px",
        }}
      >
        <Plus size={20} style={{ color: "var(--text-primary)" }} />
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Démarrer un Entraînement Vide
        </span>
      </button>

      <WorkoutHub
        data={initialWorkoutData}
        onNewRoutine={() => setShowCreate(true)}
        onExplorer={() => setShowSearch(true)}
      />

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
