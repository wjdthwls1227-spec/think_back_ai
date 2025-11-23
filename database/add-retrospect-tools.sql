-- 회고 도구 추천 테이블 생성
CREATE TABLE IF NOT EXISTS public.retrospect_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT CHECK (category IN ('노트', '필기구', '도서', '디지털', '기타')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  benefit TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_retrospect_tools_category ON public.retrospect_tools(category);
CREATE INDEX IF NOT EXISTS idx_retrospect_tools_published ON public.retrospect_tools(is_published);
CREATE INDEX IF NOT EXISTS idx_retrospect_tools_order ON public.retrospect_tools(display_order);

-- RLS 활성화
ALTER TABLE public.retrospect_tools ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자는 published된 도구만 조회 가능
CREATE POLICY "Anyone can view published retrospect_tools" 
  ON public.retrospect_tools FOR SELECT 
  USING (is_published = true);

-- RLS 정책: 어드민은 모든 도구 조회 가능
CREATE POLICY "Admins can view all retrospect_tools" 
  ON public.retrospect_tools FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS 정책: 어드민만 삽입 가능
CREATE POLICY "Admins can insert retrospect_tools" 
  ON public.retrospect_tools FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS 정책: 어드민만 수정 가능
CREATE POLICY "Admins can update retrospect_tools" 
  ON public.retrospect_tools FOR UPDATE 
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

-- RLS 정책: 어드민만 삭제 가능
CREATE POLICY "Admins can delete retrospect_tools" 
  ON public.retrospect_tools FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_retrospect_tools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_retrospect_tools_updated_at ON public.retrospect_tools;

CREATE TRIGGER update_retrospect_tools_updated_at
  BEFORE UPDATE ON public.retrospect_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_retrospect_tools_updated_at();

