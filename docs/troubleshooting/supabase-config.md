# Supabase 설정 문제 해결 가이드

## 현재 문제

**"Unable to exchange external code"** = Supabase가 OAuth 코드 교환 실패

**원인:** Supabase Redirect URL 또는 카카오 설정 문제

---

## 100% 확실한 확인 방법

### 1단계: Supabase URL Configuration 직접 확인

**[Supabase 대시보드 접속](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)**

1. 왼쪽 메뉴 → **Authentication**
2. 상단 탭 → **URL Configuration**
3. **이 부분을 정확히 확인:**

#### Redirect URLs (필수)
```
http://localhost:3000/auth/callback
http://192.168.45.3:3000/auth/callback
```

**⚠️ 확인사항:**
- [ ] 위 두 URL이 **정확히** 입력되어 있는가?
- [ ] 끝에 슬래시 `/` 있는가? (있으면 제거!)
- [ ] 공백 있나? (있으면 제거!)
- [ ] `https://` 아닌 `http://`인가?

#### Site URL (필수)
```
http://localhost:3000
```

4. **Save** 버튼 클릭했나?
   - [ ] 네, 클릭했습니다
   - [ ] 아니요, 저장 안 했습니다 ← **저장하세요!**

---

### 2단계: 카카오 개발자 콘솔 확인

**[카카오 개발자 콘솔](https://developers.kakao.com/)**

1. 내 애플리케이션 선택
2. **플랫폼 설정** → Web
3. **사이트 도메인** 확인:

```
http://localhost:3000
http://192.168.45.3:3000
```

4. **카카오 로그인** → Redirect URI 확인:

```
https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

**⚠️ 중요:** 카카오 Redirect URI는 **Supabase 주소**여야 합니다!

---

### 3단계: Supabase Providers 확인

**[Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)**

1. Authentication → **Providers**
2. **Kakao** 선택
3. 다음 확인:

- [ ] **Enabled** 체크 되어 있는가?
- [ ] **Client ID** (REST API 키) 입력되어 있는가?
- [ ] **Client Secret** 입력되어 있는가?
- [ ] **Redirect URL** 확인:

```
https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

---

## 테스트 순서

### 1. 브라우저 쿠키 완전 삭제

**중요:** 이전 세션이 문제일 수 있습니다!

1. 브라우저 설정 → 모든 쿠키 삭제
2. 또는 시크릿/프라이빗 모드로 테스트

### 2. 서버 재시작

```powershell
# Ctrl+C로 서버 종료
# 그 다음
npm run dev
```

### 3. PC에서 테스트

1. http://localhost:3000 접속
2. 로그인 버튼 클릭
3. 카카오 로그인 성공
4. **성공 여부 확인**

### 4. 모바일에서 테스트

1. http://192.168.45.3:3000 접속
2. 로그인 버튼 클릭
3. 카카오 로그인 성공
4. **성공 여부 확인**

---

## 올바른 플로우

```
1. 사용자: http://localhost:3000/login 접속
2. 카카오 로그인 버튼 클릭
3. Supabase가 카카오로 리디렉션 (OAuth 시작)
4. 사용자: 카카오 로그인 성공
5. 카카오가 Supabase로 리디렉션: 
   https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback?code=...
6. Supabase가 코드를 세션으로 교환 후 내 앱으로 리디렉션:
   http://localhost:3000/auth/callback?code=...
7. 내 앱의 callback route가 세션 확보 완료
8. 홈으로 리디렉션: http://localhost:3000
```

**이 플로우 중 어느 단계에서 실패하는지 확인!**

---

## 자주 있는 실수

### ❌ 실수 1: Redirect URL 끝에 슬래시

```
❌ http://localhost:3000/auth/callback/
✅ http://localhost:3000/auth/callback
```

### ❌ 실수 2: 카카오 Redirect URI에 내 앱 주소

```
❌ http://localhost:3000/auth/callback
✅ https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

### ❌ 실수 3: Site URL과 Redirect URL 혼동

- **Site URL**: `http://localhost:3000`
- **Redirect URL**: `http://localhost:3000/auth/callback`

### ❌ 실수 4: 저장 안 함

설정 변경 후 **반드시 Save** 클릭!

### ❌ 실수 5: 네트워크 주소 안 추가

Supabase와 카카오에 **모두** `192.168.45.3:3000` 추가 필요!

### ❌ 실수 6: HTTP vs HTTPS

- 로컬 개발: **HTTP** (`http://`)
- 프로덕션: **HTTPS** (`https://`)

---

## 문제 진단 체크리스트

로그인 시도 후 확인:

- [ ] 브라우저가 카카오 로그인 페이지로 리디렉션되는가?
- [ ] 카카오 로그인 성공 후 돌아오는가?
- [ ] 에러가 발생하는가?

**에러가 발생하면:**

1. **브라우저 주소창 URL 확인**
   ```
   http://localhost:3000/auth/callback?error=...
   ```
   
2. **에러 종류별 해결:**
   - `error=server_error` + `Unable to exchange external code`
     → **Supabase Redirect URL 누락/오타**
   
   - `error=redirect_uri_mismatch`
     → **카카오 Redirect URI 설정 오류**

3. **브라우저 콘솔 에러 확인** (F12)

---

## 여전히 안 되면?

### 1. Supabase Authentication Logs 확인

**[Authentication Logs](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg/auth/logs)**

최근 에러 메시지 확인:
- 어떤 에러인지?
- 언제 발생했는지?

### 2. 카카오 콜백 에러 확인

**[카카오 개발자 콘솔](https://developers.kakao.com/)** → 내 애플리케이션 → 알림

Callback URL 에러 확인

### 3. 서버 로그 확인

터미널 출력에서:
- `=== OAuth Callback Debug ===` 메시지 확인
- 에러 메시지 전체 확인

### 4. 브라우저 주소창 확인

로그인 시도 후 주소창 URL 복사:
```
http://localhost:3000/auth/callback?error=...
```
전체 URL이 어떻게 나오는지 확인

---

## 핵심 정리

**가장 중요한 3가지:**

1. ✅ Supabase Redirect URLs에 `localhost`와 `192.168.45.3` 모두 추가
2. ✅ **Save 버튼 클릭**
3. ✅ 카카오 Redirect URI는 Supabase 주소 (내 앱 아님!)

이 3가지만 제대로 하면 됩니다!

---

**설정 확인 후 다시 테스트해보세요!**


