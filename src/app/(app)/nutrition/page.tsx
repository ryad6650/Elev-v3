import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Nutrition — Élev" };
import NutritionPageClient from "@/components/nutrition/NutritionPageClient";
import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchNutritionData } from "@/lib/nutrition";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function NutritionPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const d = date ?? today;

  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const initialData = await fetchNutritionData(supabase, d, user.id);

  return (
    <Suspense
      fallback={
        <div
          className="px-4 pt-6 pb-28"
          style={{ maxWidth: 520, margin: "0 auto" }}
        >
          <div
            className="h-8 w-32 rounded-lg mb-5"
            style={{ background: "var(--bg-secondary)" }}
          />
          <div
            className="h-40 rounded-2xl mb-4"
            style={{ background: "var(--bg-secondary)" }}
          />
          <div
            className="h-24 rounded-2xl mb-3"
            style={{ background: "var(--bg-secondary)" }}
          />
          <div
            className="h-24 rounded-2xl mb-3"
            style={{ background: "var(--bg-secondary)" }}
          />
        </div>
      }
    >
      <NutritionPageClient initialData={initialData} />
    </Suspense>
  );
}
