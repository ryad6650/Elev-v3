import { createClient } from "@/lib/supabase/server";
import { fetchHistoriqueData } from "@/lib/historique";
import HistoriquePageClient from "@/components/historique/HistoriquePageClient";

export default async function HistoriquePage() {
  const supabase = await createClient();
  const data = await fetchHistoriqueData(supabase);

  return <HistoriquePageClient initialData={data} />;
}
