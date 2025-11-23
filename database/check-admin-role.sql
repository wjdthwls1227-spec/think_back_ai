-- wjdthwls12@naver.com 사용자의 어드민 권한 확인

-- 방법 1: 이메일로 직접 확인
SELECT 
  id,
  email,
  display_name,
  role,
  created_at
FROM public.profiles
WHERE email = 'wjdthwls12@naver.com';

-- 방법 2: auth.users와 조인해서 확인
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  u.email as auth_email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'wjdthwls12@naver.com';

-- 방법 3: role이 'admin'인 모든 사용자 확인
SELECT 
  email,
  display_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin';

-- 방법 4: 현재 로그인한 사용자의 role 확인 (auth.uid() 사용)
SELECT 
  email,
  display_name,
  role
FROM public.profiles
WHERE id = auth.uid();
