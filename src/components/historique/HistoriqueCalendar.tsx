"use client";

import { useState, useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  streakActuel: number;
}

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
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

const glassStyle = {
  background: "rgba(255,255,255,0.35)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 2px 8px rgba(74,55,40,0.04)",
} as const;

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
  const debutSemaine = (premierJour.getDay() + 6) % 7;
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
      className="rounded-2xl mb-2.5"
      style={{ ...glassStyle, padding: "12px 14px" }}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "14px",
            color: "var(--text-primary)",
          }}
        >
          {MOIS[mois]} {annee}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => navMois(-1)}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(74,55,40,0.07)",
              color: "var(--text-muted)",
              fontSize: "11px",
              border: "none",
            }}
          >
            ‹
          </button>
          <button
            onClick={() => navMois(1)}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(74,55,40,0.07)",
              color: "var(--text-muted)",
              fontSize: "11px",
              border: "none",
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {JOURS.map((j, i) => (
          <div
            key={i}
            className="text-center py-0.5"
            style={{
              fontSize: "7px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {j}
          </div>
        ))}
      </div>

      {/* Grille jours */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`e-${i}`} className="aspect-square" />;

          const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasSession = sessionDates.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className="aspect-square flex flex-col items-center justify-center gap-0.5 rounded-lg relative"
              style={{
                fontSize: "9px",
                fontWeight: isToday ? 700 : 500,
                color: isToday ? "#fff" : "var(--text-muted)",
                background: isToday
                  ? "linear-gradient(135deg, #c4a882, #a0785c)"
                  : "transparent",
              }}
            >
              {day}
              {hasSession && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: isToday ? "#fff" : "#74BF7A",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Streak */}
      <div
        className="text-center mt-2"
        style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--text-muted)",
        }}
      >
        🔥 Streak actuel : {streakActuel} jour{streakActuel > 1 ? "s" : ""}
      </div>
    </div>
  );
}
