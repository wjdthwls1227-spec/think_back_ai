-- RLS 무한 재귀 문제 해결 (v2 - 더 간단한 방법)
-- profiles 테이블을 조회하는 정책이 profiles 테이블 자체를 다시 조회하면서 무한 루프 발생
-- 해결: admin 정책을 완전히 제거하고, 서비스 역할 키를 사용하거나 정책을 단순화

-- 1. 모든 admin 관련 정책 삭제
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can insert contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can update contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can delete contents" ON public.contents;
DROP POLICY IF EXISTS "Admins can view all community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can insert community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can update community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can delete community_cases" ON public.community_cases;
DROP POLICY IF EXISTS "Admins can view all user_contents" ON public.user_contents;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.contents;
DROP POLICY IF EXISTS "Admins can view all journals" ON public.journals;
DROP POLICY IF EXISTS "Admins can view all journal_ai_analyses" ON public.journal_ai_analyses;

-- 2. 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- 3. profiles 테이블의 기본 정책만 유지
-- (이미 "Users can view own profile", "Users can insert own profile", "Users can update own profile" 정책이 있음)

-- 4. Contents: 공개된 콘텐츠만 조회 가능 (admin 기능은 나중에 서비스 역할 키로 처리)
-- 기존 정책 확인 후 필요시 재생성
DROP POLICY IF EXISTS "Anyone can view published contents" ON public.contents;
CREATE POLICY "Anyone can view published contents" 
  ON public.contents FOR SELECT 
  USING (is_published = true);

-- 5. Community cases: 모두 조회 가능 (공개 데이터)
DROP POLICY IF EXISTS "Anyone can view community_cases" ON public.community_cases;
CREATE POLICY "Anyone can view community_cases" 
  ON public.community_cases FOR SELECT 
  USING (true);

-- 6. 테스트를 위해 profiles 조회 정책 확인
-- 현재 정책:
-- - "Users can view own profile" (auth.uid() = id) - 이것만 있으면 됨

-- 7. RLS가 제대로 작동하는지 확인
-- profiles 테이블에 대한 SELECT는 자신의 프로필만 조회 가능
-- admin 기능은 나중에 서비스 역할 키를 사용하는 API로 처리

