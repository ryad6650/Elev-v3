import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ProgrammeRoutine {
  jour: number;
  label: string;
  routine_id: string;
  nom: string;
  nbExercices: number;
}

export interface Programme {
  id: string;
  nom: string;
  description: string | null;
  difficulte: 'debutant' | 'intermediaire' | 'avance';
  duree_semaines: number;
  jours: number[];
  routines: ProgrammeRoutine[];
  progres?: { semaine_actuelle: number; total_semaines: number };
}

export interface ProgrammesPageData {
  programmes: Programme[];
  programmeActif: Programme | null;
  routinesDisponibles: { id: string; nom: string }[];
}

const JOURS_NOMS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

type RoutineRaw = { id: string; nom: string; routine_exercises: { id: string }[] } | null;
type ProgRoutineRaw = { jour: number; routines: RoutineRaw };
type ProgrammeRaw = {
  id: string;
  nom: string;
  description: string | null;
  difficulte: string | null;
  duree_semaines: number | null;
  jours: number[] | null;
  programme_routines: ProgRoutineRaw[];
};

function parseProgramme(p: ProgrammeRaw): Programme {
  return {
    id: p.id,
    nom: p.nom,
    description: p.description,
    difficulte: (p.difficulte as Programme['difficulte']) ?? 'intermediaire',
    duree_semaines: p.duree_semaines ?? 8,
    jours: p.jours ?? [],
    routines: (p.programme_routines ?? [])
      .map((pr) => ({
        jour: pr.jour,
        label: JOURS_NOMS[pr.jour] ?? `Jour ${pr.jour + 1}`,
        routine_id: pr.routines?.id ?? '',
        nom: pr.routines?.nom ?? 'Routine',
        nbExercices: pr.routines?.routine_exercises?.length ?? 0,
      }))
      .sort((a, b) => a.jour - b.jour),
  };
}

export async function fetchProgrammesData(supabase: SupabaseClient<Database>): Promise<ProgrammesPageData> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const [profileRes, programmesRes, routinesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('programme_actif_id, programme_actif_debut')
      .eq('id', user.id)
      .single(),
    supabase
      .from('programmes')
      .select('id, nom, description, difficulte, duree_semaines, jours, programme_routines(jour, routines(id, nom, routine_exercises(id)))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('routines')
      .select('id, nom')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const rawProgrammes = (programmesRes.data ?? []) as unknown as ProgrammeRaw[];
  const programmes = rawProgrammes.map(parseProgramme);

  const profile = profileRes.data;
  let programmeActif: Programme | null = null;

  if (profile?.programme_actif_id) {
    const found = programmes.find((p) => p.id === profile.programme_actif_id) ?? null;
    if (found) {
      let progres: Programme['progres'] | undefined;
      if (profile.programme_actif_debut) {
        const diffDays = Math.floor(
          (Date.now() - new Date(profile.programme_actif_debut).getTime()) / 86400000
        );
        progres = {
          semaine_actuelle: Math.min(Math.floor(diffDays / 7) + 1, found.duree_semaines),
          total_semaines: found.duree_semaines,
        };
      }
      programmeActif = { ...found, progres };
    }
  }

  return {
    programmes,
    programmeActif,
    routinesDisponibles: (routinesRes.data ?? []) as { id: string; nom: string }[],
  };
}
