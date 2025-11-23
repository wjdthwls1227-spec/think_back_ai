-- contents 테이블 RLS 정책 수정
-- 재귀 문제를 피하기 위해 SECURITY DEFINER 함수 사용

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Admins can insert contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can update contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can delete contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can view all contents" ON public.contents;

-- 2. is_admin 함수 생성/업데이트 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- RLS를 우회하여 직접 조회
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$;

-- 3. 어드민이 contents 조회 가능
CREATE POLICY "Admins can view all contents" 
  ON public.contents FOR SELECT 
  USING (public.is_admin(auth.uid()));

-- 4. 어드민이 contents 삽입 가능
CREATE POLICY "Admins can insert contents" 
  ON public.contents FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. 어드민이 contents 수정 가능
CREATE POLICY "Admins can update contents" 
  ON public.contents FOR UPDATE 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. 어드민이 contents 삭제 가능
CREATE POLICY "Admins can delete contents" 
  ON public.contents FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- 7. 함수 권한 부여 (필요한 경우)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;

