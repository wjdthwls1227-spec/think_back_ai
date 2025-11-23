# 개발 및 배포 워크플로우

간단한 개발 및 배포 가이드입니다.

## 🚀 빠른 시작

### 1. 기능 개발 시작하기

새로운 기능을 개발할 때:

```bash
# develop 브랜치로 이동
git checkout develop
git pull origin develop

# 새 기능 브랜치 생성 (예: feature/회고검색기능)
git checkout -b feature/기능명

# 이제 개발 시작!
```

**또는 간단하게:**
```bash
git checkout -b feature/기능명 develop
```

### 2. 개발 중간 저장

```bash
git add .
git commit -m "feat: 기능 개발 중간 저장"
git push origin feature/기능명
```

### 3. 기능 완료 후 테스트

```bash
# develop으로 병합
git checkout develop
git pull origin develop
git merge feature/기능명
git push origin develop

# develop 브랜치가 Vercel에 연결되어 있다면 자동으로 스테이징 배포됨
# → 여기서 최종 테스트
```

### 4. 배포하기 (사용자에게 공개)

여러 기능이 완료되고 테스트가 끝났을 때:

```bash
# main으로 병합 (프로덕션 배포)
git checkout main
git pull origin main
git merge develop
git push origin main

# → 사용자 사이트에 새 기능이 반영됨!
```

## 📝 실제 사용 예시

### 예시 1: 회고 검색 기능 개발

```bash
# 1. 기능 개발 시작
git checkout develop
git checkout -b feature/회고검색기능

# 2. 개발 작업 (코드 작성)
# ... src/app/history/page.tsx 수정 ...

# 3. 중간 저장
git add .
git commit -m "feat: 회고 검색 기능 추가"
git push origin feature/회고검색기능

# 4. 기능 완료 후 develop으로 병합
git checkout develop
git merge feature/회고검색기능
git push origin develop

# 5. 테스트 완료 후 배포
git checkout main
git merge develop
git push origin main
```

### 예시 2: 여러 기능을 한 번에 배포

```bash
# 기능 A, B, C를 각각 feature 브랜치에서 개발 완료
# 모두 develop에 병합 완료
# 테스트 완료

# 이제 한 번에 배포
git checkout main
git merge develop
git push origin main
```

## ⚠️ 주의사항

### 절대 하지 말아야 할 것

1. **main 브랜치에 직접 커밋하지 않기**
   ```bash
   # ❌ 이렇게 하면 안 됨
   git checkout main
   git add .
   git commit -m "수정"
   git push origin main
   
   # ✅ 이렇게 해야 함
   git checkout feature/기능명
   git add .
   git commit -m "수정"
   git push origin feature/기능명
   ```

2. **테스트 없이 main으로 병합하지 않기**
   - 항상 develop에서 충분히 테스트 후에만 main으로

### 긴급 수정이 필요한 경우

운영 중인 사이트에 긴급 버그가 발생했을 때:

```bash
# main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/긴급수정

# 수정 후
git add .
git commit -m "fix: 긴급 버그 수정"
git checkout main
git merge hotfix/긴급수정
git push origin main

# develop에도 병합 (나중에)
git checkout develop
git merge hotfix/긴급수정
git push origin develop
```

## 🔄 Vercel 자동 배포

Vercel을 사용하는 경우:

- **feature 브랜치 푸시** → 프리뷰 URL 자동 생성 (테스트용)
- **develop 브랜치 푸시** → 스테이징 URL 자동 생성 (최종 테스트)
- **main 브랜치 푸시** → 프로덕션 배포 (사용자 사이트)

### Vercel 설정 확인

1. Vercel 대시보드 접속
2. 프로젝트 → Settings → Git
3. Production Branch: `main` 확인
4. Preview Branches: `develop`, `feature/*` 확인

## 📋 체크리스트

### 기능 개발 시작 전
- [ ] develop 브랜치가 최신인지 확인 (`git pull origin develop`)
- [ ] feature 브랜치 생성
- [ ] 로컬에서 개발 환경 확인

### 기능 개발 중
- [ ] 정기적으로 커밋 및 푸시
- [ ] 프리뷰 URL에서 확인 (Vercel 사용 시)
- [ ] 다른 기능과 충돌 없는지 확인

### 배포 전
- [ ] develop에서 모든 기능 테스트 완료
- [ ] 빌드 에러 없음 확인 (`npm run build`)
- [ ] 데이터베이스 변경사항 확인 (필요 시)
- [ ] 환경 변수 확인

### 배포 후
- [ ] 프로덕션 사이트에서 기능 확인
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 확인

## 💡 팁

### 브랜치 이름 규칙

- `feature/기능명` - 새 기능 개발
- `fix/버그명` - 버그 수정
- `hotfix/긴급수정` - 긴급 수정
- `refactor/리팩토링명` - 코드 개선

예시:
- `feature/회고검색기능`
- `feature/다크모드`
- `fix/로그인에러`
- `hotfix/데이터손실수정`

### 커밋 메시지 규칙

- `feat: 새 기능 추가`
- `fix: 버그 수정`
- `refactor: 코드 리팩토링`
- `docs: 문서 수정`
- `style: 코드 포맷팅`
- `test: 테스트 추가`

---

**요약**: feature 브랜치에서 개발 → develop으로 병합 → 테스트 → main으로 배포


