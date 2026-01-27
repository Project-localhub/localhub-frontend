import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('내가 보낸 메시지를 올바르게 렌더링한다', () => {
    const message = {
      id: '1',
      message: '안녕하세요',
      sender: 'user1',
      timestamp: '2024-01-01T12:00:00Z',
    };

    render(<ChatMessage message={message} isMyMessage={true} />);

    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('상대방이 보낸 메시지를 올바르게 렌더링한다', () => {
    const message = {
      id: '2',
      message: '반갑습니다',
      sender: 'user2',
      timestamp: '2024-01-01T12:01:00Z',
    };

    render(<ChatMessage message={message} isMyMessage={false} />);

    expect(screen.getByText('반갑습니다')).toBeInTheDocument();
  });

  it('내 메시지는 오른쪽 정렬 스타일을 가진다', () => {
    const message = {
      id: '1',
      message: '테스트 메시지',
      sender: 'user1',
    };

    const { container } = render(<ChatMessage message={message} isMyMessage={true} />);
    const messageElement = container.querySelector('.justify-end');

    expect(messageElement).toBeInTheDocument();
  });

  it('상대방 메시지는 왼쪽 정렬 스타일을 가진다', () => {
    const message = {
      id: '2',
      message: '테스트 메시지',
      sender: 'user2',
    };

    const { container } = render(<ChatMessage message={message} isMyMessage={false} />);
    const messageElement = container.querySelector('.justify-start');

    expect(messageElement).toBeInTheDocument();
  });
});


