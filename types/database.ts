export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          professional_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          professional_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          professional_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          author_id: string;
          category: string;
          content: string;
          created_at: string;
          excerpt: string;
          id: string;
          published: boolean;
          published_at: string | null;
          read_time_minutes: number;
          slug: string;
          title: string;
        };
        Insert: {
          author_id: string;
          category: string;
          content: string;
          created_at?: string;
          excerpt: string;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          read_time_minutes?: number;
          slug: string;
          title: string;
        };
        Update: {
          author_id?: string;
          category?: string;
          content?: string;
          created_at?: string;
          excerpt?: string;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          read_time_minutes?: number;
          slug?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_profiles: {
        Row: {
          assigned_nutritionist_id: string | null;
          assigned_trainer_id: string | null;
          birth_date: string | null;
          created_at: string;
          gender: string | null;
          notes: string | null;
          phone: string | null;
          profile_id: string;
          updated_at: string;
        };
        Insert: {
          assigned_nutritionist_id?: string | null;
          assigned_trainer_id?: string | null;
          birth_date?: string | null;
          created_at?: string;
          gender?: string | null;
          notes?: string | null;
          phone?: string | null;
          profile_id: string;
          updated_at?: string;
        };
        Update: {
          assigned_nutritionist_id?: string | null;
          assigned_trainer_id?: string | null;
          birth_date?: string | null;
          created_at?: string;
          gender?: string | null;
          notes?: string | null;
          phone?: string | null;
          profile_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_profiles_assigned_nutritionist_id_fkey";
            columns: ["assigned_nutritionist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_profiles_assigned_trainer_id_fkey";
            columns: ["assigned_trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at: string;
          id: string;
          professional_id: string;
          subject: string | null;
          updated_at: string;
        };
        Insert: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at?: string;
          id?: string;
          professional_id: string;
          subject?: string | null;
          updated_at?: string;
        };
        Update: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string;
          created_at?: string;
          id?: string;
          professional_id?: string;
          subject?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      diet_plans: {
        Row: {
          client_id: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          nutritionist_id: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["plan_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          nutritionist_id: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          nutritionist_id?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diet_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diet_plans_nutritionist_id_fkey";
            columns: ["nutritionist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_profiles: {
        Row: {
          bio: string | null;
          created_at: string;
          profile_id: string;
          specialty: Database["public"]["Enums"]["professional_specialty"];
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          profile_id: string;
          specialty: Database["public"]["Enums"]["professional_specialty"];
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          profile_id?: string;
          specialty?: Database["public"]["Enums"]["professional_specialty"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["profile_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      progress_entries: {
        Row: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at: string;
          id: string;
          metric_type: string;
          metric_unit: string | null;
          metric_value: number | null;
          note: string | null;
          recorded_at: string;
          recorded_by: string | null;
          updated_at: string;
        };
        Insert: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at?: string;
          id?: string;
          metric_type: string;
          metric_unit?: string | null;
          metric_value?: number | null;
          note?: string | null;
          recorded_at?: string;
          recorded_by?: string | null;
          updated_at?: string;
        };
        Update: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string;
          created_at?: string;
          id?: string;
          metric_type?: string;
          metric_unit?: string | null;
          metric_value?: number | null;
          note?: string | null;
          recorded_at?: string;
          recorded_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "progress_entries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "progress_entries_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string | null;
          created_at: string;
          description: string | null;
          file_url: string;
          id: string;
          title: string;
          updated_at: string;
          uploaded_by: string;
        };
        Insert: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string | null;
          created_at?: string;
          description?: string | null;
          file_url: string;
          id?: string;
          title: string;
          updated_at?: string;
          uploaded_by: string;
        };
        Update: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string | null;
          created_at?: string;
          description?: string | null;
          file_url?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_plans: {
        Row: {
          client_id: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["plan_status"];
          title: string;
          trainer_id: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title: string;
          trainer_id: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title?: string;
          trainer_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey";
            columns: ["trainer_id"];
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
      has_specialty: {
        Args: {
          required_specialty: Database["public"]["Enums"]["professional_specialty"];
        };
        Returns: boolean;
      };
      is_admin: {
        Args: never;
        Returns: boolean;
      };
      is_client_assigned_to_current_professional: {
        Args: {
          area: Database["public"]["Enums"]["service_area"];
          client_profile_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled";
      plan_status: "draft" | "active" | "archived";
      professional_specialty: "nutrition" | "training" | "both";
      profile_role: "professional" | "client" | "admin";
      service_area: "nutrition" | "training" | "general";
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
    Enums: {
      appointment_status: ["scheduled", "completed", "cancelled"],
      plan_status: ["draft", "active", "archived"],
      professional_specialty: ["nutrition", "training", "both"],
      profile_role: ["professional", "client", "admin"],
      service_area: ["nutrition", "training", "general"],
    },
  },
} as const;
