import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { DEFAULT_ACCENT } from "@/lib/profil";
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
  exerciceNoms: string[];
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
  accentColor: string;
  accentSecondary: string | null;
  gradientIntensity: number;
}

// Types pour la réponse RPC
interface RpcNutritionEntry {
  quantite_g: number;
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
}

interface RpcRoutineExercise {
  nom: string | null;
  series_cible: number;
  groupe_musculaire: string | null;
}

interface RpcResult {
  profile: {
    prenom: string | null;
    photo_url: string | null;
    objectif_calories: number | null;
    objectif_proteines: number | null;
    objectif_glucides: number | null;
    objectif_lipides: number | null;
    streak_connexions: number | null;
    derniere_connexion: string | null;
    theme: string | null;
    accent_color: string | null;
    accent_secondary: string | null;
    gradient_intensity: number | null;
  } | null;
  nutrition_today: RpcNutritionEntry[];
  poids_history: { poids: number; date: string }[];
  workout_dates: { date: string }[];
  nutrition_dates: string[];
  latest_routine: {
    id: string;
    nom: string;
    jours: string[];
    exercises: RpcRoutineExercise[];
  } | null;
  sommeil: { duree_minutes: number | null } | null;
}

export async function fetchDashboardData(
  supabase: SupabaseClient<Database>,
  _userId?: string,
): Promise<DashboardData> {
  const today = getTodayString();
  const weekStart = getWeekStart();
  const thirtyDaysAgo = getNDaysAgo(30);
  const sevenWeeksAgo = getNDaysAgo(49);

  // 1 seul appel RPC au lieu de 7 queries
  const { data: rpc, error } = await supabase.rpc("get_dashboard_data", {
    p_today: today,
    p_week_start: weekStart,
    p_thirty_days_ago: thirtyDaysAgo,
    p_seven_weeks_ago: sevenWeeksAgo,
  });

  if (error) throw error;
  const d = rpc as unknown as RpcResult;

  // Calories / macros du jour
  let cal = 0,
    prot = 0,
    gluc = 0,
    lip = 0;
  for (const e of d.nutrition_today ?? []) {
    const r = e.quantite_g / 100;
    cal += e.calories * r;
    prot += (e.proteines ?? 0) * r;
    gluc += (e.glucides ?? 0) * r;
    lip += (e.lipides ?? 0) * r;
  }

  // Poids
  const poidsData = d.poids_history ?? [];
  const poidsActuel = poidsData[0]?.poids ?? null;
  const poidsIlYA7Jours = poidsData.find((p) => {
    const diff = Math.abs(
      new Date(today).getTime() - new Date(p.date).getTime(),
    );
    return diff >= 5 * 86400000 && diff <= 9 * 86400000;
  });
  const poidsDelta =
    poidsActuel != null && poidsIlYA7Jours
      ? +(poidsActuel - poidsIlYA7Jours.poids).toFixed(1)
      : null;

  // Workouts
  const workoutDates = d.workout_dates ?? [];
  const seancesAujourdhui = workoutDates.some((w) => w.date === today);
  const seancesCetteSemaine = workoutDates.filter(
    (w) => w.date >= weekStart,
  ).length;

  // Streak
  const nutritionDates = d.nutrition_dates ?? [];
  const allDates = [...workoutDates.map((w) => w.date), ...nutritionDates];
  const streakJours = computeStreak(allDates);

  // Objectifs hebdo
  const nutritionJoursCetteSemaine = new Set(
    nutritionDates.filter((date) => date >= weekStart),
  ).size;
  const poidsJoursCetteSemaine = new Set(
    poidsData.filter((p) => p.date >= weekStart).map((p) => p.date),
  ).size;

  // Prochaine routine
  let prochaineRoutine: ProchaineRoutine | null = null;
  const routineData = d.latest_routine;
  if (routineData) {
    const exos = routineData.exercises ?? [];
    const totalSets = exos.reduce((sum, e) => sum + (e.series_cible ?? 3), 0);
    const groupesRaw = exos
      .map((e) => e.groupe_musculaire)
      .filter(Boolean) as string[];
    prochaineRoutine = {
      id: routineData.id,
      nom: routineData.nom,
      jours: routineData.jours ?? [],
      nbExercices: exos.length,
      dureeEstimee: totalSets > 0 ? Math.round(totalSets * 3.5) : null,
      groupesMusculaires: [...new Set(groupesRaw)].slice(0, 3),
      exerciceNoms: exos.map((e) => e.nom).filter(Boolean) as string[],
    };
  }

  const profil = d.profile;

  return {
    prenom: profil?.prenom ?? null,
    photoUrl: profil?.photo_url ?? null,
    objectifCalories: profil?.objectif_calories ?? 2000,
    objectifProteines: profil?.objectif_proteines ?? 150,
    objectifGlucides: profil?.objectif_glucides ?? 200,
    objectifLipides: profil?.objectif_lipides ?? 65,
    caloriesConsommees: Math.round(cal),
    proteinesConsommees: Math.round(prot),
    glucidesConsommees: Math.round(gluc),
    lipidesConsommees: Math.round(lip),
    poidsActuel,
    poidsDelta,
    seancesAujourdhui,
    seancesCetteSemaine,
    streakJours,
    nutritionJoursCetteSemaine,
    poidsJoursCetteSemaine,
    weightHistory: [...poidsData].reverse().map((w) => ({
      poids: w.poids,
      date: w.date,
    })),
    prochaineRoutine,
    streakConnexions: profil?.streak_connexions ?? 1,
    sommeilMinutes: d.sommeil?.duree_minutes ?? null,
    theme: (profil?.theme ?? "dark") as "dark" | "light",
    accentColor: profil?.accent_color ?? DEFAULT_ACCENT,
    accentSecondary: profil?.accent_secondary ?? null,
    gradientIntensity: profil?.gradient_intensity ?? 50,
  };
}
