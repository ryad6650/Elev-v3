"use client";

import { Check } from "lucide-react";

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];

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
            background: "rgba(30,157,76,0.15)",
            fontSize: 14,
            fontWeight: 700,
            color: "#74BF7A",
          }}
        >
          🔥 {streakJours} jour{streakJours > 1 ? "s" : ""}
        </div>
      </div>

      <div
        style={{
          background: "#262220",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "18px 16px",
        }}
      >
        <div className="flex justify-between items-center">
          {JOURS.map((jour, i) => {
            const isPast = i < todayIdx;
            const isToday = i === todayIdx;
            const isCompleted = isPast;

            return (
              <div
                key={`${jour}-${i}`}
                className="flex flex-col items-center gap-2"
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isToday
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                >
                  {jour}
                </span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    ...(isCompleted
                      ? {
                          border: "2px solid #74BF7A",
                          background: isToday
                            ? "rgba(116,191,122,0.12)"
                            : "transparent",
                        }
                      : {
                          border: "1.5px solid rgba(255,255,255,0.1)",
                          background: "transparent",
                        }),
                  }}
                >
                  {isCompleted && (
                    <Check size={16} strokeWidth={3} color="#74BF7A" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
