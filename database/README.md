# 데이터베이스 스키마

## 파일 설명

### `schema.sql`
기존 스키마 (v0 이전 버전). 호환성을 위해 유지됩니다.

### `schema-v0.sql`
v0 기획서에 맞춘 완전한 새 스키마. **새로 시작하는 경우** 이 파일을 사용하세요.

### `migration-v0.sql`
기존 데이터베이스를 v0 구조로 마이그레이션하는 스크립트. **기존 데이터가 있는 경우** 이 파일을 사용하세요.

## 사용 방법

### 새로 시작하는 경우

1. Supabase 대시보드 → SQL Editor
2. `schema-v0.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블, 인덱스, RLS 정책이 생성됩니다

### 기존 데이터베이스 마이그레이션

1. **백업 권장**: 기존 데이터를 먼저 백업하세요
2. Supabase 대시보드 → SQL Editor
3. `migration-v0.sql` 파일의 내용을 복사하여 실행
4. 마이그레이션이 완료되면:
   - `profiles` 테이블에 `display_name`, `ai_plan_until` 컬럼이 추가됩니다
   - `role` 값이 'owner'/'member'에서 'admin'/'user'로 변경됩니다
   - 새로운 테이블들이 생성됩니다

## 주요 변경사항

### Profiles 테이블
- `display_name` 컬럼 추가
- `role` 체크 제약조건 변경: 'owner'/'member' → 'user'/'admin'
- `ai_plan_until` 컬럼 추가 (AI 요금제 만료일)

### 새로 추가된 테이블
- `contents`: 회고 콘텐츠 상품
- `user_contents`: 사용자가 가진 콘텐츠
- `orders`: 주문 (확장용)
- `order_items`: 주문 항목
- `community_cases`: 커뮤니티 사례
- `journals`: 회고 (EditorJS 기반)
- `journal_ai_analyses`: AI 분석 결과

### 기존 테이블 유지
- `retrospective_entries`: 기존 회고 항목 (호환성 유지)
- `weekly_reports`: 주간 리포트 (호환성 유지)

## RLS 정책 요약

- **Contents**: 공개된 콘텐츠는 누구나 조회 가능, 관리자는 모든 작업 가능
- **User contents**: 사용자는 자신의 콘텐츠만 접근 가능
- **Community cases**: 누구나 조회 가능, 관리자는 모든 작업 가능
- **Journals**: 사용자는 자신의 회고만 접근 가능
- **Journal AI analyses**: 사용자는 자신의 분석 결과만 접근 가능

## 주의사항

- 마이그레이션 실행 전 반드시 백업을 수행하세요
- `migration-v0.sql`은 기존 데이터를 보존하면서 구조를 업데이트합니다
- `role` 값이 자동으로 변환됩니다: 'owner' → 'admin', 'member' → 'user'
