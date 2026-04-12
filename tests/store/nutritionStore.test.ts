import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock les dépendances du store avant l'import
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => ({ data: { user: null } })) },
    from: vi.fn(),
  })),
}));

vi.mock("@/app/actions/nutrition", () => ({
  revalidateDashboard: vi.fn(),
}));

vi.mock("@/store/toastStore", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { useNutritionStore } from "@/store/nutritionStore";

const DEFAULT_PROFILE = {
  objectif_calories: 2000,
  objectif_proteines: 150,
  objectif_glucides: 250,
  objectif_lipides: 70,
};

describe("nutritionStore", () => {
  beforeEach(() => {
    useNutritionStore.getState().reset();
  });

  it("état initial a des entries vides et le profil par défaut", () => {
    const state = useNutritionStore.getState();
    expect(state.entries).toEqual([]);
    expect(state.profile).toEqual(DEFAULT_PROFILE);
    expect(state.date).toBe("");
    expect(state.isLoading).toBe(false);
    expect(state.hasFetched).toBe(false);
  });

  it("setEntries met à jour les entries", () => {
    const mockEntries = [
      {
        id: "e1",
        meal_number: 1,
        meal_time: "08:00",
        quantite_g: 100,
        quantite_portion: null,
        aliment: {
          id: "a1",
          nom: "Poulet",
          calories: 165,
          proteines: 31,
          glucides: 0,
          lipides: 3.6,
          fibres: null,
          sucres: null,
          sel: null,
          code_barres: null,
        },
      },
    ];

    useNutritionStore.getState().setEntries(mockEntries);
    expect(useNutritionStore.getState().entries).toEqual(mockEntries);
  });

  it("reset remet tout à l'état initial", () => {
    useNutritionStore.setState({
      entries: [
        {
          id: "x",
          meal_number: 1,
          meal_time: "12:00",
          quantite_g: 200,
          quantite_portion: null,
          aliment: {
            id: "a2",
            nom: "Riz",
            calories: 130,
            proteines: 2.7,
            glucides: 28,
            lipides: 0.3,
            fibres: null,
            sucres: null,
            sel: null,
            code_barres: null,
          },
        },
      ],
      date: "2025-04-12",
      isLoading: true,
      hasFetched: true,
    });

    useNutritionStore.getState().reset();
    const state = useNutritionStore.getState();

    expect(state.entries).toEqual([]);
    expect(state.date).toBe("");
    expect(state.isLoading).toBe(false);
    expect(state.hasFetched).toBe(false);
  });

  it("updateAlimentInEntries met à jour l'aliment dans les entries", () => {
    const aliment = {
      id: "a1",
      nom: "Poulet",
      calories: 165,
      proteines: 31,
      glucides: 0,
      lipides: 3.6,
      fibres: null,
      sucres: null,
      sel: null,
      code_barres: null,
    };

    useNutritionStore.setState({
      entries: [
        {
          id: "e1",
          meal_number: 1,
          meal_time: "08:00",
          quantite_g: 100,
          quantite_portion: null,
          aliment,
        },
      ],
    });

    const updatedAliment = { ...aliment, nom: "Poulet grillé", calories: 180 };
    useNutritionStore.getState().updateAlimentInEntries("a1", updatedAliment);

    const entries = useNutritionStore.getState().entries;
    expect(entries[0].aliment.nom).toBe("Poulet grillé");
    expect(entries[0].aliment.calories).toBe(180);
  });
});
