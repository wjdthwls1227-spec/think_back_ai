import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 환경에서 모바일 접속 허용
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? [
    'http://192.168.45.3:3000',
    'http://localhost:3000'
  ] : undefined,
  // ESLint 오류가 있어도 빌드 계속 진행 (프로덕션 배포를 위해)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
