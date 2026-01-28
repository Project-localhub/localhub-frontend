# LocalHub Frontend

지역 기반 실시간 커뮤니티 & 소상공인 홍보 서비스 **LocalHub**의 프론트엔드 레포지토리입니다.  
React + Vite 기반으로 개발되며, 지도, 실시간 채팅, 소상공인 대시보드 등을 제공합니다.

## 🚀 기술 스택

### Core Framework

- **React 19.2.3** - UI 라이브러리
- **Vite 7.2.4** - 빌드 도구 및 개발 서버
- **React Router v7.13.0** - 클라이언트 사이드 라우팅

### 상태 관리

- **TanStack Query (React Query) 5.90.12** - 서버 상태 관리 (API 데이터 캐싱, 동기화, 무한 스크롤)
- **Zustand 5.0.9** - 클라이언트 상태 관리 (UI 상태, 전역 상태)

### 스타일링

- **Tailwind CSS v4** - 유틸리티 퍼스트 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리

### HTTP & 실시간 통신

- **Axios 1.13.2** - HTTP 클라이언트
- **STOMP.js 7.2.1** - WebSocket 메시징 프로토콜
- **SockJS 1.6.1** - WebSocket 폴백 지원

### 서버 사이드 렌더링

- **Express 4.22.1** - SSR 서버
- **React Server Components** - 서버 사이드 렌더링

### 폼 관리

- **React Hook Form 7.68.0** - 폼 상태 관리 및 유효성 검사

### 차트 및 UI 컴포넌트

- **Recharts 3.5.1** - 차트 라이브러리 (대시보드 통계)
- **Embla Carousel** - 이미지 캐러셀

### 테스트

- **Vitest 4.0.15** - 테스트 프레임워크
- **React Testing Library** - 컴포넌트 테스트

### 기타

- **Day.js** - 날짜/시간 처리
- **Sonner** - 토스트 알림

## 📦 시작하기

### 프로젝트 클론

```bash
git clone <repository-url>
cd localhub-frontend
```

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
# SSR 포함 개발 서버 (권장)
npm run dev

# 클라이언트만 개발 서버
npm run dev:client
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
# 클라이언트 + 서버 빌드 (SSR)
npm run build

# 클라이언트만 빌드
npm run build:client

# 서버만 빌드
npm run build:server
```

### 프로덕션 미리보기

```bash
npm run preview
```

## 🛠️ 개발 도구

```bash
# 코드 포맷팅
npm run format

# 린트 검사
npm run lint

# 테스트 실행
npm run test

