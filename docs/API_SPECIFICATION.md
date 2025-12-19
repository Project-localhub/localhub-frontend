# LocalHub 백엔드 API 명세서

## 📋 목차

1. [공통 사항](#공통-사항)
2. [인증 API](#인증-api)
3. [가게 API](#가게-api)
4. [리뷰 API](#리뷰-api)
5. [찜 API](#찜-api)
6. [채팅 API](#채팅-api)

---

## 공통 사항

### Base URL

```
http://localhost:8082/api
```

### 인증

- JWT 토큰 기반 인증
- `Authorization: Bearer {accessToken}` 헤더 사용
- 쿠키에 `refreshToken` 저장 (httpOnly)

### 응답 형식

#### 성공 응답

```json
{
  "data": { ... },
  "message": "성공 메시지 (선택)"
}
```

또는 배열 직접 반환:

```json
[{ ... }, { ... }]
```

#### 에러 응답

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

### HTTP 상태 코드

- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 인증 API

### 1. 회원가입

```
POST /api/auth/join
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

**Response:**

```json
{
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

### 2. 로그인

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

---

## 가게 API

### 1. 가게 등록

```
POST /api/stores
Content-Type: multipart/form-data
```

**Request (FormData):**

- `name` (string, required): 가게 이름
- `businessNumber` (string, required): 사업자등록번호 (하이픈 제거된 10자리 숫자)
- `description` (string, required): 가게 설명
- `category` (string, required): 카테고리 (한식, 중식, 일식, 양식, 카페, 분식, 치킨, 피자, 베이커리, 기타)
- `phone` (string, required): 전화번호
- `address` (string, required): 주소
- `latitude` (string, required): 위도
- `longitude` (string, required): 경도
- `keywords` (string[], optional): 키워드 배열 (깨끗함, 맛있음, 친절함 등)
- `openTime` (string, required): 영업 시작 시간 (HH:mm)
- `closeTime` (string, required): 영업 종료 시간 (HH:mm)
- `hasBreakTime` (boolean, optional): 브레이크타임 여부
- `breakStartTime` (string, optional): 브레이크타임 시작 시간 (HH:mm)
- `breakEndTime` (string, optional): 브레이크타임 종료 시간 (HH:mm)
- `images` (File[], optional): 이미지 파일 (최대 3개)

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "맛있는 한식당",
    "businessNumber": "1234567890",
    "category": "한식",
    "address": "서울시 강남구 역삼동 123-45",
    "images": ["url1", "url2", "url3"]
  }
}
```

### 2. 사장님의 가게 목록 조회

```
GET /api/stores/my
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "맛있는 한식당",
      "category": "한식",
      "address": "서울시 강남구 역삼동 123-45",
      "image": "https://...",
      "rating": 4.8,
      "reviewCount": 234
    }
  ]
}
```

또는 배열 직접 반환:

```json
[
  {
    "id": 1,
    "name": "맛있는 한식당",
    ...
  }
]
```

### 3. 가게 정보 조회

```
GET /api/stores/{storeId}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "맛있는 한식당",
    "businessNumber": "1234567890",
    "description": "신선한 재료로 만드는 정성스러운 한식 전문점입니다.",
    "category": "한식",
    "phone": "02-1234-5678",
    "address": "서울시 강남구 역삼동 123-45",
    "latitude": "37.5665",
    "longitude": "126.9780",
    "keywords": ["깨끗함", "맛있음", "친절함"],
    "openTime": "09:00",
    "closeTime": "22:00",
    "hasBreakTime": true,
    "breakStartTime": "14:00",
    "breakEndTime": "17:00",
    "images": ["url1", "url2", "url3"],
    "rating": 4.8,
    "reviewCount": 234,
    "favoriteCount": 178,
    "isFavorite": false
  }
}
```

### 4. 가게 정보 수정

```
PUT /api/stores/{storeId}
Content-Type: multipart/form-data
```

**Request (FormData):** 가게 등록과 동일 (모든 필드 optional)

**Response:** 수정된 가게 정보

### 5. 가게 조회수 증가

```
POST /api/stores/{storeId}/views
```

**Response:**

```json
{
  "data": {
    "storeId": 1,
    "viewCount": 1234
  }
}
```

**참고:**

- 중복 방지는 백엔드에서 처리 (IP 주소 또는 사용자 ID 기반)
- 같은 사용자가 같은 날 여러 번 방문해도 1회만 카운트

### 6. 가게 통계 조회

```
GET /api/stores/{storeId}/stats
```

**Response:**

```json
{
  "data": {
    "todayViews": 234,
    "monthlyReviews": 45,
    "lastMonthReviews": 40,
    "favoriteCount": 178,
    "lastMonthFavoriteCount": 170,
    "chatInquiries": 23,
    "chartData": [
      { "day": "월", "views": 120 },
      { "day": "화", "views": 180 },
      { "day": "수", "views": 150 },
      { "day": "목", "views": 200 },
      { "day": "금", "views": 280 },
      { "day": "토", "views": 320 },
      { "day": "일", "views": 250 }
    ],
    "recentReviews": [
      {
        "id": 1,
        "userName": "김철수",
        "rating": 5,
        "content": "정말 맛있어요!",
        "date": "1시간 전"
      }
    ]
  }
}
```

**필드 설명:**

- `todayViews`: 오늘 조회수
- `monthlyReviews`: 이번 달 리뷰 수
- `lastMonthReviews`: 전달 리뷰 수 (비교용)
- `favoriteCount`: 현재 찜한 고객 수
- `lastMonthFavoriteCount`: 전달 찜한 고객 수 (비교용)
- `chatInquiries`: 이번 달 채팅 문의 수
- `chartData`: 주간 조회수 추이 데이터 (최근 7일)
- `recentReviews`: 최근 리뷰 목록 (최대 3개)

---

## 리뷰 API

### 1. 가게 리뷰 목록 조회

```
GET /api/stores/{storeId}/reviews
```

**Query Parameters:**

- `page` (number, optional): 페이지 번호 (기본값: 1)
- `size` (number, optional): 페이지 크기 (기본값: 10)
- `month` (string, optional): 특정 월 필터링 (YYYY-MM 형식)

**Response:**

```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 10,
        "userName": "김철수",
        "rating": 5,
        "content": "정말 맛있어요!",
        "images": ["url1", "url2"],
        "createdAt": "2024-12-05T10:30:00",
        "date": "1시간 전"
      }
    ],
    "totalElements": 234,
    "totalPages": 24,
    "currentPage": 1
  }
}
```

### 2. 이번 달 리뷰 수 조회

```
GET /api/stores/{storeId}/reviews/count?year=2024&month=12
```

**Query Parameters:**

- `year` (number, required): 연도
- `month` (number, required): 월 (1-12)

**Response:**

```json
{
  "data": {
    "count": 45,
    "year": 2024,
    "month": 12
  }
}
```

### 3. 리뷰 작성 (추후 구현)

```
POST /api/stores/{storeId}/reviews
```

---

## 찜 API

### 1. 가게를 찜한 사용자 수 조회

```
GET /api/stores/{storeId}/favorites/count
```

**Response:**

```json
{
  "data": {
    "count": 178,
    "storeId": 1
  }
}
```

### 2. 가게를 찜한 사용자 목록 조회

```
GET /api/stores/{storeId}/favorites
```

**Query Parameters:**

- `page` (number, optional): 페이지 번호
- `size` (number, optional): 페이지 크기

**Response:**

```json
{
  "data": {
    "content": [
      {
        "userId": 10,
        "userName": "김철수",
        "favoritedAt": "2024-12-01T10:00:00"
      }
    ],
    "totalElements": 178,
    "totalPages": 18
  }
}
```

### 3. 찜하기/찜 해제 (추후 구현)

```
POST /api/stores/{storeId}/favorites
DELETE /api/stores/{storeId}/favorites
```

---

## 채팅 API

### 1. 사장님의 채팅방 목록 조회

```
GET /api/stores/{storeId}/chat-rooms
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "userId": 10,
      "userName": "김철수",
      "lastMessage": "네, 예약 가능합니다!",
      "lastMessageTime": "2024-12-05T14:30:00",
      "unreadCount": 2,
      "createdAt": "2024-12-01T10:00:00"
    }
  ]
}
```

### 2. 이번 달 채팅 문의 수 조회

```
GET /api/stores/{storeId}/chat-rooms/count?year=2024&month=12
```

**Query Parameters:**

- `year` (number, required): 연도
- `month` (number, required): 월 (1-12)

**Response:**

```json
{
  "data": {
    "count": 23,
    "year": 2024,
    "month": 12
  }
}
```

**참고:**

- 1:1 채팅 기준으로 카운트
- 이번 달에 생성된 채팅방 수

### 3. 채팅방 메시지 조회

```
GET /api/chat-rooms/{roomId}/messages
```

**Query Parameters:**

- `page` (number, optional): 페이지 번호
- `size` (number, optional): 페이지 크기

**Response:**

```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "sender": "user",
        "content": "안녕하세요, 오늘 저녁 예약 가능한가요?",
        "createdAt": "2024-12-05T14:28:00",
        "time": "오후 2:28"
      },
      {
        "id": 2,
        "sender": "store",
        "content": "안녕하세요! 몇 시쯤 예약하시려나요?",
        "createdAt": "2024-12-05T14:29:00",
        "time": "오후 2:29"
      }
    ],
    "totalElements": 10,
    "totalPages": 1
  }
}
```

**참고:**

- `sender`: "user" 또는 "store"
- 메시지는 최신순으로 정렬

### 4. 메시지 전송 (추후 구현)

```
POST /api/chat-rooms/{roomId}/messages
```

---

## 중요 사항

### 1. 사업자등록번호 중복 체크

- 가게 등록 시 사업자등록번호 중복 체크 필수
- 중복 시 `400 Bad Request` 반환

### 2. 조회수 집계

- 일일 조회수: 오늘 날짜 기준으로 카운트
- 주간 조회수 추이: 최근 7일간 일별 조회수
- 중복 방지: IP 주소 또는 사용자 ID 기반

### 3. 통계 데이터 계산

- **이번 달 리뷰 수**: 현재 월의 리뷰 수
- **전달 리뷰 수**: 이전 달의 리뷰 수 (비교용)
- **찜한 고객 수**: 현재 찜한 고객 수 (누적)
- **전달 찜한 고객 수**: 전달 말일 기준 찜한 고객 수 (비교용)
- **이번 달 채팅 문의**: 이번 달에 생성된 1:1 채팅방 수

### 4. 권한 체크

- 사장님 전용 API: `/api/stores/my`, `/api/stores/{storeId}/stats` 등
- 가게 소유자만 접근 가능하도록 권한 체크 필요

### 5. 페이지네이션

- 리뷰, 찜 목록 등은 페이지네이션 지원
- 기본값: `page=1`, `size=10`

---

## 프론트엔드 연동 참고

프론트엔드에서 사용하는 API 함수 위치:

- `src/shared/api/storeApi.js`
- `src/shared/api/reviewApi.js`
- `src/shared/api/favoriteApi.js`
- `src/shared/api/chatApi.js`

React Query 훅 위치:

- `src/shared/hooks/useStoreQueries.js`
- `src/shared/hooks/useReviewQueries.js`
- `src/shared/hooks/useFavoriteQueries.js`
- `src/shared/hooks/useChatQueries.js`
