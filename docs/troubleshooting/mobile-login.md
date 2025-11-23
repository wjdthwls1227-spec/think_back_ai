# 모바일 로그인 문제 해결 가이드

## 문제 증상
- ✅ PC에서는 로그인 정상 작동
- ❌ 모바일 기기에서 로그인 실패
- 에러: "네트워크가 서버에 연결할 수 없습니다" 또는 ERR_CONNECTION_FAILED

---

## 빠른 해결 가이드

### 1단계: 개발 서버 재시작

**현재 서버 상태 확인:**
```powershell
netstat -ano | findstr :3000
```

**재시작:**
```powershell
# 기존 서버 종료 (백그라운드 프로세스 있으면)
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 새 서버 시작
npm run dev
```

**중요:** 서버를 시작할 때 "Windows 방화벽" 경고가 뜨면 **"액세스 허용"** 클릭!

### 2단계: 모바일 접속

1. 터미널 출력 확인:
   ```
   ▲ Next.js 15.4.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.X.X:3000  ← 이 주소 사용!
   ```

2. 모바일 브라우저에서 `http://192.168.X.X:3000` 접속

---

## 원인 분석

PC는 작동하는데 모바일만 안 되는 이유는 **Supabase Redirect URL 설정**입니다.

모바일에서 로그인 시도 흐름:
1. 모바일 → `http://192.168.45.3:3000/login` 접속
2. 카카오 로그인 클릭
3. Supabase → 카카오로 리디렉션
4. 카카오 로그인 성공
5. **카카오 → Supabase로 복귀**
6. **Supabase가 `192.168.45.3:3000/auth/callback`로 리디렉션**
7. 내 앱 콜백 수신

**문제:** Supabase가 `192.168.45.3:3000/auth/callback`를 허용 목록에 없는 URL로 인식

---

## 확실한 해결 방법

### 1단계: Supabase Redirect URL 추가

**[Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)**

1. 왼쪽 메뉴 → **Authentication**
2. 상단 탭 → **URL Configuration**
3. **Redirect URLs** 섹션
4. **새 줄 추가** 버튼 클릭
5. 정확히 입력:

```
http://192.168.45.3:3000/auth/callback
```

**⚠️ 주의:**
- 정확히 위와 같이 입력 (복사-붙여넣기 권장)
- 끝에 슬래시 `/` 없음
- 공백 없음
- `https://` 아닌 `http://`

6. **Save** 클릭!

### 2단계: 카카오 사이트 도메인 추가

