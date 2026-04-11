import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { revalidateDashboard } from "@/app/actions/nutrition";
import type {
  NutritionEntry,
  NutritionProfile,
  NutritionAliment,
} from "@/lib/nutrition-utils";

interface NutritionState {
  // State
  entries: NutritionEntry[];
  profile: NutritionProfile;
  date: string;
  isLoading: boolean;
  hasFetched: boolean;

  // Actions
  fetchDay: (date: string) => Promise<void>;
  addEntry: (
    mealNumber: number,
    aliment: NutritionAliment,
    alimentId: string,
    quantiteG: number,
    date: string,
    mealTime: string,
    quantitePortion?: number | null,
  ) => Promise<void>;
  updateEntry: (
    id: string,
    quantiteG: number,
    quantitePortion?: number | null,
  ) => Promise<void>;
  updateAlimentInEntries: (
    alimentId: string,
    aliment: NutritionAliment,
  ) => void;
  removeEntry: (id: string) => Promise<void>;
  setEntries: (entries: NutritionEntry[]) => void;
  reset: () => void;
}

const DEFAULT_PROFILE: NutritionProfile = {
  objectif_calories: 2000,
  objectif_proteines: 150,
  objectif_glucides: 250,
  objectif_lipides: 70,
};

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

let cachedUserId: string | null = null;
let fetchDayRequestId = 0;

