# 이메일 인증 설정 가이드

## Supabase 대시보드 설정

### 1. 이메일 인증 활성화

1. Supabase 대시보드 → **Authentication** → **Settings**
2. **Email Auth** 섹션에서:
   - ✅ **Enable email confirmations** 체크
   - **Confirm email** 옵션 활성화

### 2. 이메일 템플릿 설정

1. **Authentication** → **Email Templates**
2. **Confirm signup** 템플릿 확인
3. 기본 템플릿 사용 또는 커스터마이징 가능

### 3. Redirect URL 설정

1. **Authentication** → **URL Configuration**
2. **Site URL**: 프로덕션 도메인 (예: `https://your-domain.com`)
3. **Redirect URLs**에 추가:
   - `http://localhost:3000/auth/callback` (개발)
   - `https://your-domain.com/auth/callback` (프로덕션)

## 동작 방식

### 회원가입 플로우

1. 사용자가 회원가입 폼 작성
2. `signUp` 함수 호출 → Supabase가 이메일 인증 링크 전송
3. 사용자에게 "이메일 인증이 필요합니다" 안내 페이지 표시
4. 사용자가 이메일에서 인증 링크 클릭
5. `/auth/callback` → `/auth/verify-email`로 리다이렉트
6. 인증 완료 후 로그인 가능

### 로그인 플로우

1. 사용자가 이메일/비밀번호로 로그인 시도
2. 이메일 인증이 안 된 경우 → "이메일 인증이 필요합니다" 에러 표시
3. 이메일 인증이 완료된 경우 → 정상 로그인

## 주의사항

- 이메일 인증이 완료되기 전에는 로그인 불가
- 인증 링크는 24시간 유효 (Supabase 기본값)
- 인증 링크 만료 시 회원가입을 다시 해야 함 (향후 재전송 기능 추가 예정)

