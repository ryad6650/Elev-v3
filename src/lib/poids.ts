import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { MensurationsData } from "@/components/poids/MensurationsCard";

export interface PoidsEntry {
  id: string;
  date: string;
  poids: number;
}

export interface PoidsPageData {
  entries: PoidsEntry[];
  taille: number | null;
  mensurations: MensurationsData | null;
}

export async function fetchPoidsData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<PoidsPageData> {
  const [poidsRes, profileRes, mensurationsRes] = await Promise.all([
    supabase
      .from("poids_history")
      .select("id, date, poids")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
    supabase.from("profiles").select("taille").eq("id", userId).single(),
    supabase
      .from("mensurations")
      .select("cou, tour_taille, poitrine, hanches, bras, cuisse, mollet")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const entries: PoidsEntry[] = (poidsRes.data ?? []).map((e) => ({
    id: e.id,
    date: e.date ?? "",
    poids: e.poids,
  }));

  const m = mensurationsRes.data;
  const mensurations: MensurationsData | null = m
    ? {
        cou: m.cou ?? null,
        tour_taille: m.tour_taille ?? null,
        poitrine: m.poitrine ?? null,
        hanches: m.hanches ?? null,
        bras: m.bras ?? null,
        cuisse: m.cuisse ?? null,
        mollet: m.mollet ?? null,
      }
    : null;

  return {
    entries,
    taille: profileRes.data?.taille ?? null,
    mensurations,
  };
}
