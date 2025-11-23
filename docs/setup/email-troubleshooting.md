# 이메일 인증 메일이 오지 않는 경우 해결 방법

## 1. Supabase 대시보드 설정 확인

### 이메일 인증 활성화
1. Supabase 대시보드 → **Authentication** → **Settings**
2. **Email Auth** 섹션 확인:
   - ✅ **Enable email confirmations** 체크되어 있는지 확인
   - **Confirm email** 옵션이 활성화되어 있는지 확인

### Redirect URL 설정
1. **Authentication** → **URL Configuration**
2. **Site URL** 확인:
   - 로컬 개발: `http://localhost:3000` (또는 현재 포트)
   - 프로덕션: 실제 도메인
3. **Redirect URLs**에 다음 추가:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://your-domain.com/auth/callback
   ```

### 이메일 템플릿 확인
1. **Authentication** → **Email Templates**
2. **Confirm signup** 템플릿 확인:
   - `{{ .ConfirmationURL }}`이 포함되어 있는지 확인
   - 링크가 제대로 생성되는지 확인

## 2. 개발 환경에서 이메일 인증 비활성화 (테스트용)

개발 중에는 이메일 인증을 일시적으로 비활성화할 수 있습니다:

1. Supabase 대시보드 → **Authentication** → **Settings**
2. **Email Auth** 섹션에서:
   - ❌ **Enable email confirmations** 체크 해제
3. 저장 후 회원가입 시 즉시 로그인 가능

**주의**: 프로덕션에서는 반드시 이메일 인증을 활성화해야 합니다.

## 3. 이메일 재전송 기능 사용

1. `/auth/resend-email` 페이지 방문
2. 가입한 이메일 주소 입력
3. "인증 메일 재전송" 버튼 클릭

## 4. 스팸 폴더 확인

- 받은편지함과 스팸 폴더 모두 확인
- 이메일 제공업체에 따라 스팸으로 분류될 수 있음

## 5. Supabase 로그 확인

1. Supabase 대시보드 → **Logs** → **Auth Logs**
2. 최근 회원가입 시도 확인
3. 에러 메시지 확인:
   - `Email rate limit exceeded`: 이메일 전송 제한 초과
   - `Email not configured`: 이메일 설정 문제
   - 기타 에러 메시지 확인

## 6. SMTP 설정 (프로덕션 권장)

Supabase 기본 이메일 서비스는 제한이 있을 수 있습니다. 프로덕션에서는 SMTP 설정을 권장합니다:

1. **Authentication** → **Settings** → **SMTP Settings**
2. SMTP 서버 정보 입력 (Gmail, SendGrid, AWS SES 등)
3. 테스트 이메일 발송 확인

## 7. 빠른 체크리스트

- [ ] Supabase 대시보드에서 "Enable email confirmations" 활성화
- [ ] Redirect URL에 현재 도메인 추가
- [ ] 이메일 템플릿에 `{{ .ConfirmationURL }}` 포함
- [ ] 스팸 폴더 확인
- [ ] `/auth/resend-email`에서 재전송 시도
- [ ] Supabase Auth Logs에서 에러 확인
- [ ] 브라우저 콘솔에서 에러 확인

## 8. 임시 해결책 (개발 환경)

개발 중에는 이메일 인증을 비활성화하고 테스트할 수 있습니다:

1. Supabase 대시보드 → **Authentication** → **Settings**
2. **Enable email confirmations** 체크 해제
3. 회원가입 시 즉시 로그인 가능

**프로덕션 배포 전에는 반드시 다시 활성화하세요!**

