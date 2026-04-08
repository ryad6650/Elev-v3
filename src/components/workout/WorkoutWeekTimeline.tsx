"use client";

import { memo } from "react";
import Link from "next/link";
import type { WorkoutPageData } from "@/lib/workout";
import type { ProgrammesPageData } from "@/lib/programmes";

const JOURS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function getDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    return d.toISOString().slice(0, 10);
  });
}

interface Props {
  historique: WorkoutPageData["historique"];
  programmeActif: ProgrammesPageData["programmeActif"];
}

export default memo(function WorkoutWeekTimeline({
  historique,
  programmeActif,
}: Props) {
  const todayIdx = getDayIndex();
  const weekDates = getWeekDates();

  const doneDates = new Set(historique.map((h) => h.date));

  const routineByDay = new Map<number, string>();
  if (programmeActif) {
    for (const r of programmeActif.routines) {
      const shortName =
        r.nom.length > 5
          ? (r.nom.split(/[\s—–-]/)[0] ?? r.nom.slice(0, 5))
          : r.nom;
      routineByDay.set(r.jour, shortName);
    }
  }

  return (
    <div
      className="rounded-[20px] overflow-hidden p-3.5 px-4"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[9px] font-bold tracking-[0.22em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Cette semaine
        </span>
        <Link
          href="/historique"
          className="text-[10px] font-semibold"
          style={{ color: "var(--accent-text)" }}
        >
          Voir tout &rarr;
        </Link>
      </div>

      {/* Jours */}
      <div className="flex gap-1">
        {JOURS.map((jour, i) => {
          const isDone = doneDates.has(weekDates[i]);
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          const isRest = !isDone && !isToday && !routineByDay.has(i);
          const routineName = routineByDay.get(i);

          let dotStyle: React.CSSProperties = {
            width: 28,
            height: 28,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            background: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.07)",
          };

          if (isDone) {
            dotStyle = {
              ...dotStyle,
              background: "rgba(34,197,94,0.12)",
              borderColor: "rgba(34,197,94,0.2)",
            };
          } else if (isToday) {
            dotStyle = {
              ...dotStyle,
              background: "#1B2E1D",
              borderColor: "#2d4a2f",
              boxShadow: "0 2px 12px rgba(27,46,29,0.6)",
            };
          } else if (isRest || isPast) {
            dotStyle = { ...dotStyle, opacity: 0.35 };
          }

          let content: React.ReactNode;
          if (isDone) {
            content = (
              <span style={{ color: "var(--text-primary)" }}>{"\u2713"}</span>
            );
          } else if (isToday) {
            content = <span>{"\uD83D\uDCAA"}</span>;
          } else if (!isPast && routineName) {
            content = (
              <span
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {routineName}
              </span>
            );
          } else {
            content = (
              <span style={{ color: "var(--text-muted)" }}>{"\u2014"}</span>
            );
          }

          return (
            <div key={jour} className="flex-1 flex flex-col items-center gap-1">
              <span
                className="text-[8px] font-semibold tracking-[0.04em]"
                style={{ color: "var(--text-muted)" }}
              >
                {jour}
              </span>
              <div style={dotStyle}>{content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
