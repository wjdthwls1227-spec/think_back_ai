# 회고리즘 (Think Back AI) v0 기획서

## 1. 서비스 개요

**서비스명(ko)**: 회고리즘  
**서비스명(en)**: ThinkBack AI

**목적**:  
개인/팀의 회고를 구조화하고 AI 분석으로 요약·패턴·다음 액션을 제안하는 플랫폼

**수익 구조(초기)**:  
- 회고 콘텐츠 판매(워크북, 커뮤니티 기수, 패키지)
- AI 요금제(구독 플랜: Free / AI Pro)

## 2. 기술 스택

### 프론트
- Next.js 15.4.4 (App Router)
- React 19.1.0
- TypeScript 5

### 스타일링
- Tailwind CSS 4
- PostCSS
- 다크모드: `darkMode: 'class'` + `dark:` 유틸

### 백엔드/BaaS
- Supabase
- @supabase/supabase-js (클라이언트)
- @supabase/ssr (서버 사이드)

### 에디터
- EditorJS + header / list / paragraph / table / checklist / toggle / drag-drop

### UI 유틸
- lucide-react (아이콘)
- clsx, tailwind-merge

### 인증
- Supabase Auth (이메일 Magic Link, 카카오 OAuth)

### 배포
- Vercel

## 3. 정보 구조 / IA 전체

### 3.1 상위 구조 트리

#### 공개 영역 (비로그인 가능)
- `/` 랜딩
- `/contents` 회고 콘텐츠 목록(쇼핑몰 카탈로그)
- `/contents/[slug]` 회고 콘텐츠 상세
- `/pricing` 요금제 소개 (Free / AI Pro)
- `/login` 로그인/회원가입

#### 구매/앱 영역 (로그인 필요)
- `/checkout/[contentId]` 회고 콘텐츠 구매 플로우(v0: 더미)
- `/app/dashboard` 대시보드
- `/app/journal` 회고 작성 + AI 분석
- `/app/contents` 내가 가진 회고 콘텐츠 목록
- `/app/mypage` 마이페이지(프로필 + 요금제 + 내 콘텐츠 + 계정)

#### 어드민 영역 (로그인 + role=admin)
- `/app/admin/contents` 회고 콘텐츠 관리(상품 CMS)
- `/app/admin/community-cases` 커뮤니티 사례 관리

### 3.2 공개 영역 상세 IA

#### `/` 랜딩

**헤더 (공통)**
- 로고: ThinkBack AI / 서브: 회고리즘
- 네비:
  - 서비스 소개 → `/#about`
  - 콘텐츠 → `/contents`
  - 플랜 → `/pricing`
- 다크모드 토글
- 로그인 → `/login`

**Hero 섹션**
- 타이틀: "성장하는 사람들의 회고 알고리즘 플랫폼"
- 서브카피: ThinkBack AI 설명 1–2줄
- CTA
  - Primary: 3분 만에 회고 시작하기 → `/login`
  - Secondary: 회고 콘텐츠 살펴보기 → `/contents`
- 목업 카드들(정적 UI)
  - "오늘 회고" 카드
  - "AI 분석 요약" 카드
  - "이번 주 패턴" 카드

**About 섹션** `/#about`
- 타이틀: "회고리즘은 이런 사람을 위해 만들었다"
- 왼쪽: 타깃 bullet 3개
- 오른쪽: 기능 카드 3개
  - 개인 회고 템플릿
  - AI 기반 회고 분석
  - 팀 회고 리포트

**콘텐츠/사례 섹션** `/#contents`
- 타이틀: "회고리즘으로 변화한 사람들"
- 커뮤니티 사례 카드 3개
- 데이터 출처: `community_cases` (is_featured=true 상위 3개)
- fallback: 하드코딩

**커뮤니티 섹션** `/#community`
- 타이틀: "우리는 혼자 회고하지 않는다"
- 설명: 챌린지/워크숍/온라인 커뮤니티
- 카드:
  - 9주 회고 챌린지
  - 회고 워크숍
  - 온라인 커뮤니티
- 더미 통계: 참여자/누적 회고 수

**회고 도구 추천 섹션** `/#tools`
- 타이틀: "회고를 도와주는 도구들"
- 설명: 향후 쿠팡파트너스 연동 예정
- Client Component `RetrospectTools`
- 타입:
  ```typescript
  type RetrospectTool = {
    id: string;
    category: "노트" | "필기구" | "도서" | "디지털" | "기타";
    name: string;
    description: string;
    benefit: string;
    imageUrl: string;
    linkUrl: string;
  };
  ```
