# 상태 관리 가이드

## 개요

이 프로젝트는 **TanStack Query (React Query)**와 **Zustand**를 사용하여 상태를 관리합니다.

- **TanStack Query**: 서버 상태 관리 (API 데이터, 캐싱, 동기화)
- **Zustand**: 클라이언트 상태 관리 (UI 상태, 전역 상태)

## 📁 파일 구조

```
src/
├── shared/
│   └── hooks/              # React Query 훅
│       ├── useStoreQueries.js
│       ├── useReviewQueries.js
│       ├── useFavoriteQueries.js
│       └── useChatQueries.js
└── state/                  # Zustand 스토어
    ├── useUIStore.js       # UI 상태 (모달, 드롭다운, 탭)
    ├── useFilterStore.js   # 필터 상태 (검색어, 카테고리)
    ├── useDashboardStore.js # 대시보드 상태
    └── useMapStore.js      # 지도 상태
```

## 🔄 TanStack Query (서버 상태)

### 사용 목적

- API 데이터 조회 및 캐싱
- 자동 리프레시 및 동기화
- 로딩/에러 상태 관리
- Optimistic Updates

### Query 훅 사용 예시

```javascript
import { useMyStores, useStoreStats } from '@/shared/hooks/useStoreQueries';

// 가게 목록 조회
const { data: stores, isLoading, error } = useMyStores();

// 가게 통계 조회
const { data: stats } = useStoreStats(storeId, {
  enabled: !!storeId, // 조건부 실행
});
```

### Mutation 훅 사용 예시

```javascript
import { useCreateStore } from '@/shared/hooks/useStoreQueries';

const createStoreMutation = useCreateStore();

const handleSubmit = async (formData) => {
  await createStoreMutation.mutateAsync(formData);
  // 자동으로 관련 쿼리가 갱신됨
};
```

### Query Keys 구조

```javascript
// 계층적 구조로 관리
storeKeys = {
  all: ['stores'],
  lists: () => [...storeKeys.all, 'list'],
  list: (filters) => [...storeKeys.lists(), { filters }],
  details: () => [...storeKeys.all, 'detail'],
  detail: (id) => [...storeKeys.details(), id],
  myStores: () => [...storeKeys.all, 'my'],
  stats: (id) => [...storeKeys.all, 'stats', id],
};
```

## 🗄️ Zustand (클라이언트 상태)

### 사용 목적

- UI 상태 (모달, 드롭다운 열림/닫힘)
- 필터 상태 (검색어, 카테고리)
- 선택 상태 (선택된 가게, 탭)
- 지도 상태 (중심 좌표, 줌 레벨)

### 스토어 사용 예시

```javascript
import { useDashboardStore } from '@/state/useDashboardStore';

const { selectedStoreId, setSelectedStoreId } = useDashboardStore();

// 상태 업데이트
setSelectedStoreId(storeId);
```

### 주요 스토어

#### 1. `useUIStore` - UI 상태

- 모달 열림/닫힘
- 드롭다운 상태
- 탭 선택

#### 2. `useFilterStore` - 필터 상태

- 홈 페이지 필터 (검색어, 카테고리, 정렬)
- 가게 목록 필터

#### 3. `useDashboardStore` - 대시보드 상태

- 선택된 가게 ID
- 통계 기간 선택
- 드롭다운 상태

#### 4. `useMapStore` - 지도 상태

- 중심 좌표
- 줌 레벨
- 선택된 마커
- 보기 모드 (리스트/지도)

## 📋 상태 관리 원칙

### TanStack Query로 관리할 것

✅ 서버에서 가져오는 데이터

- 가게 목록, 가게 상세, 가게 통계
- 리뷰 목록
- 찜 목록
- 채팅 목록, 메시지
- 사용자 정보

### Zustand로 관리할 것

✅ UI 상태

- 모달 열림/닫힘
- 드롭다운 상태
- 탭 선택

✅ 필터 및 검색

- 검색어
- 카테고리 필터
- 정렬 옵션

✅ 선택 상태

- 선택된 가게 ID
- 선택된 마커
- 선택된 기간

✅ 지도 상태

- 중심 좌표
- 줌 레벨
- 보기 모드

### ❌ 사용하지 말 것

- 서버 데이터를 Zustand에 저장 (TanStack Query 사용)
- 로컬 UI 상태를 전역으로 관리 (useState 사용)
- 인증 상태 (AuthContext 사용)

## 🔧 백엔드 연동 전 준비사항

현재 모든 API 함수와 훅이 준비되어 있습니다. 백엔드 API가 준비되면:

1. **API 함수 확인**: `src/shared/api/` 폴더의 API 함수들이 올바른 엔드포인트를 호출하는지 확인
2. **응답 형식 확인**: 백엔드 응답 형식에 맞게 데이터 변환 로직 추가
3. **에러 처리**: API 에러에 대한 적절한 에러 메시지 표시
4. **로딩 상태**: 로딩 중 UI 표시 (이미 구현됨)

## 📝 예시: OwnerDashboardPage

```javascript
// React Query로 서버 데이터 가져오기
const { data: stores, isLoading } = useMyStores();
const { data: stats } = useStoreStats(selectedStoreId);

// Zustand로 UI 상태 관리
const { selectedStoreId, setSelectedStoreId } = useDashboardStore();
```

## 🚀 다음 단계

1. 백엔드 API 연동
2. 에러 처리 강화
3. Optimistic Updates 추가
4. 무한 스크롤 구현 (필요시)
