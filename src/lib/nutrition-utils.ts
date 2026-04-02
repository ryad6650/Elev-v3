// Utilitaires purs nutrition — utilisables côté client ET serveur

export interface NutritionAliment {
  id: string; // '' si résultat OFT pas encore en DB locale
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
  source?: "local" | "openfoodfacts";
  is_global?: boolean;
  portion_nom?: string | null;
  taille_portion_g?: number | null;
}

export interface NutritionEntry {
  id: string;
  meal_number: number;
  meal_time: string; // ISO timestamp
  quantite_g: number;
  aliment: NutritionAliment;
}

/** Un repas regroupé (toutes les entries d'un même meal_number) */
export interface Meal {
  meal_number: number;
  meal_time: string; // heure du premier aliment ajouté
  entries: NutritionEntry[];
}

export interface NutritionProfile {
  objectif_calories: number;
  objectif_proteines: number | null;
  objectif_glucides: number | null;
  objectif_lipides: number | null;
}

export interface NutritionPageData {
  entries: NutritionEntry[];
  profile: NutritionProfile;
  date: string;
}

export function calcNutrients(aliment: NutritionAliment, quantite_g: number) {
  const f = quantite_g / 100;
  return {
    calories: Math.round(aliment.calories * f),
    proteines: Math.round((aliment.proteines ?? 0) * f * 10) / 10,
    glucides: Math.round((aliment.glucides ?? 0) * f * 10) / 10,
    lipides: Math.round((aliment.lipides ?? 0) * f * 10) / 10,
  };
}

export function sumEntries(entries: NutritionEntry[]) {
  return entries.reduce(
    (acc, e) => {
      const n = calcNutrients(e.aliment, e.quantite_g);
      return {
        calories: acc.calories + n.calories,
        proteines: Math.round((acc.proteines + n.proteines) * 10) / 10,
        glucides: Math.round((acc.glucides + n.glucides) * 10) / 10,
        lipides: Math.round((acc.lipides + n.lipides) * 10) / 10,
      };
    },
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 },
  );
}

/** Regroupe les entries par meal_number → liste de Meal triés par heure */
export function groupByMeal(entries: NutritionEntry[]): Meal[] {
  const map = new Map<number, NutritionEntry[]>();
  for (const e of entries) {
    const arr = map.get(e.meal_number) ?? [];
    arr.push(e);
    map.set(e.meal_number, arr);
  }
  return Array.from(map.entries())
    .map(([meal_number, entries]) => ({
      meal_number,
      meal_time: entries[0].meal_time,
      entries,
    }))
    .sort((a, b) => a.meal_number - b.meal_number);
}

/** Prochain meal_number disponible */
export function nextMealNumber(entries: NutritionEntry[]): number {
  if (entries.length === 0) return 1;
  return Math.max(...entries.map((e) => e.meal_number)) + 1;
}
