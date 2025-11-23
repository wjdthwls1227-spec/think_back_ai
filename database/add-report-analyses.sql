-- 리포트 분석 결과 저장 테이블 추가

-- updated_at 함수가 없으면 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 리포트 분석 결과 저장 테이블 추가
CREATE TABLE IF NOT EXISTS public.report_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  analysis_result JSONB NOT NULL,
  journal_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_report_analyses_user_id ON public.report_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_report_analyses_type ON public.report_analyses(report_type);
CREATE INDEX IF NOT EXISTS idx_report_analyses_period ON public.report_analyses(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_report_analyses_user_type_period ON public.report_analyses(user_id, report_type, period_start);

-- RLS 활성화
ALTER TABLE public.report_analyses ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (이미 존재하는 경우)
DROP POLICY IF EXISTS "Users can view own report_analyses" ON public.report_analyses;
DROP POLICY IF EXISTS "Users can insert own report_analyses" ON public.report_analyses;
DROP POLICY IF EXISTS "Users can update own report_analyses" ON public.report_analyses;
DROP POLICY IF EXISTS "Users can delete own report_analyses" ON public.report_analyses;
DROP POLICY IF EXISTS "Admins can view all report_analyses" ON public.report_analyses;

-- RLS 정책: 사용자는 자신의 리포트 분석만 조회 가능
CREATE POLICY "Users can view own report_analyses" 
  ON public.report_analyses FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 리포트 분석만 삽입 가능
CREATE POLICY "Users can insert own report_analyses" 
  ON public.report_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 리포트 분석만 수정 가능
CREATE POLICY "Users can update own report_analyses" 
  ON public.report_analyses FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 리포트 분석만 삭제 가능
CREATE POLICY "Users can delete own report_analyses" 
  ON public.report_analyses FOR DELETE 
  USING (auth.uid() = user_id);

-- Admin이 모든 리포트 분석 조회 가능
CREATE POLICY "Admins can view all report_analyses" 
  ON public.report_analyses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- updated_at 트리거 (기존 트리거가 있으면 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_report_analyses_updated_at ON public.report_analyses;
CREATE TRIGGER update_report_analyses_updated_at
  BEFORE UPDATE ON public.report_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

