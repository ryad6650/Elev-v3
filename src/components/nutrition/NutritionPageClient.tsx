"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import NutritionHeader from "./NutritionHeader";
import MealSection from "./MealSection";
import MealDetailView from "./MealDetailView";
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

function getWeekNum(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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
  const [modalMeal, setModalMeal] = useState<number | null>(null);
  const [modalMealTime, setModalMealTime] = useState<string | null>(null);
  const [viewMealNumber, setViewMealNumber] = useState<number | null>(null);
  const [viewEntry, setViewEntry] = useState<NutritionEntry | null>(null);

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
  const FIXED_MEALS = [1, 2, 3, 4] as const;
  const meals: Meal[] = useMemo(() => {
    const map = new Map(mealsFromEntries.map((m) => [m.meal_number, m]));
    return FIXED_MEALS.map(
      (num) => map.get(num) ?? { meal_number: num, meal_time: "", entries: [] },
    );
  }, [mealsFromEntries]);

  const viewMeal = useMemo(() => {
    if (viewMealNumber === null) return null;
    return (
      meals.find((m) => m.meal_number === viewMealNumber) ?? {
        meal_number: viewMealNumber,
        meal_time: "",
        entries: [],
      }
    );
  }, [viewMealNumber, meals]);

  const handleMealAdd = useCallback((meal: Meal) => {
    setModalMealTime(meal.meal_time || new Date().toISOString());
    setModalMeal(meal.meal_number);
  }, []);

  const handleMealClick = useCallback((meal: Meal) => {
    setViewMealNumber(meal.meal_number);
  }, []);

  const isToday = date === today;
  const dateTitle = isToday
    ? "Aujourd'hui"
    : new Date(date + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
  const weekNum = getWeekNum(new Date(date + "T12:00:00"));
  const streak = initialData.streak ?? 0;

  function navigate(delta: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    router.push(`/nutrition?date=${d.toISOString().split("T")[0]}`);
  }

  return (
    <>
      <main
        className="page-enter"
        style={{
          maxWidth: 430,
          margin: "0 auto",
          padding: "20px 20px 0",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
          background: "#0C0A09",
          minHeight: "100dvh",
        }}
      >
        {/* Stats en haut à droite */}
        <div
          className="flex justify-end items-center gap-4"
          style={{ marginBottom: 12 }}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 18 }}>🔥</span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              0
            </span>
          </div>
          <Calendar size={22} color="var(--text-secondary)" />
        </div>

        {/* En-tête date */}
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-nunito)",
                  fontStyle: "normal",
                  textShadow:
                    "0 0 20px rgba(255,255,255,0.18), 0 0 40px rgba(255,255,255,0.07)",
                }}
              >
                {dateTitle}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                  fontFamily: "var(--font-sans)",
                }}
              >
                Semaine {weekNum}
              </p>
            </div>
            <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
              <button
                onClick={() => navigate(-1)}
                className="active:scale-95 transition-transform flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--bg-secondary)",
                  fontSize: 18,
                  color: "var(--text-secondary)",
                }}
                aria-label="Jour précédent"
              >
                ‹
              </button>
              <button
                onClick={() => navigate(1)}
                disabled={isToday}
                className="active:scale-95 transition-transform flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--bg-secondary)",
                  fontSize: 18,
                  color: "var(--text-secondary)",
                  opacity: isToday ? 0.3 : 1,
                }}
                aria-label="Jour suivant"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Section Résumé */}
        <div style={{ marginBottom: 24 }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 12 }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Résumé
            </h2>
            <button
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1E9D4C",
                fontFamily: "var(--font-sans)",
              }}
            >
              Détails
            </button>
          </div>
          <NutritionHeader
            totalCalories={total.calories}
            totalProteines={total.proteines}
            totalGlucides={total.glucides}
            totalLipides={total.lipides}
            caloriesBrulees={0}
            profile={displayProfile}
          />
        </div>

        {/* Section Alimentation */}
        <div>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 12 }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Alimentation
            </h2>
            <button
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#1E9D4C",
                fontFamily: "var(--font-sans)",
              }}
            >
              Plus
            </button>
          </div>
          <div
            style={{
              background: "#151312",
              borderRadius: 16,
              overflow: "hidden",
              border: "2px solid #595F60",
            }}
          >
            {meals.map((meal, i) => (
              <div key={meal.meal_number}>
                {i > 0 && (
                  <div
                    style={{
                      height: 1,
                      background: "var(--border)",
                      marginLeft: 74,
                    }}
                  />
                )}
                <MealSection
                  meal={meal}
                  calorieObjectif={displayProfile.objectif_calories ?? 2000}
                  onAdd={handleMealAdd}
                  onMealClick={handleMealClick}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalMeal !== null && (
        <AddFoodModal
          mealNumber={modalMeal}
          mealTime={modalMealTime ?? new Date().toISOString()}
          date={date}
          initialFrequents={initialData.frequents}
          onClose={(addedCount) => {
            const mealNum = modalMeal;
            setModalMeal(null);
            setModalMealTime(null);
            if (mealNum !== null && addedCount && addedCount > 0)
              setViewMealNumber(mealNum);
          }}
        />
      )}
      {viewMeal && (
        <MealDetailView
          meal={viewMeal}
          profile={displayProfile}
          onClose={() => setViewMealNumber(null)}
          onFoodClick={(entry) => setViewEntry(entry)}
          onAdd={() => {
            setModalMealTime(viewMeal.meal_time || new Date().toISOString());
            setModalMeal(viewMeal.meal_number);
          }}
        />
      )}
      {viewEntry && (
        <EditEntryModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}
    </>
  );
}
