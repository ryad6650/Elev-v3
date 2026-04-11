"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getTodayString, getNDaysAgo } from "@/lib/date-utils";
import { guardSupabase } from "@/lib/supabase/guard";

/**
 * Met à jour le streak de connexions de l'utilisateur.
 * Appelé une fois par visite dashboard.
 */
export async function updateConnexionStreak(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const today = getTodayString();
  const hier = getNDaysAgo(1);

  const { data: profil } = await supabase
    .from("profiles")
    .select("streak_connexions, derniere_connexion")
    .eq("id", userId)
    .single();

  const derniereConnexion = profil?.derniere_connexion ?? null;
  let streakConnexions = profil?.streak_connexions ?? 1;

  if (derniereConnexion === null || derniereConnexion < hier) {
    streakConnexions = 1;
  } else if (derniereConnexion === hier) {
    streakConnexions = streakConnexions + 1;
  }

  if (derniereConnexion !== today) {
    guardSupabase(
      await supabase
        .from("profiles")
        .update({
          streak_connexions: streakConnexions,
          derniere_connexion: today,
        })
        .eq("id", userId),
    );
  }

  return streakConnexions;
}
