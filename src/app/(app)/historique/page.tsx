import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchHistoriqueData } from "@/lib/historique";
import HistoriquePageClient from "@/components/historique/HistoriquePageClient";

export const metadata: Metadata = { title: "Historique — Élev" };

async function HistoriqueContent() {
  const user = await getUserFromMiddleware();
  if (!user) return null;
  const supabase = await createClient();
  const data = await fetchHistoriqueData(supabase, user.id);
  return <HistoriquePageClient initialData={data} />;
}

export default function HistoriquePage() {
  return (
    <Suspense fallback={<Loading />}>
      <HistoriqueContent />
    </Suspense>
  );
}
