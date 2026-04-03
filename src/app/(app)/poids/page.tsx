import { createClient } from "@/lib/supabase/server";
import { fetchPoidsData } from "@/lib/poids";
import PoidsPageClient from "@/components/poids/PoidsPageClient";

export default async function PoidsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await fetchPoidsData(supabase, user.id);
  return <PoidsPageClient initialData={data} />;
}
