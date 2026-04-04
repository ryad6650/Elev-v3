import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Poids — Élev" };
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchPoidsData } from "@/lib/poids";
import PoidsPageClient from "@/components/poids/PoidsPageClient";

export default async function PoidsPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const data = await fetchPoidsData(supabase, user.id);
  return <PoidsPageClient initialData={data} />;
}
