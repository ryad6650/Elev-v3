import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockFrom = vi.fn((table: string) => {
  if (table === "nutrition_entries") {
    return {
      insert: mockInsert,
      delete: () => ({
        eq: () => ({
          eq: mockDelete,
        }),
      }),
    };
  }
  return {};
});

const mockSupabase = { from: mockFrom };
const mockUser = { id: "user-123" };

vi.mock("@/lib/supabase/auth", () => ({
  withAuthUser: vi.fn(() =>
    Promise.resolve({ supabase: mockSupabase, user: mockUser }),
  ),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Stub pour éviter l'erreur "server only"
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/user", () => ({
  getUserFromMiddleware: vi.fn(),
}));
vi.mock("@/lib/supabase/guard", () => ({
  guardSupabase: vi.fn(),
}));

import {
  addNutritionEntry,
  deleteNutritionEntry,
} from "@/app/actions/nutrition";

describe("addNutritionEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("insère une entrée avec les bonnes données", async () => {
    mockInsert.mockReturnValue({ error: null });

    await addNutritionEntry(1, "aliment-abc", 150, "2025-04-12");

    expect(mockFrom).toHaveBeenCalledWith("nutrition_entries");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        meal_number: 1,
        aliment_id: "aliment-abc",
        quantite_g: 150,
        date: "2025-04-12",
      }),
    );
  });

  it("throw si Supabase retourne une erreur", async () => {
    mockInsert.mockReturnValue({
      error: { message: "Constraint violation" },
    });

    await expect(
      addNutritionEntry(1, "aliment-abc", 100, "2025-04-12"),
    ).rejects.toThrow("Constraint violation");
  });
});

describe("deleteNutritionEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("supprime l'entrée par id et user_id", async () => {
    mockDelete.mockReturnValue({ error: null });

    await deleteNutritionEntry("entry-456");

    expect(mockFrom).toHaveBeenCalledWith("nutrition_entries");
  });

  it("throw si Supabase retourne une erreur", async () => {
    mockDelete.mockReturnValue({
      error: { message: "Not found" },
    });

    await expect(deleteNutritionEntry("bad-id")).rejects.toThrow("Not found");
  });
});
