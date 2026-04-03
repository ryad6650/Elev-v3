"use server";

import { createClient } from "@/lib/supabase/server";
import { getTodayString, getNDaysAgo } from "@/lib/date-utils";

/**
 * Met à jour le streak de connexions de l'utilisateur.
 * Appelé une fois par visite dashboard.
 */
export async function updateConnexionStreak(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const today = getTodayString();
  const hier = getNDaysAgo(1);

  const { data: profil } = await supabase
    .from("profiles")
    .select("streak_connexions, derniere_connexion")
    .eq("id", user.id)
    .single();

  const derniereConnexion = profil?.derniere_connexion ?? null;
  let streakConnexions = profil?.streak_connexions ?? 1;

  if (derniereConnexion === null || derniereConnexion < hier) {
    streakConnexions = 1;
  } else if (derniereConnexion === hier) {
    streakConnexions = streakConnexions + 1;
  }

  if (derniereConnexion !== today) {
    await supabase
      .from("profiles")
      .update({
        streak_connexions: streakConnexions,
        derniere_connexion: today,
      })
      .eq("id", user.id);
  }

  return streakConnexions;
}
