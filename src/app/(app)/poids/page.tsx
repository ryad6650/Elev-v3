import { createClient } from "@/lib/supabase/server";
import { fetchPoidsData } from "@/lib/poids";
import PoidsPageClient from "@/components/poids/PoidsPageClient";

export default async function PoidsPage() {
  const supabase = await createClient();
  const data = await fetchPoidsData(supabase);

  return <PoidsPageClient initialData={data} />;
}
