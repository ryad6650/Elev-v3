"use client";

import { memo } from "react";
import Link from "next/link";
import type { ProchaineRoutine } from "@/lib/dashboard";

const JOURS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function getDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

interface Props {
  seancesAujourdhui: boolean;
  seancesCetteSemaine: number;
  prochaineRoutine: ProchaineRoutine | null;
}

export default memo(function WeeklyWorkoutCard({
  seancesAujourdhui,
  prochaineRoutine,
}: Props) {
  const todayIdx = getDayIndex();

  return (
    <div
      className="rounded-[20px] overflow-hidden p-3.5 px-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
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
          style={{ color: "#74BF7A" }}
        >
          Voir tout &rarr;
        </Link>
      </div>

      {/* Jours de la semaine */}
      <div className="flex gap-1 mb-3">
        {JOURS.map((jour, i) => {
          const isPast = i < todayIdx;
          const isToday = i === todayIdx;
          const isDone = isPast && i < 2;

          const dotClass = "flex-1 flex flex-col items-center gap-1";
          let dotStyle: React.CSSProperties = {
            width: 28,
            height: 28,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          };

          if (isDone && seancesAujourdhui !== undefined) {
            dotStyle = {
              ...dotStyle,
              background: "rgba(34,197,94,0.12)",
              borderColor: "rgba(34,197,94,0.2)",
            };
          }
          if (isToday) {
            dotStyle = {
              ...dotStyle,
              background: "#1B2E1D",
              borderColor: "#2d4a2f",
              boxShadow: "0 2px 12px rgba(27,46,29,0.6)",
            };
          }

          return (
            <div key={jour} className={dotClass}>
              <span
                className="text-[8px] font-semibold tracking-[0.04em]"
                style={{ color: "var(--text-muted)" }}
              >
                {jour}
              </span>
              <div style={dotStyle}>
                <span
                  style={{
                    color: "#FAFAF9",
                    opacity: isPast && !isDone && !isToday ? 0.35 : 1,
                  }}
                >
                  {isDone ? "\u2713" : isToday ? "\uD83D\uDCAA" : "\u2014"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine active */}
      {prochaineRoutine && (
        <Link href="/workout" className="block">
          <div
            className="rounded-[14px] p-3 px-3.5 flex items-center gap-2.5"
            style={{
              background: "linear-gradient(135deg, #07100A 0%, #74BF7A 100%)",
              border: "1px solid rgba(116,191,122,0.2)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight">
                {prochaineRoutine.nom}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: "rgba(250,250,249,0.6)" }}
              >
                {prochaineRoutine.nbExercices} exercice
                {prochaineRoutine.nbExercices !== 1 ? "s" : ""}
                {prochaineRoutine.dureeEstimee != null &&
                  ` \u00B7 ~${prochaineRoutine.dureeEstimee} min`}
              </p>
            </div>
            <div
              className="rounded-[10px] px-3 py-2 text-[11px] font-bold text-white shrink-0"
              style={{
                background: "rgba(250,250,249,0.15)",
                border: "1px solid rgba(250,250,249,0.2)",
              }}
            >
              Lancer &rarr;
            </div>
          </div>
        </Link>
      )}
    </div>
  );
});
