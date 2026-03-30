import { fetchProfilData } from "@/lib/profil";
import ProfilPageClient from "@/components/profil/ProfilPageClient";

export default async function ProfilPage() {
  const data = await fetchProfilData();
  return <ProfilPageClient data={data} />;
}
