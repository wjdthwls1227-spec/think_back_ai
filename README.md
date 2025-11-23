# 회고리즘 (Think Back AI)

AI 기반 회고 분석 플랫폼

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

- **PC 접속**: [http://localhost:3000](http://localhost:3000)
- **모바일 접속**: 터미널에 표시된 `Network: http://192.168.X.X:3000` 주소 사용

## 환경 설정

프로젝트를 처음 시작하시나요? 상세한 설정 가이드는 [설정 가이드](./docs/setup/setup-instructions.md)를 참고하세요.

**⚠️ 중요:** 로그인 기능을 사용하려면 Supabase와 카카오 OAuth 설정이 필요합니다.


## 배포

배포 전 필수 확인사항은 [배포 체크리스트](./docs/deployment/DEPLOYMENT_CHECKLIST.md)를 참고하세요.

[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하여 배포할 수 있습니다.

## 프로젝트 구조

프로젝트의 폴더 및 파일 구조는 [프로젝트 구조](./docs/PROJECT_STRUCTURE.md)를 참고하세요.

## 개발 및 배포 워크플로우

운영 중인 서비스에 영향을 주지 않고 개발하는 방법:

1. **기능 개발 시작**: `git checkout -b feature/기능명 develop`
2. **개발 완료 후**: `git checkout develop && git merge feature/기능명`
3. **배포하기**: `git checkout main && git merge develop && git push origin main`

자세한 내용은 [워크플로우 가이드](./docs/deployment/WORKFLOW.md)를 참고하세요.

## 문서

프로젝트 관련 문서는 `docs/` 폴더에 정리되어 있습니다:

- **[프로젝트 구조](./docs/PROJECT_STRUCTURE.md)** - 폴더 및 파일 구조 설명
- **[설정 가이드](./docs/setup/setup-instructions.md)** - 초기 설정 및 환경 구성
- **[개발 문서](./docs/development/)** - 개발 히스토리 및 기여자 정보
- **[배포 가이드](./docs/deployment/)** - 배포 전 체크리스트 및 워크플로우
- **[트러블슈팅](./docs/troubleshooting/)** - 문제 해결 가이드
