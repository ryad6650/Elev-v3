"use client";

import { memo } from "react";
import Link from "next/link";
import type { WorkoutPageData } from "@/lib/workout";
import type { ProgrammesPageData } from "@/lib/programmes";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Cette semaine
        </span>
        <Link
          href="/historique"
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--green)",
          }}
        >
          Historique &rarr;
        </Link>
      </div>

      {/* Jours */}
      <div className="flex justify-between">
        {JOURS.map((jour, i) => {
          const isDone = doneDates.has(weekDates[i]);
          const isToday = i === todayIdx;
          const isPast = i < todayIdx && !isDone;
          const routineName =
            !isDone && !isToday && i > todayIdx
              ? routineByDay.get(i)
              : undefined;

          return (
            <div key={jour} className="flex flex-col items-center gap-1.5">
              <span
                style={{
                  fontFamily: "var(--font-nunito), sans-serif",
                  fontSize: 11,
                  fontWeight: isToday ? 700 : 500,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: isToday ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {jour}
              </span>
              <DayDot
                isDone={isDone}
                isToday={isToday}
                isPast={isPast}
                routineName={routineName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

function DayDot({
  isDone,
  isToday,
  isPast,
  routineName,
}: {
  isDone: boolean;
  isToday: boolean;
  isPast: boolean;
  routineName?: string;
}) {
  const base = "w-[36px] h-[36px] rounded-xl flex items-center justify-center";

  if (isDone) {
    return (
      <div className={base} style={{ background: "var(--green)" }}>
        <span className="text-[12px] font-bold text-white">✓</span>
      </div>
    );
  }
  if (isToday) {
    return (
      <div
        className={base}
        style={{
          border: "2px solid var(--green)",
          background: "var(--green-dim)",
        }}
      >
        <span className="text-[15px]">💪</span>
      </div>
    );
  }
  if (routineName) {
    return (
      <div
        className={base}
        style={{
          border: "1.5px dashed rgba(0,0,0,0.12)",
          background: "transparent",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 8,
            fontWeight: 700,
            color: "var(--text-muted)",
          }}
        >
          {routineName}
        </span>
      </div>
    );
  }
  return (
    <div
      className={base}
      style={{
        background: "rgba(0,0,0,0.04)",
        opacity: isPast ? 0.35 : 1,
      }}
    />
  );
}
