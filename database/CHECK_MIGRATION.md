# 마이그레이션 확인 가이드

## 1. Supabase에서 현재 상태 확인

### 현재 테이블 확인
Supabase 대시보드 → Table Editor에서 다음을 확인하세요:

#### Profiles 테이블
- [ ] `display_name` 컬럼이 있는가?
- [ ] `ai_plan_until` 컬럼이 있는가?
- [ ] `role` 컬럼의 값이 'user' 또는 'admin'인가? (기존: 'owner', 'member')

#### 새로 생성된 테이블
- [ ] `contents` 테이블이 있는가?
- [ ] `user_contents` 테이블이 있는가?
- [ ] `orders` 테이블이 있는가?
- [ ] `order_items` 테이블이 있는가?
- [ ] `community_cases` 테이블이 있는가?
- [ ] `journals` 테이블이 있는가?
- [ ] `journal_ai_analyses` 테이블이 있는가?

#### Enum 타입
- [ ] `content_type` enum이 있는가? (workbook, cohort, bundle)

## 2. 마이그레이션 실행 방법

### 방법 A: 기존 데이터가 있는 경우
1. **백업 권장**: Supabase 대시보드 → Database → Backups에서 백업 생성
2. SQL Editor 열기
3. `database/migration-v0.sql` 파일의 전체 내용을 복사
4. SQL Editor에 붙여넣기
5. **RUN** 버튼 클릭
6. 에러가 없는지 확인

### 방법 B: 새로 시작하는 경우
1. SQL Editor 열기
2. `database/schema-v0.sql` 파일의 전체 내용을 복사
3. SQL Editor에 붙여넣기
4. **RUN** 버튼 클릭

## 3. 마이그레이션 후 확인사항

### Profiles 테이블 확인
```sql
-- display_name이 제대로 설정되었는지 확인
SELECT id, name, display_name, role, ai_plan_until 
FROM public.profiles 
LIMIT 5;
```

### Role 변환 확인
```sql
-- role이 'user' 또는 'admin'으로 변환되었는지 확인
SELECT role, COUNT(*) 
FROM public.profiles 
GROUP BY role;
```

### 새 테이블 확인
```sql
-- 모든 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### RLS 정책 확인
```sql
-- RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## 4. 문제 해결

### 에러: "constraint already exists"
- 이미 일부 제약조건이 존재하는 경우
- `IF NOT EXISTS` 구문이 있으므로 대부분 무시해도 됨
- 계속 진행하면 됨

### 에러: "column already exists"
- 이미 컬럼이 추가된 경우
- `ADD COLUMN IF NOT EXISTS` 구문이 있으므로 무시해도 됨

### Role 변환이 안 되는 경우
- 기존 role 값이 'owner'/'member'가 아닌 경우
- 수동으로 확인 후 업데이트:
```sql
-- 현재 role 값 확인
SELECT DISTINCT role FROM public.profiles;

-- 수동 변환 (필요한 경우)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'owner';

UPDATE public.profiles 
SET role = 'user' 
WHERE role = 'member';
```

## 5. 마이그레이션 완료 후

### 코드 업데이트 필요
마이그레이션 후 다음 파일들을 확인/수정해야 할 수 있습니다:

1. `src/app/admin/page.tsx` - role 옵션을 'user'/'admin'으로 변경
2. `src/types/index.ts` - User 타입의 role을 'user' | 'admin'으로 변경
3. 기타 'owner'/'member'를 사용하는 코드

### 테스트
1. 로그인 테스트
2. 프로필 조회 테스트
3. 새 테이블에 데이터 삽입 테스트

