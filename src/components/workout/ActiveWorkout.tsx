"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, AlarmClock, X } from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { useShallow } from "zustand/react/shallow";
import {
  getUserExerciseSettings,
  getExerciseLastRefs,
} from "@/app/actions/routines";
import ExerciseCard from "./ExerciseCard";
import WorkoutTimer from "./WorkoutTimer";
import RestTimer from "./RestTimer";
import WorkoutSummary from "./WorkoutSummary";

const ExerciseSearch = dynamic(() => import("./ExerciseSearch"), {
  ssr: false,
});

interface PRNotif {
  exerciseName: string;
  poids: number;
  reps: number;
}

export default function ActiveWorkout() {
  const isActive = useWorkoutStore((s) => s.activeWorkout !== null);
  const debutAt = useWorkoutStore((s) => s.activeWorkout?.debutAt ?? 0);
  const exercises = useWorkoutStore(
    useShallow((s) => s.activeWorkout?.exercises ?? []),
  );
  const exerciseUids = exercises.map((e) => e.uid);
  const minimizeWorkout = useWorkoutStore((s) => s.minimizeWorkout);
  const replaceExercise = useWorkoutStore((s) => s.replaceExercise);
  const [showSearch, setShowSearch] = useState(false);
  const [replacingUid, setReplacingUid] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [prNotif, setPrNotif] = useState<PRNotif | null>(null);
  const prTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [openUids, setOpenUids] = useState<Set<string>>(
    () => new Set(exerciseUids),
  );

  useEffect(() => {
    if (!prNotif) return;
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate([100, 50, 100]);
    if (prTimerRef.current) clearTimeout(prTimerRef.current);
    prTimerRef.current = setTimeout(() => setPrNotif(null), 4000);
    return () => {
      if (prTimerRef.current) clearTimeout(prTimerRef.current);
    };
  }, [prNotif]);

  useEffect(() => {
    setOpenUids((prev) => {
      const next = new Set(prev);
      exerciseUids.forEach((uid) => next.add(uid));
      return next;
    });
  }, [exerciseUids.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = useCallback((uid: string) => {
    setOpenUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }, []);
  const handlePR = useCallback(
    (name: string, poids: number, reps: number) =>
      setPrNotif({ exerciseName: name, poids, reps }),
    [],
  );
  const handleReplace = useCallback((uid: string) => {
    setReplacingUid(uid);
    setShowSearch(true);
  }, []);

  const volume = exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter((s) => s.completed && !s.isWarmup)
        .reduce((s2, set) => s2 + (set.poids ?? 0) * (set.reps ?? 0), 0),
    0,
  );
  const totalSeries = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed && !s.isWarmup).length,
    0,
  );

  if (!isActive) return null;
  if (showSummary) {
    const workout = useWorkoutStore.getState().activeWorkout;
    if (!workout) return null;
    return <WorkoutSummary workout={workout} totalPausedMs={0} />;
  }

  return (
    <>
      <div className="min-h-dvh flex flex-col" style={{ background: "#000" }}>
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-4"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: 12,
            background: "#1C1C1E",
          }}
        >
          <button
            onClick={minimizeWorkout}
            className="flex items-center gap-2 active:opacity-70"
          >
            <ChevronDown size={22} style={{ color: "var(--text-primary)" }} />
            <span
              style={{
                fontFamily: "var(--font-nunito),sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Entraînement
            </span>
          </button>
          <div className="flex items-center gap-3">
            <AlarmClock size={22} style={{ color: "var(--text-primary)" }} />
            <button
              onClick={() => setShowSummary(true)}
              className="px-5 py-2 rounded-full font-semibold text-[15px] active:scale-[0.97] transition-transform"
              style={{
                background: "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-nunito),sans-serif",
              }}
            >
              Terminer
            </button>
          </div>
        </div>

        {/* Sync bar */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            borderTop: "1.5px solid #2C2C2E",
            borderBottom: "1.5px solid #2C2C2E",
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: "#22C55E" }}
          />
          <span
            style={{
              fontFamily: "var(--font-nunito),sans-serif",
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            Synchronisation en direct active
          </span>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center px-4 py-3"
          style={{ borderBottom: "0.5px solid #2C2C2E" }}
        >
          <div className="flex-1">
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-nunito),sans-serif",
                marginBottom: 2,
              }}
            >
              Durée
            </div>
            <WorkoutTimer startedAt={debutAt} compact />
          </div>
          <div className="flex-1">
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-nunito),sans-serif",
                marginBottom: 2,
              }}
            >
              Volume
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-nunito),sans-serif",
              }}
            >
              {volume > 0 ? `${volume} kg` : "0 kg"}
            </span>
          </div>
          <div className="flex-1">
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-nunito),sans-serif",
                marginBottom: 2,
              }}
            >
              Séries
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-nunito),sans-serif",
              }}
            >
              {totalSeries}
            </span>
          </div>
          {/* Silhouettes corps */}
          <div className="flex gap-1 opacity-30">
            <svg
              width="18"
              height="30"
              viewBox="0 0 18 30"
              fill="var(--text-muted)"
            >
              <ellipse cx="9" cy="3.5" rx="3.5" ry="3.5" />
              <rect x="6" y="8" width="6" height="11" rx="3" />
              <rect x="3" y="19" width="4.5" height="9" rx="2.25" />
              <rect x="10.5" y="19" width="4.5" height="9" rx="2.25" />
            </svg>
            <svg
              width="18"
              height="30"
              viewBox="0 0 18 30"
              fill="var(--text-muted)"
            >
              <ellipse cx="9" cy="3.5" rx="3.5" ry="3.5" />
              <rect x="6" y="8" width="6" height="11" rx="3" />
              <rect x="3" y="19" width="4.5" height="9" rx="2.25" />
              <rect x="10.5" y="19" width="4.5" height="9" rx="2.25" />
            </svg>
          </div>
        </div>

        {/* Liste exercices */}
        <div
          className="flex-1 overflow-y-auto pb-24"
          style={{ scrollbarWidth: "none" }}
        >
          {exerciseUids.length === 0 && (
            <div className="text-center py-16">
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Aucun exercice.
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-6 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Ajouter un exercice
              </button>
            </div>
          )}
          {exerciseUids.map((uid) => (
            <ExerciseCard
              key={uid}
              uid={uid}
              isOpen={openUids.has(uid)}
              onOpen={handleOpen}
              onPR={handlePR}
              onReplace={handleReplace}
            />
          ))}
        </div>

        {/* PR notification */}
        {prNotif && (
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(5,137,214,0.12)",
              border: "1px solid rgba(5,137,214,0.25)",
            }}
          >
            <span className="shrink-0">🏆</span>
            <p
              className="flex-1 text-xs font-semibold truncate"
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-nunito),sans-serif",
              }}
            >
              Record ! {prNotif.exerciseName} — {prNotif.poids}kg ×{" "}
              {prNotif.reps}
            </p>
            <button onClick={() => setPrNotif(null)}>
              <X size={14} style={{ color: "var(--accent)" }} />
            </button>
          </div>
        )}
      </div>

      {showSearch && (
        <ExerciseSearch
          onClose={() => {
            setShowSearch(false);
            setReplacingUid(null);
          }}
          title={replacingUid ? "Remplacer l'exercice" : "Ajouter un exercice"}
          onSelect={
            replacingUid
              ? async (ex) => {
                  const [settingsMap] = await Promise.all([
                    getUserExerciseSettings([ex.id]),
                    getExerciseLastRefs([ex.id]),
                  ]);
                  const s = settingsMap[ex.id];
                  replaceExercise(replacingUid, {
                    exerciseId: ex.id,
                    nom: ex.nom,
                    groupeMusculaire: ex.groupe_musculaire,
                    gifUrl: ex.gif_url,
                    seriesCible: 3,
                    repsCible: 10,
                    repsCibleMax: null,
                    restDuration: s?.restDuration ?? null,
                    notes: s?.notes ?? "",
                  });
                  setShowSearch(false);
                  setReplacingUid(null);
                }
              : undefined
          }
        />
      )}
      <RestTimer />
    </>
  );
}
