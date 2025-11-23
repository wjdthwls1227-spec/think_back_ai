-- 마이그레이션 확인 쿼리
-- Supabase SQL Editor에서 실행하여 마이그레이션이 제대로 되었는지 확인하세요

-- 1. Profiles 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Role 값 확인 (user, admin만 있어야 함)
SELECT role, COUNT(*) as count
FROM public.profiles 
GROUP BY role
ORDER BY role;

-- 3. display_name이 제대로 설정되었는지 확인
SELECT id, name, display_name, role, ai_plan_until
FROM public.profiles 
LIMIT 5;

-- 4. 새로 생성된 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'contents', 
  'user_contents', 
  'orders', 
  'order_items', 
  'community_cases', 
  'journals', 
  'journal_ai_analyses'
)
ORDER BY table_name;

-- 5. content_type enum 확인
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'content_type'
ORDER BY e.enumsortorder;

-- 6. RLS가 활성화되어 있는지 확인
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles',
  'contents', 
  'user_contents', 
  'orders', 
  'order_items', 
  'community_cases', 
  'journals', 
  'journal_ai_analyses'
)
ORDER BY tablename;

