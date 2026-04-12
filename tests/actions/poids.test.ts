import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

const mockFrom = vi.fn(() => ({
  select: () => ({
    eq: () => ({
      eq: () => ({
        maybeSingle: mockMaybeSingle,
      }),
    }),
  }),
  insert: mockInsert,
  update: () => ({
    eq: () => ({
      eq: mockUpdate,
    }),
  }),
}));

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

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/supabase/user", () => ({
  getUserFromMiddleware: vi.fn(),
}));

import { upsertPoids } from "@/app/actions/poids";

describe("upsertPoids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("insère un nouveau poids quand aucun existant", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockInsert.mockReturnValue({ error: null });

    await upsertPoids("2025-04-12", 78.5);

    expect(mockFrom).toHaveBeenCalledWith("poids_history");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        date: "2025-04-12",
        poids: 78.5,
      }),
    );
  });

  it("met à jour le poids quand une entrée existe déjà", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: "existing-id" } });
    mockUpdate.mockReturnValue({ error: null });

    await upsertPoids("2025-04-12", 79.0);

    expect(mockUpdate).toHaveBeenCalled();
  });

  it("throw si Supabase retourne une erreur à l'insertion", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockInsert.mockReturnValue({
      error: { message: "DB error" },
    });

    await expect(upsertPoids("2025-04-12", 80)).rejects.toThrow("DB error");
  });

  it("throw si Supabase retourne une erreur à l'update", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: "existing-id" } });
    mockUpdate.mockReturnValue({
      error: { message: "Update failed" },
    });

    await expect(upsertPoids("2025-04-12", 80)).rejects.toThrow(
      "Update failed",
    );
  });
});
