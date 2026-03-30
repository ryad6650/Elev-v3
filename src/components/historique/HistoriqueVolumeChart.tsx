"use client";

import { useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

const W = 340;
const H = 110;
const BAR_W = 30;
const PAD_X = 14;
const PAD_TOP = 24;
const PAD_BOT = 20;
const INNER_H = H - PAD_TOP - PAD_BOT;

interface Props {
  workouts: HistoriqueWorkout[];
}

interface SemaineData {
  label: string;
  volume: number;
  x: number;
}

export default function HistoriqueVolumeChart({ workouts }: Props) {
  const semaines = useMemo<SemaineData[]>(() => {
    const now = new Date();
    const totalBars = 8;
    const spacing = (W - 2 * PAD_X - BAR_W) / (totalBars - 1);

    return Array.from({ length: totalBars }, (_, idx) => {
      const weeksAgo = totalBars - 1 - idx;
      const ref = new Date(now);
      ref.setDate(now.getDate() - weeksAgo * 7);

      const day = ref.getDay();
      const monday = new Date(ref);
      monday.setDate(ref.getDate() - (day === 0 ? 6 : day - 1));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const mondayStr = monday.toISOString().split("T")[0];
      const sundayStr = sunday.toISOString().split("T")[0];

      let volume = 0;
      for (const w of workouts) {
        if (w.date >= mondayStr && w.date <= sundayStr) volume += w.volume;
      }

      return {
        label: `S${idx + 1}`,
        volume: Math.round(volume),
        x: PAD_X + BAR_W / 2 + idx * spacing,
      };
    });
  }, [workouts]);

  const maxVol = Math.max(...semaines.map((s) => s.volume), 1);
  const picIdx = semaines.reduce(
    (best, s, i) => (s.volume > semaines[best].volume ? i : best),
    0
  );
  const pic = semaines[picIdx];

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Volume hebdo (kg)
        </p>
        {pic.volume > 0 && (
          <p className="text-xs font-bold" style={{ color: "var(--accent-text)" }}>
            Pic : {pic.volume >= 1000 ? `${Math.round(pic.volume / 100) / 10}k` : pic.volume} kg
          </p>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" height={H}>
        <defs>
          <linearGradient id="barAccent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8860C" stopOpacity="1" />
            <stop offset="100%" stopColor="#E8860C" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="barMuted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bg-elevated)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--bg-elevated)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X} y1={PAD_TOP + INNER_H}
          x2={W - PAD_X} y2={PAD_TOP + INNER_H}
          stroke="var(--border)" strokeWidth="1"
        />

        {semaines.map((s, i) => {
          const barH = s.volume > 0 ? Math.max(5, (s.volume / maxVol) * INNER_H) : 3;
          const y = PAD_TOP + INNER_H - barH;
          const highlight = i === picIdx && s.volume > 0;
          const isCurrent = i === semaines.length - 1;
          const fill = highlight || isCurrent ? "url(#barAccent)" : "url(#barMuted)";
          const labelColor = highlight || isCurrent ? "var(--accent-text)" : "var(--text-muted)";
          const labelWeight = highlight || isCurrent ? "600" : "400";
          const volLabel = s.volume >= 1000 ? `${Math.round(s.volume / 100) / 10}k` : String(s.volume);

          return (
            <g key={s.label}>
              <rect x={s.x - BAR_W / 2} y={y} width={BAR_W} height={barH} rx={6} fill={fill} />
              {highlight && s.volume > 0 && (
                <>
                  <rect x={s.x - 22} y={y - 17} width={44} height={14} rx={4} fill="var(--accent)" />
                  <text x={s.x} y={y - 7} textAnchor="middle" fontSize={8}
                    fill="white" fontFamily="DM Sans" fontWeight="600">
                    {volLabel}
                  </text>
                </>
              )}
              <text
                x={s.x} y={PAD_TOP + INNER_H + 14}
                textAnchor="middle" fontSize={9}
                fill={labelColor} fontFamily="DM Sans" fontWeight={labelWeight}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
