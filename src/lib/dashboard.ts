import { createClient } from "@/lib/supabase/server";

export interface ProchaineRoutine {
  id: string;
  nom: string;
  nbExercices: number;
  jours: string[];
}

export interface DashboardData {
  prenom: string | null;
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
  nutritionJoursCetteSemaine: number;
  poidsJoursCetteSemaine: number;
  weightHistory: { date: string; poids: number }[];
  prochaineRoutine: ProchaineRoutine | null;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

function getNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function computeStreak(activityDates: string[]): number {
  const dateSet = new Set(activityDates);
  const cursor = new Date();
  let streak = 0;

  // Si pas d'activité aujourd'hui, commencer à hier
  if (!dateSet.has(getTodayString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (!dateSet.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

type AlimentJoin = {
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
} | null;

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const today = getTodayString();
  const weekStart = getWeekStart();
  const thirtyDaysAgo = getNDaysAgo(30);
  const sevenWeeksAgo = getNDaysAgo(49);

  const [profileRes, nutritionRes, workoutsWeekRes, poidsRes, weightHistoryRes, nutritionDatesRes, workoutDatesRes, routinesRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("nutrition_entries")
        .select("quantite_g, aliments(calories, proteines, glucides, lipides)")
        .eq("user_id", user.id)
        .eq("date", today),
      supabase.from("workouts").select("date").eq("user_id", user.id).gte("date", weekStart),
      supabase
        .from("poids_history")
        .select("poids, date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(14),
      supabase
        .from("poids_history")
        .select("date, poids")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgo)
        .order("date", { ascending: true }),
      supabase
        .from("nutrition_entries")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", sevenWeeksAgo),
      supabase.from("workouts").select("date").eq("user_id", user.id).gte("date", sevenWeeksAgo),
      supabase
        .from("routines")
        .select("id, nom, jours, routine_exercises(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  const profil = profileRes.data;

  // Calcul calories/macros du jour
  let caloriesConsommees = 0, proteinesConsommees = 0, glucidesConsommees = 0, lipidesConsommees = 0;
  const entries = nutritionRes.data as Array<{ quantite_g: number; aliments: AlimentJoin }> ?? [];
  for (const entry of entries) {
    const a = entry.aliments;
    if (!a) continue;
    const r = entry.quantite_g / 100;
    caloriesConsommees += a.calories * r;
    proteinesConsommees += (a.proteines ?? 0) * r;
    glucidesConsommees += (a.glucides ?? 0) * r;
    lipidesConsommees += (a.lipides ?? 0) * r;
  }

  // Poids actuel + delta vs semaine précédente
  const poidsData = poidsRes.data ?? [];
  const poidsActuel = poidsData[0]?.poids ?? null;
  const poidsIlYA7Jours = poidsData.find((p) => {
    const diff = Math.abs(new Date(today).getTime() - new Date(p.date).getTime());
    return diff >= 5 * 86400000 && diff <= 9 * 86400000;
  });
  const poidsDelta =
    poidsActuel != null && poidsIlYA7Jours
      ? +(poidsActuel - poidsIlYA7Jours.poids).toFixed(1)
      : null;

  // Séances
  const workouts = workoutsWeekRes.data ?? [];
  const seancesAujourdhui = workouts.some((w) => w.date === today);
  const seancesCetteSemaine = workouts.length;

  // Streak
  const allDates = [
    ...(nutritionDatesRes.data ?? []).map((d) => d.date),
    ...(workoutDatesRes.data ?? []).map((d) => d.date),
  ];
  const streakJours = computeStreak(allDates);

  // Objectifs hebdo
  const nutritionJoursCetteSemaine = new Set(
    (nutritionDatesRes.data ?? []).filter((d) => d.date >= weekStart).map((d) => d.date)
  ).size;
  const poidsJoursCetteSemaine = new Set(
    (poidsData ?? []).filter((d) => d.date >= weekStart).map((d) => d.date)
  ).size;

  // Prochaine routine
  const routineData = routinesRes.data as { id: string; nom: string; jours: string[]; routine_exercises: { count: number }[] } | null;
  const prochaineRoutine: ProchaineRoutine | null = routineData
    ? {
        id: routineData.id,
        nom: routineData.nom,
        jours: routineData.jours ?? [],
        nbExercices: routineData.routine_exercises?.[0]?.count ?? 0,
      }
    : null;

  return {
    prenom: profil?.prenom ?? null,
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
    weightHistory: weightHistoryRes.data ?? [],
    prochaineRoutine,
  };
}