- 카테고리 필터: 전체/노트/필기구/도서/디지털/기타
- 카드 리스트: 이름/설명/benefit/자세히보기 링크

**푸터**
- © {year} ThinkBack AI · 회고리즘.
- 제휴 링크 안내: 쿠팡파트너스 포함 가능 문구

#### `/contents` 회고 콘텐츠 목록 (쇼핑몰)
- 상단: 소개 문구
- 필터/탭(선택): 전체/워크북/커뮤니티/패키지
- 카드 리스트
  - type: workbook / cohort / bundle
  - title / subtitle / price / badge
  - 자세히 보기 → `/contents/[slug]`

#### `/contents/[slug]` 회고 콘텐츠 상세
- 상품 헤더
  - 제목 / 가격 / 타입 태그 / 한 줄 요약
- 소개
  - 이 콘텐츠가 해결하는 문제
  - 기대되는 변화
- 구성/커리큘럼
  - 워크북: 목차/주차
  - 커뮤니티: 기간, 포함 요소
- CTA
  - 지금 구매하기
  - 로그인 O → `/checkout/[id]`
  - 로그인 X → `/login?redirect=/checkout/[id]`

#### `/pricing` 요금제
- **Free 카드**
  - 기능: 회고 작성, 콘텐츠 개별 구매 가능, AI 없음
- **AI Pro 카드**
  - 기능: AI 회고 분석, 월간 리포트(계획)
- 비로그인 → 로그인 후 시작하기
- 로그인 → 플랜 적용하기 (나중에 결제/플랜 API 연동)

#### `/login`
- 이메일 입력 폼
- "로그인 / 링크 보내기" 버튼
- v0: UI만, Supabase Magic Link 연결은 TODO

### 3.3 앱(로그인 후) IA

#### `/app/dashboard`
- 문구: "오늘 하루도 회고로 정리해볼까요?"
- 카드 3개
  - 오늘 회고 작성하기 → `/app/journal`
  - 최근 회고 리스트(더미 3건)
  - 내 회고 콘텐츠 요약 → `/app/contents`

#### `/app/journal`
- 상단: 오늘 날짜, 간단 프롬프트 3문장
- EditorJS 기반 회고 작성 영역
- 버튼
  - 저장하기: v0에서 EditorJS save() → console.log
  - AI 분석 보기:
    - 로그인 + AI 플랜 활성 → `/api/journals/[id]/analyze` 호출
    - 결과 카드(요약/키워드/내일 액션 3개)
    - 플랜 없음(Free) → 업그레이드 유도 + `/pricing` 링크

#### `/app/contents` (내 콘텐츠)
- `user_contents` + `contents` join
- 카드 리스트
  - type 태그 (워크북/커뮤니티/패키지)
  - 제목/부제
  - 진행률(progress bar)
  - 이어보기 버튼(추후 콘텐츠 상세로 연결)

#### `/app/mypage` (마이페이지)
- 섹션 4개.
  - **프로필**
    - 이름(display_name) / 이메일
  - **요금제**
    - 현재 플랜: Free / AI Pro
    - `ai_plan_until > now` → AI Pro, 만료일 표시
    - 버튼: `/pricing`
  - **내 콘텐츠 요약**
    - 구매한 콘텐츠 개수, 참여 기수 수, 리스트 일부
  - **계정**
    - 로그아웃 버튼(나중에 Supabase signOut 연동)

### 3.4 어드민 IA

**어드민 조건**: `profiles.role = 'admin'`.

**공통**
- `/app/(protected)/layout.tsx`에서 인증 체크
- 어드민 페이지 내에서 추가로 role 검사, 아니면 403/리다이렉트

#### `/app/admin/contents` 회고 콘텐츠 CMS
- 리스트
  - 제목 / 타입 / 가격 / 공개 여부 / 생성일 / 편집 / 삭제
- 생성/수정 폼
  - slug
  - type (workbook / cohort / bundle)
  - title
  - subtitle
  - price
  - description
  - meta(JSON) – v0는 textarea
  - is_published

#### `/app/admin/community-cases` 커뮤니티 사례 관리
- 테이블: 제목 / 카테고리 / is_featured / 생성일 / 편집 / 삭제
- 폼: 제목 / 카테고리 / 요약/본문 / is_featured
- 랜딩 사례 섹션은 `community_cases`에서 `is_featured=true` 상위 3개 조회.

