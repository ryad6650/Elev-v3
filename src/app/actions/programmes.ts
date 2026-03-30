'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateProgrammeInput {
  nom: string;
  description?: string;
  difficulte: string;
  duree_semaines: number | null;
  jours: number[];
  routinesParJour: Record<number, string>; // jour → routine_id
}

export async function createProgramme(input: CreateProgrammeInput): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: programme, error } = await supabase
    .from('programmes')
    .insert({
      user_id: user.id,
      nom: input.nom,
      description: input.description ?? null,
      difficulte: input.difficulte,
      duree_semaines: input.duree_semaines,
      jours: input.jours,
    })
    .select('id')
    .single();

  if (error || !programme) throw new Error(error?.message ?? 'Erreur création programme');

  const lignes = Object.entries(input.routinesParJour)
    .filter(([, rid]) => rid)
    .map(([jour, rid]) => ({
      programme_id: programme.id,
      routine_id: rid,
      jour: parseInt(jour),
    }));

  if (lignes.length > 0) {
    await supabase.from('programme_routines').insert(lignes);
  }

  revalidatePath('/programmes');
}

export async function activerProgramme(programmeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await supabase
    .from('profiles')
    .update({
      programme_actif_id: programmeId,
      programme_actif_debut: new Date().toISOString().split('T')[0],
    })
    .eq('id', user.id);

  revalidatePath('/programmes');
  revalidatePath('/dashboard');
}

export async function desactiverProgramme(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await supabase
    .from('profiles')
    .update({ programme_actif_id: null, programme_actif_debut: null })
    .eq('id', user.id);

  revalidatePath('/programmes');
  revalidatePath('/dashboard');
}

export async function deleteProgramme(programmeId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await supabase.from('programmes').delete().eq('id', programmeId).eq('user_id', user.id);
  revalidatePath('/programmes');
}
