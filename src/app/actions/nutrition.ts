'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addNutritionEntry(
  repas: "petit-dejeuner" | "dejeuner" | "diner" | "snacks",
  alimentId: string,
  quantiteG: number,
  date: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase.from("nutrition_entries").insert({
    user_id: user.id,
    repas,
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

  // Vérifier si déjà en base (par code_barres)
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

  if (error || !data) throw new Error(error?.message ?? "Erreur création aliment");
  return { id: data.id };
}

export async function createCustomAliment(
  nom: string,
  calories: number,
  proteines: number | null,
  glucides: number | null,
  lipides: number | null
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("aliments")
    .insert({ user_id: user.id, nom, calories, proteines, glucides, lipides, is_global: false })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Erreur création aliment");
  return { id: data.id };
}

type EntryWithAliment = {
  aliment_id: string;
  aliments: {
    id: string; nom: string; marque: string | null; calories: number;
    proteines: number | null; glucides: number | null; lipides: number | null;
    fibres: number | null; sucres: number | null; sel: number | null; code_barres: string | null;
  } | null;
};

export async function getRecentAliments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Limite à 20 — suffisant pour extraire 6 aliments distincts sans sur-fetch
  const { data } = await supabase
    .from("nutrition_entries")
    .select("aliment_id, aliments(id, nom, marque, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(20);

  if (!data) return [];

  const seen = new Set<string>();
  const recents: EntryWithAliment["aliments"][] = [];
  for (const e of data as EntryWithAliment[]) {
    if (!seen.has(e.aliment_id) && e.aliments) {
      seen.add(e.aliment_id);
      recents.push(e.aliments);
      if (recents.length >= 6) break;
    }
  }
  return recents;
}
