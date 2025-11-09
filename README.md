# 회고리즘 (Refleezy)

소기업 실행력 향상을 위한 AI 기반 회고 분석 자동화 플랫폼

## 환경 설정

### 1. Supabase 대시보드 설정 ⚠️ 중요!

**로그인 문제를 방지하기 위해 반드시 설정해야 합니다:**

1. **Supabase 대시보드 직접 접속:** [dlwuckbuhnfzmramxosg 프로젝트](https://supabase.com/dashboard/project/dlwuckbuhnfzmramxosg)
2. 좌측 메뉴 → **Authentication** 클릭
3. 상단 탭 → **URL Configuration** 클릭
4. **Redirect URLs**에 다음 추가:
   - `http://localhost:3000/auth/callback`
   - 모바일 테스트 시: `http://192.168.X.X:3000/auth/callback` (터미널에 표시된 Network 주소)
   - 배포 시: `https://yourdomain.com/auth/callback`
5. **Site URL** 설정:
   - 로컬: `http://localhost:3000`
   - 프로덕션: 배포 도메인
6. **Save** 클릭

자세한 설정은 [setup-instructions.md](./setup-instructions.md)를 참고하세요.

### 2. 환경변수 설정

`.env.local` 파일이 이미 생성되어 있어야 합니다. 파일 내용 확인:

```bash
# 파일 내용 확인
cat .env.local
```

필수 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `NEXT_PUBLIC_SITE_URL`: 앱 도메인 (로컬: `http://localhost:3000`)

### 3. 의존성 설치 및 서버 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

- **PC 접속**: [http://localhost:3000](http://localhost:3000)
- **모바일 접속**: 터미널에 표시된 `Network: http://192.168.X.X:3000` 주소 사용

**⚠️ 모바일 접속이 안 될 때:**

Windows 방화벽이 차단하고 있을 수 있습니다. 다음 중 하나를 시도하세요:

1. **방화벽 자동 허용 (권장)**:
   - 개발 서버 실행 시 "Windows 보안 경고" 팝업 표시
   - **"액세스 허용"** 클릭

2. **수동 방화벽 설정**:
   - [WINDOWS_FIREWALL_FIX.md](./WINDOWS_FIREWALL_FIX.md) 참고
   - PowerShell을 관리자 권한으로 실행 후 명령 실행

3. **개발 서버 재시작**:
   - 방화벽 설정 후 `npm run dev` 재실행

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 배포

### Vercel에 배포하기

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**⚠️ 배포 전 필수 확인사항:**
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 참고
- Supabase Redirect URLs에 배포 도메인 추가
- 카카오 개발자 콘솔에 배포 도메인 추가
- Vercel 환경 변수 설정

자세한 내용은 [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) 참고하세요.
