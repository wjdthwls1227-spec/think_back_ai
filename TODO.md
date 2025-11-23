# TODO 및 개선 사항

## 🔴 긴급 (High Priority)

### 1. 타입 안정성 개선
- [x] `any` 타입을 적절한 타입으로 변경
  - [x] `src/app/reports/page.tsx` - 리포트 페이지 (dailyAnalysis, weeklyAnalysis, monthlyAnalysis)
  - [x] `src/app/app/admin/retrospect-tools/page.tsx` - category 타입 및 error 처리
  - [x] `src/components/admin/RichTextEditor.tsx` - blocks 배열 타입
  - [x] `src/types/index.ts` - UserInfo 인터페이스 추가
- [ ] 타입 정의 파일 정리 및 확장
  - `src/types/index.ts` - 더 구체적인 타입 정의 추가 (진행 중)

### 2. RLS 정책 검증
- [ ] `contents` 테이블 RLS 정책이 제대로 작동하는지 확인
- [ ] `is_admin` 함수가 모든 경우에 올바르게 동작하는지 테스트
- [ ] Admin 사용자가 콘텐츠를 생성/수정/삭제할 수 있는지 확인

## 🟡 중요 (Medium Priority)

### 3. 코드 품질 개선
- [ ] 사용하지 않는 변수 제거
  - `src/app/app/journal/page.tsx` - `selectedDateFormatted`
  - `src/app/app/admin/contents/page.tsx` - `Plus` import
  - `src/app/app/admin/retrospect-tools/page.tsx` - `Plus` import
  - `src/components/Navigation.tsx` - `loggedInNavItems`
- [ ] React Hook 의존성 배열 수정
  - `src/app/checkout/ai-pro/page.tsx` - `checkAIPlan` 의존성
  - `src/app/history/page.tsx` - `fetchJournals` 의존성
  - `src/app/reports/page.tsx` - 여러 useEffect 의존성
  - `src/components/admin/RichTextEditor.tsx` - `onChange` 의존성

### 4. 이미지 최적화
- [ ] `<img>` 태그를 Next.js `<Image />` 컴포넌트로 변경
  - `src/app/admin/page.tsx`
  - `src/app/app/admin/contents/page.tsx`
  - `src/app/team/page.tsx`
  - `src/components/auth/UserProfile.tsx`
  - `src/components/contents/ContentDetailClient.tsx`
  - `src/components/contents/ContentsList.tsx`

### 5. 에러 처리 개선
- [ ] API 라우트에서 더 구체적인 에러 메시지 제공
- [ ] 클라이언트 사이드 에러 바운더리 추가
- [ ] 사용자 친화적인 에러 메시지 표시

## 🟢 개선 (Low Priority)

### 6. 성능 최적화
- [ ] 불필요한 리렌더링 방지 (React.memo, useMemo, useCallback)
- [ ] 이미지 lazy loading 구현
- [ ] 코드 스플리팅 최적화

### 7. 접근성 개선
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션 개선
- [ ] 색상 대비 검증

### 8. 문서화
- [ ] API 엔드포인트 문서화
- [ ] 컴포넌트 사용법 문서화
- [ ] 데이터베이스 스키마 문서 업데이트

### 9. 테스트
- [ ] 단위 테스트 추가
- [ ] 통합 테스트 추가
- [ ] E2E 테스트 추가

### 10. 보안
- [ ] 환경 변수 검증 강화
- [ ] 입력 값 검증 및 sanitization
- [ ] XSS 방지 확인

## 📝 기타

### 11. Git 히스토리 정리
- [ ] 깨진 커밋 메시지 수정 (9684ab8, 9652810, 271b58f)
  - 주의: 히스토리 변경이 필요하므로 신중하게 진행

### 12. 개발 환경 개선
- [ ] Pre-commit 훅 설정 (husky, lint-staged)
- [ ] CI/CD 파이프라인 개선
- [ ] 개발 도구 설정 (Prettier, ESLint 규칙 강화)

### 13. 기능 개선
- [ ] 에디터 기능 확장 (RichTextEditor)
- [ ] 리포트 내보내기 기능
- [ ] 다국어 지원 (i18n)
- [ ] 다크 모드 개선

## 🎯 우선순위별 작업 계획

### Phase 1: 안정성 (1-2주)
1. 타입 안정성 개선 (긴급)
2. RLS 정책 검증 (긴급)
3. 에러 처리 개선 (중요)

### Phase 2: 품질 (2-3주)
4. 코드 품질 개선 (중요)
5. 이미지 최적화 (중요)
6. React Hook 의존성 수정 (중요)

### Phase 3: 최적화 (3-4주)
7. 성능 최적화 (개선)
8. 접근성 개선 (개선)
9. 문서화 (개선)

### Phase 4: 확장 (4주+)
10. 테스트 추가 (개선)
11. 보안 강화 (개선)
12. 기능 개선 (기타)

