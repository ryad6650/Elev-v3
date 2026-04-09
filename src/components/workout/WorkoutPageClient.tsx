"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useWorkoutStore } from "@/store/workoutStore";
import WorkoutHub from "./WorkoutHub";
import ActiveWorkout from "./ActiveWorkout";
import WorkoutWeekTimeline from "./WorkoutWeekTimeline";
import ProgrammeActiveView from "@/components/programmes/ProgrammeActiveView";
import { getRoutineExercises } from "@/app/actions/routines";
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
      style={{ maxWidth: 430, margin: "0 auto", padding: "20px 28px 112px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {getDateFr()}
        </span>
        <div className="flex gap-2.5">
          <RoundBtn onClick={() => setShowSearch(true)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </RoundBtn>
          <RoundBtn onClick={() => setShowCreate(true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </RoundBtn>
        </div>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 32,
          fontWeight: 500,
          color: "var(--text-primary)",
          letterSpacing: "-0.5px",
          lineHeight: 1.1,
          marginBottom: 20,
        }}
      >
        Mes Séances
      </h1>

      {/* Timeline semaine */}
      <div style={{ marginBottom: 18 }}>
        <WorkoutWeekTimeline
          historique={initialWorkoutData.historique}
          programmeActif={initialProgrammesData.programmeActif}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3" style={{ marginBottom: 20 }}>
        <QuickBtn
          icon="⚡"
          label="Séance libre"
          sub="Sans routine"
          onClick={() => startWorkout({ routineId: null, routineName: null })}
        />
        <QuickBtn
          icon="📋"
          label="Programme"
          sub={
            initialProgrammesData.programmeActif?.nom ?? "Voir mes programmes"
          }
          onClick={() => setShowProgrammes((v) => !v)}
        />
      </div>

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

function RoundBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur-sm)",
        WebkitBackdropFilter: "var(--glass-blur-sm)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {children}
    </button>
  );
}

function QuickBtn({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-5 px-3 text-center active:scale-[0.98] transition-transform"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 3,
        }}
      >
        {sub}
      </div>
    </button>
  );
}
