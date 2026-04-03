import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/dashboard";
import { updateConnexionStreak } from "@/app/actions/streak";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [data, streakConnexions] = await Promise.all([
    fetchDashboardData(supabase),
    updateConnexionStreak().catch(() => null),
  ]);

  const finalData =
    streakConnexions != null ? { ...data, streakConnexions } : data;

  return <DashboardPageClient initialData={finalData} />;
}
