"use client";

import { Check, ChevronLeft } from "lucide-react";
import type { Programme } from "@/lib/programmes";

const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const JOURS_INITIALES = ["L", "M", "M", "J", "V", "S", "D"];

interface Props {
  programme: Programme;
  onBack: () => void;
  onStartRoutine: (routineId: string, routineNom: string) => void;
}

export default function ProgrammeActiveView({
  programme,
  onBack,
  onStartRoutine,
}: Props) {
  const progress = programme.progres;
  const pct = progress
    ? Math.round((progress.semaine_actuelle / progress.total_semaines) * 100)
    : 0;
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Lundi

  // Build routine map: jour index -> routine
  const routineMap = new Map(programme.routines.map((r) => [r.jour, r]));

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--bg-gradient)" }}
    >
      {/* Header */}
      <div
        className="shrink-0"
        style={{ padding: "max(1rem, env(safe-area-inset-top)) 28px 0" }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <ChevronLeft size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div>
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Programme actif
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 28,
                fontWeight: 500,
                color: "var(--text-primary)",
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              {programme.nom}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 28px 112px", scrollbarWidth: "none" }}
      >
        {/* Progress card */}
        {progress && (
          <ProgressCard
            semaine={progress.semaine_actuelle}
            total={progress.total_semaines}
            pct={pct}
          />
        )}

        {/* Cette semaine */}
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          Cette semaine
        </div>

        {/* Day cards */}
        <div className="flex flex-col gap-2.5">
          {JOURS.map((jour, idx) => {
            const routine = routineMap.get(idx);
            const isToday = idx === todayIdx;
            const isDone = idx < todayIdx && !!routine;
            const isRest = !routine;
            const isFuture = idx > todayIdx;

            if (isRest) {
              return <RestDayCard key={idx} jour={jour} isToday={isToday} />;
            }
            if (isDone) {
              return <DoneDayCard key={idx} jour={jour} routine={routine} />;
            }
            if (isToday) {
              return (
                <TodayDayCard
                  key={idx}
                  jour={jour}
                  routine={routine}
                  onStart={() =>
                    onStartRoutine(routine.routine_id, routine.nom)
                  }
                />
              );
            }
            return (
              <FutureDayCard
                key={idx}
                jour={jour}
                routine={routine}
                initial={JOURS_INITIALES[idx]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgressCard({
  semaine,
  total,
  pct,
}: {
  semaine: number;
  total: number;
  pct: number;
}) {
  return (
    <div
      className="rounded-[20px] mb-3.5"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        padding: "18px 20px",
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          Semaine {semaine} / {total}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--green)",
            background: "var(--green-dim)",
            padding: "3px 10px",
            borderRadius: 9999,
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 99,
          background: "rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 99,
            background: "var(--green)",
          }}
        />
      </div>
    </div>
  );
}

function DoneDayCard({
  jour,
  routine,
}: {
  jour: string;
  routine: { nom: string; nbExercices: number };
}) {
  return (
    <div
      className="rounded-[20px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        padding: "16px 18px",
        opacity: 0.7,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--green)",
          }}
        >
          <Check size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {jour} — {routine.nom}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {routine.nbExercices} exercices · ✓ Terminé
          </div>
        </div>
      </div>
    </div>
  );
}

function TodayDayCard({
  jour,
  routine,
  onStart,
}: {
  jour: string;
  routine: { nom: string; nbExercices: number };
  onStart: () => void;
}) {
  return (
    <div
      className="rounded-[20px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1.5px solid var(--green)",
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0 text-lg"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--green-dim)",
          }}
        >
          💪
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {jour} — {routine.nom}
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--green)",
                background: "var(--green-dim)",
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              Aujourd&apos;hui
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {routine.nbExercices} exercices
          </div>
        </div>
      </div>
      <button
        onClick={onStart}
        className="w-full mt-3.5 active:scale-[0.98] transition-transform"
        style={{
          padding: 11,
          borderRadius: "var(--radius-sm)",
          background: "var(--green)",
          color: "#fff",
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        Commencer la séance
      </button>
    </div>
  );
}

function RestDayCard({ jour, isToday }: { jour: string; isToday: boolean }) {
  return (
    <div
      className="rounded-[20px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: isToday
          ? "1.5px solid var(--green)"
          : "1px solid var(--glass-border)",
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0 text-base"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(0,0,0,0.04)",
          }}
        >
          😴
        </div>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-muted)",
            }}
          >
            {jour} — Repos
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            Jour de récupération
          </div>
        </div>
      </div>
    </div>
  );
}

function FutureDayCard({
  jour,
  routine,
  initial,
}: {
  jour: string;
  routine: { nom: string; nbExercices: number };
  initial: string;
}) {
  return (
    <div
      className="rounded-[20px]"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--glass-border)",
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(0,0,0,0.04)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-muted)",
            }}
          >
            {initial}
          </span>
        </div>
        <div className="flex-1">
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {jour} — {routine.nom}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {routine.nbExercices} exercices
          </div>
        </div>
      </div>
    </div>
  );
}
