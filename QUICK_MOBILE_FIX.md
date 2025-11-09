# 🚀 모바일 접속 빠른 해결 가이드

## 문제
- ✅ PC에서는 로그인 정상 작동
- ❌ 모든 모바일 기기에서 로그인 실패
- 에러: "네트워크가 서버에 연결할 수 없습니다" 또는 ERR_CONNECTION_FAILED

---

## ✅ 해결 방법

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

---

### 2단계: 모바일 접속

1. 터미널 출력 확인:
   ```
   ▲ Next.js 15.4.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.X.X:3000  ← 이 주소 사용!
   ```

2. 모바일 브라우저에서 `http://192.168.X.X:3000` 접속

---

### 3단계: 여전히 안 되면

#### A. Windows 방화벽 수동 설정

**PowerShell을 관리자 권한으로 실행** (중요!)

```powershell
# 방화벽 규칙 추가
New-NetFirewallRule -DisplayName "Node.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
```

---

#### B. Supabase 설정 확인

1. [Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)
2. Authentication → URL Configuration
3. Redirect URLs에 다음 추가:
   ```
   http://192.168.X.X:3000/auth/callback
   ```
   (터미널에 표시된 네트워크 주소 사용)

---

#### C. 카카오 개발자 콘솔 설정 확인

1. [카카오 개발자 콘솔](https://developers.kakao.com/)
2. 플랫폼 설정 → Web
3. 사이트 도메인에 추가:
   ```
   http://192.168.X.X:3000
   ```

---

## 🎯 체크리스트

- [ ] 개발 서버가 `0.0.0.0:3000`에서 수신 중 (`netstat`로 확인)
- [ ] Windows 방화벽 경고에서 "액세스 허용" 클릭
- [ ] Supabase Redirect URLs에 네트워크 주소 추가
- [ ] 카카오 개발자 콘솔에 네트워크 주소 추가
- [ ] PC와 모바일이 **같은 Wi-Fi**에 연결
- [ ] 모바일 브라우저에서 `http://192.168.X.X:3000` 접속

---

## 📱 추가 확인사항

### 네트워크 테스트

**PC에서:**
```powershell
# IP 주소 확인
ipconfig

# Wi-Fi 어댑터의 IPv4 주소 확인
# 예: 192.168.45.3
```

**모바일에서:**
- 설정 → Wi-Fi → 연결된 네트워크 정보
- IP 주소가 같은 대역인지 확인 (예: 192.168.45.X)

### 라우터 설정 확인

일부 라우터는 "AP 격리(AP Isolation)" 기능으로 기기 간 통신을 차단합니다:

1. 라우터 관리 페이지 접속 (보통 `192.168.1.1`)
2. 무선 설정 → AP 격리 **해제**

---

## 🔧 자세한 가이드

- **Windows 방화벽**: [WINDOWS_FIREWALL_FIX.md](./WINDOWS_FIREWALL_FIX.md)
- **기기별 문제**: [MOBILE_DEVICE_TROUBLESHOOTING.md](./MOBILE_DEVICE_TROUBLESHOOTING.md)
- **전체 설정**: [setup-instructions.md](./setup-instructions.md)

---

## ⚡ 빠른 진단

모바일에서 시크릿/프라이빗 모드로 접속:

```
✅ 작동 → 캐시/쿠키 문제
❌ 안됨 → 방화벽 또는 네트워크 문제
```

---

## 💡 성공 사례

설정이 올바르면:
- ✅ 모바일에서 `http://192.168.X.X:3000` 접속 성공
- ✅ 카카오 로그인 버튼 클릭
- ✅ 카카오 로그인 팝업 표시
- ✅ 로그인 성공

**아직도 안 되면:**
- 브라우저 콘솔(F12) 에러 확인
- 터미널 에러 메시지 확인
- 다른 모바일 기기로 테스트



