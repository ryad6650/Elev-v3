"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, Plus, Pause, Play, X } from "lucide-react";
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
  const routineName = useWorkoutStore(
    (s) => s.activeWorkout?.routineName ?? null,
  );
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
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [prNotif, setPrNotif] = useState<PRNotif | null>(null);
  const prTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!prNotif) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    if (prTimerRef.current) clearTimeout(prTimerRef.current);
    prTimerRef.current = setTimeout(() => setPrNotif(null), 4000);
    return () => {
      if (prTimerRef.current) clearTimeout(prTimerRef.current);
    };
  }, [prNotif]);

  const [openUid, setOpenUid] = useState<string | null>(
    () => exerciseUids[0] ?? null,
  );

  const handleOpen = useCallback((uid: string) => setOpenUid(uid), []);
  const handlePR = useCallback(
    (name: string, poids: number, reps: number) =>
      setPrNotif({ exerciseName: name, poids, reps }),
    [],
  );
  const handleReplace = useCallback((uid: string) => {
    setReplacingUid(uid);
    setShowSearch(true);
  }, []);

  if (!isActive) return null;
  if (showSummary) {
    const workout = useWorkoutStore.getState().activeWorkout;
    if (!workout) return null;
    return <WorkoutSummary workout={workout} totalPausedMs={totalPausedMs} />;
  }

  const isPaused = pausedAt !== null;
  const handlePause = () => setPausedAt(Date.now());
  const handleResume = () => {
    if (!pausedAt) return;
    setTotalPausedMs((prev) => prev + Date.now() - pausedAt);
    setPausedAt(null);
  };

  return (
    <>
      <div
        className="min-h-dvh flex flex-col"
        style={{ background: "var(--bg-gradient)" }}
      >
        {/* Header */}
        <div
          className="shrink-0"
          style={{
            padding: "max(1rem, env(safe-area-inset-top)) 20px 0",
          }}
        >
          {/* Back row : retour + label routine + Terminer */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <button
                onClick={minimizeWorkout}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              >
                <ChevronLeft
                  size={16}
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.08em]"
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  color: "var(--text-muted)",
                }}
              >
                {routineName ?? "Séance libre"}
              </span>
            </div>
            <button
              onClick={() => setShowSummary(true)}
              className="text-[12px] font-semibold tracking-[0.02em] rounded-full px-[18px] py-2 border-none"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                background: "var(--green)",
                color: "#fff",
              }}
            >
              Terminer
            </button>
          </div>

          {/* Titre */}
          <h1
            className="text-[28px] leading-[1.1] font-medium tracking-[-0.5px] mt-3 mb-3"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              color: "var(--text-primary)",
            }}
          >
            En cours...
          </h1>
        </div>

        {/* Contenu scrollable */}
        <div
          className="flex-1 overflow-y-auto pt-2 pb-36 flex flex-col gap-2.5"
          style={{ scrollbarWidth: "none", padding: "8px 28px 144px" }}
        >
          {/* Timer card */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-[20px]"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="flex flex-col">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  color: "var(--text-muted)",
                }}
              >
                Durée séance
              </span>
              <WorkoutTimer
                startedAt={debutAt}
                pausedAt={pausedAt}
                totalPausedMs={totalPausedMs}
                large
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.04)" }}
              >
                {isPaused ? (
                  <Play
                    size={14}
                    fill="var(--text-muted)"
                    style={{ color: "var(--text-muted)" }}
                  />
                ) : (
                  <Pause
                    size={14}
                    fill="var(--text-muted)"
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Section label */}
          {exerciseUids.length > 0 && (
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.08em] mt-1 mb-1"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                color: "var(--text-muted)",
              }}
            >
              Exercices ·{" "}
              {(() => {
                const done = exercises.filter((e) => {
                  const work = e.sets.filter((s) => !s.isWarmup);
                  return work.length > 0 && work.every((s) => s.completed);
                }).length;
                return `${done}/${exercises.length}`;
              })()}
            </p>
          )}

          {/* Exercices */}
          {exerciseUids.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun exercice pour le moment.
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-6 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "var(--green)", color: "#fff" }}
              >
                Ajouter un exercice
              </button>
            </div>
          )}
          {exerciseUids.map((uid) => (
            <ExerciseCard
              key={uid}
              uid={uid}
              isOpen={openUid === uid}
              onOpen={handleOpen}
              onPR={handlePR}
              onReplace={handleReplace}
            />
          ))}
        </div>

        {/* FAB ajouter exercice */}
        {exerciseUids.length > 0 && (
          <button
            onClick={() => setShowSearch(true)}
            className="fixed w-[52px] h-[52px] rounded-full flex items-center justify-center border-none"
            style={{
              bottom: 28,
              right: 28,
              zIndex: 50,
              background: "var(--green)",
              boxShadow: "0 4px 16px rgba(42,157,110,0.3)",
            }}
          >
            <Plus size={22} color="#fff" strokeWidth={2.5} />
          </button>
        )}

        {/* Bannière PR */}
        {prNotif && (
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm flex items-center gap-2 px-4 py-3 rounded-[12px]"
            style={{
              background: "rgba(42,157,110,0.12)",
              border: "1px solid rgba(42,157,110,0.25)",
              animation: "prSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <span className="text-base shrink-0">🏆</span>
            <p
              className="flex-1 text-xs font-semibold truncate"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                color: "var(--green)",
              }}
            >
              Record ! {prNotif.exerciseName} — {prNotif.poids}kg ×{" "}
              {prNotif.reps}
            </p>
            <button
              onClick={() => setPrNotif(null)}
              className="p-1 shrink-0"
              style={{ color: "var(--green)" }}
            >
              <X size={14} />
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
                  const [settingsMap, refsMap] = await Promise.all([
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
