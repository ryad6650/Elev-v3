"use client";

import { useState, useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  streakActuel: number;
}

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];
const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function HistoriqueCalendar({ workouts, streakActuel }: Props) {
  const today = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois] = useState(today.getMonth());

  const sessionDates = useMemo(
    () => new Set(workouts.map((w) => w.date)),
    [workouts],
  );
  const todayStr = today.toISOString().split("T")[0];

  const premierJour = new Date(annee, mois, 1);
  const debutSemaine = (premierJour.getDay() + 6) % 7; // lundi=0
  const nbJours = new Date(annee, mois + 1, 0).getDate();

  function navMois(dir: -1 | 1) {
    const d = new Date(annee, mois + dir, 1);
    setAnnee(d.getFullYear());
    setMois(d.getMonth());
  }

  const cells: (number | null)[] = [
    ...Array(debutSemaine).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];

  return (
    <div
      className="rounded-2xl p-4 mb-3"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={() => navMois(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          ‹
        </button>
        <span
          className="font-semibold"
          style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}
        >
          {MOIS[mois]} {annee}
        </span>
        <button
          onClick={() => navMois(1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          ›
        </button>
      </div>

      {/* Grille calendrier */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Entêtes jours */}
        {JOURS.map((j, i) => (
          <div
            key={i}
            className="text-center pb-2"
            style={{
              fontSize: "0.58rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              paddingTop: 4,
            }}
          >
            {j}
          </div>
        ))}

        {/* Jours */}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasSession = sessionDates.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className="flex flex-col items-center"
              style={{ gap: 3, padding: "4px 2px", minHeight: 36 }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontSize: "0.72rem",
                  fontWeight: isToday ? 700 : 500,
                  background: isToday ? "var(--accent)" : "transparent",
                  color: isToday
                    ? "#fff"
                    : hasSession
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                {day}
              </div>
              {hasSession && (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Streak */}
      <div
        className="flex items-center gap-1.5 mt-3 pt-3"
        style={{
          borderTop: "1px solid var(--border)",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        🔥 Streak actuel :&nbsp;
        <strong style={{ color: "var(--accent-text)", fontWeight: 700 }}>
          {streakActuel} jour{streakActuel > 1 ? "s" : ""}
        </strong>
        &nbsp;consécutif{streakActuel > 1 ? "s" : ""}
      </div>
    </div>
  );
}
