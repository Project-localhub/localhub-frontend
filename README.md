# 🏪 LocalHub Frontend

> 지역 기반 실시간 커뮤니티 & 소상공인 홍보 서비스

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://developer.mozilla.org/ko/docs/Web/JavaScript)

---

## 🚀 빠른 시작

```bash
# 설치
npm install

# 개발 서버 실행 (SSR 포함)
npm run dev

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
```

---

## 🛠️ 기술 스택

| 카테고리       | 기술                                           |
| -------------- | ---------------------------------------------- |
| **프레임워크** | React 19.2.3, Vite 7.2.4, React Router v7.13.0 |
| **상태 관리**  | TanStack Query 5.90.12, Zustand 5.0.9          |
| **스타일링**   | Tailwind CSS v4, Lucide React                  |
| **통신**       | Axios 1.13.2, STOMP.js 7.2.1, SockJS 1.6.1     |
| **SSR**        | Express 4.22.1                                 |
| **기타**       | React Hook Form, Recharts, Day.js, Sonner      |

---

## 📁 프로젝트 구조

```
src/
├── app/              # 라우터, React Query 설정
├── features/        # 도메인별 기능
│   ├── chat/        # 채팅 (components, context, hooks)
│   ├── store/       # 가게 (components, hooks, lib, constants)
│   ├── favorite/   # 찜 (hooks)
│   ├── review/      # 리뷰 (hooks)
│   ├── owner-dashboard/  # 대시보드 (hooks, lib, state)
│   └── home/        # 홈페이지 (components, hooks)
├── pages/           # 페이지 컴포넌트
├── shared/          # 공통 모듈
│   ├── api/        # API 클라이언트
│   ├── ui/         # 공통 UI 컴포넌트
│   ├── lib/        # 유틸리티
│   └── state/      # 전역 UI 상태
└── components/      # 페이지 레벨 컴포넌트
```

**구조 원칙**: Feature-based 구조로 도메인별 응집도 향상, 계층 분리 (pages → features → shared)

---

## ✨ 주요 기능

### 🔐 인증 시스템

- 일반 로그인/회원가입 (이메일 기반)
- 소셜 로그인 (구글, 카카오 OAuth 2.0)
- 비밀번호 찾기/변경
- 역할 기반 접근 제어 (CUSTOMER, OWNER)

### 🏪 가게 관리

- 가게 리스트 (무한 스크롤)
- 필터링 (카테고리, 지역, 이름 검색)
- 지도/리스트 뷰 전환
- 가게 등록/수정 (사장님)

### ⭐ 리뷰 & ❤️ 찜

- 리뷰 작성/조회
- 찜하기/찜 해제
- 찜 목록 조회

### 💬 실시간 채팅

- WebSocket 기반 실시간 메시지
- 자동 스크롤
- SocketProvider + Context 패턴

### 🗺️ 지도 통합

- 카카오맵 SDK
- 필터링된 마커 표시
- 거리 기반 조회

### 📊 사장님 대시보드

- 통계 대시보드 (조회수, 리뷰, 찜, 채팅)
- 가게 관리 (등록/수정, 메뉴)
- 주간 조회수 차트

### ⚡ 성능 최적화

- SSR (Server-Side Rendering)
- 코드 스플리팅
- 이미지 Lazy Loading
- 번들 최적화

---

## 🏗️ 아키텍처

### 상태 관리

```
서버 상태 (React Query)
  └─ 가게, 리뷰, 찜, 채팅, 사용자 정보

클라이언트 상태 (Zustand)
  └─ UI 상태, 필터, 지도, 대시보드

로컬 상태 (useState)
  └─ 폼 입력값, 컴포넌트 내부 상태
```

### WebSocket 통신

```
SocketProvider (Context)
  └─ STOMP.js + SockJS
      └─ React Query 통합 (자동 캐시 업데이트)
```

### SSR 흐름

```
Express Server
  └─ entry-server.jsx (renderToString)
      └─ HTML + dehydratedState
          └─ entry-client.jsx (hydrateRoot)
```

---

## 🛠️ 개발 명령어

```bash
npm run dev          # 개발 서버 (SSR)
npm run dev:client   # 클라이언트만
npm run build        # 빌드
npm run preview      # 프로덕션 미리보기
npm run lint         # 린트 검사
npm run format       # 코드 포맷팅
npm run test         # 테스트 실행
```

---
