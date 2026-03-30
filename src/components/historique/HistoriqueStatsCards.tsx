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
    { emoji: "💪", value: seances, label: "Séances" },
    { emoji: "⚡", value: formatVolume(volume), label: "Volume kg" },
    { emoji: "🔥", value: streakActuel, label: "Streak" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      {stats.map(({ emoji, value, label }) => (
        <div
          key={label}
          className="rounded-2xl p-3.5 text-center"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="text-[22px] mb-1.5">{emoji}</div>
          <div
            className="text-xl font-bold leading-none mb-1"
            style={{ color: "var(--accent-text)" }}
          >
            {value}
          </div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
