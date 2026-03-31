import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionAliment } from "@/lib/nutrition-utils";

const SELECT_COLS = "id, nom, marque, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global, portion_nom, taille_portion_g";

/** Normalise un produit OpenFoodFacts en NutritionAliment */
function normalizeOFF(p: Record<string, unknown>): NutritionAliment | null {
  const nom = ((p.product_name_fr as string) || (p.product_name as string) || "").trim();
  if (!nom || nom.length < 2) return null;

  const n = (p.nutriments as Record<string, number>) ?? {};
  const kcal = n["energy-kcal_100g"] ?? n["energy_value"] ?? 0;
  if (!kcal || kcal <= 0 || kcal > 9000) return null;

  return {
    id: "", // pas encore en DB locale
    nom,
    marque: p.brands ? (p.brands as string).split(",")[0].trim() || null : null,
    calories: Math.round(kcal),
    proteines: n["proteins_100g"] ?? null,
    glucides: n["carbohydrates_100g"] ?? null,
    lipides: n["fat_100g"] ?? null,
    fibres: n["fiber_100g"] ?? null,
    sucres: n["sugars_100g"] ?? null,
    sel: n["salt_100g"] ?? null,
    code_barres: p.code ? String(p.code) : null,
    source: "openfoodfacts",
  };
}

/** Recherche dans OpenFoodFacts (timeout 3s) */
async function searchOFF(q: string): Promise<NutritionAliment[]> {
  try {
    const params = new URLSearchParams({
      action: "process",
      search_terms: q,
      json: "1",
      page_size: "10",
      sort_by: "unique_scans_n",
      fields: "code,product_name,product_name_fr,brands,nutriments",
    });
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      {
        headers: { "User-Agent": "Elev-v3/1.0 (contact@elev.app)" },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products ?? []).map(normalizeOFF).filter(Boolean) as NutritionAliment[];
  } catch {
    return [];
  }
}

/** Recherche par code-barres : DB locale puis OFT */
async function searchByBarcode(barcode: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<NutritionAliment[]> {
  const { data } = await supabase
    .from("aliments")
    .select(SELECT_COLS)
    .eq("code_barres", barcode)
    .limit(1);
  if (data?.length) return [{ ...data[0], source: "local" as const }];

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { headers: { "User-Agent": "Elev-v3/1.0 (contact@elev.app)" }, signal: AbortSignal.timeout(5000) }
    );
    const json = await res.json();
    if (json.status === 1 && json.product) {
      const aliment = normalizeOFF({ ...json.product, code: barcode });
      if (aliment) return [aliment];
    }
  } catch { /* OFT indisponible */ }
  return [];
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const barcode = request.nextUrl.searchParams.get("barcode");
  if (barcode) return NextResponse.json(await searchByBarcode(barcode, supabase));

  const q = request.nextUrl.searchParams.get("q") ?? "";

  // Sans recherche : retourner les aliments globaux populaires
  if (!q.trim()) {
    const { data } = await supabase
      .from("aliments")
      .select(SELECT_COLS)
      .eq("is_global", true)
      .limit(20);
    return NextResponse.json(
      (data ?? []).map((r) => ({ ...r, source: "local" as const }))
    );
  }

  // Recherche parallèle : DB locale + OpenFoodFacts
  const [localResult, offResults] = await Promise.all([
    supabase
      .from("aliments")
      .select(SELECT_COLS)
      .or(`is_global.eq.true,user_id.eq.${user.id}`)
      .ilike("nom", `%${q}%`)
      .limit(20),
    searchOFF(q),
  ]);

  const local: NutritionAliment[] = (localResult.data ?? []).map((r) => ({
    ...r,
    source: "local" as const,
  }));

  // Dédupliquer les résultats OFT déjà présents en local
  const localCodes = new Set(local.map((a) => a.code_barres).filter(Boolean));
  const localNoms = new Set(local.map((a) => a.nom.toLowerCase()));

  const offFiltered = offResults.filter((r) => {
    if (r.code_barres && localCodes.has(r.code_barres)) return false;
    if (localNoms.has(r.nom.toLowerCase())) return false;
    return true;
  });

  return NextResponse.json([...local, ...offFiltered]);
}
