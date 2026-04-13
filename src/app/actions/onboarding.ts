"use server";

import { createClient } from "@/lib/supabase/server";
import {
  validateCalories,
  validateWeight,
  validateHeight,
  validateMacro,
} from "@/lib/validation";

export async function saveOnboarding(data: {
  prenom: string;
  taille: number | null;
  poids: number | null;
  objectif_calories: number;
  objectif_proteines: number | null;
  objectif_glucides: number | null;
  objectif_lipides: number | null;
}): Promise<void> {
  if (data.taille != null) validateHeight(data.taille);
  if (data.poids != null) validateWeight(data.poids);
  validateCalories(data.objectif_calories);
  if (data.objectif_proteines != null) validateMacro(data.objectif_proteines);
  if (data.objectif_glucides != null) validateMacro(data.objectif_glucides);
  if (data.objectif_lipides != null) validateMacro(data.objectif_lipides);
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