# 테스트 watch 모드
npm run test:watch
```

## 📁 프로젝트 구조

```
src/
├── app/                    # 앱 설정
│   ├── router.jsx         # 라우터 설정
│   ├── routes.jsx         # 라우트 정의
│   ├── queryClient.jsx    # React Query 설정
│   ├── App.jsx            # 루트 컴포넌트
│   └── ProtectedRoute.jsx # 보호된 라우트 컴포넌트
│
├── features/              # 도메인별 기능 (Feature-based 구조)
│   ├── chat/              # 채팅 도메인
│   │   ├── components/    # 채팅 관련 컴포넌트
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatMessageList.jsx
│   │   ├── context/       # SocketProvider, SocketContext
│   │   │   ├── SocketContext.jsx
│   │   │   └── SocketProvider.jsx
│   │   ├── hooks/         # 채팅 관련 훅
│   │   │   ├── useChatQueries.js
│   │   │   ├── useChatRoom.js
│   │   │   ├── useChatWebSocket.js
│   │   │   └── useSocket.js
│   │   └── lib/           # 채팅 관련 유틸리티
│   │
│   ├── store/             # 가게 도메인
│   │   ├── components/    # 가게 관련 컴포넌트
│   │   ├── hooks/         # 가게 관련 훅
│   │   │   ├── useStoreQueries.js
│   │   │   ├── useStoreForm.js
│   │   │   └── useStoreEditForm.js
│   │   ├── lib/           # 가게 관련 유틸리티
│   │   │   └── storeUtils.js
│   │   └── constants/     # 가게 관련 상수
│   │       └── storeConstants.js
│   │
│   ├── favorite/          # 찜 도메인
│   │   └── hooks/
│   │       └── useFavoriteQueries.js
│   │
│   ├── review/            # 리뷰 도메인
│   │   └── hooks/
│   │       └── useReviewQueries.js
│   │
│   ├── owner-dashboard/   # 사장님 대시보드 도메인
│   │   ├── hooks/
│   │   │   └── useDashboardStats.js
│   │   ├── lib/
│   │   │   └── statsUtils.js
│   │   └── state/
│   │       └── useDashboardStore.js
│   │
│   └── home/              # 홈페이지 도메인
│       ├── components/
│       │   ├── HomeSearchHeader.jsx
│       │   ├── HomeFilterModal.jsx
│       │   ├── HomeStoreList.jsx
│       │   └── HomeViewModeTabs.jsx
│       └── hooks/
│           └── useHomePage.js
│
├── pages/                 # 페이지 컴포넌트 (라우트에 직접 연결)
│   ├── HomePage.jsx
│   ├── StoreDetailPage.jsx
│   ├── ChatListPage.jsx
│   ├── ChatDetailPage.jsx
│   ├── FavoritePage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── FindUserPage.jsx
│   ├── FindPasswordPage.jsx
│   ├── ChangePasswordPage.jsx
│   ├── ReviewPage.jsx
│   ├── OAuthRedirectPage.jsx
│   └── owner/            # 사장님 전용 페이지
│       ├── OwnerDashboardPage.jsx
│       ├── StoreRegisterPage.jsx
│       ├── StoreEditPage.jsx
│       └── MenuManagePage.jsx
│
├── shared/                # 공통 모듈 (도메인에 속하지 않는 것들)
│   ├── api/              # API 클라이언트
│   │   ├── client.js     # Axios 인스턴스
│   │   ├── auth.js
│   │   ├── storeApi.js
│   │   ├── chatApi.js
│   │   ├── reviewApi.js
│   │   └── favoriteApi.js
│   │
│   ├── ui/               # 공통 UI 컴포넌트 (재사용 가능한 컴포넌트)
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── dialog.jsx
│   │   └── ...
│   │
│   ├── lib/              # 공통 유틸리티
│   │   ├── kakao.js      # 카카오 SDK 초기화
│   │   ├── kakaoMap.js   # 카카오맵 SDK 로드
│   │   └── phoneUtils.js
│   │
│   ├── state/            # 전역 UI 상태 (도메인에 속하지 않는 상태)
│   │   ├── useFilterStore.js
│   │   ├── useMapStore.js
│   │   └── useUIStore.js
│   │
│   └── constants/        # 공통 상수
│       └── pageConstants.js
│
├── components/           # 페이지 레벨 공통 컴포넌트
│   ├── Layout.jsx       # 레이아웃 컴포넌트 (헤더, 네비게이션)
│   ├── StoreCard.jsx
│   ├── ReviewCard.jsx
│   ├── MapView.jsx
│   └── dashboard/       # 대시보드 공통 컴포넌트
│       ├── StoreSelector.jsx
│       ├── StatsCards.jsx
│       ├── ViewsChart.jsx
│       ├── RecentReviews.jsx
│       ├── QuickActions.jsx
│       ├── DaumPostcodeModal.jsx
│       └── ...
│
├── context/              # 전역 Context
│   └── AuthContext.jsx   # 인증 Context
│
├── entry-client.jsx      # 클라이언트 진입점 (SSR)
├── entry-server.jsx      # 서버 진입점 (SSR)
├── main.jsx              # 클라이언트 진입점 (CSR 전용)
│
└── styles/
    └── globals.css       # 전역 스타일
