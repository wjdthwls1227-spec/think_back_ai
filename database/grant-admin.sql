-- 특정 사용자에게 어드민 권한 부여
-- 이메일: wjdthwls12@naver.com

-- 방법 1: 이메일로 직접 업데이트 (권장)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'wjdthwls12@naver.com';

-- 방법 2: auth.users를 통해 user_id 찾아서 업데이트
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'wjdthwls12@naver.com'
);

-- 확인 쿼리: 업데이트가 제대로 되었는지 확인
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.created_at
FROM public.profiles p
WHERE p.email = 'wjdthwls12@naver.com';

