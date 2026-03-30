"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveOnboarding(data: {
  prenom: string;
  taille: number | null;
  poids: number | null;
  objectif_calories: number;
  objectif_proteines: number | null;
  objectif_glucides: number | null;
  objectif_lipides: number | null;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("profiles")
    .update({
      prenom: data.prenom,
      taille: data.taille,
      poids: data.poids,
      objectif_calories: data.objectif_calories,
      objectif_proteines: data.objectif_proteines,
      objectif_glucides: data.objectif_glucides,
      objectif_lipides: data.objectif_lipides,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  // Pas de redirect() ici — géré côté client via router.push
}
