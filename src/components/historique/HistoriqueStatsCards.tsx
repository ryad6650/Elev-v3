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
    <div className="flex gap-2.5 mb-3">
      {stats.map(({ val, label, barColor }) => (
        <div
          key={label}
          className="flex-1 flex items-center gap-2.5 rounded-[16px]"
          style={{
            background: "rgba(255,255,255,0.35)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 2px 8px rgba(74,55,40,0.04)",
            padding: "12px",
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
              className="font-semibold uppercase"
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: 3,
                letterSpacing: "0.06em",
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
