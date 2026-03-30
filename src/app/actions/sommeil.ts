"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSommeil(date: string, dureeMinutes: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("sommeil")
    .upsert(
      { user_id: user.id, date, duree_minutes: dureeMinutes },
      { onConflict: "user_id,date" }
    );

  if (error) throw error;
  revalidatePath("/dashboard");
}

export async function deleteSommeil(date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("sommeil")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) throw error;
  revalidatePath("/dashboard");
}
