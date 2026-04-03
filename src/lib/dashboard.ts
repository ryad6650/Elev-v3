import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AccentColor } from "@/lib/profil";
import {
  getTodayString,
  getWeekStart,
  getNDaysAgo,
  computeStreak,
} from "@/lib/date-utils";

export interface ProchaineRoutine {
  id: string;
  nom: string;
  nbExercices: number;
  jours: string[];
  dureeEstimee: number | null;
  groupesMusculaires: string[];
}

export interface DashboardData {
  prenom: string | null;
  photoUrl: string | null;
  objectifCalories: number;
  objectifProteines: number;
  objectifGlucides: number;
  objectifLipides: number;
  caloriesConsommees: number;
  proteinesConsommees: number;
  glucidesConsommees: number;
  lipidesConsommees: number;
  poidsActuel: number | null;
  poidsDelta: number | null;
  seancesAujourdhui: boolean;
  seancesCetteSemaine: number;
  streakJours: number;
  streakConnexions: number;
  nutritionJoursCetteSemaine: number;
  poidsJoursCetteSemaine: number;
  weightHistory: { date: string; poids: number }[];
  prochaineRoutine: ProchaineRoutine | null;
  sommeilMinutes: number | null;
  theme: "dark" | "light";
  accentColor: AccentColor;
}

type AlimentJoin = {
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
} | null;

export async function fetchDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardData> {
  const today = getTodayString();
  const weekStart = getWeekStart();
  const thirtyDaysAgo = getNDaysAgo(30);
  const sevenWeeksAgo = getNDaysAgo(49);

  const [
    profileRes,
    nutritionRes,
    poidsRes,
    workoutDatesRes,
    nutritionDatesRes,
    routinesRes,
    sommeilRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "prenom, photo_url, objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides, streak_connexions, derniere_connexion, theme, accent_color",
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("nutrition_entries")
      .select("quantite_g, aliments(calories, proteines, glucides, lipides)")
      .eq("user_id", userId)
      .eq("date", today),
    supabase
      .from("poids_history")
      .select("poids, date")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo)
      .order("date", { ascending: false }),
    supabase
      .from("workouts")
      .select("date")
      .eq("user_id", userId)
      .gte("date", sevenWeeksAgo),
    supabase
      .from("nutrition_entries")
      .select("date")
      .eq("user_id", userId)
      .gte("date", sevenWeeksAgo),
    supabase
      .from("routines")
      .select(
        "id, nom, jours, routine_exercises(series_cible, exercises(groupe_musculaire))",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("sommeil")
      .select("duree_minutes")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle(),
  ]);

  // Calories / macros du jour
  let caloriesConsommees = 0,
    proteinesConsommees = 0,
    glucidesConsommees = 0,
    lipidesConsommees = 0;
  for (const entry of (nutritionRes.data ?? []) as Array<{
    quantite_g: number;
    aliments: AlimentJoin;
  }>) {
    const a = entry.aliments;
    if (!a) continue;
    const r = entry.quantite_g / 100;
    caloriesConsommees += a.calories * r;
    proteinesConsommees += (a.proteines ?? 0) * r;
    glucidesConsommees += (a.glucides ?? 0) * r;
    lipidesConsommees += (a.lipides ?? 0) * r;
  }

  // Poids (desc -> index 0 = plus récent)
  const poidsData = poidsRes.data ?? [];
  const poidsActuel = poidsData[0]?.poids ?? null;
  const poidsIlYA7Jours = poidsData.find((p) => {
    const diff = Math.abs(
      new Date(today).getTime() - new Date(p.date!).getTime(),
    );
    return diff >= 5 * 86400000 && diff <= 9 * 86400000;
  });
  const poidsDelta =
    poidsActuel != null && poidsIlYA7Jours
      ? +(poidsActuel - poidsIlYA7Jours.poids).toFixed(1)
      : null;
  const weightHistory = [...poidsData].reverse();

  // Workouts
  const workoutDates = workoutDatesRes.data ?? [];
  const seancesAujourdhui = workoutDates.some((w) => w.date === today);
  const seancesCetteSemaine = workoutDates.filter(
    (w) => w.date! >= weekStart,
  ).length;

  // Streak (workouts + nutrition)
  const allDates = [
    ...workoutDates.map((d) => d.date).filter((d): d is string => d != null),
    ...(nutritionDatesRes.data ?? [])
      .map((d) => d.date)
      .filter((d): d is string => d != null),
  ];
  const streakJours = computeStreak(allDates);

  // Objectifs hebdo
  const nutritionJoursCetteSemaine = new Set(
    (nutritionDatesRes.data ?? [])
      .filter((d) => d.date! >= weekStart)
      .map((d) => d.date),
  ).size;
  const poidsJoursCetteSemaine = new Set(
    poidsData.filter((d) => d.date! >= weekStart).map((d) => d.date),
  ).size;

  // Prochaine routine
  type RoutineExRow = {
    series_cible: number;
    exercises: { groupe_musculaire: string } | null;
  };
  const routineData = routinesRes.data as {
    id: string;
    nom: string;
    jours: string[];
    routine_exercises: RoutineExRow[];
  } | null;
  let prochaineRoutine: ProchaineRoutine | null = null;
  if (routineData) {
    const exos = routineData.routine_exercises ?? [];
    const totalSets = exos.reduce((sum, e) => sum + (e.series_cible ?? 3), 0);
    const groupesRaw = exos
      .map((e) => e.exercises?.groupe_musculaire)
      .filter(Boolean) as string[];
    prochaineRoutine = {
      id: routineData.id,
      nom: routineData.nom,
      jours: routineData.jours ?? [],
      nbExercices: exos.length,
      dureeEstimee: totalSets > 0 ? Math.round(totalSets * 3.5) : null,
      groupesMusculaires: [...new Set(groupesRaw)].slice(0, 3),
    };
  }

  const profil = profileRes.data;
  const streakConnexions = profil?.streak_connexions ?? 1;

  return {
    prenom: profil?.prenom ?? null,
    photoUrl: profil?.photo_url ?? null,
    objectifCalories: profil?.objectif_calories ?? 2000,
    objectifProteines: profil?.objectif_proteines ?? 150,
    objectifGlucides: profil?.objectif_glucides ?? 200,
    objectifLipides: profil?.objectif_lipides ?? 65,
    caloriesConsommees: Math.round(caloriesConsommees),
    proteinesConsommees: Math.round(proteinesConsommees),
    glucidesConsommees: Math.round(glucidesConsommees),
    lipidesConsommees: Math.round(lipidesConsommees),
    poidsActuel,
    poidsDelta,
    seancesAujourdhui,
    seancesCetteSemaine,
    streakJours,
    nutritionJoursCetteSemaine,
    poidsJoursCetteSemaine,
    weightHistory: weightHistory.map((w) => ({
      poids: w.poids,
      date: w.date!,
    })),
    prochaineRoutine,
    streakConnexions,
    sommeilMinutes: sommeilRes.data?.duree_minutes ?? null,
    theme: (profil?.theme ?? "dark") as "dark" | "light",
    accentColor: (profil?.accent_color ?? "orange") as AccentColor,
  };
}
