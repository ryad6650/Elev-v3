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
            <button
              onClick={minimizeWorkout}
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(74,55,40,0.07)",
              }}
            >
              <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
            </button>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{ color: "var(--text-muted)" }}
            >
              {routineName ?? "Séance libre"}
            </span>
            <button
              onClick={() => setShowSummary(true)}
              className="text-[9px] font-bold tracking-[0.04em] rounded-[20px] px-3 py-[5px] border-none"
              style={{
                background:
                  "linear-gradient(135deg, var(--bar-from), var(--bar-to))",
                color: "#fff",
              }}
            >
              Terminer
            </button>
          </div>

          {/* Titre */}
          <h1
            className="text-[26px] leading-[1.1] italic tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text-primary)",
            }}
          >
            En cours...
          </h1>
        </div>

        {/* Contenu scrollable */}
        <div
          className="flex-1 overflow-y-auto px-4 pt-3.5 pb-36 flex flex-col gap-2.5"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Timer card */}
          <div
            className="flex items-center justify-between px-3.5 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 2px 8px rgba(74,55,40,0.04)",
            }}
          >
            <div className="flex flex-col">
              <span
                className="text-[8px] font-bold uppercase tracking-[0.1em]"
                style={{ color: "var(--text-secondary)" }}
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
            <div className="flex gap-1.5">
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(74,55,40,0.08)",
                }}
              >
                {isPaused ? (
                  <Play
                    size={13}
                    fill="var(--text-muted)"
                    style={{ color: "var(--text-muted)" }}
                  />
                ) : (
                  <Pause
                    size={13}
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
              className="text-[8px] font-bold uppercase tracking-[0.1em] mt-1"
              style={{ color: "var(--text-secondary)" }}
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
                className="btn-accent px-6 py-3 rounded-2xl text-sm font-semibold"
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
            className="fixed bottom-[62px] right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center border-none"
            style={{
              background:
                "linear-gradient(135deg, var(--bar-from), var(--bar-to))",
              boxShadow: "0 4px 16px rgba(160,120,92,0.3)",
            }}
          >
            <Plus size={20} color="#fff" strokeWidth={1.5} />
          </button>
        )}

        {/* Bannière PR */}
        {prNotif && (
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(217,119,6,0.15) 100%)",
              border: "1px solid rgba(234,179,8,0.4)",
              backdropFilter: "blur(12px)",
              animation: "prSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: "rgba(234,179,8,0.25)" }}
            >
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold truncate"
                style={{ color: "#FDE68A" }}
              >
                Nouveau record !
              </p>
              <p className="text-xs" style={{ color: "#CA8A04" }}>
                {prNotif.exerciseName} — {prNotif.poids}kg × {prNotif.reps}
              </p>
            </div>
            <button
              onClick={() => setPrNotif(null)}
              className="p-1 shrink-0"
              style={{ color: "#CA8A04" }}
            >
              <X size={16} />
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
