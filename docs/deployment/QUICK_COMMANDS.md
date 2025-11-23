# 빠른 명령어 가이드

자주 사용하는 Git 명령어를 빠르게 참고할 수 있는 가이드입니다.

## 🚀 기능 개발 시작

```bash
git checkout develop
git pull origin develop
git checkout -b feature/기능명
```

## 💾 개발 중간 저장

```bash
git add .
git commit -m "feat: 기능 개발 중간 저장"
git push origin feature/기능명
```

## ✅ 기능 완료 후 테스트

```bash
git checkout develop
git pull origin develop
git merge feature/기능명
git push origin develop
```

## 🎯 배포하기 (사용자에게 공개)

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

## 📋 현재 상태 확인

```bash
# 현재 브랜치 확인
git branch

# 변경사항 확인
git status

# 최근 커밋 확인
git log --oneline -5
```

## 🔄 브랜치 전환

```bash
# develop으로 이동
git checkout develop

# main으로 이동
git checkout main

# feature 브랜치로 이동
git checkout feature/기능명
```

## ⚠️ 긴급 수정 (운영 중인 사이트)

```bash
git checkout main
git checkout -b hotfix/긴급수정
# 수정 후
git add .
git commit -m "fix: 긴급 수정"
git checkout main
git merge hotfix/긴급수정
git push origin main
```

---

**핵심**: feature에서 개발 → develop으로 병합 → main으로 배포


