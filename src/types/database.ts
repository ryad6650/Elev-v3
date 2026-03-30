export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          prenom: string | null;
          poids: number | null;
          taille: number | null;
          objectif_calories: number;
          objectif_proteines: number | null;
          objectif_glucides: number | null;
          objectif_lipides: number | null;
          photo_url: string | null;
          theme: "dark" | "light";
          programme_actif_id: string | null;
          programme_actif_debut: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          prenom?: string | null;
          poids?: number | null;
          taille?: number | null;
          objectif_calories?: number;
          objectif_proteines?: number | null;
          objectif_glucides?: number | null;
          objectif_lipides?: number | null;
          photo_url?: string | null;
          theme?: "dark" | "light";
          programme_actif_id?: string | null;
          programme_actif_debut?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      programmes: {
        Row: {
          id: string;
          user_id: string;
          nom: string;
          description: string | null;
          difficulte: string;
          duree_semaines: number;
          jours: number[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nom: string;
          description?: string | null;
          difficulte?: string;
          duree_semaines?: number;
          jours?: number[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programmes"]["Insert"]>;
        Relationships: [];
      };
      programme_routines: {
        Row: {
          id: string;
          programme_id: string;
          routine_id: string;
          jour: number;
        };
        Insert: {
          id?: string;
          programme_id: string;
          routine_id: string;
          jour: number;
        };
        Update: Partial<Database["public"]["Tables"]["programme_routines"]["Insert"]>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          nom: string;
          groupe_musculaire: string;
          equipement: string | null;
          is_global: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nom: string;
          groupe_musculaire: string;
          equipement?: string | null;
          is_global?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          nom: string;
          jours: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nom: string;
          jours?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["routines"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      routine_exercises: {
        Row: {
          id: string;
          routine_id: string;
          exercise_id: string;
          ordre: number;
          series_cible: number;
          reps_cible: number;
          reps_cible_max: number | null;
        };
        Insert: {
          id?: string;
          routine_id: string;
          exercise_id: string;
          ordre: number;
          series_cible?: number;
          reps_cible?: number;
          reps_cible_max?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["routine_exercises"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "routine_exercises_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string | null;
          date: string;
          duree_minutes: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id?: string | null;
          date?: string;
          duree_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workouts_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          }
        ];
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          ordre_exercice: number | null;
          numero_serie: number | null;
          poids: number | null;
          reps: number | null;
          completed: boolean;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          ordre_exercice?: number | null;
          numero_serie?: number | null;
          poids?: number | null;
          reps?: number | null;
          completed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["workout_sets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sets_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      aliments: {
        Row: {
          id: string;
          user_id: string | null;
          nom: string;
          calories: number;
          proteines: number | null;
          glucides: number | null;
          lipides: number | null;
          is_global: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          nom: string;
          calories: number;
          proteines?: number | null;
          glucides?: number | null;
          lipides?: number | null;
          is_global?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["aliments"]["Insert"]>;
        Relationships: [];
      };
      nutrition_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          repas: "petit-dejeuner" | "dejeuner" | "diner" | "snacks";
          aliment_id: string;
          quantite_g: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          repas: "petit-dejeuner" | "dejeuner" | "diner" | "snacks";
          aliment_id: string;
          quantite_g: number;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_entries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "nutrition_entries_aliment_id_fkey";
            columns: ["aliment_id"];
            isOneToOne: false;
            referencedRelation: "aliments";
            referencedColumns: ["id"];
          }
        ];
      };
      poids_history: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          poids: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          poids: number;
        };
        Update: Partial<Database["public"]["Tables"]["poids_history"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
