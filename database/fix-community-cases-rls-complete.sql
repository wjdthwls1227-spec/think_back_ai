-- community_cases 테이블 RLS 정책 완전 수정
-- is_admin 함수를 사용하여 무한 재귀 문제 방지

-- 1. is_admin 함수가 없으면 생성
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

-- 2. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anyone can view community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can view all community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can insert community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can update community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can delete community_cases" ON public.community_cases;

-- 3. 공개 조회 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view community_cases" 
  ON public.community_cases FOR SELECT 
  USING (true);

-- 4. 어드민 INSERT 정책 (is_admin 함수 사용)
CREATE POLICY "Admins can insert community_cases" 
  ON public.community_cases FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. 어드민 UPDATE 정책 (is_admin 함수 사용)
CREATE POLICY "Admins can update community_cases" 
  ON public.community_cases FOR UPDATE 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. 어드민 DELETE 정책 (is_admin 함수 사용)
CREATE POLICY "Admins can delete community_cases" 
  ON public.community_cases FOR DELETE 
  USING (public.is_admin(auth.uid()));

