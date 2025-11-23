-- community_cases 테이블에 이미지 URL 필드 추가
ALTER TABLE public.community_cases 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 이미지 URL 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_community_cases_image_url ON public.community_cases(image_url) WHERE image_url IS NOT NULL;

