/**
 * Lève une erreur si la réponse Supabase contient une erreur.
 * Usage : guardSupabase(await supabase.from("x").delete().eq(...))
 */
export function guardSupabase<T>(res: {
  data: T;
  error: { message: string } | null;
}): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
