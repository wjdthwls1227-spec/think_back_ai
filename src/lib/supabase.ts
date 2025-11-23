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
          display_name?: string;
          avatar_url?: string;
          role: 'user' | 'admin';
          ai_plan_until?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          display_name?: string;
          avatar_url?: string;
          role?: 'user' | 'admin';
          ai_plan_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          display_name?: string;
          avatar_url?: string;
          role?: 'user' | 'admin';
          ai_plan_until?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contents: {
        Row: {
          id: string;
          slug: string;
          type: 'workbook' | 'cohort' | 'bundle';
          title: string;
          subtitle?: string;
          description?: string;
          price: number;
          is_published: boolean;
          meta?: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          type: 'workbook' | 'cohort' | 'bundle';
          title: string;
          subtitle?: string;
          description?: string;
          price: number;
          is_published?: boolean;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          type?: 'workbook' | 'cohort' | 'bundle';
          title?: string;
          subtitle?: string;
          description?: string;
          price?: number;
          is_published?: boolean;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
      };
      user_contents: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          progress: number;
          started_at?: string;
          completed_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          progress?: number;
          started_at?: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          progress?: number;
          started_at?: string;
          completed_at?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: 'pending' | 'paid' | 'failed' | 'refunded';
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          content_id: string;
          unit_amount: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          content_id: string;
          unit_amount: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          content_id?: string;
          unit_amount?: number;
          quantity?: number;
          created_at?: string;
        };
      };
      community_cases: {
        Row: {
          id: string;
          title: string;
          subtitle?: string;
          body?: string;
          category?: string;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string;
          body?: string;
          category?: string;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string;
          body?: string;
          category?: string;
          is_featured?: boolean;
          created_at?: string;
        };
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          type: 'daily' | 'weekly' | 'monthly';
          date: string;
          title: string | null;
          content: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: 'daily' | 'weekly' | 'monthly';
          date: string;
          title?: string | null;
          content: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'daily' | 'weekly' | 'monthly';
          date?: string;
          title?: string | null;
          content?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_ai_analyses: {
        Row: {
          id: string;
          journal_id: string;
          user_id: string;
          result: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          journal_id: string;
          user_id: string;
          result: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          journal_id?: string;
          user_id?: string;
          result?: Record<string, unknown>;
          created_at?: string;
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