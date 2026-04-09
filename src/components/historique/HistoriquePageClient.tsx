"use client";

import { useState } from "react";
import type { HistoriquePageData } from "@/lib/historique";
import { fetchHistoriqueData } from "@/lib/historique";
import { createClient } from "@/lib/supabase/client";
import { fetchWorkoutDetail } from "@/app/actions/historique";
import type { WorkoutDetail } from "@/app/actions/historique";
import HistoriqueStatsCards from "./HistoriqueStatsCards";
import HistoriqueCalendar from "./HistoriqueCalendar";
import PRSection from "./PRSection";
import HistoriqueList from "./HistoriqueList";
import SleepHistorySection from "./SleepHistorySection";
import WorkoutDetailSheet from "./WorkoutDetailSheet";

interface Props {
  initialData: HistoriquePageData;
}

export default function HistoriquePageClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(
    null,
  );

  const reload = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    fetchHistoriqueData(supabase, user.id)
      .then((d) => setData(d))
      .catch(console.error);
  };

  const handleSelect = async (id: string) => {
    try {
      const detail = await fetchWorkoutDetail(id);
      setSelectedWorkout(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleted = () => {
    setSelectedWorkout(null);
    reload();
  };

  const handleUpdated = (w: WorkoutDetail) => {
    setSelectedWorkout(w);
    reload();
  };

  return (
    <main
      className="page-enter"
      style={{ maxWidth: 430, margin: "0 auto", padding: "20px 28px 112px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          Journal
        </div>
        <h1
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 32,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Historique
        </h1>
      </div>

      <HistoriqueStatsCards
        workouts={data.workouts}
        totalSeances={data.totalSeances}
        streakActuel={data.streakActuel}
        estTout={true}
      />

      <HistoriqueCalendar
        workouts={data.workouts}
        streakActuel={data.streakActuel}
      />

      <HistoriqueList workouts={data.workouts} onSelect={handleSelect} />

      <SleepHistorySection
        sommeil={data.sommeil}
        onDeleted={(id) => {
          setData((d) => ({
            ...d,
            sommeil: d.sommeil.filter((s) => s.id !== id),
          }));
        }}
      />

      <PRSection prs={data.prsRecents} />

      {selectedWorkout && (
        <WorkoutDetailSheet
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      )}
    </main>
  );
}
