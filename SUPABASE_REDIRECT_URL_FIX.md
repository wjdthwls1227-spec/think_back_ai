# 🔴 CRITICAL: OAuth 리다이렉트 URL 오류 해결

## ❌ 현재 에러
```
GET /auth/callback?error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code
```

**"Unable to exchange external code"** = Supabase가 카카오에서 받은 인증 코드를 세션으로 교환할 수 없음

---

## ✅ 해결 방법

### 1단계: Supabase Redirect URLs 확인 및 수정

**[Supabase 대시보드 접속](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)**

1. 좌측 메뉴 → **Authentication** 클릭
2. 상단 탭 → **URL Configuration** 클릭
3. **Redirect URLs** 섹션 확인

**현재 IP 주소:** `192.168.45.3`

**다음 URL들이 모두 있어야 함:**

```
http://localhost:3000/auth/callback
http://192.168.45.3:3000/auth/callback
```

**중요:** 
- ✅ 각 줄마다 정확히 위와 같이 입력
- ❌ 끝에 슬래시(`/`) 없음
- ❌ 공백 없음
- ❌ `https://` 아닌 `http://`

4. **Site URL** 확인:
   ```
   http://localhost:3000
   ```

5. **Save** 클릭!

---

### 2단계: 카카오 개발자 콘솔 확인

**[카카오 개발자 콘솔](https://developers.kakao.com/)**

1. 내 애플리케이션 선택
2. 플랫폼 설정 → Web 플랫폼
3. **사이트 도메인**에 다음 추가:

```
http://localhost:3000
http://192.168.45.3:3000
```

4. 카카오 로그인 → Redirect URI 확인:

```
https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

**중요:** 카카오 Redirect URI는 **Supabase 주소**여야 합니다!

---

### 3단계: Supabase OAuth Provider 확인

**[Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)**

1. Authentication → Providers
2. **Kakao** 활성화 여부 확인
3. Client ID (REST API 키) 확인
4. Client Secret 확인
5. Redirect URL 확인:

```
https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

---

### 4단계: 서버 재시작

```powershell
# 서버 종료
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 재시작
npm run dev
```

**터미널 출력 확인:**
```
▲ Next.js 15.4.4 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.45.3:3000  ← 이 주소 확인!
```

---

## 🔍 문제 진단 체크리스트

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

## 🎯 올바른 플로우

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

## ⚠️ 자주 있는 실수

### 1. Supabase Redirect URL에 슬래시 추가
```
❌ http://localhost:3000/auth/callback/
✅ http://localhost:3000/auth/callback
```

### 2. 카카오 Redirect URI에 내 앱 주소 입력
```
❌ http://localhost:3000/auth/callback
✅ https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback
```

### 3. Site URL과 Redirect URL 혼동
- **Site URL**: `http://localhost:3000` (슬래시 없음)
- **Redirect URL**: `http://localhost:3000/auth/callback` (`/auth/callback` 추가)

### 4. HTTP vs HTTPS
- 로컬 개발: **HTTP** (`http://`)
- 프로덕션: **HTTPS** (`https://`)

---

## 📞 추가 도움이 필요하면

1. 브라우저 주소창 전체 URL 복사
2. 브라우저 콘솔 에러 스크린샷
3. Supabase Authentication 로그 확인

[Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg) → Authentication → Logs



