import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface WeeklyWorkout {
  date: string;
  duree_minutes: number | null;
  routine_nom: string | null;
  exercises: {
    nom: string;
    groupe_musculaire: string;
    sets: { reps: number | null; poids: number | null }[];
  }[];
}

export interface WeeklyNutritionDay {
  date: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export interface WeeklySleep {
  date: string;
  duree_minutes: number;
}

export interface WeeklyReportData {
  prenom: string | null;
  weekStart: string;
  weekEnd: string;
  workouts: WeeklyWorkout[];
  nutrition: WeeklyNutritionDay[];
  sleep: WeeklySleep[];
  objectifs: {
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
  };
}

/** Lundi précédent (ou lundi d'il y a 7 jours si on est lundi) */
export function getLastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  // Lundi de cette semaine
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() + mondayOffset);
  // Semaine précédente
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  return { start: fmt(lastMonday), end: fmt(lastSunday) };
}

export async function fetchWeeklyReport(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<WeeklyReportData> {
  const { start, end } = getLastWeekRange();

  // Fetch en parallèle
  const [profileRes, workoutsRes, nutritionRes, sleepRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "prenom, objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides",
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("workouts")
      .select(
        `
        id, date, duree_minutes,
        routines ( nom ),
        workout_sets ( reps, poids, ordre_exercice,
          exercises ( nom, groupe_musculaire )
        )
      `,
      )
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true }),
    supabase
      .from("nutrition_entries")
      .select(
        "date, quantite_g, aliments ( calories, proteines, glucides, lipides )",
      )
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true }),
    supabase
      .from("sommeil")
      .select("date, duree_minutes")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true }),
  ]);

  // Profil
  const profil = profileRes.data;

  // Workouts — regrouper les sets par exercice
  const workouts: WeeklyWorkout[] = (workoutsRes.data ?? []).map((w) => {
    const setsRaw = (w.workout_sets ?? []) as {
      reps: number | null;
      poids: number | null;
      ordre_exercice: number | null;
      exercises: { nom: string; groupe_musculaire: string } | null;
    }[];

    const exerciseMap = new Map<string, WeeklyWorkout["exercises"][number]>();
    for (const s of setsRaw) {
      const exName = s.exercises?.nom ?? "Inconnu";
      if (!exerciseMap.has(exName)) {
        exerciseMap.set(exName, {
          nom: exName,
          groupe_musculaire: s.exercises?.groupe_musculaire ?? "",
          sets: [],
        });
      }
      exerciseMap.get(exName)!.sets.push({ reps: s.reps, poids: s.poids });
    }

    const routineData = w.routines as { nom: string } | null;
    return {
      date: w.date ?? start,
      duree_minutes: w.duree_minutes,
      routine_nom: routineData?.nom ?? null,
      exercises: Array.from(exerciseMap.values()),
    };
  });

  // Nutrition — agréger par jour
  const nutritionMap = new Map<string, WeeklyNutritionDay>();
  for (const e of nutritionRes.data ?? []) {
    const date = e.date ?? start;
    const aliment = e.aliments as {
      calories: number;
      proteines: number | null;
      glucides: number | null;
      lipides: number | null;
    } | null;
    if (!aliment) continue;
    const r = (e.quantite_g ?? 0) / 100;
    if (!nutritionMap.has(date)) {
      nutritionMap.set(date, {
        date,
        calories: 0,
        proteines: 0,
        glucides: 0,
        lipides: 0,
      });
    }
    const day = nutritionMap.get(date)!;
    day.calories += aliment.calories * r;
    day.proteines += (aliment.proteines ?? 0) * r;
    day.glucides += (aliment.glucides ?? 0) * r;
    day.lipides += (aliment.lipides ?? 0) * r;
  }
  const nutrition = Array.from(nutritionMap.values()).map((d) => ({
    ...d,
    calories: Math.round(d.calories),
    proteines: Math.round(d.proteines),
    glucides: Math.round(d.glucides),
    lipides: Math.round(d.lipides),
  }));

  // Sommeil
  const sleep: WeeklySleep[] = (sleepRes.data ?? []).map((s) => ({
    date: s.date,
    duree_minutes: s.duree_minutes,
  }));

  return {
    prenom: profil?.prenom ?? null,
    weekStart: start,
    weekEnd: end,
    workouts,
    nutrition,
    sleep,
    objectifs: {
      calories: profil?.objectif_calories ?? 2000,
      proteines: profil?.objectif_proteines ?? 150,
      glucides: profil?.objectif_glucides ?? 200,
      lipides: profil?.objectif_lipides ?? 65,
    },
  };
}
