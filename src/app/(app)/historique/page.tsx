import { createClient } from "@/lib/supabase/server";
import { fetchHistoriqueData } from "@/lib/historique";
import HistoriquePageClient from "@/components/historique/HistoriquePageClient";

export default async function HistoriquePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await fetchHistoriqueData(supabase, user.id);
  return <HistoriquePageClient initialData={data} />;
}
