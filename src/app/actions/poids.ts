"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertPoids(date: string, poids: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: existing } = await supabase
    .from("poids_history")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("poids_history")
      .update({ poids })
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("poids_history")
      .insert({ user_id: user.id, date, poids });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/poids");
  revalidatePath("/dashboard");
}

export async function deletePoids(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("poids_history")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/poids");
  revalidatePath("/dashboard");
}
