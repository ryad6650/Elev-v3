import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionAliment } from "@/lib/nutrition-utils";

// Cache mémoire pour les résultats OpenFoodFacts (évite les appels externes répétés)
const offCache = new Map<string, { data: NutritionAliment[]; ts: number }>();
const OFF_CACHE_TTL = 60_000; // 60 secondes

function getCachedOFF(q: string): NutritionAliment[] | null {
  const entry = offCache.get(q.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.ts > OFF_CACHE_TTL) {
    offCache.delete(q.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCachedOFF(q: string, data: NutritionAliment[]): void {
  // Limiter la taille du cache à 100 entrées
  if (offCache.size >= 100) {
    const oldest = offCache.keys().next().value;
    if (oldest) offCache.delete(oldest);
  }
  offCache.set(q.toLowerCase(), { data, ts: Date.now() });
}

const SELECT_COLS =
  "id, nom, marque, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global";

function normalizeOFF(p: Record<string, unknown>): NutritionAliment | null {
  const nom = (
    (p.product_name_fr as string) ||
    (p.product_name as string) ||
    ""
  ).trim();
  if (!nom || nom.length < 2) return null;
  const n = (p.nutriments as Record<string, number>) ?? {};
  const kcal = n["energy-kcal_100g"] ?? n["energy_value"] ?? 0;
  if (!kcal || kcal <= 0 || kcal > 9000) return null;
  return {
    id: "",
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

async function searchOFF(
  q: string,
  timeoutMs = 1500,
): Promise<NutritionAliment[]> {
  try {
    const params = new URLSearchParams({
      action: "process",
      search_terms: q,
      json: "1",
      page_size: "8",
      sort_by: "unique_scans_n",
      fields: "code,product_name,product_name_fr,brands,nutriments",
    });
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      {
        headers: { "User-Agent": "Elev-v3/1.0 (contact@elev.app)" },
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products ?? [])
      .map(normalizeOFF)
      .filter(Boolean) as NutritionAliment[];
  } catch (e) {
    console.warn("OpenFoodFacts recherche indisponible:", e);
    return [];
  }
}

async function searchByBarcode(
  barcode: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<NutritionAliment[]> {
  const { data } = await supabase
    .from("aliments")
    .select(SELECT_COLS)
    .eq("code_barres", barcode)
    .limit(1);
  if (data?.length)
    return [
      {
        ...data[0],
        is_global: data[0].is_global ?? undefined,
        source: "local" as const,
      },
    ];
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        headers: { "User-Agent": "Elev-v3/1.0" },
        signal: AbortSignal.timeout(5000),
      },
    );
    const json = await res.json();
    if (json.status === 1 && json.product) {
      const aliment = normalizeOFF({ ...json.product, code: barcode });
      if (aliment) return [aliment];
    }
  } catch (e) {
    console.warn("OpenFoodFacts barcode indisponible:", e);
  }
  return [];
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const barcode = request.nextUrl.searchParams.get("barcode");
  if (barcode)
    return NextResponse.json(await searchByBarcode(barcode, supabase));

  const q = request.nextUrl.searchParams.get("q") ?? "";

  const cacheHeaders = {
    "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
  };

  // Pas de requête → aliments globaux populaires (état initial)
  if (!q.trim()) {
    const { data } = await supabase
      .from("aliments")
      .select(SELECT_COLS)
      .eq("is_global", true)
      .limit(24);
    return NextResponse.json(
      (data ?? []).map((r) => ({ ...r, source: "local" as const })),
      { headers: cacheHeaders },
    );
  }

  // Recherche via RPC (trigram + ILIKE, priorité aliments utilisés)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcData, error: rpcError } = (await (supabase.rpc as any)(
    "search_aliments",
    {
      search_query: q,
      user_uuid: user.id,
      max_results: 25,
    },
  )) as {
    data: Array<{
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
      usage_count: number;
      match_rank: number;
    }> | null;
    error: { message: string } | null;
  };

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  const local: NutritionAliment[] = (rpcData ?? []).map((r) => ({
    id: r.id,
    nom: r.nom,
    marque: r.marque,
    calories: r.calories,
    proteines: r.proteines,
    glucides: r.glucides,
    lipides: r.lipides,
    fibres: r.fibres,
    sucres: r.sucres,
    sel: r.sel,
    code_barres: r.code_barres,
    is_global: r.is_global,
    source: "local" as const,
  }));

  // Si assez de résultats locaux, pas besoin d'OFF
  if (local.length >= 8)
    return NextResponse.json(local, { headers: cacheHeaders });

  // Compléter avec OFF en parallèle (cache mémoire + timeout court)
  const cachedOFF = getCachedOFF(q);
  const offResults = cachedOFF ?? (await searchOFF(q, 1500));
  if (!cachedOFF) setCachedOFF(q, offResults);
  const localCodes = new Set(local.map((a) => a.code_barres).filter(Boolean));
  const localNoms = new Set(local.map((a) => a.nom.toLowerCase()));
  const offFiltered = offResults.filter((r) => {
    if (r.code_barres && localCodes.has(r.code_barres)) return false;
    if (localNoms.has(r.nom.toLowerCase())) return false;
    return true;
  });

  return NextResponse.json([...local, ...offFiltered], {
    headers: cacheHeaders,
  });
}
