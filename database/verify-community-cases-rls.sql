-- community_cases 테이블의 RLS 정책 확인

-- 1. RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'community_cases';

-- 2. 현재 적용된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'community_cases';

-- 3. 정책이 제대로 작동하는지 테스트 (인증 없이 조회 가능한지)
-- 이 쿼리는 Supabase 대시보드의 SQL Editor에서 실행하세요
SELECT COUNT(*) FROM public.community_cases;

