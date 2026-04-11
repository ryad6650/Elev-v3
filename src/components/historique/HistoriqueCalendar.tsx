"use client";

import { useState, useMemo } from "react";
import type {
  HistoriqueWorkout,
  NutritionDaySummary,
  PoidsRecord,
} from "@/lib/historique";

interface Props {
  workouts: HistoriqueWorkout[];
  nutritionDays: NutritionDaySummary[];
  poidsHistory: PoidsRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
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

export default function HistoriqueCalendar({
  workouts,
  nutritionDays,
  poidsHistory,
  selectedDate,
  onSelectDate,
}: Props) {
  const today = new Date();
  const [annee, setAnnee] = useState(today.getFullYear());
  const [mois, setMois] = useState(today.getMonth());

  const workoutDates = useMemo(
    () => new Set(workouts.map((w) => w.date)),
    [workouts],
  );
  const nutriDates = useMemo(
    () => new Set(nutritionDays.map((n) => n.date)),
    [nutritionDays],
  );
  const poidsDates = useMemo(
    () => new Set(poidsHistory.map((p) => p.date)),
    [poidsHistory],
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
      className="card-surface"
      style={{ padding: "16px 18px", marginBottom: 14 }}
    >
      {/* Nav mois */}
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontFamily: "var(--font-nunito), sans-serif",
            fontSize: 17,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {MOIS[mois]} {annee}
        </span>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => navMois(dir)}
              className="flex items-center justify-center active:opacity-60 transition-opacity"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--glass-subtle)",
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

      {/* Entêtes */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {JOURS.map((j) => (
          <div
            key={j}
            className="text-center py-0.5"
            style={{
              fontSize: 10,
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

      {/* Grille */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`e-${i}`} className="aspect-square" />;

          const dateStr = `${annee}-${String(mois + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate && !isToday;
          const hasWorkout = workoutDates.has(dateStr);
          const hasNutri = nutriDates.has(dateStr);
          const hasPoids = poidsDates.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className="aspect-square flex flex-col items-center justify-center rounded-lg relative"
              style={{
                fontSize: 12,
                fontWeight: isToday || isSelected ? 700 : 500,
                border: "none",
                cursor: "pointer",
                transition: "background 150ms",
                color: isToday
                  ? "#fff"
                  : isSelected
                    ? "#4A8B50"
                    : "var(--text-muted)",
                background: isToday
                  ? "#1B2E1D"
                  : isSelected
                    ? "rgba(27,46,29,0.15)"
                    : "transparent",
              }}
            >
              {day}
              {/* Dots */}
              {(hasWorkout || hasNutri || hasPoids) && (
                <div className="absolute flex gap-0.5" style={{ bottom: 2 }}>
                  {hasWorkout && (
                    <span
                      className="block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: isToday ? "#fff" : "#74BF7A",
                      }}
                    />
                  )}
                  {hasNutri && (
                    <span
                      className="block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: isToday
                          ? "rgba(255,255,255,0.6)"
                          : "#936A4F",
                      }}
                    />
                  )}
                  {hasPoids && (
                    <span
                      className="block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: isToday
                          ? "rgba(255,255,255,0.4)"
                          : "#6BA3D6",
                      }}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex gap-4 mt-2.5 justify-center">
        {[
          { color: "#74BF7A", label: "Séance" },
          { color: "#936A4F", label: "Nutrition" },
          { color: "#6BA3D6", label: "Pesée" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="block rounded-full"
              style={{ width: 7, height: 7, background: color }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
