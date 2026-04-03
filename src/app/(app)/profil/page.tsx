import { createClient } from "@/lib/supabase/server";
import { fetchProfilData } from "@/lib/profil";
import ProfilPageClient from "@/components/profil/ProfilPageClient";

export default async function ProfilPage() {
  const supabase = await createClient();
  const data = await fetchProfilData(supabase);

  return <ProfilPageClient initialData={data} />;
}
