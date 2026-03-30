"use client";

import { useState, useMemo } from "react";
import type { HistoriquePageData } from "@/lib/historique";
import HistoriqueStatsCards from "./HistoriqueStatsCards";
import HistoriqueVolumeChart from "./HistoriqueVolumeChart";
import PRSection from "./PRSection";
import HistoriqueList from "./HistoriqueList";

const PERIODES = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "3 mois", days: 90 },
  { label: "Tout", days: Infinity },
];

interface Props {
  data: HistoriquePageData;
}

export default function HistoriquePageClient({ data }: Props) {
  const [periodeDays, setPeriodeDays] = useState(30);

  const workoutsFiltres = useMemo(() => {
    if (!isFinite(periodeDays)) return data.workouts;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodeDays);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return data.workouts.filter((w) => w.date >= cutoffStr);
  }, [data.workouts, periodeDays]);

  return (
    <main
      className="px-4 pt-6 pb-28 page-enter"
      style={{ maxWidth: 520, margin: "0 auto" }}
    >
      {/* En-tête */}
      <div className="mb-5">
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            color: "var(--text-primary)",
          }}
        >
          Historique
        </h1>
      </div>

      {/* Période pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 mb-5"
        style={{ scrollbarWidth: "none" }}
      >
        {PERIODES.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => setPeriodeDays(days)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
            style={
              periodeDays === days
                ? { background: "var(--accent)", color: "#fff", border: "none" }
                : {
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <HistoriqueStatsCards
        workouts={workoutsFiltres}
        totalSeances={data.totalSeances}
        streakActuel={data.streakActuel}
        estTout={!isFinite(periodeDays)}
      />

      {/* Graphique volume hebdo */}
      <HistoriqueVolumeChart workouts={data.workouts} />

      {/* Records */}
      <PRSection prs={data.prsRecents} />

      {/* Label section */}
      <p
        className="text-[11px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        Mes séances
      </p>

      {/* Liste */}
      <HistoriqueList workouts={workoutsFiltres} />
    </main>
  );
}
