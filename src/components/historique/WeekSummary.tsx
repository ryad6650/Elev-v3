"use client";

import { useMemo } from "react";
import type {
  HistoriqueWorkout,
  NutritionDaySummary,
  SommeilRecord,
} from "@/lib/historique";

interface Props {
  selectedDate: string;
  workouts: HistoriqueWorkout[];
  nutritionDays: NutritionDaySummary[];
  sommeil: SommeilRecord[];
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${Math.round(v / 100) / 10}k`;
  return String(v);
}

function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export default function WeekSummary({
  selectedDate,
  workouts,
  nutritionDays,
  sommeil,
}: Props) {
  const stats = useMemo(() => {
    const d = new Date(selectedDate + "T12:00:00");
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split("T")[0];
    const sunStr = sunday.toISOString().split("T")[0];

    const weekWorkouts = workouts.filter(
      (w) => w.date >= monStr && w.date <= sunStr,
    );
    const weekNutri = nutritionDays.filter(
      (n) => n.date >= monStr && n.date <= sunStr,
    );
    const weekSommeil = sommeil.filter(
      (s) => s.date >= monStr && s.date <= sunStr,
    );

    const totalVolume = weekWorkouts.reduce((s, w) => s + w.volume, 0);
    const avgKcal =
      weekNutri.length > 0
        ? Math.round(
            weekNutri.reduce((s, n) => s + n.calories, 0) / weekNutri.length,
          )
        : 0;
    const avgSleep =
      weekSommeil.length > 0
        ? Math.round(
            weekSommeil.reduce((s, e) => s + e.duree_minutes, 0) /
              weekSommeil.length,
          )
        : 0;

    return {
      seances: weekWorkouts.length,
      volume: formatVolume(totalVolume),
      avgKcal:
        avgKcal > 0 ? new Intl.NumberFormat("fr-FR").format(avgKcal) : "—",
      avgSleep: avgSleep > 0 ? formatDuree(avgSleep) : "—",
    };
  }, [selectedDate, workouts, nutritionDays, sommeil]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 8,
        }}
      >
        Semaine en bref
      </div>
      <div className="card-surface" style={{ padding: "14px 16px" }}>
        <div className="grid grid-cols-4 gap-2" style={{ textAlign: "center" }}>
          {[
            { val: String(stats.seances), label: "Séances", color: "#74BF7A" },
            {
              val: stats.volume,
              label: "Volume kg",
              color: "var(--text-primary)",
            },
            {
              val: stats.avgKcal,
              label: "Moy. kcal",
              color: "var(--text-primary)",
            },
            { val: stats.avgSleep, label: "Moy. sommeil", color: "#9B7EC8" },
          ].map(({ val, label, color }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                }}
              >
                {val}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginTop: 3,
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
