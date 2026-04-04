import { createClient } from "@/lib/supabase/server";
import { fetchProfilStats } from "@/lib/profil";
import ProfilStats from "./ProfilStats";

interface Props {
  userId: string;
}

export default async function ProfilStatsAsync({ userId }: Props) {
  const supabase = await createClient();
  const stats = await fetchProfilStats(supabase, userId);
  return <ProfilStats stats={stats} />;
}
