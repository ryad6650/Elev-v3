"use client";

import type { HistoriquePageData } from "@/lib/historique";
import HistoriqueStatsCards from "./HistoriqueStatsCards";
import HistoriqueCalendar from "./HistoriqueCalendar";
import PRSection from "./PRSection";
import HistoriqueList from "./HistoriqueList";

interface Props {
  data: HistoriquePageData;
}

export default function HistoriquePageClient({ data }: Props) {
  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tête */}
      <div className="mb-5">
        <div
          className="font-semibold uppercase mb-1"
          style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}
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
          style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "0.07em" }}
        >
          Dernières séances
        </div>
        <HistoriqueList workouts={data.workouts} />
      </div>

      {/* Records personnels */}
      <PRSection prs={data.prsRecents} />
    </main>
  );
}
