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
      className="pt-5 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 112px" }}
    >
      {/* En-tête */}
      <div style={{ padding: "0 6px", marginBottom: 14 }}>
        <div
          className="font-medium"
          style={{
            fontSize: "11px",
            color: "var(--accent-text)",
            letterSpacing: "0.05em",
          }}
        >
          Journal
        </div>
        <h1
          className="leading-none"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "36px",
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            textShadow: "0 2px 32px rgba(0,0,0,0.7)",
          }}
        >
          Historique.
        </h1>
      </div>

      {/* Stats globales */}
      <HistoriqueStatsCards
        workouts={data.workouts}
        totalSeances={data.totalSeances}
        streakActuel={data.streakActuel}
        estTout={true}
      />

      {/* Calendrier mensuel */}
      <HistoriqueCalendar
        workouts={data.workouts}
        streakActuel={data.streakActuel}
      />

      {/* Liste des séances */}
      <div className="mb-2.5">
        <div
          className="font-bold uppercase mb-2"
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            letterSpacing: "0.22em",
            padding: "2px 2px 0",
          }}
        >
          Dernières séances
        </div>
        <HistoriqueList workouts={data.workouts} onSelect={handleSelect} />
      </div>

      {/* Sommeil */}
      <SleepHistorySection
        sommeil={data.sommeil}
        onDeleted={(id) => {
          setData((d) => ({
            ...d,
            sommeil: d.sommeil.filter((s) => s.id !== id),
          }));
        }}
      />

      {/* Records personnels */}
      <PRSection prs={data.prsRecents} />

      {/* Détail séance */}
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
