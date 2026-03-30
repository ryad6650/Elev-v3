import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("aliments")
    .select("id, nom, calories, proteines, glucides, lipides")
    .or(`is_global.eq.true,user_id.eq.${user.id}`)
    .limit(20);

  if (q.trim()) {
    query = query.ilike("nom", `%${q}%`);
  } else {
    // Sans recherche, renvoyer les aliments globaux populaires
    query = query.eq("is_global", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
