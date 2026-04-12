"use client";

import { useState, useMemo, useCallback } from "react";
import type { HistoriquePageData } from "@/lib/historique";
import { fetchHistoriqueData } from "@/lib/historique";
import { createClient } from "@/lib/supabase/client";
import { fetchWorkoutDetail } from "@/app/actions/historique";
import type { WorkoutDetail } from "@/app/actions/historique";
import HistoriqueCalendar from "./HistoriqueCalendar";
import DaySummary from "./DaySummary";
import WeekSummary from "./WeekSummary";
import PRSection from "./PRSection";
import WorkoutDetailSheet from "./WorkoutDetailSheet";

interface Props {
  initialData: HistoriquePageData;
}

export default function HistoriquePageClient({ initialData }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [data, setData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const d = await fetchHistoriqueData(supabase, user.id);
      setData(d);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger l'historique");
    }
  }, []);

  const handleSelectWorkout = useCallback(async (id: string) => {
    try {
      const detail = await fetchWorkoutDetail(id);
      setSelectedWorkout(detail);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger le détail");
    }
  }, []);

  const dayNutrition = useMemo(
    () => data.nutritionDays.find((n) => n.date === selectedDate),
    [data.nutritionDays, selectedDate],
  );
  const dayPoids = useMemo(
    () => data.poidsHistory.find((p) => p.date === selectedDate),
    [data.poidsHistory, selectedDate],
  );
  const previousPoids = useMemo(() => {
    const sorted = [...data.poidsHistory].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const idx = sorted.findIndex((p) => p.date < selectedDate);
    return idx >= 0 ? sorted[idx] : undefined;
  }, [data.poidsHistory, selectedDate]);

  const daySommeil = useMemo(
    () => data.sommeil.find((s) => s.date === selectedDate),
    [data.sommeil, selectedDate],
  );
  const avgSommeil = useMemo(() => {
    if (data.sommeil.length === 0) return 0;
    return Math.round(
      data.sommeil.reduce((s, e) => s + e.duree_minutes, 0) /
        data.sommeil.length,
    );
  }, [data.sommeil]);

  return (
    <main
      className="page-enter"
      style={{
        maxWidth: 430,
        margin: "0 auto",
        padding: "20px 28px",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
        background: "#1B1715",
        minHeight: "100dvh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
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
            fontFamily: "var(--font-lora), serif",
            fontStyle: "italic",
            fontSize: 34,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
          }}
        >
          Historique
        </h1>
      </div>

      {/* Streak + mois */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 12 }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(232,184,109,0.1)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 13,
            fontWeight: 700,
            color: "#E8B86D",
            border: "1px solid rgba(232,184,109,0.12)",
          }}
        >
          🔥 {data.streakActuel} jour{data.streakActuel > 1 ? "s" : ""}
        </span>
        <span
          style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}
        >
          {data.totalSeances} séances au total
        </span>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#ef4444",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Calendrier */}
      <HistoriqueCalendar
        workouts={data.workouts}
        nutritionDays={data.nutritionDays}
        poidsHistory={data.poidsHistory}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Résumé du jour */}
      <DaySummary
        date={selectedDate}
        workouts={data.workouts}
        nutrition={dayNutrition}
        poids={dayPoids}
        previousPoids={previousPoids}
        sommeil={daySommeil}
        avgSommeil={avgSommeil}
        objectifs={data.objectifs}
        onSelectWorkout={handleSelectWorkout}
      />

      {/* Semaine en bref */}
      <WeekSummary
        selectedDate={selectedDate}
        workouts={data.workouts}
        nutritionDays={data.nutritionDays}
        sommeil={data.sommeil}
      />

      {/* PRs */}
      <PRSection prs={data.prsRecents} />

      {/* Détail séance */}
      {selectedWorkout && (
        <WorkoutDetailSheet
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onDeleted={() => {
            setSelectedWorkout(null);
            reload();
          }}
          onUpdated={(w) => {
            setSelectedWorkout(w);
            reload();
          }}
        />
      )}
    </main>
  );
}
