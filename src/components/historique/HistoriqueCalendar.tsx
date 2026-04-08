"use client";

import { useState, useMemo } from "react";
import type { HistoriqueWorkout } from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  streakActuel: number;
}

const JOURS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
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
      className="rounded-[20px] p-4 mb-2.5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontStyle: "italic",
            fontSize: "16px",
            color: "var(--text-primary)",
          }}
        >
          {MOIS[mois]} {annee}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => navMois(-1)}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "11px",
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
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "11px",
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
              fontSize: "8px",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
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
                fontSize: "10px",
                fontWeight: 500,
                color: isToday ? "#FAFAF9" : "var(--text-secondary)",
                background: isToday ? "var(--accent)" : "transparent",
                border: isToday ? "1px solid rgba(116,191,122,0.25)" : "none",
                boxShadow: isToday ? "0 2px 10px rgba(27,46,29,0.5)" : "none",
              }}
            >
              {day}
              {hasSession && (
                <div
                  style={{
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
        className="flex items-center gap-1.5 mt-2 pt-2"
        style={{
          borderTop: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
          🔥 Streak actuel :
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "var(--accent-text)",
          }}
        >
          {streakActuel} jour{streakActuel > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
