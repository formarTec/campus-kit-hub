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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      buildings: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      computer_licenses: {
        Row: {
          computer_id: string
          id: string
          license_id: string
        }
        Insert: {
          computer_id: string
          id?: string
          license_id: string
        }
        Update: {
          computer_id?: string
          id?: string
          license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "computer_licenses_computer_id_fkey"
            columns: ["computer_id"]
            isOneToOne: false
            referencedRelation: "computers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "computer_licenses_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      computers: {
        Row: {
          acquisition_type: string | null
          building_id: string | null
          created_at: string
          hardware_specs: string | null
          id: string
          ip_address: string | null
          location: string | null
          name: string
          software_specs: string | null
          updated_at: string
        }
        Insert: {
          acquisition_type?: string | null
          building_id?: string | null
          created_at?: string
          hardware_specs?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          name: string
          software_specs?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_type?: string | null
          building_id?: string | null
          created_at?: string
          hardware_specs?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          name?: string
          software_specs?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "computers_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_day: number | null
          grace_period_days: number | null
          id: string
          start_date: string | null
          supplier_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_day?: number | null
          grace_period_days?: number | null
          id?: string
          start_date?: string | null
          supplier_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_day?: number | null
          grace_period_days?: number | null
          id?: string
          start_date?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      instrument_loans: {
        Row: {
          actual_return: string | null
          created_at: string
          expected_return: string | null
          id: string
          instrument_id: string
          loan_date: string
          notes: string | null
          student_contact: string | null
          student_name: string
        }
        Insert: {
          actual_return?: string | null
          created_at?: string
          expected_return?: string | null
          id?: string
          instrument_id: string
          loan_date?: string
          notes?: string | null
          student_contact?: string | null
          student_name: string
        }
        Update: {
          actual_return?: string | null
          created_at?: string
          expected_return?: string | null
          id?: string
          instrument_id?: string
          loan_date?: string
          notes?: string | null
          student_contact?: string | null
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "instrument_loans_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      instruments: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          model: string | null
          name: string
          notes: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["instrument_status"]
          type: Database["public"]["Enums"]["instrument_type"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          model?: string | null
          name: string
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["instrument_status"]
          type?: Database["public"]["Enums"]["instrument_type"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          model?: string | null
          name?: string
          notes?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["instrument_status"]
          type?: Database["public"]["Enums"]["instrument_type"]
          updated_at?: string
        }
        Relationships: []
      }
      license_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          license_key: string | null
          password: string | null
          payment_type: string | null
          purchase_price: number | null
          software_name: string
          supplier_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          license_key?: string | null
          password?: string | null
          payment_type?: string | null
          purchase_price?: number | null
          software_name: string
          supplier_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          license_key?: string | null
          password?: string | null
          payment_type?: string | null
          purchase_price?: number | null
          software_name?: string
          supplier_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "license_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          computer_id: string | null
          created_at: string
          id: string
          instrument_id: string | null
          last_maintenance: string | null
          next_maintenance: string | null
          notes: string | null
        }
        Insert: {
          computer_id?: string | null
          created_at?: string
          id?: string
          instrument_id?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
        }
        Update: {
          computer_id?: string | null
          created_at?: string
          id?: string
          instrument_id?: string | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_computer_id_fkey"
            columns: ["computer_id"]
            isOneToOne: false
            referencedRelation: "computers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          company_name: string
          contacts: string | null
          contract_url: string | null
          created_at: string
          document: string | null
          id: string
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contacts?: string | null
          contract_url?: string | null
          created_at?: string
          document?: string | null
          id?: string
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contacts?: string | null
          contract_url?: string | null
          created_at?: string
          document?: string | null
          id?: string
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "gestor" | "usuario"
      instrument_status: "disponivel" | "em_uso" | "emprestado" | "manutencao"
      instrument_type:
        | "instrumento"
        | "microfone"
        | "caixa_de_som"
        | "mesa_de_som"
        | "outro"
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
      app_role: ["superadmin", "admin", "gestor", "usuario"],
      instrument_status: ["disponivel", "em_uso", "emprestado", "manutencao"],
      instrument_type: [
        "instrumento",
        "microfone",
        "caixa_de_som",
        "mesa_de_som",
        "outro",
      ],
    },
  },
} as const
