-- contents 테이블 RLS 정책 테스트

-- 1. is_admin 함수 테스트
SELECT 
  public.is_admin('95fc1648-78df-4caf-91a8-ad34fcb0df26'::UUID) as is_admin_result,
  (SELECT role FROM public.profiles WHERE id = '95fc1648-78df-4caf-91a8-ad34fcb0df26'::UUID) as user_role;

-- 2. 현재 사용자 확인
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as current_user_role;

-- 3. contents 테이블 조회 테스트 (어드민)
SELECT 
  COUNT(*) as total_contents,
  COUNT(*) FILTER (WHERE is_published = true) as published_contents,
  COUNT(*) FILTER (WHERE is_published = false) as unpublished_contents
FROM public.contents;

-- 4. RLS 정책 확인
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
WHERE tablename = 'contents'
ORDER BY policyname;

-- 5. 함수 권한 확인
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'is_admin';

