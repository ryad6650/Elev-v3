"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addNutritionEntry(
  mealNumber: number,
  alimentId: string,
  quantiteG: number,
  date: string,
  mealTime?: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase.from("nutrition_entries").insert({
    user_id: user.id,
    meal_number: mealNumber,
    meal_time: mealTime ?? new Date().toISOString(),
    aliment_id: alimentId,
    quantite_g: quantiteG,
    date,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/nutrition");
}

export async function deleteNutritionEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("nutrition_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/nutrition");
}

/**
 * Sauvegarde un aliment externe (OFT) en tant qu'aliment utilisateur.
 * Vérifie d'abord si le code_barres existe déjà (évite les doublons).
 */
export async function upsertExternalAliment(aliment: {
  nom: string;
  marque?: string | null;
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
  fibres?: number | null;
  sucres?: number | null;
  sel?: number | null;
  code_barres?: string | null;
}): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  if (aliment.code_barres) {
    const { data: existing } = await supabase
      .from("aliments")
      .select("id")
      .eq("code_barres", aliment.code_barres)
      .maybeSingle();
    if (existing) return { id: existing.id };
  }

  const { data, error } = await supabase
    .from("aliments")
    .insert({
      user_id: user.id,
      nom: aliment.nom,
      marque: aliment.marque ?? null,
      calories: aliment.calories,
      proteines: aliment.proteines,
      glucides: aliment.glucides,
      lipides: aliment.lipides,
      fibres: aliment.fibres ?? null,
      sucres: aliment.sucres ?? null,
      sel: aliment.sel ?? null,
      code_barres: aliment.code_barres ?? null,
      is_global: false,
    })
    .select("id")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Erreur création aliment");
  return { id: data.id };
}

export async function createCustomAliment(
  nom: string,
  calories: number,
  proteines: number | null,
  glucides: number | null,
  lipides: number | null,
  portion_nom?: string | null,
  taille_portion_g?: number | null,
  code_barres?: string | null,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("aliments")
    .insert({
      user_id: user.id,
      nom,
      calories,
      proteines,
      glucides,
      lipides,
      is_global: false,
      portion_nom: portion_nom ?? null,
      taille_portion_g: taille_portion_g ?? null,
      code_barres: code_barres ?? null,
    })
    .select("id")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Erreur création aliment");
  return { id: data.id };
}

export async function updateCustomAliment(
  id: string,
  nom: string,
  calories: number,
  proteines: number | null,
  glucides: number | null,
  lipides: number | null,
  portion_nom: string | null,
  taille_portion_g: number | null,
  code_barres?: string | null,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("aliments")
    .update({
      nom,
      calories,
      proteines,
      glucides,
      lipides,
      portion_nom,
      taille_portion_g,
      code_barres: code_barres ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Erreur modification aliment");
  return { id: data.id };
}

type EntryWithAliment = {
  aliment_id: string;
  aliments: {
    id: string;
    nom: string;
    marque: string | null;
    calories: number;
    proteines: number | null;
    glucides: number | null;
    lipides: number | null;
    fibres: number | null;
    sucres: number | null;
    sel: number | null;
    code_barres: string | null;
    is_global: boolean;
    portion_nom: string | null;
    taille_portion_g: number | null;
  } | null;
};

export async function getRecentAliments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const query = supabase
    .from("nutrition_entries")
    .select(
      "aliment_id, aliments(id, nom, marque, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global, portion_nom, taille_portion_g)",
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data } = await query.limit(30);

  if (!data) return [];

  const seen = new Set<string>();
  const recents: EntryWithAliment["aliments"][] = [];
  for (const e of data as EntryWithAliment[]) {
    if (!seen.has(e.aliment_id) && e.aliments) {
      seen.add(e.aliment_id);
      recents.push(e.aliments);
      if (recents.length >= 8) break;
    }
  }
  return recents;
}

export async function getFavoriteAliments(): Promise<
  EntryWithAliment["aliments"][]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_aliment_favorites")
    .select(
      "aliments(id, nom, marque, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global, portion_nom, taille_portion_g)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return [];
  return (data as unknown as { aliments: EntryWithAliment["aliments"] }[])
    .map((r) => r.aliments)
    .filter(Boolean);
}

export async function toggleFavoriteAliment(
  alimentId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: existing } = await supabase
    .from("user_aliment_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("aliment_id", alimentId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("user_aliment_favorites")
      .delete()
      .eq("id", existing.id);
    return false;
  }

  await supabase
    .from("user_aliment_favorites")
    .insert({ user_id: user.id, aliment_id: alimentId });
  return true;
}

export async function getFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_aliment_favorites")
    .select("aliment_id")
    .eq("user_id", user.id);

  return (data ?? []).map((r) => r.aliment_id);
}
