"use client";

import { useEffect, useState } from "react";
import type { HistoriquePageData } from "@/lib/historique";
import { fetchHistoriqueData } from "@/lib/historique";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCache } from "@/lib/pageCache";
import { fetchWorkoutDetail } from "@/app/actions/historique";
import type { WorkoutDetail } from "@/app/actions/historique";
import HistoriqueStatsCards from "./HistoriqueStatsCards";
import HistoriqueCalendar from "./HistoriqueCalendar";
import PRSection from "./PRSection";
import HistoriqueList from "./HistoriqueList";
import WorkoutDetailSheet from "./WorkoutDetailSheet";

const CACHE_KEY = "historique";

export default function HistoriquePageClient() {
  const [data, setData] = useState<HistoriquePageData | null>(
    getCached<HistoriquePageData>(CACHE_KEY),
  );
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(
    null,
  );

  const reload = () => {
    const supabase = createClient();
    fetchHistoriqueData(supabase)
      .then((d) => {
        setData(d);
        setCache(CACHE_KEY, d);
      })
      .catch(console.error);
  };

  useEffect(() => {
    reload();
  }, []);

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

  if (!data)
    return (
      <main className="px-4 pt-6" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div
          className="flex items-center justify-center"
          style={{ height: "50vh" }}
        >
          <div
            className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--accent)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      </main>
    );

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tête */}
      <div className="mb-5">
        <div
          className="font-semibold uppercase mb-1"
          style={{
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          Journal
        </div>
        <h1
          className="leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "1.9rem",
            color: "var(--text-primary)",
          }}
        >
          Historique
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
      <div className="mb-3">
        <div
          className="font-semibold uppercase mb-2.5"
          style={{
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            letterSpacing: "0.07em",
          }}
        >
          Dernières séances
        </div>
        <HistoriqueList workouts={data.workouts} onSelect={handleSelect} />
      </div>

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
