# 이메일 인증 비활성화 가이드 (개발 환경)

## Supabase Dashboard에서 설정 변경

### 단계별 안내

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택: `think_back_ai` (dlwuckbuhnfzmramxosg)

2. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 **Authentication** 클릭
   - 하위 메뉴에서 **Providers** 클릭

3. **Email Provider 설정**
   - **Email** 행을 찾아서 오른쪽 화살표(>) 클릭
   - 또는 **Email** 행 자체를 클릭

4. **이메일 인증 비활성화**
   - **Enable email confirmations** 토글을 **OFF**로 변경
   - 또는 **Confirm email** 옵션을 **비활성화**
   - 하단의 **Save** 버튼 클릭

5. **확인**
   - 설정이 저장되었는지 확인
   - 회원가입을 다시 시도해보기

## 설정 변경 후 동작

- ✅ 회원가입 시 즉시 인증된 사용자로 생성됨
- ✅ `email_confirmed_at`가 자동으로 설정됨
- ✅ 로그인 가능
- ✅ 이메일 인증 불필요

## 주의사항

⚠️ **프로덕션 환경에서는 이메일 인증을 활성화하는 것을 강력히 권장합니다!**

- 개발/테스트 환경에서만 비활성화
- 프로덕션 배포 전에는 반드시 다시 활성화
- 보안을 위해 이메일 인증은 필수입니다

## 문제 해결

### 설정이 저장되지 않는 경우
1. 페이지를 새로고침
2. 다시 시도
3. Supabase 지원팀에 문의

### 여전히 이메일 인증이 필요한 경우
1. 브라우저 캐시 삭제
2. Supabase 대시보드에서 설정 다시 확인
3. 회원가입을 다시 시도

