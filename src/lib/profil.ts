import { createClient } from "@/lib/supabase/server";

export interface ProfilData {
  id: string;
  prenom: string | null;
  taille: number | null;
  objectif_calories: number;
  objectif_proteines: number | null;
  objectif_glucides: number | null;
  objectif_lipides: number | null;
  photo_url: string | null;
  theme: "dark" | "light";
  created_at: string;
  email: string | null;
}

export interface ProfilStats {
  totalSeances: number;
  seancesCeMois: number;
  streakActuel: number;
}

export interface ProfilPageData {
  profil: ProfilData;
  stats: ProfilStats;
}

export async function fetchProfilData(): Promise<ProfilPageData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const now = new Date();
  const debutMois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [profileRes, totalRes, moisRes, recentRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("workouts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("date", debutMois),
    supabase
      .from("workouts")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60),
  ]);

  // Calcul streak actuel
  let streak = 0;
  if (recentRes.data && recentRes.data.length > 0) {
    const dates = [...new Set(recentRes.data.map((w) => w.date))].sort().reverse();
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let prev = cursor;
    for (const d of dates) {
      const wd = new Date(d + "T00:00:00");
      const diff = Math.round((prev.getTime() - wd.getTime()) / 86400000);
      if (diff <= 1) {
        streak++;
        prev = wd;
      } else break;
    }
  }

  return {
    profil: {
      id: user.id,
      prenom: profileRes.data?.prenom ?? null,
      taille: profileRes.data?.taille ?? null,
      objectif_calories: profileRes.data?.objectif_calories ?? 2000,
      objectif_proteines: profileRes.data?.objectif_proteines ?? null,
      objectif_glucides: profileRes.data?.objectif_glucides ?? null,
      objectif_lipides: profileRes.data?.objectif_lipides ?? null,
      photo_url: profileRes.data?.photo_url ?? null,
      theme: profileRes.data?.theme ?? "dark",
      created_at: profileRes.data?.created_at ?? user.created_at ?? "",
      email: user.email ?? null,
    },
    stats: {
      totalSeances: totalRes.count ?? 0,
      seancesCeMois: moisRes.count ?? 0,
      streakActuel: streak,
    },
  };
}
