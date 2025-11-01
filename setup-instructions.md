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
```

## 2. 카카오 OAuth 설정

### 2.1 카카오 개발자 콘솔 설정
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 새 애플리케이션 생성
3. 플랫폼 설정 → Web 플랫폼 추가
   - 사이트 도메인: `http://localhost:3001` (개발용)
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
- http://localhost:3001 에서 앱 접속
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

### 로그인이 안 될 때
1. 카카오 개발자 콘솔의 Redirect URI 확인
2. Supabase Authentication 로그 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 데이터가 저장되지 않을 때
1. RLS 정책이 올바르게 설정되었는지 확인
2. Supabase 로그에서 권한 에러 확인
3. 테이블 구조와 타입 확인