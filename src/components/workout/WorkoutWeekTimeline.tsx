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
          className="text-[11px] font-bold tracking-[0.1em] uppercase"
          style={{ color: "#A8A29E" }}
        >
          Cette semaine
        </span>
        <Link
          href="/historique"
          className="text-[11px] font-semibold"
          style={{ color: "#74bf7a" }}
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
                className="text-[10px] font-bold tracking-[0.04em] uppercase"
                style={{ color: isToday ? "#4A3728" : "#A8A29E" }}
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
  const base = "w-[32px] h-[32px] rounded-lg flex items-center justify-center";

  if (isDone) {
    return (
      <div
        className={base}
        style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
      >
        <span className="text-[11px] font-bold text-white">✓</span>
      </div>
    );
  }
  if (isToday) {
    return (
      <div
        className={base}
        style={{ background: "linear-gradient(135deg, #c4a882, #a0785c)" }}
      >
        <span className="text-[14px]">💪</span>
      </div>
    );
  }
  if (routineName) {
    return (
      <div
        className={base}
        style={{
          border: "1.5px dashed rgba(74,55,40,0.25)",
          background: "transparent",
        }}
      >
        <span className="text-[8px] font-bold" style={{ color: "#78716C" }}>
          {routineName}
        </span>
      </div>
    );
  }
  return (
    <div
      className={base}
      style={{
        background: "rgba(74,55,40,0.06)",
        opacity: isPast ? 0.35 : 1,
      }}
    />
  );
}
