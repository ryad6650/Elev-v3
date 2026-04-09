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
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--glass-border)",
        padding: "16px 18px",
        marginBottom: 14,
      }}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {MOIS[mois]} {annee}
        </span>
        <div className="flex gap-2">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              onClick={() => navMois(dir as -1 | 1)}
              className="flex items-center justify-center transition-opacity active:opacity-60"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.04)",
                color: "var(--text-muted)",
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              {dir === -1 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>

      {/* Entêtes jours */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {JOURS.map((j, i) => (
          <div
            key={i}
            className="text-center py-0.5"
            style={{
              fontFamily: "var(--font-nunito), sans-serif",
              fontSize: 9,
              fontWeight: 600,
              color: "var(--text-muted)",
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
                fontFamily: "var(--font-nunito), sans-serif",
                fontSize: 10,
                fontWeight: isToday ? 700 : 500,
                color: isToday ? "#fff" : "var(--text-muted)",
                background: isToday ? "var(--green)" : "transparent",
              }}
            >
              {day}
              {hasSession && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: isToday ? "#fff" : "var(--green)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Streak */}
      <div
        className="text-center mt-3"
        style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--text-muted)",
        }}
      >
        🔥 Streak actuel : {streakActuel} jour{streakActuel > 1 ? "s" : ""}
      </div>
    </div>
  );
}
