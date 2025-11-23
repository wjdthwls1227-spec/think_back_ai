-- community_cases 테이블 RLS 정책 수정
-- 모든 사용자가 조회할 수 있도록 설정

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Anyone can view community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can view all community_cases" ON public.community_cases;

-- 공개 조회 정책 생성 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view community_cases" 
  ON public.community_cases FOR SELECT 
  USING (true);

-- 어드민 INSERT 정책 확인 및 수정
DROP POLICY IF EXISTS "Admins can insert community_cases" ON public.community_cases;
CREATE POLICY "Admins can insert community_cases" 
  ON public.community_cases FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 어드민 UPDATE 정책 확인 및 수정
DROP POLICY IF EXISTS "Admins can update community_cases" ON public.community_cases;
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

-- 어드민 DELETE 정책 확인 및 수정
DROP POLICY IF EXISTS "Admins can delete community_cases" ON public.community_cases;
CREATE POLICY "Admins can delete community_cases" 
  ON public.community_cases FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

