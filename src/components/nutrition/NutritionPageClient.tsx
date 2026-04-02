"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import NutritionHeader from "./NutritionHeader";
import MealSection from "./MealSection";
import AddFoodModal from "./AddFoodModal";
import FoodViewSheet from "./FoodViewSheet";
import { sumEntries, groupByMeal, nextMealNumber } from "@/lib/nutrition-utils";
import type { NutritionPageData, NutritionEntry } from "@/lib/nutrition-utils";
import { fetchNutritionData } from "@/lib/nutrition";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCache } from "@/lib/pageCache";

function cacheKey(date: string) {
  return `nutrition:${date}`;
}

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

export default function NutritionPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split("T")[0];
  const date = searchParams.get("date") ?? today;

  const [data, setData] = useState<NutritionPageData | null>(
    getCached<NutritionPageData>(cacheKey(date)),
  );
  const [modalMeal, setModalMeal] = useState<number | null>(null);
  const [modalMealTime, setModalMealTime] = useState<string | null>(null);
  const [viewEntry, setViewEntry] = useState<NutritionEntry | null>(null);
  const [supabaseRef] = useState(() => createClient());

  const refreshData = useCallback(() => {
    fetchNutritionData(supabaseRef, date)
      .then((d) => {
        setData(d);
        setCache(cacheKey(date), d);
      })
      .catch(console.error);
  }, [supabaseRef, date]);

  useEffect(() => {
    // Charger le cache immédiatement via l'initializer de useState,
    // puis fetch les données fraîches
    fetchNutritionData(supabaseRef, date)
      .then((d) => {
        setData(d);
        setCache(cacheKey(date), d);
      })
      .catch(console.error);
  }, [date, supabaseRef]);

  const total = useMemo(() => (data ? sumEntries(data.entries) : null), [data]);
  const meals = useMemo(() => (data ? groupByMeal(data.entries) : []), [data]);

  if (!data || !total)
    return (
      <main className="px-4 pt-6" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div
          className="flex items-center justify-center"
          style={{ height: "50vh" }}
        >
          <div
            className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--accent)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      </main>
    );

  function navigate(delta: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split("T")[0]}`);
  }

  function handleCreateMeal() {
    const num = nextMealNumber(data!.entries);
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
          profile={data.profile}
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
            onEntryDeleted={(id) => {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      entries: prev.entries.filter((e) => e.id !== id),
                    }
                  : prev,
              );
            }}
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
          date={data.date}
          onClose={() => {
            setModalMeal(null);
            setModalMealTime(null);
            refreshData();
          }}
        />
      )}

      {viewEntry && (
        <FoodViewSheet entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </>
  );
}
