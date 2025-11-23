# OpenAI API 설정 가이드

## 1. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴로 이동
4. "Create new secret key" 클릭
5. 키 이름 입력 (예: "think-back-ai")
6. 생성된 API 키 복사 (한 번만 표시되므로 안전하게 보관)

## 2. 환경 변수 설정

### 로컬 개발 환경

`.env.local` 파일에 다음을 추가:

```env
OPENAI_API_KEY=sk-...
```

⚠️ **중요**: `.env.local` 파일은 Git에 커밋하지 마세요. 이미 `.gitignore`에 포함되어 있습니다.

### 배포 환경 (Vercel)

1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 환경 변수 추가:
   - Key: `OPENAI_API_KEY`
   - Value: OpenAI API 키
   - Environment: Production, Preview, Development 모두 선택
4. Save 클릭

## 3. 사용 모델

현재 설정된 모델: `gpt-4o-mini`

- 비용 효율적인 모델
- 한국어 지원 우수
- 빠른 응답 속도

다른 모델로 변경하려면 `src/app/api/journals/[id]/analyze/route.ts` 파일에서 `model` 값을 변경하세요.

## 4. 비용 관리

### OpenAI API 요금제

- Pay-as-you-go 방식
- `gpt-4o-mini` 모델은 저렴한 편
- 사용량에 따라 자동 청구

### 비용 절감 팁

1. **캐싱 활용**: 동일한 회고는 1시간 내 재분석 시 캐시된 결과 사용
2. **모델 선택**: `gpt-4o-mini` 사용 (비용 효율적)
3. **사용량 모니터링**: OpenAI 대시보드에서 사용량 확인

## 5. 테스트

API 키 설정 후 다음을 확인하세요:

1. 로그인 상태에서 회고 작성
2. "AI 분석 보기" 버튼 클릭
3. 분석 결과가 정상적으로 표시되는지 확인

## 6. 문제 해결

### "AI service is not configured" 오류

- `.env.local` 파일에 `OPENAI_API_KEY`가 설정되어 있는지 확인
- 개발 서버를 재시작했는지 확인

### "Failed to analyze" 오류

- OpenAI API 키가 유효한지 확인
- OpenAI 계정에 충분한 크레딧이 있는지 확인
- OpenAI 대시보드에서 API 사용량 제한이 있는지 확인

### 분석 결과가 더미 데이터로 표시됨

- OpenAI API 호출 실패 시 자동으로 더미 데이터 반환
- 브라우저 콘솔과 서버 로그에서 오류 메시지 확인

## 7. 보안 주의사항

- ✅ API 키는 절대 Git에 커밋하지 마세요
- ✅ `.env.local`은 로컬에서만 사용
- ✅ 배포 환경에서는 환경 변수로 설정
- ✅ API 키가 노출되지 않도록 주의

