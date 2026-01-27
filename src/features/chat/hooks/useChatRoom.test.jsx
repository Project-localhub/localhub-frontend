import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChatRoom } from './useChatRoom';
import * as useChatQueries from './useChatQueries';

vi.mock('./useChatQueries');

describe('useChatRoom', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('roomId로 채팅방을 찾는다', async () => {
    const mockChats = [
      { id: '1', restaurantId: 10 },
      { id: '2', restaurantId: 20 },
    ];

    useChatQueries.useInquiryChats = vi.fn(() => ({
      data: mockChats,
    }));

    const { result } = renderHook(() => useChatRoom('1', null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.selectedChatId).toBe('1');
      expect(result.current.currentChat).toEqual(mockChats[0]);
    });
  });

  it('restaurantId로 채팅방을 찾는다', async () => {
    const mockChats = [
      { id: '1', restaurantId: 10 },
      { id: '2', restaurantId: 20 },
    ];

    useChatQueries.useInquiryChats = vi.fn(() => ({
      data: mockChats,
    }));

    const { result } = renderHook(() => useChatRoom('20', null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.selectedChatId).toBe('2');
      expect(result.current.currentChat).toEqual(mockChats[1]);
    });
  });

  it('locationState에서 storeName을 가져온다', async () => {
    const mockChats = [];

    useChatQueries.useInquiryChats = vi.fn(() => ({
      data: mockChats,
    }));

    const locationState = {
      storeName: '테스트 가게',
      storeImage: 'test-image.jpg',
    };

    const { result } = renderHook(() => useChatRoom(null, locationState), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.displayStoreName).toBe('테스트 가게');
      expect(result.current.displayStoreImage).toBe('test-image.jpg');
    });
  });

  it('채팅방을 찾지 못하면 알 수 없음을 반환한다', async () => {
    const mockChats = [];

    useChatQueries.useInquiryChats = vi.fn(() => ({
      data: mockChats,
    }));

    const { result } = renderHook(() => useChatRoom('999', null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.displayStoreName).toBe('알 수 없음');
    });
  });
});


