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
    { val: seances, label: "séances", color: "var(--accent)" },
    { val: `🔥 ${streakActuel} j`, label: "streak", color: "#F5A623" },
    { val: formatVolume(volume), label: "kg volume", color: "#5B9BF5" },
  ];

  return (
    <div className="flex gap-2 mb-3">
      {stats.map(({ val, label, color }) => (
        <div
          key={label}
          className="flex-1 relative overflow-hidden rounded-[18px] p-3"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          {/* Barre colorée gauche */}
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{ width: 3, borderRadius: "0 2px 2px 0", background: color }}
          />
          <div
            className="font-bold leading-snug"
            style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}
          >
            {val}
          </div>
          <div style={{ fontSize: "0.58rem", color: "var(--text-muted)", marginTop: 2 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
