export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          id: string
          metadata: Json | null
          record_id: string | null
          record_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          record_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          record_type?: string | null
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_text: string
          consent_type: string
          created_at: string
          given: boolean
          id: string
          user_id: string
        }
        Insert: {
          consent_text: string
          consent_type: string
          created_at?: string
          given?: boolean
          id?: string
          user_id: string
        }
        Update: {
          consent_text?: string
          consent_type?: string
          created_at?: string
          given?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          audio_duration_seconds: number | null
          audio_url: string | null
          consultation_date: string
          created_at: string
          diagnosis: string | null
          doctor_id: string
          doctor_notes: string | null
          id: string
          is_completed: boolean | null
          notes_private: boolean | null
          patient_id: string
          summary_detailed: string | null
          summary_en: Json | null
          summary_fr: Json | null
          summary_nl: Json | null
          summary_simple: string | null
          summary_technical: string | null
          transcript: string | null
          transcript_style:
            | Database["public"]["Enums"]["transcript_style"]
            | null
          updated_at: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          consultation_date?: string
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          doctor_notes?: string | null
          id?: string
          is_completed?: boolean | null
          notes_private?: boolean | null
          patient_id: string
          summary_detailed?: string | null
          summary_en?: Json | null
          summary_fr?: Json | null
          summary_nl?: Json | null
          summary_simple?: string | null
          summary_technical?: string | null
          transcript?: string | null
          transcript_style?:
            | Database["public"]["Enums"]["transcript_style"]
            | null
          updated_at?: string
        }
        Update: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          consultation_date?: string
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          id?: string
          is_completed?: boolean | null
          notes_private?: boolean | null
          patient_id?: string
          summary_detailed?: string | null
          summary_en?: Json | null
          summary_fr?: Json | null
          summary_nl?: Json | null
          summary_simple?: string | null
          summary_technical?: string | null
          transcript?: string | null
          transcript_style?:
            | Database["public"]["Enums"]["transcript_style"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          first_name: string
          house_number: string | null
          id: string
          last_name: string
          phone: string | null
          postal_code: string | null
          practice_name: string | null
          riziv_number: string | null
          street: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          house_number?: string | null
          id?: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          practice_name?: string | null
          riziv_number?: string | null
          street?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          house_number?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          practice_name?: string | null
          riziv_number?: string | null
          street?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medication_items: {
        Row: {
          consultation_id: string
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          is_repeatable: boolean | null
          name: string
          pushed_to_patient: boolean | null
          quantity_suggested: number | null
        }
        Insert: {
          consultation_id: string
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_repeatable?: boolean | null
          name: string
          pushed_to_patient?: boolean | null
          quantity_suggested?: number | null
        }
        Update: {
          consultation_id?: string
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          is_repeatable?: boolean | null
          name?: string
          pushed_to_patient?: boolean | null
          quantity_suggested?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_items_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          dosage: string | null
          id: string
          medication_item_id: string | null
          name: string
          order_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          id?: string
          medication_item_id?: string | null
          name: string
          order_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          dosage?: string | null
          id?: string
          medication_item_id?: string | null
          name?: string
          order_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_medication_item_id_fkey"
            columns: ["medication_item_id"]
            isOneToOne: false
            referencedRelation: "medication_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_box: string | null
          delivery_city: string | null
          delivery_country: string | null
          delivery_house_number: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_postal_code: string | null
          delivery_street: string | null
          email_notifications: boolean | null
          id: string
          patient_id: string
          pharmacy_id: string | null
          sms_notifications: boolean | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_box?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_house_number?: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          delivery_postal_code?: string | null
          delivery_street?: string | null
          email_notifications?: boolean | null
          id?: string
          patient_id: string
          pharmacy_id?: string | null
          sms_notifications?: boolean | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_box?: string | null
          delivery_city?: string | null
          delivery_country?: string | null
          delivery_house_number?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          delivery_postal_code?: string | null
          delivery_street?: string | null
          email_notifications?: boolean | null
          id?: string
          patient_id?: string
          pharmacy_id?: string | null
          sms_notifications?: boolean | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          house_number: string | null
          id: string
          name: string
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          street: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          house_number?: string | null
          id?: string
          name: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          street?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          house_number?: string | null
          id?: string
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          street?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          box: string | null
          city: string | null
          country: string | null
          created_at: string
          first_name: string
          gp_id: string | null
          house_number: string | null
          id: string
          last_name: string
          phone: string | null
          postal_code: string | null
          preferred_language: Database["public"]["Enums"]["language_code"]
          street: string | null
          updated_at: string
          view_style: Database["public"]["Enums"]["view_style"]
        }
        Insert: {
          box?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name: string
          gp_id?: string | null
          house_number?: string | null
          id: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          street?: string | null
          updated_at?: string
          view_style?: Database["public"]["Enums"]["view_style"]
        }
        Update: {
          box?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string
          gp_id?: string | null
          house_number?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          street?: string | null
          updated_at?: string
          view_style?: Database["public"]["Enums"]["view_style"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_gp_id_fkey"
            columns: ["gp_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_initial_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin" | "pharmacy_partner"
      delivery_method: "pickup" | "home_delivery"
      language_code: "nl" | "fr" | "en"
      order_status:
        | "sent_to_pharmacy"
        | "processing"
        | "ready"
        | "shipped"
        | "delivered"
      transcript_style: "short" | "standard" | "extended"
      view_style: "simple" | "detailed" | "technical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "doctor", "admin", "pharmacy_partner"],
      delivery_method: ["pickup", "home_delivery"],
      language_code: ["nl", "fr", "en"],
      order_status: [
        "sent_to_pharmacy",
        "processing",
        "ready",
        "shipped",
        "delivered",
      ],
      transcript_style: ["short", "standard", "extended"],
      view_style: ["simple", "detailed", "technical"],
    },
  },
} as const
