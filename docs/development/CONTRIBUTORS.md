# 기여자 (Contributors)

이 프로젝트는 여러 개발자에 의해 개발되었습니다.

## 개발 타임라인

### 초기 개발자 (2025년 8월까지)
- **기간**: 프로젝트 시작 ~ 2025년 8월
- **역할**: 프로젝트 초기 설계 및 핵심 기능 개발
- **주요 기여**:
  - 프로젝트 초기 설정 및 아키텍처 설계
  - Next.js 15 프로젝트 생성 및 설정
  - UI 컴포넌트 시스템 구축 (Button, Input, Textarea, Card)
  - 타입 시스템 및 데이터 구조 정의
  - 회고 작성 시스템 구현
    - KPT 템플릿 (Keep, Problem, Try)
    - PMI 템플릿 (Plus, Minus, Interesting)
  - 회고 히스토리 페이지 구현
  - 주간 리포트 페이지 구현
  - Supabase 통합 및 데이터베이스 스키마 설계
  - Row Level Security (RLS) 구현
  - 카카오 OAuth 인증 시스템 구축
  - 팀 관리 기능 개발
  - 보호된 라우트 시스템 구현
  - 기본 문서화 (README.md, docs/development/DEVELOPMENT_HISTORY.md, docs/setup/setup-instructions.md)

### 후속 개발자 (2025년 8월 이후)
- **기간**: 2025년 8월 이후
- **역할**: 프로젝트 유지보수, 버그 수정 및 기능 개선

#### 버전별 개발 이력

##### v1.1.0 - 회고 자유양식 기능 추가
- **날짜**: 2025년 8월 이후
- **주요 변경사항**:
  - EditorJS 기반 리치 텍스트 에디터 통합
  - 자유양식 템플릿 컴포넌트 구현 (FreeTemplate.tsx)
  - 자유양식 콘텐츠 뷰어 구현 (FreeContentViewer.tsx)
  - 다양한 블록 타입 지원 (제목, 본문, 리스트, 체크리스트, 표, 토글, 인용구)
  - 텍스트 색상 커스터마이징 기능
  - 글자 수 카운터 기능
  - 데이터베이스 스키마에 FREE 타입 추가
  - 히스토리 페이지에 자유양식 필터링 및 표시 기능 추가
  - 주간 리포트에 자유양식 회고 통합

##### v1.2.0 - 모바일 로그인 문제 해결
- **날짜**: 2025년 8월 이후
- **주요 변경사항**:
  - Windows 방화벽 설정 가이드 작성 (docs/troubleshooting/windows-firewall.md)
  - 모바일 접속 문제 해결 (docs/troubleshooting/mobile-login.md)
  - 모바일 반응형 최적화

##### v1.3.0 - Supabase 설정 문제 해결
- **날짜**: 2025년 8월 이후
- **주요 변경사항**:
  - Supabase 설정 문제 해결 가이드 (docs/troubleshooting/supabase-config.md)
  - 네트워크 설정 개선

##### v1.4.0 - 배포 준비 및 문서화
- **날짜**: 2025년 8월 이후
- **주요 변경사항**:
  - 배포 체크리스트 작성 (docs/deployment/DEPLOYMENT_CHECKLIST.md)
  - 배포 자동화 준비
  - 코드 개선 및 최적화
  - 사용자 경험 개선

## 파일별 기여 추정

### 초기 개발자 (8월까지)가 생성한 파일
- 핵심 애플리케이션 코드 (`src/` 디렉토리 대부분)
  - `src/components/retrospective/KPTTemplate.tsx`
  - `src/components/retrospective/PMITemplate.tsx`
  - `src/app/history/page.tsx` (초기 버전)
  - `src/app/reports/page.tsx` (초기 버전)
  - `src/app/retrospective/page.tsx` (초기 버전)
- 데이터베이스 스키마 (`database/schema.sql`)
- 기본 설정 파일 (`package.json`, `tsconfig.json`, `next.config.ts` 등)
- 기본 문서 (`README.md`, `docs/development/DEVELOPMENT_HISTORY.md`, `docs/setup/setup-instructions.md`)

### 후속 개발자 (8월 이후)가 생성/수정한 파일
- **자유양식 관련**
  - `src/components/retrospective/FreeTemplate.tsx` (신규 생성)
  - `src/components/retrospective/FreeContentViewer.tsx` (신규 생성)
  - `src/lib/editor/TextColorTool.ts` (신규 생성)
  - `src/types/index.ts` (FreeContent, FreeBlock 타입 추가)
  - `src/lib/utils.ts` (자유양식 관련 유틸리티 함수 추가)
  - `src/app/retrospective/page.tsx` (자유양식 템플릿 통합)
  - `src/app/history/page.tsx` (자유양식 필터링 및 표시 추가)
  - `src/app/reports/page.tsx` (자유양식 회고 통합)
  - `database/schema.sql` (FREE 타입 지원 확인)
- **문서화**
  - `docs/troubleshooting/windows-firewall.md`
  - `docs/troubleshooting/mobile-login.md` (모바일 관련 문서 통합)
  - `docs/troubleshooting/supabase-config.md` (Supabase 관련 문서 통합)
  - `docs/deployment/DEPLOYMENT_CHECKLIST.md`
  - `docs/development/CONTRIBUTORS.md` (이 파일)

## 개발 로그 (2025년 1월 이후)

### 버전별 개발 이력

#### v1.5.0 - (진행 중)
- **날짜**: 2025년 1월 XX일
- **주요 변경사항**:
  - [ ] 개발 내용을 여기에 추가하세요

---

#### 향후 계획
- [ ] 추가 개발 예정 기능

---

## 기술 스택

### 초기 개발 시 사용
- Next.js 15.4.4
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- 카카오 OAuth

### 후속 개발 시 추가/개선
- EditorJS (리치 텍스트 에디터)
- editorjs-toggle-block
- editorjs-drag-drop
- 모바일 반응형 최적화
- 네트워크 설정 개선
- 배포 자동화 준비

## 기여 가이드

프로젝트에 기여하고 싶으시다면, 이슈를 생성하거나 Pull Request를 제출해주세요.

---

**참고**: 이 문서는 Git 히스토리와 파일 수정 날짜를 기반으로 추정되었습니다. 정확한 기여 내용은 Git 히스토리를 확인하시기 바랍니다.

