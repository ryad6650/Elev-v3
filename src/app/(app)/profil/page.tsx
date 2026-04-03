import { createClient } from "@/lib/supabase/server";
import { fetchProfilData } from "@/lib/profil";
import ProfilPageClient from "@/components/profil/ProfilPageClient";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await fetchProfilData(supabase, user.id, {
    email: user.email,
    created_at: user.created_at,
  });
  return <ProfilPageClient initialData={data} />;
}
