import { createClient } from "@/lib/supabase/server";
import type { NutritionAliment, NutritionEntry, NutritionPageData } from "@/lib/nutrition-utils";

export type { NutritionAliment, NutritionEntry, NutritionProfile, NutritionPageData } from "@/lib/nutrition-utils";
export { calcNutrients, sumEntries } from "@/lib/nutrition-utils";

export async function fetchNutritionData(date: string): Promise<NutritionPageData> {
  const supabase = await createClient();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: NutritionEntry[] = (entriesRes.data ?? []).map((e: any) => ({
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
