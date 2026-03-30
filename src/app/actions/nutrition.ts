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

export async function getRecentAliments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("nutrition_entries")
    .select("aliment_id, aliments(id, nom, calories, proteines, glucides, lipides)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(50);

  if (!data) return [];

  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recents: any[] = [];
  for (const e of data as any[]) {
    if (!seen.has(e.aliment_id) && e.aliments) {
      seen.add(e.aliment_id);
      recents.push(e.aliments);
      if (recents.length >= 6) break;
    }
  }
  return recents;
}
