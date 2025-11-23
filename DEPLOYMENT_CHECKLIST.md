# 배포 전 체크리스트 ✅

## 현재 상태

### ✅ 완료된 작업
- 로컬 로그인 설정 완료 (`localhost:3000`)
- 모바일 로그인 설정 완료 (`192.168.45.3:3000`)
- 코드 자동 도메인 감지 (`window.location.origin`)
- 문서 업데이트 완료

## 배포 전 필수 확인사항

### 1. Supabase 대시보드 설정

#### Redirect URLs 추가
배포 후 실제 도메인을 추가해야 합니다:

1. [Supabase 대시보드](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg) 접속
2. Authentication → URL Configuration
3. Redirect URLs에 추가:
   - ✅ `http://localhost:3000/auth/callback` (로컬)
   - ✅ `http://192.168.45.3:3000/auth/callback` (모바일)
   - ⚠️ `https://YOUR-DOMAIN.com/auth/callback` (배포 후 추가 필요)

#### Site URL 설정
- 프로덕션: 배포 도메인으로 변경

### 2. 카카오 개발자 콘솔 설정

배포 도메인을 추가해야 합니다:

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 플랫폼 설정 → Web 플랫폼
3. 사이트 도메인 추가:
   - ✅ `http://localhost:3000`
   - ⚠️ `https://YOUR-DOMAIN.com` (배포 후 추가)

### 3. Vercel/Netlify 배포 설정

#### 환경 변수 설정
배포 플랫폼에서 다음 환경 변수 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dlwuckbuhnfzmramxosg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN.com
```

⚠️ **중요**: `.env.local`은 배포되지 않으므로 배포 플랫폼에서 직접 설정해야 합니다.

### 4. 배포 후 확인사항

- [ ] Supabase Redirect URL에 배포 도메인 추가됨
- [ ] 카카오 개발자 콘솔에 배포 도메인 추가됨
- [ ] Vercel/Netlify 환경 변수 설정됨
- [ ] 배포된 사이트에서 로그인 테스트 성공
- [ ] 카카오 로그인 작동 확인
- [ ] 이메일 로그인 작동 확인
- [ ] 모바일에서 배포된 사이트 로그인 테스트

## Git 저장 시 주의사항

### ✅ 저장해도 되는 것
- 코드 변경사항 (`.env.local` 제외)
- 문서 파일 (README, setup-instructions 등)
- 설정 파일 (package.json, next.config.ts 등)

### ❌ 절대 저장하면 안 되는 것
- `.env.local` 파일 (환경 변수, 비밀키 포함)
- `.env` 파일

### 현재 `.gitignore` 확인
`.gitignore` 파일에 다음이 포함되어 있는지 확인:
```
.env*
.env.local
```

✅ 이미 설정되어 있습니다.

## 자동화된 부분

다음은 **코드에서 자동으로** 처리되므로 별도 설정이 필요 없습니다:

1. **도메인 자동 감지**: `window.location.origin` 사용
   - 로컬: 자동으로 `http://localhost:3000` 감지
   - 배포: 자동으로 `https://YOUR-DOMAIN.com` 감지

2. **리다이렉트 URL**: 현재 접속한 도메인 + `/auth/callback`로 자동 생성

## 배포 후 필요한 수동 작업

### 1. Supabase 설정 (5분 소요)
- Redirect URL 추가
- Site URL 변경

### 2. 카카오 개발자 콘솔 (5분 소요)
- 사이트 도메인 추가

### 3. 배포 플랫폼 환경 변수 (2분 소요)
- 환경 변수 3개 추가

**총 소요 시간: 약 12분**

## 요약

- ✅ **코드**: 배포 시 자동으로 동작하도록 설계됨
- ⚠️ **설정**: Supabase, 카카오, 배포 플랫폼에서 각각 수동 설정 필요
- 📝 **문서**: 이미 업데이트 완료 (setup-instructions.md 참고)



