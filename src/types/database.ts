export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      domains: {
        Row: {
          id: string;
          name: string;
          tld: string;
          full_domain: string;
          buy_now_price: number | null;
          floor_price: number | null;
          landing_page_url: string | null;
          status: "available" | "sold" | "reserved" | "expired";
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tld: string;
          buy_now_price?: number | null;
          floor_price?: number | null;
          landing_page_url?: string | null;
          status?: "available" | "sold" | "reserved" | "expired";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tld?: string;
          buy_now_price?: number | null;
          floor_price?: number | null;
          landing_page_url?: string | null;
          status?: "available" | "sold" | "reserved" | "expired";
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prospects: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          company_name: string | null;
          domain_id: string | null;
          source: string;
          source_details: Json;
          status: "new" | "contacted" | "engaged" | "qualified" | "converted" | "unsubscribed";
          quality_score: number | null;
          timezone: string | null;
          do_not_contact: boolean;
          unsubscribed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          domain_id?: string | null;
          source: string;
          source_details?: Json;
          status?: "new" | "contacted" | "engaged" | "qualified" | "converted" | "unsubscribed";
          quality_score?: number | null;
          timezone?: string | null;
          do_not_contact?: boolean;
          unsubscribed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          domain_id?: string | null;
          source?: string;
          source_details?: Json;
          status?: "new" | "contacted" | "engaged" | "qualified" | "converted" | "unsubscribed";
          quality_score?: number | null;
          timezone?: string | null;
          do_not_contact?: boolean;
          unsubscribed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prospects_domain_id_fkey";
            columns: ["domain_id"];
            isOneToOne: false;
            referencedRelation: "domains";
            referencedColumns: ["id"];
          }
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: "email" | "voicemail" | "multi_channel";
          status: "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";
          schedule_config: Json;
          steps: Json;
          target_criteria: Json;
          total_enrolled: number;
          total_sent: number;
          total_opened: number;
          total_clicked: number;
          total_replied: number;
          total_converted: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: "email" | "voicemail" | "multi_channel";
          status?: "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";
          schedule_config?: Json;
          steps?: Json;
          target_criteria?: Json;
          total_enrolled?: number;
          total_sent?: number;
          total_opened?: number;
          total_clicked?: number;
          total_replied?: number;
          total_converted?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: "email" | "voicemail" | "multi_channel";
          status?: "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";
          schedule_config?: Json;
          steps?: Json;
          target_criteria?: Json;
          total_enrolled?: number;
          total_sent?: number;
          total_opened?: number;
          total_clicked?: number;
          total_replied?: number;
          total_converted?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body_html: string;
          body_text: string | null;
          variables: Json;
          preview_text: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body_html: string;
          body_text?: string | null;
          variables?: Json;
          preview_text?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          body_html?: string;
          body_text?: string | null;
          variables?: Json;
          preview_text?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      voicemail_templates: {
        Row: {
          id: string;
          name: string;
          script: string;
          audio_file_path: string | null;
          audio_duration_seconds: number | null;
          variables: Json;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          script: string;
          audio_file_path?: string | null;
          audio_duration_seconds?: number | null;
          variables?: Json;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          script?: string;
          audio_file_path?: string | null;
          audio_duration_seconds?: number | null;
          variables?: Json;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          prospect_id: string | null;
          campaign_id: string | null;
          domain_id: string | null;
          activity_type: string;
          description: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prospect_id?: string | null;
          campaign_id?: string | null;
          domain_id?: string | null;
          activity_type: string;
          description?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prospect_id?: string | null;
          campaign_id?: string | null;
          domain_id?: string | null;
          activity_type?: string;
          description?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_domain_id_fkey";
            columns: ["domain_id"];
            isOneToOne: false;
            referencedRelation: "domains";
            referencedColumns: ["id"];
          }
        ];
      };
      escalation_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          trigger_type: string;
          trigger_config: Json;
          conditions: Json;
          actions: Json;
          cooldown_hours: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          trigger_type: string;
          trigger_config?: Json;
          conditions?: Json;
          actions: Json;
          cooldown_hours?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          trigger_type?: string;
          trigger_config?: Json;
          conditions?: Json;
          actions?: Json;
          cooldown_hours?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaign_prospects: {
        Row: {
          id: string;
          campaign_id: string;
          prospect_id: string;
          status: "enrolled" | "in_progress" | "completed" | "paused" | "removed" | "unsubscribed";
          current_step: number;
          next_action_at: string | null;
          emails_sent: number;
          emails_opened: number;
          emails_clicked: number;
          voicemails_sent: number;
          enrolled_at: string;
          completed_at: string | null;
          paused_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          prospect_id: string;
          status?: "enrolled" | "in_progress" | "completed" | "paused" | "removed" | "unsubscribed";
          current_step?: number;
          next_action_at?: string | null;
          emails_sent?: number;
          emails_opened?: number;
          emails_clicked?: number;
          voicemails_sent?: number;
          enrolled_at?: string;
          completed_at?: string | null;
          paused_at?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          prospect_id?: string;
          status?: "enrolled" | "in_progress" | "completed" | "paused" | "removed" | "unsubscribed";
          current_step?: number;
          next_action_at?: string | null;
          emails_sent?: number;
          emails_opened?: number;
          emails_clicked?: number;
          voicemails_sent?: number;
          enrolled_at?: string;
          completed_at?: string | null;
          paused_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_prospects_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_prospects_prospect_id_fkey";
            columns: ["prospect_id"];
            isOneToOne: false;
            referencedRelation: "prospects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Domain = Database["public"]["Tables"]["domains"]["Row"];
export type DomainInsert = Database["public"]["Tables"]["domains"]["Insert"];
export type DomainUpdate = Database["public"]["Tables"]["domains"]["Update"];

export type Prospect = Database["public"]["Tables"]["prospects"]["Row"];
export type ProspectInsert = Database["public"]["Tables"]["prospects"]["Insert"];
export type ProspectUpdate = Database["public"]["Tables"]["prospects"]["Update"];

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
export type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];

export type EmailTemplate = Database["public"]["Tables"]["email_templates"]["Row"];
export type VoicemailTemplate = Database["public"]["Tables"]["voicemail_templates"]["Row"];

export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type ActivityLogInsert = Database["public"]["Tables"]["activity_logs"]["Insert"];

export type EscalationRule = Database["public"]["Tables"]["escalation_rules"]["Row"];
export type CampaignProspect = Database["public"]["Tables"]["campaign_prospects"]["Row"];
