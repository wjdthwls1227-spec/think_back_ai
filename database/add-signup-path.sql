-- profiles 테이블에 가입경로(signup_path) 필드 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signup_path TEXT;

-- 가입경로 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_profiles_signup_path ON public.profiles(signup_path) WHERE signup_path IS NOT NULL;

-- 컬럼이 제대로 추가되었는지 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'signup_path';

