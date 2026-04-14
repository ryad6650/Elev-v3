import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkoutSet {
  id: string;
  numSerie: number;
  reps: number | null;
  poids: number | null;
  completed: boolean;
  repsCible: number;
  repsCibleMax: number | null; // null = chiffre unique, sinon max de la fourchette
  poidsRef: number | null; // poids de la dernière séance
  repsRef: number | null; // reps de la dernière séance
  isWarmup: boolean;
}

export interface WorkoutExercise {
  uid: string; // ID unique dans la séance
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  gifUrl?: string | null;
  ordre: number;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null; // null = chiffre unique, sinon max de la fourchette
  sets: WorkoutSet[];
  restDuration?: number | null; // secondes de repos ; null/undefined = pas de minuteur
  notes?: string;
}

export interface ActiveWorkout {
  id: string;
  routineId: string | null;
  routineName: string | null;
  debutAt: number; // Date.now()
  exercises: WorkoutExercise[];
}

interface WorkoutStore {
  activeWorkout: ActiveWorkout | null;
  isMinimized: boolean;
  restTimer: { active: boolean; endAt: number; duration: number } | null;
  restDuration: number; // secondes

  startWorkout: (params: {
    routineId?: string | null;
    routineName?: string | null;
    exercises?: (Omit<WorkoutExercise, "uid" | "sets"> & {
      poidsRef?: number | null;
      repsRef?: number | null;
    })[];
  }) => void;
  minimizeWorkout: () => void;
  maximizeWorkout: () => void;
  addExercise: (
    exercise: Omit<WorkoutExercise, "uid" | "sets"> & {
      poidsRef?: number | null;
      repsRef?: number | null;
    },
  ) => void;
  removeExercise: (uid: string) => void;
  replaceExercise: (
    uid: string,
    newExercise: Omit<WorkoutExercise, "uid" | "sets" | "ordre">,
  ) => void;
  addSet: (uid: string) => void;
  addWarmupSets: (uid: string) => void;
  removeSet: (uid: string, setId: string) => void;
  updateSet: (
    uid: string,
    setId: string,
    field: "reps" | "poids",
    value: number | null,
  ) => void;
  toggleComplete: (uid: string, setId: string) => void;
  startRestTimer: () => void;
  dismissRestTimer: () => void;
  setRestDuration: (seconds: number) => void;
  setExerciseRestDuration: (uid: string, duration: number | null) => void;
  moveExercise: (uid: string, direction: -1 | 1) => void;
  setExerciseNote: (uid: string, note: string) => void;
  clearWorkout: () => void;
}

