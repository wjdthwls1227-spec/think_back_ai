-- is_admin 함수 테스트 및 확인
-- 이 SQL을 실행하여 함수가 제대로 작동하는지 확인하세요

-- 1. 현재 사용자 확인
SELECT auth.uid() as current_user_id;

-- 2. 현재 사용자의 프로필 확인
SELECT id, email, role 
FROM public.profiles 
WHERE id = auth.uid();

-- 3. is_admin 함수 테스트
SELECT public.is_admin(auth.uid()) as is_admin_result;

-- 4. is_admin 함수가 존재하는지 확인
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'is_admin';

