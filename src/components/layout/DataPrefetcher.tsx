"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCache } from "@/lib/pageCache";
import { getTodayString } from "@/lib/date-utils";
import { fetchDashboardData } from "@/lib/dashboard";
import { fetchWorkoutPageData } from "@/lib/workout";
import { fetchProgrammesData } from "@/lib/programmes";
import { fetchNutritionData } from "@/lib/nutrition";
import { fetchPoidsData } from "@/lib/poids";
import { fetchHistoriqueData } from "@/lib/historique";
import { fetchProfilData } from "@/lib/profil";

/**
 * Prefetch toutes les données des onglets en parallèle dès le montage.
 * Lancé immédiatement (pas de requestIdleCallback) pour que les données
 * soient prêtes avant le premier clic sur un onglet.
 */
export default function DataPrefetcher() {
  useEffect(() => {
    const supabase = createClient();
    const today = getTodayString();

    // Lancer tous les fetches en parallèle immédiatement
    if (!getCached("dashboard")) {
      fetchDashboardData(supabase)
        .then((d) => setCache("dashboard", d))
        .catch(() => {});
    }
    if (!getCached("workout")) {
      Promise.all([
        fetchWorkoutPageData(supabase),
        fetchProgrammesData(supabase),
      ])
        .then(([workoutData, programmesData]) =>
          setCache("workout", { workoutData, programmesData }),
        )
        .catch(() => {});
    }
    if (!getCached(`nutrition:${today}`)) {
      fetchNutritionData(supabase, today)
        .then((d) => setCache(`nutrition:${today}`, d))
        .catch(() => {});
    }
    if (!getCached("poids")) {
      fetchPoidsData(supabase)
        .then((d) => setCache("poids", d))
        .catch(() => {});
    }
    if (!getCached("historique")) {
      fetchHistoriqueData(supabase)
        .then((d) => setCache("historique", d))
        .catch(() => {});
    }
    if (!getCached("profil")) {
      fetchProfilData(supabase)
        .then((d) => setCache("profil", d))
        .catch(() => {});
    }
  }, []);

  return null;
}
