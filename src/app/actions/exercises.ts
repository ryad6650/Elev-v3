"use server";

import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const updateData: Record<string, unknown> = {
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
