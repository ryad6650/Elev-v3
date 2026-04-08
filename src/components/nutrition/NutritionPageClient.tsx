"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NutritionHeader from "./NutritionHeader";
import MealSection from "./MealSection";
import { sumEntries, groupByMeal } from "@/lib/nutrition-utils";
import type {
  Meal,
  NutritionEntry,
  NutritionPageData,
} from "@/lib/nutrition-utils";
import { useNutritionStore } from "@/store/nutritionStore";

const AddFoodModal = dynamic(() => import("./AddFoodModal"), { ssr: false });
const EditEntryModal = dynamic(() => import("./EditEntryModal"), {
  ssr: false,
});

function formatDateShort(d: string) {
  const t = new Date();
  const todayStr = t.toISOString().split("T")[0];
  t.setDate(t.getDate() - 1);
  const yesterdayStr = t.toISOString().split("T")[0];
  if (d === todayStr) return "Auj.";
  if (d === yesterdayStr) return "Hier";
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

interface Props {
  initialData: NutritionPageData;
}

export default function NutritionPageClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split("T")[0];
  const date = searchParams.get("date") ?? today;

  const entries = useNutritionStore((s) => s.entries);
  const profile = useNutritionStore((s) => s.profile);
  const hasFetched = useNutritionStore((s) => s.hasFetched);
  const fetchDay = useNutritionStore((s) => s.fetchDay);
  const removeEntry = useNutritionStore((s) => s.removeEntry);
  const [modalMeal, setModalMeal] = useState<number | null>(null);
  const [modalMealTime, setModalMealTime] = useState<string | null>(null);
  const [viewEntry, setViewEntry] = useState<NutritionEntry | null>(null);

  const closeAddModal = () => {
    setModalMeal(null);
    setModalMealTime(null);
  };
  const closeEditModal = () => setViewEntry(null);
  const hydratedDateRef = useRef<string | null>(null);

  if (hydratedDateRef.current !== initialData.date) {
    hydratedDateRef.current = initialData.date;
    const store = useNutritionStore.getState();
    if (!store.hasFetched || store.date !== initialData.date) {
      useNutritionStore.setState({
        entries: initialData.entries,
        profile: initialData.profile,
        date: initialData.date,
        hasFetched: true,
        isLoading: false,
      });
    }
  }

  useEffect(() => {
    if (date !== initialData.date) fetchDay(date);
  }, [date, initialData.date, fetchDay]);

  const displayEntries = hasFetched ? entries : initialData.entries;
  const displayProfile = hasFetched ? profile : initialData.profile;
  const total = useMemo(() => sumEntries(displayEntries), [displayEntries]);
  const mealsFromEntries = useMemo(
    () => groupByMeal(displayEntries),
    [displayEntries],
  );

  // Toujours afficher les 4 repas fixes, même sans entries
  const FIXED_MEALS = [1, 2, 3, 4] as const;
  const meals: Meal[] = useMemo(() => {
    const map = new Map(mealsFromEntries.map((m) => [m.meal_number, m]));
    return FIXED_MEALS.map(
      (num) => map.get(num) ?? { meal_number: num, meal_time: "", entries: [] },
    );
  }, [mealsFromEntries]);

  function navigate(delta: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split("T")[0]}`);
  }

  function handleAddToMeal(mealNumber: number, mealTime: string) {
    setModalMealTime(mealTime || new Date().toISOString());
    setModalMeal(mealNumber);
  }

  return (
    <>
      <main
        className="pt-3.5 pb-28 page-enter"
        style={{
          maxWidth: 430,
          margin: "0 auto",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* Title + date nav */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 18 }}
        >
          <h1
            className="text-[26px] leading-none"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            Nutrition
          </h1>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{ background: "rgba(74,55,40,0.07)" }}
              aria-label="Jour précédent"
            >
              <ChevronLeft
                size={14}
                strokeWidth={2.5}
                style={{ color: "var(--text-muted)" }}
              />
            </button>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-primary)", letterSpacing: "0.02em" }}
            >
              {formatDateShort(date)}
            </span>
            <button
              onClick={() => navigate(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{ background: "rgba(74,55,40,0.07)" }}
              aria-label="Jour suivant"
            >
              <ChevronRight
                size={14}
                strokeWidth={2.5}
                style={{ color: "var(--text-muted)" }}
              />
            </button>
          </div>
        </div>

        {/* Summary header */}
        <NutritionHeader
          totalCalories={total.calories}
          totalProteines={total.proteines}
          totalGlucides={total.glucides}
          totalLipides={total.lipides}
          profile={displayProfile}
        />

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: "var(--border)", margin: "4px 0 12px" }}
        />

        {/* Meals */}
        <div className="flex flex-col">
          {meals.map((meal) => (
            <div key={meal.meal_number}>
              <MealSection
                meal={meal}
                onAdd={() => handleAddToMeal(meal.meal_number, meal.meal_time)}
                onEntryDeleted={(id) => removeEntry(id)}
                onFoodClick={(entry) => setViewEntry(entry)}
              />
            </div>
          ))}
        </div>
      </main>

      {modalMeal !== null && (
        <AddFoodModal
          mealNumber={modalMeal}
          mealTime={modalMealTime ?? new Date().toISOString()}
          date={date}
          onClose={closeAddModal}
        />
      )}

      {viewEntry && (
        <EditEntryModal entry={viewEntry} onClose={closeEditModal} />
      )}
    </>
  );
}
