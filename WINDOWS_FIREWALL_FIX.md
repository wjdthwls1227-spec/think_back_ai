# Windows 방화벽 문제 해결 가이드

## 문제 증상
- PC에서는 로그인이 정상 작동 ✅
- 일부 모바일 기기에서만 로그인 실패 ❌
- 에러: **"네트워크가 서버에 연결할 수 없습니다"** 또는 **ERR_CONNECTION_FAILED**

## 원인
Windows 방화벽이 Node.js 개발 서버의 **네트워크 요청을 차단**하고 있을 가능성이 높습니다.

---

## 해결 방법

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

### 방법 3: 개발 서버 재시작

방화벽 설정 후 **개발 서버를 완전히 종료**하고 재시작:

```powershell
# 터미널에서 Ctrl+C로 서버 종료
# 그 다음 다시 시작
npm run dev
```

---

## 확인 방법

### 1. PC에서 네트워크 IP 테스트
브라우저에서 `http://192.168.45.3:3000` 접속 (터미널에 표시된 Network 주소)

### 2. 터미널 출력 확인
`npm run dev` 실행 시 다음과 같은 출력이 보여야 함:
```
▲ Next.js 15.4.4
- Local:        http://localhost:3000
- Network:      http://192.168.45.3:3000
```

### 3. 모바일에서 접속 테스트
- ✅ 작동: 방화벽 설정 성공
- ❌ 여전히 실패: 다음 단계 진행

---

## 추가 확인사항

### 라우터 AP 격리 설정
일부 라우터는 기기 간 통신을 차단하는 "AP 격리" 기능이 있습니다:

1. 라우터 관리 페이지 접속 (보통 `192.168.1.1` 또는 `192.168.0.1`)
2. **무선 설정** 또는 **고급 설정**
3. **AP 격리** 또는 **Client Isolation** 설정 찾기
4. **비활성화** 또는 **해제**

### Windows 방화벽 상태 확인
```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled
```
- **Enabled: True**: 방화벽 활성화됨
- 설정이 필요함

---

## 트러블슈팅

### Q: PowerShell에서 "액세스가 거부되었습니다" 에러
**A:** PowerShell을 **관리자 권한으로 실행**해야 합니다.
- Windows 검색 → "PowerShell" → **관리자 권한으로 실행**

### Q: 규칙을 추가했는데도 안 됩니다
**A:** 
1. 방화벽 규칙이 **Private 네트워크 프로필**에 적용되었는지 확인
2. PC와 모바일이 **같은 Wi-Fi 네트워크**에 연결되어 있는지 확인
3. 개발 서버 **재시작** 확인

### Q: 개발 서버가 "Network: http://..."를 표시하지 않습니다
**A:** 
- Next.js가 네트워크 IP를 자동으로 감지하지 못하는 경우
- 랜 케이블/와이파이 연결 확인
- VPN/프록시 비활성화

### Q: 규칙을 삭제하고 싶습니다
```powershell
# 규칙 제거
Remove-NetFirewallRule -DisplayName "Node.js Development Server"
Remove-NetFirewallRule -DisplayName "Node.js Port 3000"
```

---

## 참고사항

- **Private 네트워크**: 집/회사 Wi-Fi (비공개 네트워크)
- **Public 네트워크**: 공용 Wi-Fi, 카페 등 (공개 네트워크)
- 개발 중에는 **Private 네트워크에만** 허용하는 것을 권장
- 프로덕션 배포 시에는 Vercel/Netlify가 자동으로 처리

---

## 성공 확인 후 다음 단계

방화벽 설정이 완료되면:
1. ✅ 개발 서버 재시작: `npm run dev`
2. ✅ 모바일에서 `http://192.168.45.3:3000` 접속
3. ✅ 로그인 테스트

여전히 문제가 있으면 `MOBILE_DEVICE_TROUBLESHOOTING.md`를 참고하세요.



