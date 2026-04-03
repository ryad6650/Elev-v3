import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchProfilData } from "@/lib/profil";
import ProfilPageClient from "@/components/profil/ProfilPageClient";

export default async function ProfilPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const data = await fetchProfilData(supabase, user.id, {
    email: user.email,
    created_at: user.createdAt,
  });
  return <ProfilPageClient initialData={data} />;
}
