-- 회고리즘 (Think Back AI) v0 완전한 스키마
-- 이 파일은 새로 시작하는 경우 사용 (기존 데이터 없음)
-- 기존 데이터가 있다면 migration-v0.sql 사용

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE content_type AS ENUM ('workbook', 'cohort', 'bundle');

-- =============================================
-- TABLES
-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  ai_plan_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- display_name 기본값 설정 (name과 동일)
UPDATE public.profiles SET display_name = name WHERE display_name IS NULL;

-- 2. Contents table (회고 콘텐츠 상품)
CREATE TABLE public.contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type content_type NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User contents table (내가 가진 콘텐츠)
CREATE TABLE public.user_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- 4. Orders table (주문)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Order items table (주문 항목)
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  unit_amount INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Community cases table (커뮤니티 사례)
CREATE TABLE public.community_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Journals table (회고)
CREATE TABLE public.journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  date DATE NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Journal AI analyses table (AI 분석 결과)
CREATE TABLE public.journal_ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Retrospective entries table (기존 - 호환성 유지)
CREATE TABLE public.retrospective_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('KPT', 'PMI', 'FREE')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- 10. Weekly reports table (기존 - 호환성 유지)
CREATE TABLE public.weekly_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  ai_analysis TEXT NOT NULL,
  insights TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start, week_end)
);

-- =============================================
-- INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Contents indexes
CREATE INDEX idx_contents_slug ON public.contents(slug);
CREATE INDEX idx_contents_type ON public.contents(type);
CREATE INDEX idx_contents_is_published ON public.contents(is_published);

-- User contents indexes
CREATE INDEX idx_user_contents_user_id ON public.user_contents(user_id);
CREATE INDEX idx_user_contents_content_id ON public.user_contents(content_id);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_content_id ON public.order_items(content_id);

-- Community cases indexes
CREATE INDEX idx_community_cases_is_featured ON public.community_cases(is_featured);
CREATE INDEX idx_community_cases_category ON public.community_cases(category);

-- Journals indexes
CREATE INDEX idx_journals_user_id ON public.journals(user_id);
CREATE INDEX idx_journals_date ON public.journals(date);
CREATE INDEX idx_journals_type ON public.journals(type);
CREATE INDEX idx_journals_user_date ON public.journals(user_id, date);

-- Journal AI analyses indexes
CREATE INDEX idx_journal_ai_analyses_journal_id ON public.journal_ai_analyses(journal_id);
CREATE INDEX idx_journal_ai_analyses_user_id ON public.journal_ai_analyses(user_id);

-- Retrospective entries indexes (기존)
CREATE INDEX idx_retrospective_entries_user_id ON public.retrospective_entries(user_id);
CREATE INDEX idx_retrospective_entries_date ON public.retrospective_entries(date);
CREATE INDEX idx_retrospective_entries_type ON public.retrospective_entries(type);
CREATE INDEX idx_retrospective_entries_user_date ON public.retrospective_entries(user_id, date);

-- Weekly reports indexes (기존)
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

-- Trigger for journals updated_at
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.journals
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
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Contents policies: public select, admin all
CREATE POLICY "Anyone can view published contents" 
  ON public.contents FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can view all contents" 
  ON public.contents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert contents" 
  ON public.contents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contents" 
  ON public.contents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete contents" 
  ON public.contents FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User contents policies: users can only access their own
CREATE POLICY "Users can view own user_contents" 
  ON public.user_contents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_contents" 
  ON public.user_contents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_contents" 
  ON public.user_contents FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_contents" 
  ON public.user_contents FOR DELETE 
  USING (auth.uid() = user_id);

-- Orders policies: users can only access their own
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" 
  ON public.orders FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order items policies: users can view through orders
CREATE POLICY "Users can view own order_items" 
  ON public.order_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order_items" 
  ON public.order_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Community cases policies: public select, admin all
CREATE POLICY "Anyone can view community_cases" 
  ON public.community_cases FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert community_cases" 
  ON public.community_cases FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update community_cases" 
  ON public.community_cases FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete community_cases" 
  ON public.community_cases FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Journals policies: users can only access their own
CREATE POLICY "Users can view own journals" 
  ON public.journals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journals" 
  ON public.journals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals" 
  ON public.journals FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals" 
  ON public.journals FOR DELETE 
  USING (auth.uid() = user_id);

-- Journal AI analyses policies: users can only access their own
CREATE POLICY "Users can view own journal_ai_analyses" 
  ON public.journal_ai_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal_ai_analyses" 
  ON public.journal_ai_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Retrospective entries policies (기존)
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

-- Weekly reports policies (기존)
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

