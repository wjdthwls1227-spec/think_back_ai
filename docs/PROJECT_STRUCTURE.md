# 프로젝트 구조

이 문서는 프로젝트의 폴더 및 파일 구조를 설명합니다.

## 📁 폴더 구조

```
think_back_ai-main/
├── 📂 database/              # 데이터베이스 관련
│   ├── schema.sql           # Supabase 데이터베이스 스키마
│   └── README.md             # 데이터베이스 설명
│
├── 📂 docs/                  # 프로젝트 문서
│   ├── setup/                # 설정 가이드
│   ├── development/          # 개발 문서 (히스토리, 기여자)
│   ├── deployment/           # 배포 가이드
│   └── troubleshooting/     # 문제 해결 가이드
│
├── 📂 public/                # 정적 파일 (이미지, 아이콘 등)
│
├── 📂 src/                   # 소스 코드
│   ├── app/                  # Next.js App Router 페이지
│   ├── components/           # React 컴포넌트
│   ├── context/              # React Context
│   ├── lib/                  # 유틸리티 및 라이브러리
│   └── types/                # TypeScript 타입 정의
│
└── 📄 루트 파일들            # 프로젝트 설정 파일 (필수)
```

## 📄 루트 파일 설명

다음 파일들은 Next.js, TypeScript, ESLint 등이 루트에서 찾기 때문에 **반드시 루트에 있어야 합니다**.

### 필수 설정 파일
- `package.json` - Node.js 프로젝트 메타데이터 및 의존성
- `package-lock.json` - 정확한 의존성 버전 고정
- `next.config.ts` - Next.js 설정
- `tsconfig.json` - TypeScript 설정
- `eslint.config.mjs` - ESLint 설정
- `postcss.config.mjs` - PostCSS 설정

### 기타 파일
- `README.md` - 프로젝트 메인 문서
- `.gitignore` - Git 무시 파일 목록

## 🔍 주요 폴더 상세

### `database/`
데이터베이스 스키마 및 관련 파일
- `schema.sql`: Supabase 데이터베이스 스키마 (테이블, 인덱스, RLS 정책)

### `docs/`
프로젝트 문서
- `setup/`: 초기 설정 가이드
- `development/`: 개발 히스토리 및 기여자 정보
- `deployment/`: 배포 전 체크리스트
- `troubleshooting/`: 문제 해결 가이드

### `src/`
애플리케이션 소스 코드
- `app/`: Next.js App Router 기반 페이지 및 라우트
- `components/`: 재사용 가능한 React 컴포넌트
- `context/`: 전역 상태 관리 (AuthContext 등)
- `lib/`: 유틸리티 함수 및 외부 라이브러리 래퍼
- `types/`: TypeScript 타입 정의

### `public/`
정적 파일 (이미지, 아이콘, HTML 파일 등)

## 📝 참고사항

- **설정 파일 위치**: Next.js, TypeScript 등은 설정 파일을 루트에서 찾기 때문에 이동할 수 없습니다.
- **문서 위치**: 모든 문서는 `docs/` 폴더에 카테고리별로 정리되어 있습니다.
- **데이터베이스**: 스키마 파일은 `database/` 폴더에 있습니다.

