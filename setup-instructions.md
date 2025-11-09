# Refleezy 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 데이터베이스 테이블 생성
1. Supabase 대시보드에서 SQL Editor로 이동
2. `database.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블, 인덱스, RLS 정책이 생성됨

### 1.2 환경변수 확인
`.env.local` 파일에 올바른 값이 설정되어 있는지 확인:
```
NEXT_PUBLIC_SUPABASE_URL=https://dlwuckbuhnfzmramxosg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1.3 Redirect URLs 설정 ⚠️ 필수!
1. Supabase 대시보드 → Authentication → URL Configuration
2. **Redirect URLs**에 추가:
   - `http://localhost:3000/auth/callback`
   - 모바일 테스트 시: `http://192.168.X.X:3000/auth/callback` (현재 네트워크 IP)
   - 배포 시: `https://yourdomain.com/auth/callback`
3. **Site URL** 설정:
   - 로컬: `http://localhost:3000`
   - 프로덕션: 배포 도메인
4. **Save** 클릭

**이 설정이 없으면 로그인이 작동하지 않습니다!**

> **모바일 테스트 팁:** 개발 서버는 `- Local: http://localhost:3000`과 `- Network: http://192.168.X.X:3000` 두 주소를 표시합니다. 모바일에서 접속할 때는 Network 주소를 사용하므로 해당 IP의 Redirect URL도 추가해야 합니다.

## 2. 카카오 OAuth 설정

### 2.1 카카오 개발자 콘솔 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 새 애플리케이션 생성
3. 플랫폼 설정 → Web 플랫폼 추가
   - 사이트 도메인: `http://localhost:3000` (개발용)
   - 사이트 도메인: `http://192.168.X.X:3000` (모바일 테스트용 - 현재 IP: 192.168.45.3)
   - 사이트 도메인: `https://your-domain.com` (배포용)
4. 카카오 로그인 활성화
5. Redirect URI 설정:
   - `https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback`
6. 동의항목 설정:
   - 닉네임: 필수
   - 프로필 사진: 선택
   - 카카오계정(이메일): 필수

### 2.2 Supabase OAuth 설정
1. Supabase 대시보드 → Authentication → Providers
2. Kakao 활성화
3. 카카오 개발자 콘솔에서 복사한 값 입력:
   - **Client ID**: 카카오 앱 키의 REST API 키
   - **Client Secret**: 카카오 앱 키의 Client Secret (보안 → Client Secret 발급)
4. Redirect URL 확인: `https://dlwuckbuhnfzmramxosg.supabase.co/auth/v1/callback`

## 3. 데이터베이스 구조

### 3.1 테이블 구조

#### profiles
- 사용자 프로필 정보
- `auth.users`와 1:1 관계
- RLS 정책: 사용자는 자신의 프로필만 조회/수정 가능

#### retrospective_entries
- 회고 항목 저장
- JSON 형태로 KPT/PMI/자유 작성 내용을 저장
- 사용자별, 날짜별, 타입별 유니크 제약
- RLS 정책: 사용자는 자신의 회고만 CRUD 가능

#### weekly_reports
- 주간 리포트 데이터
- AI 분석 결과 및 인사이트 저장
- 사용자별, 주간별 유니크 제약
- RLS 정책: 사용자는 자신의 리포트만 CRUD 가능

### 3.2 보안 (RLS)
- 모든 테이블에 Row Level Security 적용
- 사용자는 자신의 데이터만 접근 가능
- `auth.uid()`를 통한 사용자 식별

## 4. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면:
- http://localhost:3000 에서 앱 접속
- 카카오 로그인 테스트
- 회고 작성 및 히스토리 확인

## 5. 배포 전 체크리스트

- [ ] Supabase 프로젝트 URL 및 키 확인
- [ ] 카카오 OAuth 설정 완료
- [ ] 데이터베이스 테이블 생성 완료
- [ ] RLS 정책 적용 확인
- [ ] 로컬 환경에서 로그인/로그아웃 테스트
- [ ] 회고 작성/조회 테스트
- [ ] 배포 환경의 도메인을 카카오 개발자 콘솔에 추가

## 6. 트러블슈팅

### 로그인이 안 될 때 (가장 흔한 문제)

**문제: "localhost로의 리디렉션이 거부됩니다" 에러**

**해결 방법:**
1. **Supabase 대시보드** → Authentication → URL Configuration
2. **Redirect URLs**에 `http://localhost:3000/auth/callback` 추가
3. **Site URL**을 `http://localhost:3000`으로 설정
4. **Save** 클릭
5. 개발 서버 재시작: `npm run dev`

**추가 확인사항:**
1. 카카오 개발자 콘솔의 Redirect URI 확인
2. Supabase Authentication 로그 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. 환경변수 `.env.local`에 `NEXT_PUBLIC_SITE_URL=http://localhost:3000` 확인

### 모바일에서 로그인이 안 될 때

**문제: PC에서는 되는데 모바일에서는 안 됨 또는 "네트워크가 서버에 연결할 수 없음"**

**원인:** 
1. Supabase Redirect URLs에 네트워크 IP 주소가 없음
2. 카카오 개발자 콘솔에 네트워크 IP 주소가 없음

**해결 방법:**

**1. Supabase 설정:**
1. 터미널에서 Network 주소 확인: `- Network: http://192.168.X.X:3000`
2. **Supabase 대시보드** → Authentication → URL Configuration
3. **Redirect URLs**에 `http://192.168.X.X:3000/auth/callback` 추가 (X.X는 실제 IP)
4. **Save** 클릭

**2. 카카오 개발자 콘솔 설정:**
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 앱 선택 → 설정 → 플랫폼
3. **Web 플랫폼**에서 사이트 도메인 추가:
   - `http://192.168.X.X:3000` (X.X는 실제 IP)
4. **저장** 클릭

**현재 IP:** `192.168.45.3` (터미널에서 확인 가능)

### "네트워크 연결 상태가 좋지 않습니다" 오류

**문제:** 카카오 로그인 시 "네트워크 연결 상태가 좋지 않습니다. 잠시 후 다시 시도해주세요" 메시지 표시

**해결 방법:**
1. **브라우저 캐시/쿠키 삭제** 후 재시도
2. **시크릿/프라이빗 모드**에서 테스트
3. **5-10분 대기** 후 재시도 (카카오 서버 문제일 수 있음)
4. **PC에서 먼저 테스트** (모바일 네트워크 문제인지 확인)
5. **설정 확인:**
   - Supabase Redirect URLs 확인
   - 카카오 개발자 콘솔 사이트 도메인 확인
   - 설정이 올바르게 저장되었는지 확인

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

### 데이터가 저장되지 않을 때
1. RLS 정책이 올바르게 설정되었는지 확인
2. Supabase 로그에서 권한 에러 확인
3. 테이블 구조와 타입 확인