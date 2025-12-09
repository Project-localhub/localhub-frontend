# LocalHub Frontend

지역 기반 실시간 커뮤니티 & 소상공인 홍보 서비스 **LocalHub**의 프론트엔드 레포지토리입니다.  
React + Vite 기반으로 개발되며, 지도, 실시간 채팅, 소상공인 대시보드 등을 제공합니다.

## 🚀 기술 스택

- **React 19** - UI 라이브러리
- **Vite** - 빌드 도구
- **React Router v6** - 라우팅
- **TanStack Query (React Query)** - 서버 상태 관리 (API 데이터 캐싱, 동기화)
- **Zustand** - 클라이언트 상태 관리 (UI 상태, 전역 상태)
- **Tailwind CSS v4** - 스타일링
- **Axios** - HTTP 클라이언트
- **Vitest** - 테스트 프레임워크

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
npm run dev
```

### 빌드

```bash
npm run build
```

### 미리보기

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
├── app/              # 앱 설정 (라우터, React Query)
├── features/         # 도메인별 기능
│   ├── store/        # 가게 관련
│   ├── auth/         # 인증 관련
│   ├── review/       # 리뷰 관련
│   ├── favorite/     # 찜 관련
│   ├── chat/         # 채팅 관련
│   └── map/          # 지도 관련
├── pages/            # 페이지 컴포넌트
├── shared/           # 공통 모듈
│   ├── api/          # API 클라이언트
│   ├── ui/           # 공통 UI 컴포넌트
│   ├── hooks/        # 공통 훅
│   └── lib/          # 유틸리티
├── state/            # Zustand 스토어
└── styles/           # 전역 스타일
```

## 📝 주요 기능

- 🏪 가게 리스트 및 상세 페이지
- 👤 사용자 인증
- ⭐ 리뷰 시스템
- ❤️ 찜 기능
- 💬 실시간 채팅
- 🗺️ 지도 통합
- 📊 사장님 대시보드

## 🔧 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:
