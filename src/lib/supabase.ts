import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role: 'owner' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role?: 'owner' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          role?: 'owner' | 'member';
          created_at?: string;
          updated_at?: string;
        };
      };
      retrospective_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: 'KPT' | 'PMI' | 'FREE';
          content: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: 'KPT' | 'PMI' | 'FREE';
          content: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          type?: 'KPT' | 'PMI' | 'FREE';
          content?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_reports: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          week_end: string;
          ai_analysis: string;
          insights: string[];
          recommendations: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          week_end: string;
          ai_analysis: string;
          insights: string[];
          recommendations: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          week_end?: string;
          ai_analysis?: string;
          insights?: string[];
          recommendations?: string[];
          created_at?: string;
        };
      };
    };
  };
};