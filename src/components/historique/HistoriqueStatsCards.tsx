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
    { val: String(seances), label: "Séances", barColor: "#74BF7A" },
    { val: `🔥 ${streakActuel}`, label: "Streak", barColor: "#C8A055" },
    { val: formatVolume(volume), label: "Volume kg", barColor: "#6BA3D6" },
  ];

  return (
    <div className="flex gap-2 mb-2.5">
      {stats.map(({ val, label, barColor }) => (
        <div
          key={label}
          className="flex-1 relative overflow-hidden rounded-[14px] py-2.5 pl-3.5 pr-2.5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="absolute left-0 rounded-r-sm"
            style={{
              width: "2.5px",
              top: 6,
              bottom: 6,
              background: barColor,
            }}
          />
          <div
            className="leading-none"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: "22px",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {val}
          </div>
          <div
            className="font-semibold"
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              marginTop: 3,
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
