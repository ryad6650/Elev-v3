"use server";

import { withAuthUser } from "@/lib/supabase/auth";

export async function createExercise(data: {
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url?: string | null;
}): Promise<{
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url: string | null;
}> {
  const { supabase, user } = await withAuthUser();

  const { data: ex, error } = await supabase
    .from("exercises")
    .insert({
      user_id: user.id,
      is_global: false,
      nom: data.nom,
      groupe_musculaire: data.groupe_musculaire,
      equipement: data.equipement,
      gif_url: data.gif_url ?? null,
    })
    .select("id, nom, groupe_musculaire, equipement, gif_url")
    .single();

  if (error || !ex)
    throw new Error(error?.message ?? "Erreur création exercice");
  return ex;
}

export async function updateExercise(
  exerciseId: string,
  data: {
    nom: string;
    groupe_musculaire: string;
    equipement: string | null;
    gif_url?: string | null;
  },
): Promise<{
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
  gif_url: string | null;
}> {
  const { supabase, user } = await withAuthUser();

  const updateData: {
    nom: string;
    groupe_musculaire: string;
    equipement: string | null;
    gif_url?: string | null;
  } = {
    nom: data.nom,
    groupe_musculaire: data.groupe_musculaire,
    equipement: data.equipement,
  };
  if (data.gif_url !== undefined) updateData.gif_url = data.gif_url;

  const { data: ex, error } = await supabase
    .from("exercises")
    .update(updateData)
    .eq("id", exerciseId)
    .eq("user_id", user.id)
    .select("id, nom, groupe_musculaire, equipement, gif_url")
    .single();

  if (error || !ex)
    throw new Error(error?.message ?? "Erreur modification exercice");
  return ex;
}
