-- 회고리즘 (Think Back AI) v0 마이그레이션 스크립트
-- 기존 스키마를 v0 기획서에 맞게 업데이트

-- =============================================
-- 1. Profiles 테이블 수정
-- =============================================

-- display_name 컬럼 추가 (name과 동일하게 설정)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 기존 name 값을 display_name에 복사
UPDATE public.profiles 
SET display_name = name 
WHERE display_name IS NULL;

-- role 체크 제약조건 변경: 'owner', 'member' -> 'user', 'admin'
-- ⚠️ 중요: 먼저 제약조건을 삭제한 후 role 값을 변경해야 함

-- 기존 체크 제약조건 삭제 (먼저 삭제)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- role 값을 매핑 (제약조건이 없으므로 안전하게 변경 가능)
UPDATE public.profiles 
SET role = CASE 
  WHEN role = 'owner' THEN 'admin'
  WHEN role = 'member' THEN 'user'
  WHEN role NOT IN ('user', 'admin') THEN 'user'  -- 기타 값도 'user'로
  ELSE role  -- 이미 'user' 또는 'admin'이면 유지
END;

-- 새로운 체크 제약조건 추가
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin'));

-- role 기본값 변경
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- ai_plan_until 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_plan_until TIMESTAMP WITH TIME ZONE;

-- =============================================
-- 2. 새로운 테이블 생성
-- =============================================

-- Content type enum 생성
DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('workbook', 'cohort', 'bundle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Contents 테이블 (회고 콘텐츠 상품)
CREATE TABLE IF NOT EXISTS public.contents (
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

-- User contents 테이블 (내가 가진 콘텐츠)
CREATE TABLE IF NOT EXISTS public.user_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Orders 테이블 (주문 - 확장용)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items 테이블 (주문 항목)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  unit_amount INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community cases 테이블 (커뮤니티 사례)
CREATE TABLE IF NOT EXISTS public.community_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journals 테이블 (회고 - 기존 retrospective_entries와 병행 사용 가능)
CREATE TABLE IF NOT EXISTS public.journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  date DATE NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal AI analyses 테이블 (AI 분석 결과)
CREATE TABLE IF NOT EXISTS public.journal_ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 인덱스 생성
-- =============================================

-- Contents indexes
CREATE INDEX IF NOT EXISTS idx_contents_slug ON public.contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_type ON public.contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_is_published ON public.contents(is_published);

-- User contents indexes
CREATE INDEX IF NOT EXISTS idx_user_contents_user_id ON public.user_contents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contents_content_id ON public.user_contents(content_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_content_id ON public.order_items(content_id);

-- Community cases indexes
CREATE INDEX IF NOT EXISTS idx_community_cases_is_featured ON public.community_cases(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_cases_category ON public.community_cases(category);

-- Journals indexes
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON public.journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journals_date ON public.journals(date);
CREATE INDEX IF NOT EXISTS idx_journals_type ON public.journals(type);
CREATE INDEX IF NOT EXISTS idx_journals_user_date ON public.journals(user_id, date);

-- Journal AI analyses indexes
CREATE INDEX IF NOT EXISTS idx_journal_ai_analyses_journal_id ON public.journal_ai_analyses(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_ai_analyses_user_id ON public.journal_ai_analyses(user_id);

-- =============================================
-- 4. Triggers
-- =============================================

-- Journals updated_at trigger
CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on new tables
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_ai_analyses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. RLS POLICIES
-- =============================================

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

-- =============================================
-- 7. 기존 profiles RLS 정책 업데이트 (admin이 모든 프로필 조회 가능)
-- =============================================

-- Admin이 모든 프로필 조회 가능하도록 정책 추가
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

