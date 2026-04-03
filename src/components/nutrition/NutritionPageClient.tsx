"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import NutritionHeader from "./NutritionHeader";
import MealSection from "./MealSection";
import AddFoodModal from "./AddFoodModal";
import FoodViewSheet from "./FoodViewSheet";
import { sumEntries, groupByMeal, nextMealNumber } from "@/lib/nutrition-utils";
import type { NutritionEntry, NutritionPageData } from "@/lib/nutrition-utils";
import { useNutritionStore } from "@/store/nutritionStore";

function formatLabel(d: string) {
  const t = new Date();
  const todayStr = t.toISOString().split("T")[0];
  t.setDate(t.getDate() - 1);
  const yesterdayStr = t.toISOString().split("T")[0];
  if (d === todayStr) return "Aujourd'hui";
  if (d === yesterdayStr) return "Hier";
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "short",
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

  const { entries, profile, hasFetched, fetchDay, removeEntry } =
    useNutritionStore();
  const [modalMeal, setModalMeal] = useState<number | null>(null);
  const [modalMealTime, setModalMealTime] = useState<string | null>(null);
  const [viewEntry, setViewEntry] = useState<NutritionEntry | null>(null);
  const hydratedDateRef = useRef<string | null>(null);

  // Hydrater le store avec les données SSR au premier rendu (sync, pas dans un effet)
  if (hydratedDateRef.current !== initialData.date) {
    hydratedDateRef.current = initialData.date;
    useNutritionStore.setState({
      entries: initialData.entries,
      profile: initialData.profile,
      date: initialData.date,
      hasFetched: true,
      isLoading: false,
    });
  }

  // Re-fetch côté client uniquement si la date change via navigation
  useEffect(() => {
    if (date !== initialData.date) fetchDay(date);
  }, [date, initialData.date, fetchDay]);

  // Utiliser les données SSR tant que le store n'a pas fetchDay
  const displayEntries = hasFetched ? entries : initialData.entries;
  const displayProfile = hasFetched ? profile : initialData.profile;
  const total = useMemo(() => sumEntries(displayEntries), [displayEntries]);
  const meals = useMemo(() => groupByMeal(displayEntries), [displayEntries]);

  function navigate(delta: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split("T")[0]}`);
  }

  function handleCreateMeal() {
    const num = nextMealNumber(entries);
    const now = new Date().toISOString();
    setModalMealTime(now);
    setModalMeal(num);
  }

  function handleAddToMeal(mealNumber: number, mealTime: string) {
    setModalMealTime(mealTime);
    setModalMeal(mealNumber);
  }

  return (
    <>
      <main
        className="px-4 pt-6 pb-28 page-enter"
        style={{ maxWidth: 520, margin: "0 auto" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h1
            className="text-3xl leading-tight"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            Nutrition
          </h1>
          <div
            className="flex items-center rounded-full"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="p-2"
              aria-label="Jour précédent"
            >
              <ChevronLeft
                size={14}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
            <span
              className="text-xs font-medium px-1"
              style={{ color: "var(--text-primary)" }}
            >
              {formatLabel(date)}
            </span>
            <button
              onClick={() => navigate(1)}
              className="p-2"
              aria-label="Jour suivant"
            >
              <ChevronRight
                size={14}
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
          </div>
        </div>

        <p
          className="text-xs font-semibold mb-3"
          style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
        >
          KCALORIES
        </p>

        <NutritionHeader
          totalCalories={total.calories}
          totalProteines={total.proteines}
          totalGlucides={total.glucides}
          totalLipides={total.lipides}
          profile={displayProfile}
        />

        <p
          className="text-xs font-semibold mb-3"
          style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
        >
          REPAS
        </p>

        {meals.map((meal) => (
          <MealSection
            key={meal.meal_number}
            meal={meal}
            onAdd={() => handleAddToMeal(meal.meal_number, meal.meal_time)}
            onEntryDeleted={removeEntry}
            onFoodClick={(entry) => setViewEntry(entry)}
          />
        ))}

        {meals.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🍽️</p>
            <p
              className="text-lg"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
                color: "var(--text-primary)",
              }}
            >
              Aucun repas
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Crée ton premier repas de la journée
            </p>
          </div>
        )}

        <button
          onClick={handleCreateMeal}
          className="btn-accent w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm mt-1 transition-all active:scale-[0.97]"
          style={{ boxShadow: "0 4px 20px rgba(232,134,12,0.3)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Plus size={14} />
          </div>
          Créer un repas
        </button>
      </main>

      {modalMeal !== null && (
        <AddFoodModal
          mealNumber={modalMeal}
          mealTime={modalMealTime ?? new Date().toISOString()}
          date={date}
          onClose={() => {
            setModalMeal(null);
            setModalMealTime(null);
          }}
        />
      )}

      {viewEntry && (
        <FoodViewSheet entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </>
  );
}