**[카카오 개발자 콘솔](https://developers.kakao.com/)**

1. 내 애플리케이션 선택
2. **플랫폼 설정** → Web
3. **사이트 도메인**에 추가:

```
http://192.168.45.3:3000
```

4. **저장**

---

## Windows 방화벽 설정

### 방법 1: PowerShell에서 방화벽 규칙 추가 (권장) ⚡

관리자 권한 PowerShell에서 다음 명령을 실행:

```powershell
# Node.js 인바운드 규칙 추가
New-NetFirewallRule -DisplayName "Node.js Development Server" -Direction Inbound -Program "$env:ProgramFiles\nodejs\node.exe" -Action Allow -Profile Private

# 개발 서버 포트 3000 명시적으로 허용
New-NetFirewallRule -DisplayName "Node.js Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
```

### 방법 2: 수동으로 방화벽 설정 추가

1. **Windows 설정** 열기
2. **개인 정보 보호 및 보안** → **Windows 보안**
3. **방화벽 및 네트워크 보호** 클릭
4. **고급 설정** 클릭 (관리자 권한 필요)
5. **인바운드 규칙** → **새 규칙**
6. **프로그램** 선택 → **다음**
7. **프로그램 경로** 선택:
   - 기본 경로: `C:\Program Files\nodejs\node.exe`
   - 또는 npm 경로: `%AppData%\npm\node.exe`
8. **연결 허용** 선택 → **다음**
9. **프로필**: **Private** 선택 → **다음** (공용 네트워크는 보안상 비권장)
10. **이름**: "Node.js Development Server" → **마침**

자세한 내용은 [Windows 방화벽 가이드](./windows-firewall.md)를 참고하세요.

---

## 테스트 방법

### 모바일에서 테스트

1. 모바일 브라우저에서 `http://192.168.45.3:3000` 접속
2. 로그인 버튼 클릭
3. 카카오 로그인 성공
4. **성공 시**: 홈 화면으로 리디렉션
5. **실패 시**: 에러 페이지 표시

### 성공 확인 기준

✅ **성공:**
- 카카오 로그인 팝업 표시
- 로그인 성공 후 홈으로 리디렉션
- 사용자 프로필 표시
- 회고 작성 페이지 접근 가능

❌ **실패:**
- "네트워크 연결 불가" 에러
- "Unable to exchange external code" 에러
- 에러 페이지로 리디렉션

---

## 추가 트러블슈팅

### 1. 브라우저 캐시 삭제

모바일 브라우저 설정:
- Chrome: 설정 → 개인정보 보호 → 인터넷 사용 기록 삭제
- Safari: 설정 → Safari → 방문기록 및 웹사이트 데이터 삭제

### 2. 시크릿 모드 테스트

- Chrome: 우측 상단 메뉴 → 새 시크릿 탭
- Safari: 하단 우측 아이콘 → 시크릿 모드

시크릿 모드에서도 안 되면 캐시 문제가 아닙니다.

### 3. 네트워크 확인

모바일과 PC가 **같은 Wi-Fi**에 연결되어 있는지 확인:
- 모바일: 설정 → Wi-Fi → 연결된 네트워크 이름
- PC: 설정 → 네트워크 → Wi-Fi 연결 이름

같은 네트워크여야 합니다!

### 4. PC에서 모바일 주소 테스트

PC 브라우저에서 `http://192.168.45.3:3000` 접속 테스트

- ✅ 접속 성공: 네트워크 정상
- ❌ 접속 실패: 네트워크 문제, 방화벽 또는 라우터 설정

### 5. 라우터 AP 격리 설정

일부 라우터는 기기 간 통신을 차단하는 "AP 격리" 기능이 있습니다:

1. 라우터 관리 페이지 접속 (보통 `192.168.1.1`)
2. **무선 설정** 또는 **고급 설정**
3. **AP 격리** 또는 **Client Isolation** 설정 찾기
4. **비활성화** 또는 **해제**

---

## 기기별 문제 해결

### 특정 모바일 기기에서만 안 될 때

**문제:** 다른 모바일 기기에서는 되는데 내 폰에서만 안 됨

**원인:** 특정 기기의 브라우저 설정이나 캐시 문제

**해결 방법:**
1. **다른 브라우저로 테스트** (Chrome, Safari, Firefox 등)
2. **앱 재설치** (PWA인 경우)
3. **설정 → 앱 → 브라우저 → 데이터 삭제**
4. **설정 → 앱 → 브라우저 → 권한 확인** (위치, 카메라 등)
5. **설정 → 네트워크 → VPN/프록시 해제**
6. **기기 재시작**

가장 효과적인 방법: **시크릿/프라이빗 모드에서 다른 브라우저로 테스트**

### 성공한 기기와 실패한 기기 비교

**성공한 기기 정보 기록:**
```
브라우저: ___________
OS: ___________
버전: ___________
```

**실패한 기기 정보 기록:**
```
브라우저: ___________
OS: ___________
버전: ___________
에러 메시지: ___________
```

이 정보를 비교하면 공통 문제를 찾을 수 있습니다.

---

## 자주 있는 실수

### ❌ 잘못된 Redirect URL

```
❌ http://192.168.45.3:3000/auth/callback/    (끝에 슬래시)
❌ http://192.168.45.3:3000/auth/callback     (앞에 공백)
❌ https://192.168.45.3:3000/auth/callback   (https)
❌ 192.168.45.3:3000/auth/callback           (http:// 없음)
```

### ✅ 올바른 Redirect URL

```
✅ http://192.168.45.3:3000/auth/callback
```

---

## 네트워크 주소 변경 시

네트워크 주소가 바뀌면:

1. **새 IP 확인**: PC에서 `ipconfig` 실행
2. **Supabase에 새 Redirect URL 추가**
3. **카카오에 새 사이트 도메인 추가**
4. **모바일에서 새 주소로 접속**

---

## 성공 확인

모든 설정이 올바르면:

1. ✅ Supabase Redirect URLs에 `192.168.45.3:3000/auth/callback` 있음
2. ✅ 카카오 사이트 도메인에 `192.168.45.3:3000` 있음
3. ✅ 모바일과 PC 같은 Wi-Fi 연결
4. ✅ 모바일 브라우저에서 `http://192.168.45.3:3000` 접속 가능
5. ✅ 카카오 로그인 성공

---

## 그래도 안 되면?

1. **Supabase 로그 확인**:
   - [Authentication Logs](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg/auth/logs)
   - 최근 에러 메시지 확인

2. **브라우저 콘솔 확인** (모바일):
   - Chrome: 원격 디버깅 사용
   - 또는 다른 브라우저로 시도

3. **Windows 방화벽 확인**:
   - [Windows 방화벽 가이드](./windows-firewall.md) 참고

4. **라우터 AP 격리 설정**:
   - 라우터 관리 페이지에서 "AP 격리" 해제

---

**가장 중요한 것: Supabase Redirect URLs에 모바일 네트워크 주소를 추가하고 저장하는 것!**


