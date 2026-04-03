import { Suspense } from "react";
import NutritionPageClient from "@/components/nutrition/NutritionPageClient";
import { createClient } from "@/lib/supabase/server";
import { fetchNutritionData } from "@/lib/nutrition";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function NutritionPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const d = date ?? today;

  const supabase = await createClient();
  const initialData = await fetchNutritionData(supabase, d);

  return (
    <Suspense>
      <NutritionPageClient initialData={initialData} />
    </Suspense>
  );
}
