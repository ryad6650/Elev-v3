import { Suspense } from "react";
import NutritionPageClient from "@/components/nutrition/NutritionPageClient";

export default function NutritionPage() {
  return (
    <Suspense>
      <NutritionPageClient />
    </Suspense>
  );
}
