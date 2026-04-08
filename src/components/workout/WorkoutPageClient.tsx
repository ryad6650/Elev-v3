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
      year: "numeric",
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
      className="px-4 pt-5 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* Header — style greeting mockup crème */}
      <div className="mb-4" style={{ padding: "0 6px" }}>
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[11px] font-medium tracking-[0.05em]"
            style={{ color: "var(--accent)", opacity: 0.7 }}
          >
            {getDateFr()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <Search size={15} style={{ color: "var(--text-secondary)" }} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <Plus
                size={17}
                strokeWidth={2.5}
                style={{ color: "var(--text-primary)" }}
              />
            </button>
          </div>
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--text-secondary)", lineHeight: 1 }}
        >
          Mes
        </p>
        <h1
          className="leading-none"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: 48,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            lineHeight: 1.02,
          }}
        >
          Séances.
        </h1>
      </div>

      {/* Timeline semaine */}
      <div className="mb-2.5">
        <WorkoutWeekTimeline
          historique={initialWorkoutData.historique}
          programmeActif={initialProgrammesData.programmeActif}
        />
      </div>

      {/* CTAs */}
      <div className="flex gap-2.5 mb-2.5">
        <button
          onClick={() => startWorkout({ routineId: null, routineName: null })}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold text-[12px] transition-all active:scale-[0.98]"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            color: "var(--accent)",
          }}
        >
          Séance libre
        </button>
        <button
          onClick={() => setShowProgrammes((v) => !v)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold text-[12px] transition-all active:scale-[0.98]"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            color: "var(--accent)",
          }}
        >
          Programme
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
