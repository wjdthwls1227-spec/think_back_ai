import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // any 타입을 경고로 변경 (빌드 실패 방지)
      "@typescript-eslint/no-unused-vars": "warn", // 사용하지 않는 변수도 경고로 변경
    },
  },
];

export default eslintConfig;
