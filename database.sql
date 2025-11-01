-- Refleezy Database Schema
-- Create tables and setup Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 2. Retrospective entries table
CREATE TABLE public.retrospective_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('KPT', 'PMI')),
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one entry per user per date per type
    UNIQUE(user_id, date, type)
);

-- 3. Weekly reports table
CREATE TABLE public.weekly_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    ai_analysis TEXT NOT NULL,
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one report per user per week
    UNIQUE(user_id, week_start, week_end)
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Retrospective entries indexes
CREATE INDEX idx_retrospective_entries_user_id ON public.retrospective_entries(user_id);
CREATE INDEX idx_retrospective_entries_date ON public.retrospective_entries(date);
CREATE INDEX idx_retrospective_entries_type ON public.retrospective_entries(type);
CREATE INDEX idx_retrospective_entries_user_date ON public.retrospective_entries(user_id, date);

-- Weekly reports indexes
CREATE INDEX idx_weekly_reports_user_id ON public.weekly_reports(user_id);
CREATE INDEX idx_weekly_reports_week_start ON public.weekly_reports(week_start);
CREATE INDEX idx_weekly_reports_user_week ON public.weekly_reports(user_id, week_start);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for retrospective_entries updated_at
CREATE TRIGGER update_retrospective_entries_updated_at
    BEFORE UPDATE ON public.retrospective_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Retrospective entries policies
CREATE POLICY "Users can view own retrospective entries" 
    ON public.retrospective_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own retrospective entries" 
    ON public.retrospective_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own retrospective entries" 
    ON public.retrospective_entries FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own retrospective entries" 
    ON public.retrospective_entries FOR DELETE 
    USING (auth.uid() = user_id);

-- Weekly reports policies
CREATE POLICY "Users can view own weekly reports" 
    ON public.weekly_reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reports" 
    ON public.weekly_reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reports" 
    ON public.weekly_reports FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reports" 
    ON public.weekly_reports FOR DELETE 
    USING (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- You can add any initial data here if needed
-- For example, default settings or system configurations