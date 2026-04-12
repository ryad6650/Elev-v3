import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware, type ServerUser } from "@/lib/supabase/user";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function withAuthUser(): Promise<{
  supabase: SupabaseClient<Database>;
  user: ServerUser;
}> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");
  return { supabase, user };
}
