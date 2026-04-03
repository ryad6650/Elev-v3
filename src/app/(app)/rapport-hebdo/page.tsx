import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchWeeklyReport } from "@/lib/weekly-report";
import WeeklyReportClient from "@/components/rapport-hebdo/WeeklyReportClient";

export default async function RapportHebdoPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const data = await fetchWeeklyReport(supabase, user.id);

  return <WeeklyReportClient data={data} />;
}
