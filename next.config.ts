import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 환경에서 모바일 접속 허용
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? [
    'http://192.168.45.3:3000',
    'http://localhost:3000'
  ] : undefined,
};

export default nextConfig;
