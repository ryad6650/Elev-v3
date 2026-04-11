"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Share, MoreHorizontal, ChevronDown } from "lucide-react";
import type { Routine } from "@/lib/workout";
import type { RoutineExerciseData } from "@/app/actions/routines";
import type { RoutineVolumePoint } from "@/app/actions/routine-detail";
import { getRoutineExercises } from "@/app/actions/routines";
import { getRoutineVolumeHistory } from "@/app/actions/routine-detail";
import ExerciseGif from "./ExerciseGif";
import RoutineChart, { type ChartTab } from "./RoutineChart";

interface Props {
  routine: Routine;
  userName: string;
  onBack: () => void;
  onStart: () => void;
  onEdit: () => void;
}

const TABS: { key: ChartTab; label: string }[] = [
  { key: "volume", label: "Volume" },
  { key: "reps", label: "Réps" },
  { key: "duree", label: "Durée" },
];

export default function RoutineDetailView({
  routine,
  userName,
  onBack,
  onStart,
  onEdit,
}: Props) {
  const [exercises, setExercises] = useState<RoutineExerciseData[]>([]);
  const [history, setHistory] = useState<RoutineVolumePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ChartTab>("volume");
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    setTimeout(onStart, 250);
  };

  const cacheRef = useRef<
    Map<
      string,
      {
        exercises: RoutineExerciseData[];
        history: RoutineVolumePoint[];
        ts: number;
      }
    >
  >(new Map());

  useEffect(() => {
    const cached = cacheRef.current.get(routine.id);
    if (cached && Date.now() - cached.ts < 60_000) {
      setExercises(cached.exercises);
      setHistory(cached.history);
      setLoading(false);
      return;
    }
    Promise.all([
      getRoutineExercises(routine.id),
      getRoutineVolumeHistory(routine.id),
    ]).then(([exs, hist]) => {
      cacheRef.current.set(routine.id, {
        exercises: exs,
        history: hist,
        ts: Date.now(),
      });
      setExercises(exs);
      setHistory(hist);
      setLoading(false);
    });
  }, [routine.id]);

  const lastEntry = history[history.length - 1];
  const lastValue = lastEntry
    ? tab === "volume"
      ? `${lastEntry.volume} kg`
      : tab === "reps"
        ? `${lastEntry.totalReps}`
        : `${lastEntry.duree_minutes ?? 0} min`
    : null;
  const lastDate = lastEntry
    ? new Date(lastEntry.date).toLocaleDateString("fr-FR", {
        month: "long",
        day: "numeric",
      })
    : null;

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 48,
        background: "#1B1715",
        overflowY: "auto",
      }}
    >
      <div style={{ paddingBottom: 96 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "max(20px, env(safe-area-inset-top)) 16px 12px",
            background: "#1B1715",
          }}
        >
          <button
            onClick={onBack}
            style={{
              color: "#fff",
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <span style={{ color: "#fff", fontSize: 16 }}>Routine</span>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              style={{
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Share size={20} />
            </button>
            <button
              style={{
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              margin: "12px 0 2px",
            }}
          >
            {routine.nom}
          </h1>
          <p style={{ color: "#8E8E93", fontSize: 14, margin: "0 0 12px" }}>
            Créée par {userName}
          </p>

          <button
            onClick={handleStart}
            disabled={isStarting}
            style={{
              width: "100%",
              background: "#1E9D4C",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "6px",
              fontSize: 17,
              fontWeight: 600,
              marginBottom: 16,
              cursor: isStarting ? "default" : "pointer",
              transform: isStarting ? "scale(0.97)" : "scale(1)",
              opacity: isStarting ? 0.85 : 1,
              transition: "transform 200ms ease, opacity 200ms ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isStarting && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            {isStarting ? "Chargement..." : "Commencer la Routine"}
          </button>

          {/* Stats + chart */}
          <div style={{ marginBottom: 4 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                {lastValue && (
                  <span
                    style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}
                  >
                    {lastValue}
                  </span>
                )}
                {lastDate && (
                  <span
                    style={{ color: "#1E9D4C", fontSize: 14, marginLeft: 6 }}
                  >
                    {lastDate}
                  </span>
                )}
              </div>
              <button
                style={{
                  color: "#1E9D4C",
                  fontSize: 13,
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                3 derniers mois <ChevronDown size={13} />
              </button>
            </div>
            <RoutineChart points={history} tab={tab} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: "none",
                  background: tab === key ? "#1E9D4C" : "#262220",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: tab === key ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Exercises section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={{ color: "#8E8E93", fontSize: 14 }}>Exercices</span>
            <button
              onClick={onEdit}
              style={{
                color: "#1E9D4C",
                fontSize: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Modifier la Routine
            </button>
          </div>

          {loading ? (
            <p
              style={{
                color: "#8E8E93",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              Chargement...
            </p>
          ) : (
            exercises.map((ex) => (
              <div key={ex.exerciseId} style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <ExerciseGif
                    gifUrl={ex.gifUrl}
                    nom={ex.nom}
                    size="sm"
                    circle
                  />
                  <span
                    style={{ color: "#1E9D4C", fontSize: 16, fontWeight: 600 }}
                  >
                    {ex.nom}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr 1fr",
                    padding: "0 16px 6px",
                    margin: "0 -16px",
                    borderBottom: "1px solid #151312",
                  }}
                >
                  {["SÉRIE", "KG", "RÉPS"].map((h) => (
                    <span
                      key={h}
                      style={{
                        color: "#6E6E73",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {Array.from({ length: ex.seriesCible }, (_, i) => i + 1).map(
                  (num) => (
                    <div
                      key={num}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "56px 1fr 1fr",
                        padding: "11px 16px",
                        margin: "0 -16px",
                        background: num % 2 === 0 ? "#262220" : "#1B1715",
                        borderBottom: "1px solid #111",
                      }}
                    >
                      <span
                        style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}
                      >
                        {num}
                      </span>
                      <span style={{ color: "#8E8E93", fontSize: 16 }}>
                        {ex.poidsRef != null ? `${ex.poidsRef}` : "–"}
                      </span>
                      <span style={{ color: "#8E8E93", fontSize: 16 }}>
                        {ex.repsRef != null ? `${ex.repsRef}` : "–"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
