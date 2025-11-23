# 인증 메일이 오지 않는 근본 원인 분석

## 🔍 근본 원인 체크리스트

### 1. **가장 흔한 원인: Supabase 이메일 인증 설정이 비활성화됨**

**확인 위치:**
- Supabase Dashboard → **Authentication** → **Providers** → **Email** 클릭
- 또는 **Authentication** → **Settings** → **Email Auth** 섹션

**확인 사항:**
- ✅ **Enable email confirmations** 토글이 **ON**인지 확인
- ✅ **Confirm email** 옵션이 활성화되어 있는지 확인

**해결 방법:**
1. Email Provider 설정 페이지로 이동
2. **Enable email confirmations** 토글을 **ON**으로 설정
3. **Save** 버튼 클릭

---

### 2. **Redirect URL이 설정되지 않음**

**확인 위치:**
- Supabase Dashboard → **Authentication** → **URL Configuration**

**확인 사항:**
- **Site URL**이 올바르게 설정되어 있는지
- **Redirect URLs**에 다음이 포함되어 있는지:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3001/auth/callback
  https://your-domain.com/auth/callback
  ```

**해결 방법:**
1. **URL Configuration** 페이지로 이동
2. **Site URL** 입력 (로컬: `http://localhost:3000`, 프로덕션: 실제 도메인)
3. **Redirect URLs**에 위 URL들 추가
4. **Save** 버튼 클릭

---

### 3. **Supabase 기본 이메일 서비스 제한 (가장 가능성 높음)**

**문제:**
- Supabase의 기본 이메일 서비스는 **무료 플랜에서 제한적**입니다
- 시간당 이메일 전송 제한이 있을 수 있음
- 일부 이메일 제공업체로는 전송이 안 될 수 있음

**확인 방법:**
1. Supabase Dashboard → **Logs** → **Auth Logs**
2. 최근 회원가입 시도 로그 확인
3. 에러 메시지 확인:
   - `Email rate limit exceeded` → 전송 제한 초과
   - `Email not configured` → 이메일 설정 문제
   - `Failed to send email` → 전송 실패

**해결 방법:**
- **개발 환경**: 이메일 인증 비활성화 (아래 참고)
- **프로덕션**: SMTP 설정 필요 (Gmail, SendGrid, AWS SES 등)

---

### 4. **이메일 템플릿 문제**

**확인 위치:**
- Supabase Dashboard → **Authentication** → **Email Templates** → **Confirm signup**

**확인 사항:**
- `{{ .ConfirmationURL }}` 변수가 포함되어 있는지
- HTML 형식이 올바른지

**기본 템플릿:**
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

---

### 5. **코드 레벨 문제 (가능성 낮음)**

**확인 사항:**
- 브라우저 콘솔에서 `signUp` 함수가 호출되는지 확인
- Network 탭에서 `auth/v1/signup` 요청이 200 응답을 받는지 확인

**현재 코드 확인:**
```typescript
// src/context/AuthContext.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

이 코드는 올바르게 작성되어 있습니다.

---

## 🚨 가장 가능성 높은 원인 (우선순위)

### 1순위: **Supabase 기본 이메일 서비스 제한**
- 무료 플랜에서는 이메일 전송이 제한적일 수 있음
- 특히 개발 환경에서 자주 발생

### 2순위: **이메일 인증 설정이 비활성화됨**
- **Enable email confirmations**가 OFF 상태

### 3순위: **Redirect URL 미설정**
- Site URL이나 Redirect URLs가 설정되지 않음

---

## ✅ 즉시 확인할 사항 (체크리스트)

1. **Supabase Dashboard → Authentication → Providers → Email**
   - [ ] **Enable email confirmations** 토글이 **ON**
   - [ ] **Confirm email** 옵션이 활성화됨

2. **Supabase Dashboard → Authentication → URL Configuration**
   - [ ] **Site URL**이 설정됨 (`http://localhost:3000` 또는 프로덕션 도메인)
   - [ ] **Redirect URLs**에 `/auth/callback` URL이 포함됨

3. **Supabase Dashboard → Logs → Auth Logs**
   - [ ] 최근 회원가입 시도 로그 확인
   - [ ] 에러 메시지 확인 (Rate limit, Email not configured 등)

4. **이메일 확인**
   - [ ] 받은편지함 확인
   - [ ] 스팸 폴더 확인
   - [ ] 이메일 제공업체 필터링 설정 확인

---

## 🔧 즉시 해결 방법

### 방법 1: 개발 환경에서 이메일 인증 비활성화 (테스트용)

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. **Enable email confirmations** 토글을 **OFF**로 설정
3. **Save** 버튼 클릭
4. 회원가입 시 즉시 로그인 가능

**주의**: 프로덕션에서는 반드시 다시 활성화해야 합니다!

### 방법 2: SMTP 설정 (프로덕션 권장)

1. Supabase Dashboard → **Authentication** → **Settings** → **SMTP Settings**
2. SMTP 서버 정보 입력:
   - Gmail, SendGrid, AWS SES, Mailgun 등
3. 테스트 이메일 발송 확인

### 방법 3: 이메일 재전송 기능 사용

1. `/auth/resend-email` 페이지 방문
2. 가입한 이메일 주소 입력
3. "인증 메일 재전송" 버튼 클릭

---

## 📊 진단 단계

### Step 1: Supabase 로그 확인
```
Supabase Dashboard → Logs → Auth Logs
```
- 회원가입 시도가 기록되는지 확인
- 에러 메시지 확인

### Step 2: 브라우저 콘솔 확인
```
F12 → Console 탭
```
- `signUp` 함수 호출 확인
- 에러 메시지 확인

### Step 3: Network 탭 확인
```
F12 → Network 탭 → auth/v1/signup 요청 확인
```
- 요청이 200 응답을 받는지 확인
- 응답 본문 확인

### Step 4: Supabase 설정 확인
```
Authentication → Providers → Email
Authentication → URL Configuration
```
- 위 체크리스트 확인

---

## 🎯 결론

**가장 가능성 높은 근본 원인:**
1. **Supabase 기본 이메일 서비스 제한** (무료 플랜)
2. **이메일 인증 설정이 비활성화됨**
3. **Redirect URL 미설정**

**즉시 확인:**
1. Supabase Dashboard → Authentication → Providers → Email
2. **Enable email confirmations**가 **ON**인지 확인
3. Supabase Dashboard → Logs → Auth Logs에서 에러 확인

**임시 해결책 (개발 환경):**
- 이메일 인증을 비활성화하고 테스트 진행

**장기 해결책 (프로덕션):**
- SMTP 설정을 통해 커스텀 이메일 서비스 연결

