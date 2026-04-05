"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";

export async function saveSommeil(date: string, dureeMinutes: number) {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("sommeil")
    .upsert(
      { user_id: user.id, date, duree_minutes: dureeMinutes },
      { onConflict: "user_id,date" },
    );

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function deleteSommeil(date: string) {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("sommeil")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) throw error;
  revalidatePath("/dashboard");
}
