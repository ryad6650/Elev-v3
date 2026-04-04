import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  NutritionAliment,
  NutritionEntry,
  NutritionPageData,
} from "@/lib/nutrition-utils";

export type {
  NutritionAliment,
  NutritionEntry,
  NutritionProfile,
  NutritionPageData,
} from "@/lib/nutrition-utils";
export { calcNutrients, sumEntries } from "@/lib/nutrition-utils";

export async function fetchNutritionData(
  supabase: SupabaseClient<Database>,
  date: string,
  userId?: string,
): Promise<NutritionPageData> {
  let uid = userId;
  if (!uid) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    uid = user.id;
  }

  const [entriesRes, profileRes] = await Promise.all([
    supabase
      .from("nutrition_entries")
      .select(
        "id, meal_number, meal_time, quantite_g, quantite_portion, aliments(id, nom, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global, portion_nom, taille_portion_g)",
      )
      .eq("user_id", uid)
      .eq("date", date)
      .order("meal_number")
      .order("meal_time"),
    supabase
      .from("profiles")
      .select(
        "objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides",
      )
      .eq("id", uid)
      .single(),
  ]);

  if (entriesRes.error) throw new Error(entriesRes.error.message);

  type RawEntry = {
    id: string;
    meal_number: number;
    meal_time: string;
    quantite_g: number;
    quantite_portion: number | null;
    aliments: {
      id: string;
      nom: string;
      calories: number;
      proteines: number | null;
      glucides: number | null;
      lipides: number | null;
      fibres: number | null;
      sucres: number | null;
      sel: number | null;
      code_barres: string | null;
      is_global: boolean | null;
      portion_nom: string | null;
      taille_portion_g: number | null;
    } | null;
  };
  const entries: NutritionEntry[] = (entriesRes.data ?? ([] as RawEntry[])).map(
    (e: RawEntry) => ({
      id: e.id,
      meal_number: e.meal_number,
      meal_time: e.meal_time,
      quantite_g: e.quantite_g,
      quantite_portion: e.quantite_portion,
      aliment: e.aliments as NutritionAliment,
    }),
  );

  const profile = profileRes.data ?? {
    objectif_calories: 2000,
    objectif_proteines: 150,
    objectif_glucides: 250,
    objectif_lipides: 70,
  };

  return {
    entries,
    profile: {
      objectif_calories: profile.objectif_calories ?? 2000,
      objectif_proteines: profile.objectif_proteines ?? 150,
      objectif_glucides: profile.objectif_glucides ?? 250,
      objectif_lipides: profile.objectif_lipides ?? 70,
    },
    date,
  };
}
