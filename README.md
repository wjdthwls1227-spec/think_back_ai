# 회고리즘 (Refleezy)

소기업 실행력 향상을 위한 AI 기반 회고 분석 자동화 플랫폼

## 환경 설정

### 1. 환경변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 값을 설정하세요.

```bash
cp .env.example .env.local
```

필수 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `NEXT_PUBLIC_SITE_URL`: 앱 도메인 (로컬: `http://localhost:3000`, 프로덕션: `https://yourdomain.com`)

### 2. 의존성 설치 및 서버 시작

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
