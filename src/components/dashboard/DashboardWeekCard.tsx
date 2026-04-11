"use client";

import { Check } from "lucide-react";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

interface Props {
  streakJours: number;
}

export default function DashboardWeekCard({ streakJours }: Props) {
  const todayIdx = getDayIndex();

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 14 }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          Cette semaine
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 14px",
            borderRadius: 9999,
            background: "rgba(30,157,76,0.1)",
            fontSize: 14,
            fontWeight: 700,
            color: "#1E9D4C",
          }}
        >
          🔥 {streakJours} jour{streakJours > 1 ? "s" : ""}
        </div>
      </div>

      <div
        style={{
          background: "#151312",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "18px 16px",
        }}
      >
        <div className="flex justify-between items-center">
          {JOURS.map((jour, i) => {
            const isPast = i < todayIdx;
            const isToday = i === todayIdx;

            return (
              <div key={jour} className="flex flex-col items-center gap-2">
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isToday ? "#1E9D4C" : "var(--text-muted)",
                  }}
                >
                  {jour}
                </span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    ...(isPast
                      ? { background: "#1B2E1D" }
                      : isToday
                        ? {
                            background: "rgba(30,157,76,0.1)",
                            border: "2px solid #1E9D4C",
                          }
                        : { background: "rgba(255,255,255,0.04)" }),
                  }}
                >
                  {isPast && <Check size={16} strokeWidth={3} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
