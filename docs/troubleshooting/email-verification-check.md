# 이메일 인증 문제 해결 가이드

## 1. 환경 변수 확인

프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, 다음 내용이 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dlwuckbuhnfzmramxosg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**확인 방법:**
1. 프로젝트 루트 폴더에서 `.env.local` 파일 확인
2. 파일이 없으면 생성
3. Supabase 대시보드 → Settings → API에서 값 복사

## 2. Supabase 대시보드에서 사용자 확인

1. [Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg) 접속
2. **Authentication** → **Users** 메뉴로 이동
3. 방금 가입한 이메일로 사용자가 생성되었는지 확인
4. 사용자가 있다면:
   - **Email Confirmed** 컬럼 확인 (false면 아직 인증 안 됨)
   - **Created At** 시간 확인

## 3. 이메일 설정 확인

### 3.1 이메일 인증 활성화 확인
1. **Authentication** → **Email** 메뉴
2. **Confirm sign up** 항목의 토글이 **ON**인지 확인
3. OFF라면 ON으로 변경하고 저장

### 3.2 이메일 템플릿 확인
1. **Authentication** → **Email** → **Templates**
2. **Confirm sign up** 템플릿 확인
3. `{{ .ConfirmationURL }}`이 포함되어 있는지 확인

### 3.3 Redirect URL 확인
1. **Authentication** → **URL Configuration**
2. **Redirect URLs**에 다음이 포함되어 있는지 확인:
   - `http://localhost:3000/auth/callback` (또는 현재 사용 중인 포트)
   - `http://localhost:3001/auth/callback` (포트가 3001인 경우)
3. **Site URL** 확인:
   - 로컬 개발: `http://localhost:3000` (또는 현재 포트)

## 4. 브라우저 콘솔 확인

1. 브라우저에서 F12 눌러서 개발자 도구 열기
2. **Console** 탭 확인
3. 회원가입 시도 시 에러 메시지 확인
4. **Network** 탭에서:
   - `auth/v1/signup` 요청이 있는지 확인
   - 응답 상태 코드 확인 (200이면 성공)

## 5. 스팸 폴더 확인

- 이메일이 스팸 폴더로 갔을 수 있습니다
- 받은편지함과 스팸 폴더 모두 확인

## 6. Supabase 이메일 서비스 제한 확인

Supabase의 기본 이메일 서비스는:
- **Rate Limit**: 시간당 제한이 있을 수 있음
- **프로덕션 사용 제한**: 프로덕션에서는 SMTP 설정 권장

**확인 방법:**
1. Supabase 대시보드 → **Settings** → **Auth**
2. 이메일 전송 제한 확인

## 7. 수동으로 이메일 재전송 (향후 기능)

현재는 수동 재전송 기능이 없지만, Supabase 대시보드에서:
1. **Authentication** → **Users**
2. 해당 사용자 클릭
3. **Send magic link** 또는 **Resend confirmation email** 옵션 확인

## 8. 테스트 방법

### 8.1 회원가입 테스트
1. 브라우저 콘솔 열기 (F12)
2. 회원가입 시도
3. 콘솔에 에러가 있는지 확인
4. Network 탭에서 `signup` 요청 확인

### 8.2 Supabase 로그 확인
1. Supabase 대시보드 → **Logs** → **Auth Logs**
2. 최근 회원가입 시도 로그 확인
3. 에러 메시지 확인

## 빠른 체크리스트

- [ ] `.env.local` 파일이 존재하고 올바른 값이 설정되어 있음
- [ ] Supabase 대시보드에서 사용자가 생성되었음
- [ ] **Confirm sign up** 토글이 ON으로 설정되어 있음
- [ ] Redirect URL에 현재 포트가 포함되어 있음
- [ ] 브라우저 콘솔에 에러가 없음
- [ ] 스팸 폴더 확인함
- [ ] Supabase Auth Logs에서 에러 확인함

## 다음 단계

위 항목을 모두 확인했는데도 이메일이 오지 않으면:
1. Supabase 대시보드 → **Support** 또는 **Discord**에서 문의
2. 또는 SMTP 설정을 사용하여 커스텀 이메일 서비스 연결