## 4. 데이터 모델 요약

### 4.1 profiles

```sql
profiles (
  id uuid primary key,            -- auth.user.id
  email text,
  display_name text,
  role text check (role in ('user','admin')) default 'user',
  ai_plan_until timestamptz,      -- AI 요금제 만료일 (null이면 Free)
  created_at timestamptz default now()
)
```

### 4.2 contents (회고 콘텐츠 상품)

```sql
create type content_type as enum ('workbook', 'cohort', 'bundle');

contents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type content_type not null,
  title text not null,
  subtitle text,
  description text,
  price integer not null,
  is_published boolean default false,
  meta jsonb,
  created_at timestamptz default now()
)
```

### 4.3 user_contents (내가 가진 콘텐츠)

```sql
user_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  content_id uuid references contents(id),
  progress integer default 0,
  started_at timestamptz,
  completed_at timestamptz
)
```

### 4.4 orders / order_items (확장용, v0는 더미 가능)

```sql
orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  total_amount integer not null,
  status text check (status in ('pending','paid','failed','refunded')) default 'pending',
  created_at timestamptz default now()
);

order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  content_id uuid references contents(id),
  unit_amount integer not null,
  quantity integer not null default 1
);
```

### 4.5 community_cases (커뮤니티 사례)

```sql
community_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  body text,
  category text,           -- '개인 회고', '커리어', '팀 프로젝트' 등
  is_featured boolean default false,
  created_at timestamptz default now()
)
```

### 4.6 journals / journal_ai_analyses (회고 + AI 결과)

```sql
journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text check (type in ('daily','weekly','monthly')) default 'daily',
  date date,
  content jsonb,           -- EditorJS 결과
  created_at timestamptz default now()
);

journal_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid references journals(id),
  user_id uuid references profiles(id),
  result jsonb,            -- 요약/키워드/액션
  created_at timestamptz default now()
)
```

## 5. 권한 / 플랜 로직

- `/app/*`, `/checkout/*`, `/app/admin/*` → 로그인 필수
- `/app/admin/*` → 로그인 + `role='admin'`

**AI 플랜:**
- `profiles.ai_plan_until > now()` → AI Pro
- 아니면 Free

**AI 분석 API:**
- 엔드포인트 예: `app/api/journals/[id]/analyze/route.ts`
- 처리 순서:
  1. `auth.getUser()`로 user 확인, 없으면 401
  2. `profiles`에서 `ai_plan_until` 조회:
     - 없거나 과거 → 402 (플랜 없음)
  3. `journals`에서 해당 journal + user_id 확인
  4. OpenAI 호출 → 결과 `journal_ai_analyses`에 저장 후 반환

**프론트 `/app/journal`에서는:**
- `hasAI` 플래그로 버튼 활성/비활성
- API 응답 402면 업그레이드 안내

## 6. 사용자 플로우 요약

### 비로그인
- `/`, `/contents`, `/contents/[slug]`, `/pricing`, `/login` 자유 열람
- 구매/AI 사용 시 로그인 요구

### 회고 콘텐츠 구매
- `/contents/[slug]` → 지금 구매하기
- 로그인 X → `/login?redirect=/checkout/[id]`
- 로그인 O → `/checkout/[id]`
- v0에서는 "구매 완료" 버튼 → `user_contents` insert → `/app/contents`

### AI 요금제 구매
- `/pricing` → AI Pro 선택 → 로그인 필요
- 결제 성공 시 `profiles.ai_plan_until` 갱신

### 회고 작성 + 분석
- `/app/journal` → EditorJS로 회고 작성 → 저장
- AI Pro → "AI 분석" → API → 결과 카드
- Free → 업그레이드 안내

### 마이페이지
- `/app/mypage` →
  - 프로필 정보
  - 현재 요금제/만료일
  - 내가 가진 콘텐츠 목록
  - 계정(로그아웃)

### 어드민
- `/app/admin/contents` → 상품 등록/수정/삭제
- `/app/admin/community-cases` → 사례 등록/수정/삭제 → 랜딩에 반영

## 7. Cursor에서 단계별 실행 순서

### 단계 0. 스펙 고정 ✅
- 위 내용 전체를 `docs/spec-thinkback-ai-v0.md`로 저장.
- 이 파일을 "단일 진실 소스"로 사용.

