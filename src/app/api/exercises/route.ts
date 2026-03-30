import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const groupe = req.nextUrl.searchParams.get("groupe") ?? "";

  const equipement = req.nextUrl.searchParams.get("equipement") ?? "";

  let query = supabase
    .from("exercises")
    .select("id, nom, groupe_musculaire, equipement")
    .or(`is_global.eq.true,user_id.eq.${user.id}`)
    .order("nom")
    .limit(100);

  if (q) query = query.ilike("nom", `%${q}%`);
  if (groupe) query = query.eq("groupe_musculaire", groupe);
  if (equipement) query = query.eq("equipement", equipement);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