async function getCurrentUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  cachedUserId = user?.id ?? null;
  return cachedUserId;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  entries: [],
  profile: DEFAULT_PROFILE,
  date: "",
  isLoading: false,
  hasFetched: false,

  fetchDay: async (date: string) => {
    const requestId = ++fetchDayRequestId;
    set({ isLoading: true, date });

    const userId = await getCurrentUserId();
    if (!userId || requestId !== fetchDayRequestId) {
      if (requestId === fetchDayRequestId) set({ isLoading: false });
      return;
    }

    const sb = getSupabase();
    const [entriesRes, profileRes] = await Promise.all([
      sb
        .from("nutrition_entries")
        .select(
          "id, meal_number, meal_time, quantite_g, quantite_portion, aliments(id, nom, calories, proteines, glucides, lipides, fibres, sucres, sel, code_barres, is_global, portion_nom, taille_portion_g)",
        )
        .eq("user_id", userId)
        .eq("date", date)
        .order("meal_number")
        .order("meal_time"),
      sb
        .from("profiles")
        .select(
          "objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides",
        )
        .eq("id", userId)
        .single(),
    ]);

    // Ignorer la réponse si une requête plus récente a été lancée
    if (requestId !== fetchDayRequestId) return;

    if (entriesRes.error || profileRes.error) {
      set({ isLoading: false });
      return;
    }

    type RawEntry = {
      id: string;
      meal_number: number;
      meal_time: string;
      quantite_g: number;
      quantite_portion: number | null;
      aliments: NutritionAliment | null;
    };

    const entries: NutritionEntry[] = ((entriesRes.data ?? []) as RawEntry[])
      .filter((e) => e.aliments !== null)
      .map((e) => ({
        id: e.id,
        meal_number: e.meal_number,
        meal_time: e.meal_time,
        quantite_g: e.quantite_g,
        quantite_portion: e.quantite_portion,
        aliment: e.aliments as NutritionAliment,
      }));

    const p = profileRes.data;
    const profile: NutritionProfile = {
      objectif_calories: p?.objectif_calories ?? 2000,
      objectif_proteines: p?.objectif_proteines ?? 150,
      objectif_glucides: p?.objectif_glucides ?? 250,
      objectif_lipides: p?.objectif_lipides ?? 70,
    };

    set({ entries, profile, isLoading: false, hasFetched: true });
  },

  addEntry: async (
    mealNumber,
    aliment,
    alimentId,
    quantiteG,
    date,
    mealTime,
    quantitePortion,
  ) => {
    const tempId = crypto.randomUUID();

    // 1. Update optimiste immédiat
    const optimisticEntry: NutritionEntry = {
      id: tempId,
      meal_number: mealNumber,
      meal_time: mealTime,
      quantite_g: quantiteG,
      quantite_portion: quantitePortion ?? null,
      aliment,
    };
    set((s) => ({
      entries: [...s.entries, optimisticEntry],
    }));

    // 2. Sync Supabase (await pour garantir la persistance)
    const userId = await getCurrentUserId();
    if (!userId) {
      set((s) => ({ entries: s.entries.filter((e) => e.id !== tempId) }));
      return;
    }

    const { data, error } = await getSupabase()
      .from("nutrition_entries")
      .insert({
        user_id: userId,
        meal_number: mealNumber,
        meal_time: mealTime,
        aliment_id: alimentId,
        quantite_g: quantiteG,
        quantite_portion: quantitePortion ?? null,
        date,
      })
      .select("id")
      .single();

    if (error || !data) {
      set((s) => ({ entries: s.entries.filter((e) => e.id !== tempId) }));
      return;
    }

    // Remplacer tempId par vrai id
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === tempId ? { ...e, id: data.id } : e,
      ),
    }));

    // Invalider le cache dashboard pour qu'il affiche les données à jour
    revalidateDashboard().catch(() => {});
  },

  updateEntry: async (
    id: string,
    quantiteG: number,
    quantitePortion?: number | null,
  ) => {
    const entries = get().entries;
    const oldEntry = entries.find((e) => e.id === id);
    if (!oldEntry) return;

    const portionVal = quantitePortion ?? null;

    // Update optimiste
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id
          ? { ...e, quantite_g: quantiteG, quantite_portion: portionVal }
          : e,
      ),
    }));

    // Sync Supabase
    const userId = await getCurrentUserId();
    if (!userId) {
      set((s) => ({
        entries: s.entries.map((e) =>
          e.id === id
            ? {
                ...e,
                quantite_g: oldEntry.quantite_g,
                quantite_portion: oldEntry.quantite_portion,
              }
            : e,
        ),
      }));
      return;
    }
    const { error } = await getSupabase()
      .from("nutrition_entries")
      .update({ quantite_g: quantiteG, quantite_portion: portionVal })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      set((s) => ({
        entries: s.entries.map((e) =>
          e.id === id
            ? {
                ...e,
                quantite_g: oldEntry.quantite_g,
                quantite_portion: oldEntry.quantite_portion,
              }
            : e,
        ),
      }));
    } else {
      revalidateDashboard().catch(() => {});
    }
  },

  removeEntry: async (id: string) => {
    // Capturer l'entrée + l'id de l'entrée suivante pour rollback stable
    const entries = get().entries;
    const removedIndex = entries.findIndex((e) => e.id === id);
    const removedEntry = removedIndex >= 0 ? entries[removedIndex] : null;
    const nextEntryId =
      removedIndex >= 0 && removedIndex < entries.length - 1
        ? entries[removedIndex + 1].id
        : null;

    // 1. Suppression optimiste immédiate
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
    }));

    // 2. Sync Supabase
    const userId = await getCurrentUserId();
    if (!userId) return;

    const { error } = await getSupabase()
      .from("nutrition_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error && removedEntry) {
      // Rollback : réinsérer avant l'entrée qui suivait (par id, pas par index)
      set((s) => {
        const copy = [...s.entries];
        const insertAt = nextEntryId
          ? copy.findIndex((e) => e.id === nextEntryId)
          : -1;
        if (insertAt >= 0) {
          copy.splice(insertAt, 0, removedEntry);
        } else {
          copy.push(removedEntry);
        }
        return { entries: copy };
      });
    } else {
      revalidateDashboard().catch(() => {});
    }
  },

  updateAlimentInEntries: (alimentId, aliment) => {
    set((s) => ({
      entries: s.entries.map((e) =>
        e.aliment?.id === alimentId ? { ...e, aliment } : e,
      ),
    }));
  },

  setEntries: (entries) => set({ entries }),
  reset: () => {
    _supabase = null;
    cachedUserId = null;
    set({
      entries: [],
      profile: DEFAULT_PROFILE,
      date: "",
      isLoading: false,
      hasFetched: false,
    });
  },
}));
