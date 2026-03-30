import { createClient } from "@/lib/supabase/server";

export interface PoidsEntry {
  id: string;
  date: string;
  poids: number;
}

export interface PoidsPageData {
  entries: PoidsEntry[];
  taille: number | null;
}

export async function fetchPoidsData(): Promise<PoidsPageData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const [poidsRes, profileRes] = await Promise.all([
    supabase
      .from("poids_history")
      .select("id, date, poids")
      .eq("user_id", user.id)
      .order("date", { ascending: true }),
    supabase
      .from("profiles")
      .select("taille")
      .eq("id", user.id)
      .single(),
  ]);

  const entries: PoidsEntry[] = (poidsRes.data ?? []).map((e) => ({
    id: e.id,
    date: e.date,
    poids: e.poids,
  }));

  return {
    entries,
    taille: profileRes.data?.taille ?? null,
  };
}
