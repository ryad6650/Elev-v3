import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock les dépendances avant l'import
const { mockSupabase, mockGetUser } = vi.hoisted(() => ({
  mockSupabase: { from: vi.fn() },
  mockGetUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock("@/lib/supabase/user", () => ({
  getUserFromMiddleware: mockGetUser,
}));

import { withAuthUser } from "@/lib/supabase/auth";

describe("withAuthUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne { supabase, user } quand authentifié", async () => {
    const fakeUser = { id: "user-123", email: "test@test.com" };
    mockGetUser.mockResolvedValue(fakeUser);

    const result = await withAuthUser();

    expect(result.supabase).toBe(mockSupabase);
    expect(result.user).toBe(fakeUser);
  });

  it('throw "Non authentifié" quand user est null', async () => {
    mockGetUser.mockResolvedValue(null);

    await expect(withAuthUser()).rejects.toThrow("Non authentifié");
  });

  it('throw "Non authentifié" quand user est undefined', async () => {
    mockGetUser.mockResolvedValue(undefined);

    await expect(withAuthUser()).rejects.toThrow("Non authentifié");
  });
});
