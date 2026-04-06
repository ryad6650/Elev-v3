import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard — Élev" };
export const dynamic = "force-dynamic";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchDashboardData } from "@/lib/dashboard";
import { updateConnexionStreak } from "@/app/actions/streak";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

async function DashboardLoader({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [data, streakConnexions] = await Promise.all([
    fetchDashboardData(supabase, userId),
    updateConnexionStreak(supabase, userId).catch(() => null),
  ]);

  const finalData =
    streakConnexions != null ? { ...data, streakConnexions } : data;

  return <DashboardPageClient initialData={finalData} />;
}

export default async function DashboardPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  return <DashboardLoader userId={user.id} />;
}
