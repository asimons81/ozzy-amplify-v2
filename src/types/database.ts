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
          clerk_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          credits_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          credits_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      personas: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          tone_profile: Json | null;
          sample_tweets: string[] | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          tone_profile?: Json | null;
          sample_tweets?: string[] | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          tone_profile?: Json | null;
          sample_tweets?: string[] | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          persona_id: string | null;
          source_type: "manual" | "youtube" | "article" | "thread";
          source_url: string | null;
          source_content: string;
          content: string;
          thread_content: string[] | null;
          viral_score: Json | null;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          persona_id?: string | null;
          source_type?: "manual" | "youtube" | "article" | "thread";
          source_url?: string | null;
          source_content: string;
          content: string;
          thread_content?: string[] | null;
          viral_score?: Json | null;
          credits_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          persona_id?: string | null;
          source_type?: "manual" | "youtube" | "article" | "thread";
          source_url?: string | null;
          source_content?: string;
          content?: string;
          thread_content?: string[] | null;
          viral_score?: Json | null;
          credits_used?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          amount: number;
          reference_type: string | null;
          reference_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          amount: number;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          amount?: number;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_action: string;
          p_reference_type: string;
          p_reference_id: string;
          p_metadata: Json;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
