import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/dashboard";
import { updateConnexionStreak } from "@/app/actions/streak";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [data, streakConnexions] = await Promise.all([
    fetchDashboardData(supabase, user.id),
    updateConnexionStreak(supabase, user.id).catch(() => null),
  ]);

  const finalData =
    streakConnexions != null ? { ...data, streakConnexions } : data;

  return <DashboardPageClient initialData={finalData} />;
}
