# 일간 분석 디버깅 체크리스트

## 현재 문제
1. **OpenAI API 할당량 초과 (429 에러)**
   - 에러 메시지: `429 You exceeded your current quota`
   - 해결 방법: OpenAI 계정의 할당량 확인 및 충전

2. **서버에서 journalsData 수신 확인 필요**

## 확인해야 할 정보

### 1. 서버 콘솔 로그 확인 (터미널)
다음 로그들을 확인하세요:

#### A. journalsData 수신 확인
```
Using client-provided journals data: { count: X, ids: [...] }
✅ Using client-provided journals: X
```
- 이 로그가 보이면 → 서버가 데이터를 받았음
- 이 로그가 안 보이면 → 서버가 데이터를 받지 못함

#### B. OpenAI API 호출 전 로그
```
Calling OpenAI API: { journalCount: X, promptLength: X, hasApiKey: true }
```
- `journalCount`가 0이면 → 회고 데이터가 없음
- `hasApiKey`가 false면 → API 키가 설정되지 않음

#### C. OpenAI API 에러
```
OpenAI API error: ...
```
- 429 에러면 → 할당량 초과
- 다른 에러면 → 해당 에러 메시지 확인

### 2. OpenAI API 키 및 할당량 확인

#### A. API 키 확인
- `.env.local` 파일에 `OPENAI_API_KEY`가 올바르게 설정되어 있는지 확인
- API 키가 유효한지 확인 (OpenAI 대시보드에서)

#### B. 할당량 확인
- OpenAI 대시보드 (https://platform.openai.com/account/usage) 접속
- 현재 사용량 및 할당량 확인
- 할당량이 부족하면 충전 필요

### 3. 클라이언트 콘솔 로그 확인 (브라우저)

#### A. 회고 데이터 전송 확인
```
Found journals on client, fetching full data and sending to server
Sending journals data to server: {count: X, ids: [...]}
```
- `count`가 0이면 → 클라이언트에서 회고를 찾지 못함
- `count`가 있으면 → 데이터 전송 성공

#### B. 서버 응답 확인
```
Retry response: {ok: true/false, status: XXX, hasError: true/false, hasSummary: true/false}
```
- `ok: false`면 → 서버 에러
- `hasError: true`면 → 에러 메시지 확인
- `hasSummary: true`면 → 분석 성공

### 4. 데이터베이스 확인

#### A. 회고 데이터 존재 확인
Supabase에서 다음 쿼리 실행:
```sql
SELECT id, date, title, type, user_id, created_at 
FROM journals 
WHERE user_id = '95fc1648-78df-4caf-91a8-ad34fcb0df26'
ORDER BY date DESC 
LIMIT 10;
```

#### B. 날짜 형식 확인
```sql
SELECT id, date, title, 
       date::text as date_text,
       to_char(date, 'YYYY-MM-DD') as date_formatted
FROM journals 
WHERE user_id = '95fc1648-78df-4caf-91a8-ad34fcb0df26'
ORDER BY date DESC 
LIMIT 5;
```

## 단계별 디버깅 순서

### Step 1: OpenAI 할당량 확인
1. OpenAI 대시보드 접속
2. 할당량 및 사용량 확인
3. 부족하면 충전

### Step 2: 서버 로그 확인
1. 터미널에서 서버 실행 중인지 확인
2. 일간 분석 실행
3. 다음 로그 확인:
   - `Using client-provided journals data:` - 데이터 수신 확인
   - `Calling OpenAI API:` - API 호출 전 상태
   - `OpenAI API error:` - API 에러 확인

### Step 3: 클라이언트 로그 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 다음 로그 확인:
   - `Sending journals data to server:` - 데이터 전송 확인
   - `Retry response:` - 서버 응답 확인

### Step 4: 데이터베이스 확인
1. Supabase 대시보드 접속
2. SQL Editor에서 위 쿼리 실행
3. 회고 데이터 및 날짜 형식 확인

## 예상되는 해결 방법

### 문제 1: OpenAI 할당량 초과
**해결**: OpenAI 계정에 크레딧 충전

### 문제 2: 서버가 journalsData를 받지 못함
**확인 필요**:
- 서버 로그에서 `Using client-provided journals data:` 로그 확인
- 클라이언트에서 `Sending journals data to server:` 로그 확인
- 네트워크 탭에서 요청 본문 확인

### 문제 3: 날짜 형식 불일치
**확인 필요**:
- 데이터베이스의 `date` 컬럼 형식
- 클라이언트에서 전송하는 `selectedDate` 형식
- 서버에서 받는 `date` 형식

## 다음 단계
위 정보들을 확인한 후, 다음을 공유해주세요:
1. 서버 콘솔의 전체 로그 (특히 `Using client-provided journals data:` 이후)
2. OpenAI 할당량 상태
3. 데이터베이스 쿼리 결과 (날짜 형식 포함)