### 단계 1. 프로젝트 스캐폴딩 (v0 / Cursor 공통)
- v0에 지금 스펙 요약 프롬프트 전달 → 기본 app/ 구조 + 레이아웃 + 간단 페이지 코드 생성.
- 코드 내려받아 Git repo think_back_ai 생성, 첫 커밋.

### 단계 2. 공통 레이아웃 / 다크모드
- `app/layout.tsx`
  - 헤더, 컨테이너, 다크모드 `dark:` 적용
- `ThemeToggle` Client Component 구현
- 공용 Button, Card 컴포넌트 구현
- 완료 후 브라우저에서 라우팅만 확인.

### 단계 3. 공개 페이지 구현
- 랜딩 `/page.tsx`
  - Hero / About / 사례 / 커뮤니티 / 도구 / 푸터 섹션
- `/contents`
  - 더미 contents 배열로 카드 리스트
- `/pricing`
  - Free / AI Pro 카드
- `/login`
  - 이메일 폼 UI
- 여기까지 UI만, Supabase 연동은 나중.

### 단계 4. 보호 레이아웃 + 기본 앱 페이지
- `lib/supabase/server.ts`, `client.ts` 생성 (공식 예시 기반)
- `app/app/(protected)/layout.tsx`
  - Supabase SSR client로 `auth.getUser()`
  - 없으면 `/login` redirect
  - 상단 앱 헤더 + 컨테이너
- `app/app/(protected)/dashboard/page.tsx`
- `app/app/(protected)/contents/page.tsx` (더미 데이터)
- `app/app/(protected)/mypage/page.tsx` (더미 데이터)
- 이 시점까지는 DB 없이 mock 데이터.

### 단계 5. EditorJS 회고 페이지
- `components/editor/JournalEditor.tsx` Client Component
  - EditorJS init / destroy
  - save()로 결과 log
- `/app/journal` 페이지에 EditorJS 삽입
- 프롬프트 텍스트 + 저장 버튼 + AI 분석 더미 결과

### 단계 6. Supabase 스키마 정의 + RLS
- Supabase 콘솔에서:
  - tables: `profiles`, `contents`, `user_contents`, `community_cases`, `journals`, `journal_ai_analyses` 생성
  - `profiles.role`, `profiles.ai_plan_until` 추가
- RLS 정책:
  - `contents`: public select / admin all
  - `community_cases`: public select / admin all
  - `user_contents`, `journals` 등은 `user_id=auth.uid()` 조건
- 스키마 완료 후 Cursor에게 DB 스키마 반영된 타입/쿼리 작성 요청.

### 단계 7. MyPage 실제 데이터 연결
- `/app/mypage/page.tsx`에서:
  - Supabase SSR로 profile + user_contents join 조회
  - 현재 플랜(currentPlan) / 만료일 계산
  - 내 콘텐츠 카드 실제 데이터로 렌더
- `/app/contents`에서도 user_contents 기반으로 리스트 표시.

### 단계 8. 콘텐츠 쇼핑몰 연결
- `/contents`, `/contents/[slug]`를 Supabase `contents` 테이블과 연결
  - `is_published=true` 목록
  - slug 기반 상세 조회
- `/checkout/[contentId]` 페이지 생성
  - "구매 완료" 버튼 클릭 시 server action으로
  - `user_contents` insert
- v0에서는 `orders/order_items`는 생략해도 됨

### 단계 9. 어드민 CMS 구현
- `/app/admin/contents`
  - `role=admin` 체크
  - contents 리스트 + 생성/수정 폼 → Supabase insert/update
- `/app/admin/community-cases`
  - community_cases 리스트 + 생성/수정/삭제
- 랜딩 사례 섹션 → `community_cases.is_featured=true` 조회로 변경

### 단계 10. AI 플랜 로직 + API 스텁
- Supabase에서 `ai_plan_until` 수동 업데이트(테스트용)
- `/app/mypage`에서 AI Pro 표시 확인
- API 라우트 `app/api/journals/[id]/analyze/route.ts` 생성
  - user + `ai_plan_until` 체크
  - 401/402/404/200 분기
  - OpenAI 호출은 TODO, 현재는 더미 result만 반환
- `/app/journal`에서 이 API 호출 + 402 처리(UI 업그레이드 안내)

## 완료 시점

여기까지 하면:
- 전체 기획 반영된 IA
- 다크모드
- EditorJS 회고
- 콘텐츠 쇼핑몰 + 내 콘텐츠
- 요금제/AI 플랜 상태 표시
- 어드민 CMS 골격
- AI 분석 권한 구조

까지 모두 정리된 상태.

