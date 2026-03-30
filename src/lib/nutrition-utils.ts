// Utilitaires purs nutrition — utilisables côté client ET serveur

export interface NutritionAliment {
  id: string;
  nom: string;
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
}

export interface NutritionEntry {
  id: string;
  repas: "petit-dejeuner" | "dejeuner" | "diner" | "snacks";
  quantite_g: number;
  aliment: NutritionAliment;
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
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  );
}