function buildSets(
  seriesCible: number,
  repsCible: number,
  repsCibleMax: number | null = null,
  poidsRef: number | null = null,
  repsRef: number | null = null,
): WorkoutSet[] {
  return Array.from({ length: seriesCible }, (_, i) => ({
    id: crypto.randomUUID(),
    numSerie: i + 1,
    reps: null,
    poids: null,
    completed: false,
    repsCible,
    repsCibleMax,
    poidsRef,
    repsRef,
    isWarmup: false,
  }));
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      isMinimized: false,
      restTimer: null,
      restDuration: 90,

      minimizeWorkout: () => set({ isMinimized: true }),
      maximizeWorkout: () => set({ isMinimized: false }),

      startWorkout: ({
        routineId = null,
        routineName = null,
        exercises = [],
      }) => {
        const builtExercises: WorkoutExercise[] = exercises.map((e, i) => ({
          ...e,
          uid: crypto.randomUUID(),
          ordre: i,
          sets: buildSets(
            e.seriesCible,
            e.repsCible,
            e.repsCibleMax ?? null,
            e.poidsRef ?? null,
            e.repsRef ?? null,
          ),
        }));
        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            routineId,
            routineName,
            debutAt: Date.now(),
            exercises: builtExercises,
          },
          isMinimized: false,
        });
      },

      addExercise: (exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const { poidsRef, repsRef, ...exData } = exercise;
        const newEx: WorkoutExercise = {
          ...exData,
          uid: crypto.randomUUID(),
          ordre: activeWorkout.exercises.length,
          sets: buildSets(
            exercise.seriesCible,
            exercise.repsCible,
            exercise.repsCibleMax ?? null,
            poidsRef ?? null,
            repsRef ?? null,
          ),
        };
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: [...activeWorkout.exercises, newEx],
          },
        });
      },

      removeExercise: (uid) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.filter((e) => e.uid !== uid),
          },
        });
      },

      replaceExercise: (uid, newExercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              return {
                ...e,
                exerciseId: newExercise.exerciseId,
                nom: newExercise.nom,
                groupeMusculaire: newExercise.groupeMusculaire,
                gifUrl: newExercise.gifUrl,
                seriesCible: newExercise.seriesCible,
                repsCible: newExercise.repsCible,
                repsCibleMax: newExercise.repsCibleMax,
                restDuration: newExercise.restDuration,
                sets: e.sets.map((s) => ({
                  ...s,
                  completed: false,
                  poidsRef: null,
                  repsRef: null,
                })),
              };
            }),
          },
        });
      },

      addSet: (uid) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              const last = e.sets[e.sets.length - 1];
              const newSet: WorkoutSet = {
                id: crypto.randomUUID(),
                numSerie: e.sets.filter((s) => !s.isWarmup).length + 1,
                reps: null,
                poids: last?.poids ?? null,
                completed: false,
                repsCible: e.repsCible,
                repsCibleMax: e.repsCibleMax ?? null,
                poidsRef: last?.poidsRef ?? null,
                repsRef: null,
                isWarmup: false,
              };
              return { ...e, sets: [...e.sets, newSet] };
            }),
          },
        });
      },

      addWarmupSets: (uid) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              const workingSets = e.sets.filter((s) => !s.isWarmup);
              // Toggle : si déjà des séries warmup, on les retire
              if (e.sets.some((s) => s.isWarmup)) {
                return { ...e, sets: workingSets };
              }
              const refPoids =
                workingSets[0]?.poids ?? workingSets[0]?.poidsRef ?? 0;
              const warmupDefs = [
                { pct: 0.5, reps: 8 },
                { pct: 0.75, reps: 5 },
                { pct: 0.85, reps: 3 },
              ];
              const warmupSets: WorkoutSet[] = warmupDefs.map((def, i) => ({
                id: crypto.randomUUID(),
                numSerie: i + 1,
                reps: def.reps,
                poids: refPoids ? Math.round(refPoids * def.pct * 2) / 2 : null,
                completed: false,
                repsCible: def.reps,
                repsCibleMax: null,
                poidsRef: null,
                repsRef: null,
                isWarmup: true,
              }));
              return { ...e, sets: [...warmupSets, ...workingSets] };
            }),
          },
        });
      },

      removeSet: (uid, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              const filtered = e.sets.filter((s) => s.id !== setId);
              // Renuméroter warmup et working indépendamment
              let wIdx = 0;
              let wkIdx = 0;
              return {
                ...e,
                sets: filtered.map((s) => ({
                  ...s,
                  numSerie: s.isWarmup ? ++wIdx : ++wkIdx,
                })),
              };
            }),
          },
        });
      },

      updateSet: (uid, setId, field, value) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const warmupPcts = [0.5, 0.75, 0.85];
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              const updatedSets = e.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s,
              );
              // Recalcul réactif des poids warmup si on modifie le poids de la 1ère vraie série
              const firstWorking = updatedSets.find((s) => !s.isWarmup);
              const isFirstWorking =
                firstWorking?.id === setId && field === "poids";
              if (isFirstWorking && updatedSets.some((s) => s.isWarmup)) {
                const ref = (value as number | null) ?? 0;
                let wIdx = 0;
                return {
                  ...e,
                  sets: updatedSets.map((s) =>
                    s.isWarmup
                      ? {
                          ...s,
                          poids: ref
                            ? Math.round(ref * warmupPcts[wIdx++] * 2) / 2
                            : s.poids,
                        }
                      : s,
                  ),
                };
              }
              return { ...e, sets: updatedSets };
            }),
          },
        });
      },

      toggleComplete: (uid, setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        let justCompleted = false;
        let exerciseRest: number | null = null;
        const updated = activeWorkout.exercises.map((e) => {
          if (e.uid !== uid) return e;
          exerciseRest = e.restDuration ?? get().restDuration;
          return {
            ...e,
            sets: e.sets.map((s) => {
              if (s.id !== setId) return s;
              if (!s.completed) justCompleted = true;
              return { ...s, completed: !s.completed };
            }),
          };
        });
        set({ activeWorkout: { ...activeWorkout, exercises: updated } });
      },

      startRestTimer: () => {
        const { restDuration } = get();
        set({
          restTimer: {
            active: true,
            endAt: Date.now() + restDuration * 1000,
            duration: restDuration,
          },
        });
      },

      dismissRestTimer: () => set({ restTimer: null }),
      setRestDuration: (seconds) => set({ restDuration: seconds }),
      setExerciseRestDuration: (uid, duration) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) =>
              e.uid === uid ? { ...e, restDuration: duration } : e,
            ),
          },
        });
      },
      moveExercise: (uid, direction) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exs = [...activeWorkout.exercises];
        const idx = exs.findIndex((e) => e.uid === uid);
        if (idx < 0) return;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= exs.length) return;
        [exs[idx], exs[newIdx]] = [exs[newIdx], exs[idx]];
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: exs.map((e, i) => ({ ...e, ordre: i })),
          },
        });
      },
      setExerciseNote: (uid, note) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) =>
              e.uid === uid ? { ...e, notes: note } : e,
            ),
          },
        });
      },
      clearWorkout: () =>
        set({ activeWorkout: null, isMinimized: false, restTimer: null }),
    }),
    {
      name: "elev-workout",
      partialize: (state) => ({
        activeWorkout: state.activeWorkout,
        restDuration: state.restDuration,
      }),
    },
  ),
);
