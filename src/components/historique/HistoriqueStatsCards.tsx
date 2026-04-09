"use client";

import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  totalSeances: number;
  streakActuel: number;
  estTout: boolean;
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${Math.round(v / 100) / 10}k`;
  return String(v);
}

export default function HistoriqueStatsCards({
  workouts,
  totalSeances,
  streakActuel,
  estTout,
}: Props) {
  const seances = estTout ? totalSeances : workouts.length;
  const volume = workouts.reduce((sum, w) => sum + w.volume, 0);

  const stats = [
    { val: String(seances), label: "Séances", barColor: "var(--green)" },
    {
      val: `🔥 ${streakActuel}`,
      label: "Streak",
      barColor: "var(--color-carbs)",
    },
    {
      val: formatVolume(volume),
      label: "Volume kg",
      barColor: "var(--color-protein)",
    },
  ];

  return (
    <div className="flex gap-2.5 mb-3">
      {stats.map(({ val, label, barColor }) => (
        <div
          key={label}
          className="flex-1 flex items-center gap-2.5"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--glass-border)",
            padding: 12,
          }}
        >
          <div
            style={{
              width: 3,
              height: 36,
              borderRadius: 2,
              background: barColor,
              flexShrink: 0,
            }}
          />
          <div className="flex flex-col">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 22,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {val}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
