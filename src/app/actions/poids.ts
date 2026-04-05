"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";
import type { MensurationsData } from "@/components/poids/MensurationsCard";

export async function upsertPoids(date: string, poids: number): Promise<void> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
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
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
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

export async function saveMensurations(data: MensurationsData): Promise<void> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase.from("mensurations").upsert(
    {
      user_id: user.id,
      cou: data.cou,
      tour_taille: data.tour_taille,
      poitrine: data.poitrine,
      hanches: data.hanches,
      bras: data.bras,
      cuisse: data.cuisse,
      mollet: data.mollet,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/poids");
}
