-- RLS 무한 재귀 문제 해결
-- "Admins can view all profiles" 정책이 profiles 테이블을 다시 조회하면서 무한 루프 발생
-- 이 정책을 삭제하고 수정된 버전으로 재생성

-- 1. 기존 문제가 있는 정책 삭제
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. 수정된 정책 생성 (auth.users를 직접 조회하여 무한 재귀 방지)
-- SECURITY DEFINER 함수를 사용하여 RLS를 우회하고 조회
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- 3. 수정된 정책 생성 (함수 사용)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    public.is_admin(auth.uid())
  );

-- 4. 다른 테이블의 admin 정책도 동일하게 수정
-- Contents
DROP POLICY IF EXISTS "Admins can view all contents" ON public.contents;
CREATE POLICY "Admins can view all contents" 
  ON public.contents FOR SELECT 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert contents" ON public.contents;
CREATE POLICY "Admins can insert contents" 
  ON public.contents FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update contents" ON public.contents;
CREATE POLICY "Admins can update contents" 
  ON public.contents FOR UPDATE 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete contents" ON public.contents;
CREATE POLICY "Admins can delete contents" 
  ON public.contents FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Community cases
DROP POLICY IF EXISTS "Admins can view all community_cases" ON public.community_cases;
CREATE POLICY "Admins can view all community_cases" 
  ON public.community_cases FOR SELECT 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert community_cases" ON public.community_cases;
CREATE POLICY "Admins can insert community_cases" 
  ON public.community_cases FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update community_cases" ON public.community_cases;
CREATE POLICY "Admins can update community_cases" 
  ON public.community_cases FOR UPDATE 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete community_cases" ON public.community_cases;
CREATE POLICY "Admins can delete community_cases" 
  ON public.community_cases FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- User contents (admin이 모든 사용자의 콘텐츠 조회 가능)
DROP POLICY IF EXISTS "Admins can view all user_contents" ON public.user_contents;
CREATE POLICY "Admins can view all user_contents" 
  ON public.user_contents FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Orders (admin이 모든 주문 조회 가능)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
  ON public.orders FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Journals (admin이 모든 회고 조회 가능)
DROP POLICY IF EXISTS "Admins can view all journals" ON public.journals;
CREATE POLICY "Admins can view all journals" 
  ON public.journals FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- Journal AI analyses (admin이 모든 분석 조회 가능)
DROP POLICY IF EXISTS "Admins can view all journal_ai_analyses" ON public.journal_ai_analyses;
CREATE POLICY "Admins can view all journal_ai_analyses" 
  ON public.journal_ai_analyses FOR SELECT 
  USING (public.is_admin(auth.uid()));

