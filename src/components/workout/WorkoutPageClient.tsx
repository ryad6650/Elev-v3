"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Search } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import WorkoutHub from "./WorkoutHub";
import ActiveWorkout from "./ActiveWorkout";
import WorkoutProgrammesSection from "./WorkoutProgrammesSection";
import WorkoutWeekTimeline from "./WorkoutWeekTimeline";
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

  if (activeWorkout && !isMinimized) return <ActiveWorkout />;

  return (
    <main
      className="px-5 pt-3.5 pb-28 page-enter"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[11px] font-bold tracking-[0.12em] uppercase"
          style={{ color: "#78716C" }}
        >
          {getDateFr()}
        </span>
        <div className="flex gap-2.5">
          <RoundBtn onClick={() => setShowSearch(true)}>
            <Search size={15} style={{ color: "#78716C" }} />
          </RoundBtn>
          <RoundBtn onClick={() => setShowCreate(true)}>
            <Plus size={17} strokeWidth={2.5} style={{ color: "#78716C" }} />
          </RoundBtn>
        </div>
      </div>
      <h1
        className="leading-tight mb-5"
        style={{
          fontFamily: "var(--font-dm-serif)",
          fontStyle: "italic",
          fontSize: 34,
          color: "#4A3728",
          letterSpacing: "-0.01em",
        }}
      >
        Mes Séances.
      </h1>

      {/* Timeline semaine */}
      <div className="mb-[18px]">
        <WorkoutWeekTimeline
          historique={initialWorkoutData.historique}
          programmeActif={initialProgrammesData.programmeActif}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-5">
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
      className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
      style={{ background: "rgba(74,55,40,0.07)" }}
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
      className="flex-1 py-4 px-3 rounded-[18px] text-center active:scale-[0.98] transition-transform"
      style={{
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 2px 8px rgba(74,55,40,0.04)",
      }}
    >
      <div className="text-[22px] mb-1.5">{icon}</div>
      <div className="text-[12px] font-bold" style={{ color: "#4A3728" }}>
        {label}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: "#78716C" }}>
        {sub}
      </div>
    </button>
  );
}
