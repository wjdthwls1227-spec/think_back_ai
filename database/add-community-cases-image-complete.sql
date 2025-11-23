-- community_cases 테이블에 image_url 필드 추가
-- 이미 추가되어 있으면 에러 없이 스킵됨

-- image_url 컬럼 추가
ALTER TABLE public.community_cases 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 이미지 URL 인덱스 추가 (선택사항, 성능 향상)
CREATE INDEX IF NOT EXISTS idx_community_cases_image_url 
ON public.community_cases(image_url) 
WHERE image_url IS NOT NULL;

-- 컬럼이 제대로 추가되었는지 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'community_cases'
  AND column_name = 'image_url';

