import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { NutritionAliment, NutritionEntry, NutritionPageData } from "@/lib/nutrition-utils";

export type { NutritionAliment, NutritionEntry, NutritionProfile, NutritionPageData } from "@/lib/nutrition-utils";
export { calcNutrients, sumEntries } from "@/lib/nutrition-utils";

export async function fetchNutritionData(supabase: SupabaseClient<Database>, date: string): Promise<NutritionPageData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const [entriesRes, profileRes] = await Promise.all([
    supabase
      .from("nutrition_entries")
      .select("id, repas, quantite_g, aliments(id, nom, calories, proteines, glucides, lipides)")
      .eq("user_id", user.id)
      .eq("date", date),
    supabase
      .from("profiles")
      .select("objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides")
      .eq("id", user.id)
      .single(),
  ]);

  type RawEntry = {
    id: string; repas: string; quantite_g: number;
    aliments: { id: string; nom: string; calories: number; proteines: number | null; glucides: number | null; lipides: number | null } | null;
  };
  const entries: NutritionEntry[] = (entriesRes.data ?? [] as RawEntry[]).map((e: RawEntry) => ({
    id: e.id,
    repas: e.repas as NutritionEntry["repas"],
    quantite_g: e.quantite_g,
    aliment: e.aliments as NutritionAliment,
  }));

  const profile = profileRes.data ?? {
    objectif_calories: 2000,
    objectif_proteines: 150,
    objectif_glucides: 250,
    objectif_lipides: 70,
  };

  return { entries, profile, date };
}
