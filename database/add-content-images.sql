-- contents 테이블에 이미지 필드 추가
ALTER TABLE public.contents
ADD COLUMN IF NOT EXISTS thumbnail_image_url TEXT,
ADD COLUMN IF NOT EXISTS detail_image_url TEXT;

-- 인덱스는 필요 없음 (이미지 URL은 검색 대상이 아님)