```

### 구조 설계 원칙

1. **Feature-based 구조**: 도메인별로 기능을 그룹화하여 응집도 향상
2. **계층 분리**: pages (라우트) → features (도메인 로직) → shared (공통)
3. **명확한 책임**: 각 폴더의 역할이 명확함
4. **확장 가능성**: 새로운 도메인 추가가 쉬움

## 📝 주요 기능

### 1. 사용자 인증 시스템

- **일반 로그인/회원가입**: 이메일 기반 인증
- **소셜 로그인**: 구글, 카카오 OAuth 2.0
- **비밀번호 관리**: 비밀번호 찾기, 변경 (소셜 로그인 사용자 제외)
- **자동 로그인**: localStorage 기반 토큰 복구
- **역할 기반 접근 제어**: CUSTOMER, OWNER 역할 구분

### 2. 가게 관리 시스템

- **가게 리스트**: 무한 스크롤 페이지네이션
- **필터링**: 카테고리, 지역(구), 가게 이름 검색
- **지도/리스트 뷰**: 전환 가능한 뷰 모드
- **가게 상세 페이지**: 정보, 메뉴, 리뷰, 지도 표시
- **가게 등록/수정** (사장님): 주소 검색, 이미지 업로드, 운영 시간 설정

### 3. 리뷰 시스템

- **리뷰 작성/조회**: 별점 평가, 리뷰 내용 및 이미지
- **리뷰 통계**: 평균 별점, 리뷰 개수, 월별 통계

### 4. 찜 기능

- **찜하기/찜 해제**: 가게 찜하기 기능
- **찜 목록**: 찜한 가게 목록 조회
- **로그인 상태 기반**: 비로그인 시 API 호출 방지

### 5. 실시간 채팅

- **채팅 목록**: 사용자/사장님별 채팅방 목록
- **실시간 메시지**: WebSocket 기반 실시간 송수신
- **자동 스크롤**: 새 메시지 수신 시 자동 스크롤
- **SocketProvider**: Context 기반 WebSocket 관리

### 6. 지도 통합

- **카카오맵 SDK**: 가게 위치 마커 표시
- **필터링된 마커**: 필터 조건에 맞는 가게만 표시
- **거리 기반 조회**: 사용자 위치 기반 거리 계산

### 7. 사장님 대시보드

- **통계 대시보드**: 조회수, 리뷰, 찜, 채팅 문의 통계
- **가게 관리**: 가게 등록/수정, 메뉴 관리
- **최근 리뷰**: 최근 리뷰 목록 표시
- **차트**: 주간 조회수 차트

### 8. SEO 및 성능 최적화

- **Server-Side Rendering (SSR)**: 초기 로딩 속도 개선 및 SEO 최적화
- **코드 스플리팅**: 라우트 레벨 코드 스플리팅
- **이미지 Lazy Loading**: 성능 최적화
- **번들 최적화**: manualChunks 설정으로 번들 크기 최적화

## 🔧 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# API 서버 URL (필수)

# 카카오 JavaScript 키 (지도 및 소셜 로그인용)
```

### 환경 변수 사용법

코드에서 환경 변수는 `import.meta.env.VITE_XXX` 형식으로 접근합니다:

```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
```

## 🏗️ 아키텍처

### 상태 관리 전략

1. **서버 상태 (React Query)**
   - 가게 목록, 상세 정보
   - 리뷰 목록
   - 찜 목록
   - 채팅 목록, 메시지
   - 사용자 정보

2. **클라이언트 상태 (Zustand)**
   - UI 상태 (모달, 드롭다운)
   - 필터 상태 (카테고리, 지역)
   - 지도 상태 (중심점, 줌)
   - 대시보드 상태 (선택된 가게, 기간)

3. **로컬 상태 (useState)**
   - 폼 입력값
   - 컴포넌트 내부 UI 상태

### WebSocket 아키텍처

- **SocketProvider + Context 패턴**: React 패턴 준수
- **STOMP.js + SockJS**: 구조화된 메시징 프로토콜
- **React Query 통합**: 메시지 수신 시 자동 캐시 업데이트
- **자동 재연결**: 연결 끊김 시 자동 재연결

### SSR 아키텍처

- **entry-server.jsx**: 서버 사이드 렌더링
- **entry-client.jsx**: 클라이언트 사이드 hydration
- **Express 서버**: SSR 서버 구현
- **React Query dehydrate/hydrate**: 서버 상태 전달
