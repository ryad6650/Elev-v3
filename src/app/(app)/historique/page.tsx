import { createClient } from "@/lib/supabase/server";
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
