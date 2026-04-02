export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      aliments: {
        Row: {
          calories: number;
          code_barres: string | null;
          fibres: number | null;
          glucides: number | null;
          id: string;
          is_global: boolean | null;
          lipides: number | null;
          marque: string | null;
          nom: string;
          portion_nom: string | null;
          proteines: number | null;
          sel: number | null;
          sucres: number | null;
          taille_portion_g: number | null;
          user_id: string | null;
        };
        Insert: {
          calories: number;
          code_barres?: string | null;
          fibres?: number | null;
          glucides?: number | null;
          id?: string;
          is_global?: boolean | null;
          lipides?: number | null;
          marque?: string | null;
          nom: string;
          portion_nom?: string | null;
          proteines?: number | null;
          sel?: number | null;
          sucres?: number | null;
          taille_portion_g?: number | null;
          user_id?: string | null;
        };
        Update: {
          calories?: number;
          code_barres?: string | null;
          fibres?: number | null;
          glucides?: number | null;
          id?: string;
          is_global?: boolean | null;
          lipides?: number | null;
          marque?: string | null;
          nom?: string;
          portion_nom?: string | null;
          proteines?: number | null;
          sel?: number | null;
          sucres?: number | null;
          taille_portion_g?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "aliments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          equipement: string | null;
          gif_url: string | null;
          groupe_musculaire: string;
          id: string;
          is_global: boolean | null;
          nom: string;
          user_id: string | null;
        };
        Insert: {
          equipement?: string | null;
          gif_url?: string | null;
          groupe_musculaire: string;
          id?: string;
          is_global?: boolean | null;
          nom: string;
          user_id?: string | null;
        };
        Update: {
          equipement?: string | null;
          gif_url?: string | null;
          groupe_musculaire?: string;
          id?: string;
          is_global?: boolean | null;
          nom?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      mensurations: {
        Row: {
          bras: number | null;
          cou: number | null;
          cuisse: number | null;
          hanches: number | null;
          id: string;
          mollet: number | null;
          poitrine: number | null;
          tour_taille: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bras?: number | null;
          cou?: number | null;
          cuisse?: number | null;
          hanches?: number | null;
          id?: string;
          mollet?: number | null;
          poitrine?: number | null;
          tour_taille?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bras?: number | null;
          cou?: number | null;
          cuisse?: number | null;
          hanches?: number | null;
          id?: string;
          mollet?: number | null;
          poitrine?: number | null;
          tour_taille?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      nutrition_entries: {
        Row: {
          aliment_id: string;
          date: string | null;
          id: string;
          meal_number: number;
          meal_time: string;
          quantite_g: number;
          user_id: string;
        };
        Insert: {
          aliment_id: string;
          date?: string | null;
          id?: string;
          meal_number: number;
          meal_time: string;
          quantite_g: number;
          user_id: string;
        };
        Update: {
          aliment_id?: string;
          date?: string | null;
          id?: string;
          meal_number?: number;
          meal_time?: string;
          quantite_g?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nutrition_entries_aliment_id_fkey";
            columns: ["aliment_id"];
            isOneToOne: false;
            referencedRelation: "aliments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nutrition_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      poids_history: {
        Row: {
          date: string | null;
          id: string;
          poids: number;
          user_id: string;
        };
        Insert: {
          date?: string | null;
          id?: string;
          poids: number;
          user_id: string;
        };
        Update: {
          date?: string | null;
          id?: string;
          poids?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poids_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          derniere_connexion: string | null;
          id: string;
          objectif_calories: number | null;
          objectif_glucides: number | null;
          objectif_lipides: number | null;
          objectif_proteines: number | null;
          photo_url: string | null;
          poids: number | null;
          prenom: string | null;
          programme_actif_debut: string | null;
          programme_actif_id: string | null;
          streak_connexions: number;
          taille: number | null;
          theme: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          derniere_connexion?: string | null;
          id: string;
          objectif_calories?: number | null;
          objectif_glucides?: number | null;
          objectif_lipides?: number | null;
          objectif_proteines?: number | null;
          photo_url?: string | null;
          poids?: number | null;
          prenom?: string | null;
          programme_actif_debut?: string | null;
          programme_actif_id?: string | null;
          streak_connexions?: number;
          taille?: number | null;
          theme?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          derniere_connexion?: string | null;
          id?: string;
          objectif_calories?: number | null;
          objectif_glucides?: number | null;
          objectif_lipides?: number | null;
          objectif_proteines?: number | null;
          photo_url?: string | null;
          poids?: number | null;
          prenom?: string | null;
          programme_actif_debut?: string | null;
          programme_actif_id?: string | null;
          streak_connexions?: number;
          taille?: number | null;
          theme?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_programme_actif_id_fkey";
            columns: ["programme_actif_id"];
            isOneToOne: false;
            referencedRelation: "programmes";
            referencedColumns: ["id"];
          },
        ];
      };
      programme_routines: {
        Row: {
          id: string;
          jour: number;
          programme_id: string;
          routine_id: string;
        };
        Insert: {
          id?: string;
          jour: number;
          programme_id: string;
          routine_id: string;
        };
        Update: {
          id?: string;
          jour?: number;
          programme_id?: string;
          routine_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "programme_routines_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "programmes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "programme_routines_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
      programmes: {
        Row: {
          created_at: string | null;
          description: string | null;
          difficulte: string | null;
          duree_semaines: number | null;
          id: string;
          jours: number[] | null;
          nom: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          difficulte?: string | null;
          duree_semaines?: number | null;
          id?: string;
          jours?: number[] | null;
          nom: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          difficulte?: string | null;
          duree_semaines?: number | null;
          id?: string;
          jours?: number[] | null;
          nom?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      routine_exercises: {
        Row: {
          exercise_id: string;
          id: string;
          ordre: number;
          reps_cible: number | null;
          reps_cible_max: number | null;
          routine_id: string;
          series_cible: number | null;
        };
        Insert: {
          exercise_id: string;
          id?: string;
          ordre: number;
          reps_cible?: number | null;
          reps_cible_max?: number | null;
          routine_id: string;
          series_cible?: number | null;
        };
        Update: {
          exercise_id?: string;
          id?: string;
          ordre?: number;
          reps_cible?: number | null;
          reps_cible_max?: number | null;
          routine_id?: string;
          series_cible?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
      routines: {
        Row: {
          created_at: string | null;
          id: string;
          jours: string[] | null;
          nom: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          jours?: string[] | null;
          nom: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          jours?: string[] | null;
          nom?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "routines_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sommeil: {
        Row: {
          created_at: string | null;
          date: string;
          duree_minutes: number;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          duree_minutes: number;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          duree_minutes?: number;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_exercise_rest: {
        Row: {
          exercise_id: string;
          rest_duration: number;
          user_id: string;
        };
        Insert: {
          exercise_id: string;
          rest_duration: number;
          user_id: string;
        };
        Update: {
          exercise_id?: string;
          rest_duration?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_exercise_rest_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_exercise_rest_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_sets: {
        Row: {
          completed: boolean | null;
          exercise_id: string;
          id: string;
          numero_serie: number | null;
          ordre_exercice: number | null;
          poids: number | null;
          reps: number | null;
          workout_id: string;
        };
        Insert: {
          completed?: boolean | null;
          exercise_id: string;
          id?: string;
          numero_serie?: number | null;
          ordre_exercice?: number | null;
          poids?: number | null;
          reps?: number | null;
          workout_id: string;
        };
        Update: {
          completed?: boolean | null;
          exercise_id?: string;
          id?: string;
          numero_serie?: number | null;
          ordre_exercice?: number | null;
          poids?: number | null;
          reps?: number | null;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sets_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: {
          created_at: string | null;
          date: string | null;
          duree_minutes: number | null;
          id: string;
          notes: string | null;
          routine_id: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          date?: string | null;
          duree_minutes?: number | null;
          id?: string;
          notes?: string | null;
          routine_id?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          date?: string | null;
          duree_minutes?: number | null;
          id?: string;
          notes?: string | null;
          routine_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workouts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_aliments: {
        Args: { max_results?: number; search_query: string; user_uuid: string };
        Returns: {
          calories: number;
          code_barres: string;
          fibres: number;
          glucides: number;
          id: string;
          is_global: boolean;
          lipides: number;
          marque: string;
          match_rank: number;
          nom: string;
          proteines: number;
          sel: number;
          sucres: number;
          usage_count: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
