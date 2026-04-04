import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Historique — Élev" };
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchHistoriqueData } from "@/lib/historique";
import HistoriquePageClient from "@/components/historique/HistoriquePageClient";

export default async function HistoriquePage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const data = await fetchHistoriqueData(supabase, user.id);
  return <HistoriquePageClient initialData={data} />;
}
