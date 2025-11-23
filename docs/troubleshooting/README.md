# 트러블슈팅 가이드

이 폴더에는 프로젝트에서 발생할 수 있는 문제들과 해결 방법이 정리되어 있습니다.

## 문서 목록

### [모바일 로그인 문제](./mobile-login.md)
- 모바일 기기에서 로그인이 안 될 때
- Windows 방화벽 설정
- 네트워크 연결 문제
- 기기별 문제 해결

### [Supabase 설정 문제](./supabase-config.md)
- "Unable to exchange external code" 에러
- Redirect URL 설정
- 카카오 OAuth 설정 확인
- 인증 플로우 문제 해결

### [Windows 방화벽 설정](./windows-firewall.md)
- Node.js 개발 서버 방화벽 규칙 추가
- PowerShell 명령어 가이드
- 수동 설정 방법

## 빠른 진단

### 로그인이 안 될 때
1. [Supabase 설정 확인](./supabase-config.md) - 가장 흔한 원인
2. [모바일 로그인 문제](./mobile-login.md) - 모바일에서만 안 될 때
3. [Windows 방화벽](./windows-firewall.md) - 네트워크 연결 문제

### 데이터가 저장되지 않을 때
1. RLS 정책 확인
2. Supabase 로그 확인
3. 테이블 구조 확인

## 추가 도움

문제가 계속되면:
1. 브라우저 콘솔 에러 확인 (F12)
2. Supabase Authentication Logs 확인
3. 터미널 에러 메시지 확인


