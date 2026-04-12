"use server";

import { withAuthUser } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export async function saveSommeil(date: string, dureeMinutes: number) {
  const { supabase, user } = await withAuthUser();

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
  const { supabase, user } = await withAuthUser();

  const { error } = await supabase
    .from("sommeil")
    .delete()
    .eq("user_id", user.id)
    .eq("date", date);

  if (error) throw error;
  revalidatePath("/dashboard");
}
