import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkoutSet {
  id: string;
  numSerie: number;
  reps: number | null;
  poids: number | null;
  completed: boolean;
  repsCible: number;
  poidsRef: number | null; // valeur de la dernière séance
}

export interface WorkoutExercise {
  uid: string; // ID unique dans la séance
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  ordre: number;
  seriesCible: number;
  repsCible: number;
  sets: WorkoutSet[];
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
  restTimer: { active: boolean; endAt: number; duration: number } | null;
  restDuration: number; // secondes

  startWorkout: (params: {
    routineId?: string | null;
    routineName?: string | null;
    exercises?: Omit<WorkoutExercise, 'uid' | 'sets'>[];
  }) => void;
  addExercise: (exercise: Omit<WorkoutExercise, 'uid' | 'sets'>) => void;
  removeExercise: (uid: string) => void;
  addSet: (uid: string) => void;
  updateSet: (uid: string, setId: string, field: 'reps' | 'poids', value: number | null) => void;
  toggleComplete: (uid: string, setId: string) => void;
  startRestTimer: () => void;
  dismissRestTimer: () => void;
  setRestDuration: (seconds: number) => void;
  clearWorkout: () => void;
}

function buildSets(seriesCible: number, repsCible: number): WorkoutSet[] {
  return Array.from({ length: seriesCible }, (_, i) => ({
    id: crypto.randomUUID(),
    numSerie: i + 1,
    reps: null,
    poids: null,
    completed: false,
    repsCible,
    poidsRef: null,
  }));
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      restTimer: null,
      restDuration: 90,

      startWorkout: ({ routineId = null, routineName = null, exercises = [] }) => {
        const builtExercises: WorkoutExercise[] = exercises.map((e, i) => ({
          ...e,
          uid: crypto.randomUUID(),
          ordre: i,
          sets: buildSets(e.seriesCible, e.repsCible),
        }));
        set({
          activeWorkout: {
            id: crypto.randomUUID(),
            routineId,
            routineName,
            debutAt: Date.now(),
            exercises: builtExercises,
          },
        });
      },

      addExercise: (exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const newEx: WorkoutExercise = {
          ...exercise,
          uid: crypto.randomUUID(),
          ordre: activeWorkout.exercises.length,
          sets: buildSets(exercise.seriesCible, exercise.repsCible),
        };
        set({ activeWorkout: { ...activeWorkout, exercises: [...activeWorkout.exercises, newEx] } });
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
                numSerie: e.sets.length + 1,
                reps: null,
                poids: last?.poids ?? null,
                completed: false,
                repsCible: e.repsCible,
                poidsRef: last?.poidsRef ?? null,
              };
              return { ...e, sets: [...e.sets, newSet] };
            }),
          },
        });
      },

      updateSet: (uid, setId, field, value) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: activeWorkout.exercises.map((e) => {
              if (e.uid !== uid) return e;
              return {
                ...e,
                sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
              };
            }),
          },
        });
      },

      toggleComplete: (uid, setId) => {
        const { activeWorkout, restDuration } = get();
        if (!activeWorkout) return;
        let justCompleted = false;
        const updated = activeWorkout.exercises.map((e) => {
          if (e.uid !== uid) return e;
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
        if (justCompleted) {
          set({ restTimer: { active: true, endAt: Date.now() + restDuration * 1000, duration: restDuration } });
        }
      },

      startRestTimer: () => {
        const { restDuration } = get();
        set({ restTimer: { active: true, endAt: Date.now() + restDuration * 1000, duration: restDuration } });
      },

      dismissRestTimer: () => set({ restTimer: null }),
      setRestDuration: (seconds) => set({ restDuration: seconds }),
      clearWorkout: () => set({ activeWorkout: null, restTimer: null }),
    }),
    {
      name: 'elev-workout',
      partialize: (state) => ({ activeWorkout: state.activeWorkout, restDuration: state.restDuration }),
    }
  )
);
