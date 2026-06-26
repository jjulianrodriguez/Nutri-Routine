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
          created_by: string | null;
          description: string | null;
          ends_at: string | null;
          event_type: Database["public"]["Enums"]["appointment_event_type"];
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
          created_by?: string | null;
          description?: string | null;
          ends_at?: string | null;
          event_type?: Database["public"]["Enums"]["appointment_event_type"];
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
          created_by?: string | null;
          description?: string | null;
          ends_at?: string | null;
          event_type?: Database["public"]["Enums"]["appointment_event_type"];
          id?: string;
          professional_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
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
          is_pinned: boolean;
          published: boolean;
          published_at: string | null;
          read_time_minutes: number;
          slug: string;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          category: string;
          content: string;
          created_at?: string;
          excerpt: string;
          id?: string;
          is_pinned?: boolean;
          published?: boolean;
          published_at?: string | null;
          read_time_minutes?: number;
          slug: string;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          category?: string;
          content?: string;
          created_at?: string;
          excerpt?: string;
          id?: string;
          is_pinned?: boolean;
          published?: boolean;
          published_at?: string | null;
          read_time_minutes?: number;
          slug?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
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
      chat_conversations: {
        Row: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at: string;
          id: string;
          last_message_at: string | null;
          last_message_preview: string | null;
          professional_id: string;
          updated_at: string;
        };
        Insert: {
          area: Database["public"]["Enums"]["service_area"];
          client_id: string;
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          professional_id: string;
          updated_at?: string;
        };
        Update: {
          area?: Database["public"]["Enums"]["service_area"];
          client_id?: string;
          created_at?: string;
          id?: string;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          professional_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_conversations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_conversations_professional_id_fkey";
            columns: ["professional_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          deleted_at: string | null;
          delivered_at: string;
          edited_at: string | null;
          id: string;
          read_at: string | null;
          read_by: string | null;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          deleted_at?: string | null;
          delivered_at?: string;
          edited_at?: string | null;
          id?: string;
          read_at?: string | null;
          read_by?: string | null;
          sender_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          deleted_at?: string | null;
          delivered_at?: string;
          edited_at?: string | null;
          id?: string;
          read_at?: string | null;
          read_by?: string | null;
          sender_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "chat_conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_read_by_fkey";
            columns: ["read_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_assignments: {
        Row: {
          active: boolean;
          assigned_by: string;
          client_id: string;
          created_at: string;
          days_of_week: number[];
          end_date: string | null;
          habit_id: string;
          id: string;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          assigned_by: string;
          client_id: string;
          created_at?: string;
          days_of_week?: number[];
          end_date?: string | null;
          habit_id: string;
          id?: string;
          start_date?: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          assigned_by?: string;
          client_id?: string;
          created_at?: string;
          days_of_week?: number[];
          end_date?: string | null;
          habit_id?: string;
          id?: string;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_assignments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_assignments_habit_id_fkey";
            columns: ["habit_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_progress: {
        Row: {
          client_id: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          date: string;
          habit_assignment_id: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          date: string;
          habit_assignment_id: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          date?: string;
          habit_assignment_id?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_progress_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_progress_habit_assignment_id_fkey";
            columns: ["habit_assignment_id"];
            isOneToOne: false;
            referencedRelation: "habit_assignments";
            referencedColumns: ["id"];
          },
        ];
      };
      habits: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habits_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string | null;
          created_at: string;
          destination_path: string;
          event_type: string;
          id: string;
          message: string;
          metadata: Json;
          read_at: string | null;
          recipient_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          destination_path: string;
          event_type: string;
          id?: string;
          message: string;
          metadata?: Json;
          read_at?: string | null;
          recipient_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          destination_path?: string;
          event_type?: string;
          id?: string;
          message?: string;
          metadata?: Json;
          read_at?: string | null;
          recipient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_settings: {
        Row: {
          allow_assigned_professionals_health_data: boolean;
          allow_assigned_professionals_personal_info: boolean;
          allow_assigned_professionals_sensitive_notes: boolean;
          created_at: string;
          notifications_enabled: boolean;
          notify_appointments: boolean;
          notify_assignments: boolean;
          notify_messages: boolean;
          notify_plan_changes: boolean;
          profile_id: string;
          reduced_motion: boolean;
          text_size: string;
          theme: string;
          time_format: string;
          updated_at: string;
        };
        Insert: {
          allow_assigned_professionals_health_data?: boolean;
          allow_assigned_professionals_personal_info?: boolean;
          allow_assigned_professionals_sensitive_notes?: boolean;
          created_at?: string;
          notifications_enabled?: boolean;
          notify_appointments?: boolean;
          notify_assignments?: boolean;
          notify_messages?: boolean;
          notify_plan_changes?: boolean;
          profile_id: string;
          reduced_motion?: boolean;
          text_size?: string;
          theme?: string;
          time_format?: string;
          updated_at?: string;
        };
        Update: {
          allow_assigned_professionals_health_data?: boolean;
          allow_assigned_professionals_personal_info?: boolean;
          allow_assigned_professionals_sensitive_notes?: boolean;
          created_at?: string;
          notifications_enabled?: boolean;
          notify_appointments?: boolean;
          notify_assignments?: boolean;
          notify_messages?: boolean;
          notify_plan_changes?: boolean;
          profile_id?: string;
          reduced_motion?: boolean;
          text_size?: string;
          theme?: string;
          time_format?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
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
      exercises: {
        Row: {
          category: string;
          created_at: string;
          created_by: string;
          description: string | null;
          difficulty: string | null;
          exercise_type: string;
          id: string;
          is_active: boolean;
          multimedia_url: string | null;
          multimedia_urls: string[];
          muscle_group: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          created_by: string;
          description?: string | null;
          difficulty?: string | null;
          exercise_type?: string;
          id?: string;
          is_active?: boolean;
          multimedia_url?: string | null;
          multimedia_urls?: string[];
          muscle_group?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          difficulty?: string | null;
          exercise_type?: string;
          id?: string;
          is_active?: boolean;
          multimedia_url?: string | null;
          multimedia_urls?: string[];
          muscle_group?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_profiles: {
        Row: {
          availability_days: string | null;
          availability_note: string | null;
          availability_schedule: string | null;
          bio: string | null;
          certifications: string | null;
          created_at: string;
          experience: string | null;
          focus_areas: string[];
          is_active: boolean;
          professional_links: string | null;
          professional_phone: string | null;
          profile_id: string;
          specialty: Database["public"]["Enums"]["professional_specialty"];
          updated_at: string;
        };
        Insert: {
          availability_days?: string | null;
          availability_note?: string | null;
          availability_schedule?: string | null;
          bio?: string | null;
          certifications?: string | null;
          created_at?: string;
          experience?: string | null;
          focus_areas?: string[];
          is_active?: boolean;
          professional_links?: string | null;
          professional_phone?: string | null;
          profile_id: string;
          specialty: Database["public"]["Enums"]["professional_specialty"];
          updated_at?: string;
        };
        Update: {
          availability_days?: string | null;
          availability_note?: string | null;
          availability_schedule?: string | null;
          bio?: string | null;
          certifications?: string | null;
          created_at?: string;
          experience?: string | null;
          focus_areas?: string[];
          is_active?: boolean;
          professional_links?: string | null;
          professional_phone?: string | null;
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
      nutrition_document_folders: {
        Row: {
          active: boolean;
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nutrition_document_folders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      nutrition_documents: {
        Row: {
          client_id: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          document_type: Database["public"]["Enums"]["nutrition_document_type"];
          file_name: string;
          file_size: number;
          folder_id: string | null;
          id: string;
          mime_type: string;
          status: Database["public"]["Enums"]["nutrition_document_status"];
          storage_path: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          document_type: Database["public"]["Enums"]["nutrition_document_type"];
          file_name: string;
          file_size: number;
          folder_id?: string | null;
          id?: string;
          mime_type: string;
          status?: Database["public"]["Enums"]["nutrition_document_status"];
          storage_path: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          document_type?: Database["public"]["Enums"]["nutrition_document_type"];
          file_name?: string;
          file_size?: number;
          folder_id?: string | null;
          id?: string;
          mime_type?: string;
          status?: Database["public"]["Enums"]["nutrition_document_status"];
          storage_path?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nutrition_documents_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nutrition_documents_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nutrition_documents_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "nutrition_document_folders";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_personal_details: {
        Row: {
          allergies: string | null;
          birth_date: string | null;
          body_fat_percentage: number | null;
          body_measurements: string | null;
          created_at: string;
          dietary_restrictions: string | null;
          gender: string | null;
          gender_description: string | null;
          height_cm: number | null;
          important_medications: string | null;
          injuries: string | null;
          medical_conditions: string | null;
          phone: string | null;
          professional_notes: string | null;
          profile_id: string;
          updated_at: string;
          weight_kg: number | null;
        };
        Insert: {
          allergies?: string | null;
          birth_date?: string | null;
          body_fat_percentage?: number | null;
          body_measurements?: string | null;
          created_at?: string;
          dietary_restrictions?: string | null;
          gender?: string | null;
          gender_description?: string | null;
          height_cm?: number | null;
          important_medications?: string | null;
          injuries?: string | null;
          medical_conditions?: string | null;
          phone?: string | null;
          professional_notes?: string | null;
          profile_id: string;
          updated_at?: string;
          weight_kg?: number | null;
        };
        Update: {
          allergies?: string | null;
          birth_date?: string | null;
          body_fat_percentage?: number | null;
          body_measurements?: string | null;
          created_at?: string;
          dietary_restrictions?: string | null;
          gender?: string | null;
          gender_description?: string | null;
          height_cm?: number | null;
          important_medications?: string | null;
          injuries?: string | null;
          medical_conditions?: string | null;
          phone?: string | null;
          professional_notes?: string | null;
          profile_id?: string;
          updated_at?: string;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_personal_details_profile_id_fkey";
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
      routine_exercises: {
        Row: {
          created_at: string;
          duration_minutes: number | null;
          exercise_id: string;
          id: string;
          notes: string | null;
          position: number;
          repetitions: string | null;
          rest_seconds: number | null;
          routine_id: string;
          series: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes?: number | null;
          exercise_id: string;
          id?: string;
          notes?: string | null;
          position: number;
          repetitions?: string | null;
          rest_seconds?: number | null;
          routine_id: string;
          series?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number | null;
          exercise_id?: string;
          id?: string;
          notes?: string | null;
          position?: number;
          repetitions?: string | null;
          rest_seconds?: number | null;
          routine_id?: string;
          series?: number | null;
          updated_at?: string;
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
          category: string;
          created_at: string;
          creator_id: string;
          description: string;
          difficulty: string;
          id: string;
          identifier: string | null;
          is_active: boolean;
          name: string;
          target_audience: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          creator_id: string;
          description: string;
          difficulty: string;
          id?: string;
          identifier?: string | null;
          is_active?: boolean;
          name: string;
          target_audience: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          creator_id?: string;
          description?: string;
          difficulty?: string;
          id?: string;
          identifier?: string | null;
          is_active?: boolean;
          name?: string;
          target_audience?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "routines_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_template_days: {
        Row: {
          created_at: string;
          day_number: number;
          id: string;
          routine_id: string;
          template_id: string;
          updated_at: string;
          weekday: string | null;
        };
        Insert: {
          created_at?: string;
          day_number: number;
          id?: string;
          routine_id: string;
          template_id: string;
          updated_at?: string;
          weekday?: string | null;
        };
        Update: {
          created_at?: string;
          day_number?: number;
          id?: string;
          routine_id?: string;
          template_id?: string;
          updated_at?: string;
          weekday?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_template_days_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_template_days_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_templates: {
        Row: {
          created_at: string;
          creator_id: string;
          cycle_days: number;
          description: string | null;
          id: string;
          identifier: string | null;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          creator_id: string;
          cycle_days: number;
          description?: string | null;
          id?: string;
          identifier?: string | null;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string;
          cycle_days?: number;
          description?: string | null;
          id?: string;
          identifier?: string | null;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_templates_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_day_progress: {
        Row: {
          client_id: string;
          completed_at: string | null;
          completed_exercise_ids: string[];
          created_at: string;
          cycle_day: number;
          id: string;
          updated_at: string;
          workout_date: string;
          workout_plan_id: string;
        };
        Insert: {
          client_id: string;
          completed_at?: string | null;
          completed_exercise_ids?: string[];
          created_at?: string;
          cycle_day: number;
          id?: string;
          updated_at?: string;
          workout_date: string;
          workout_plan_id: string;
        };
        Update: {
          client_id?: string;
          completed_at?: string | null;
          completed_exercise_ids?: string[];
          created_at?: string;
          cycle_day?: number;
          id?: string;
          updated_at?: string;
          workout_date?: string;
          workout_plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_day_progress_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_day_progress_workout_plan_id_fkey";
            columns: ["workout_plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_plans: {
        Row: {
          client_id: string;
          created_at: string;
          description: string | null;
          duration_weeks: number | null;
          end_date: string | null;
          id: string;
          routine_id: string | null;
          routine_snapshot: Json | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["plan_status"];
          template_id: string | null;
          template_snapshot: Json | null;
          title: string;
          trainer_id: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          description?: string | null;
          duration_weeks?: number | null;
          end_date?: string | null;
          id?: string;
          routine_id?: string | null;
          routine_snapshot?: Json | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          template_id?: string | null;
          template_snapshot?: Json | null;
          title: string;
          trainer_id: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          description?: string | null;
          duration_weeks?: number | null;
          end_date?: string | null;
          id?: string;
          routine_id?: string | null;
          routine_snapshot?: Json | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          template_id?: string | null;
          template_snapshot?: Json | null;
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
          {
            foreignKeyName: "workout_plans_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "workout_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_plans_routine_id_fkey";
            columns: ["routine_id"];
            isOneToOne: false;
            referencedRelation: "routines";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_workout_template_to_client: {
        Args: {
          p_client_id: string;
          p_duration_weeks: number;
          p_start_date?: string;
          p_template_id: string;
        };
        Returns: string;
      };
      assign_routine_to_client: {
        Args: {
          p_client_id: string;
          p_duration_weeks: number;
          p_routine_id: string;
          p_start_date?: string;
        };
        Returns: string;
      };
      ensure_chat_conversation: {
        Args: {
          p_area: Database["public"]["Enums"]["service_area"];
          p_client_id: string;
          p_professional_id: string;
        };
        Returns: string;
      };
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
      mark_all_notifications_read: {
        Args: never;
        Returns: number;
      };
      mark_chat_conversation_read: {
        Args: {
          p_conversation_id: string;
        };
        Returns: number;
      };
      delete_chat_message: {
        Args: {
          p_message_id: string;
        };
        Returns: string;
      };
      mark_notification_read: {
        Args: {
          p_notification_id: string;
        };
        Returns: string;
      };
      list_manageable_workout_template_identifiers: {
        Args: never;
        Returns: {
          id: string;
          identifier: string | null;
        }[];
      };
      send_chat_message: {
        Args: {
          p_body: string;
          p_conversation_id: string;
        };
        Returns: string;
      };
      update_chat_message: {
        Args: {
          p_body: string;
          p_message_id: string;
        };
        Returns: string;
      };
      save_routine: {
        Args: {
          p_category: string;
          p_description: string;
          p_difficulty: string;
          p_exercises: Json;
          p_is_active: boolean;
          p_name: string;
          p_routine_id: string | null;
          p_target_audience: string;
        };
        Returns: string;
      };
      save_workout_template: {
        Args: {
          p_cycle_days: number;
          p_days: Json;
          p_description: string;
          p_identifier: string;
          p_is_active: boolean;
          p_name: string;
          p_template_id: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      appointment_event_type:
        | "appointment"
        | "follow_up"
        | "reminder"
        | "review"
        | "progress_check"
        | "consultation"
        | "other";
      appointment_status: "scheduled" | "completed" | "cancelled";
      nutrition_document_status: "active" | "inactive";
      nutrition_document_type: "meal_plan" | "educational_library";
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
      appointment_event_type: [
        "appointment",
        "follow_up",
        "reminder",
        "review",
        "progress_check",
        "consultation",
        "other",
      ],
      appointment_status: ["scheduled", "completed", "cancelled"],
      plan_status: ["draft", "active", "archived"],
      professional_specialty: ["nutrition", "training", "both"],
      profile_role: ["professional", "client", "admin"],
      service_area: ["nutrition", "training", "general"],
    },
  },
} as const;
