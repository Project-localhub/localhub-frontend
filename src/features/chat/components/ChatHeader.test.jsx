import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatHeader from './ChatHeader';

describe('ChatHeader', () => {
  it('가게 이름을 표시한다', () => {
    const mockOnBack = vi.fn();

    render(<ChatHeader storeName="테스트 가게" onBack={mockOnBack} />);

    expect(screen.getByText('테스트 가게')).toBeInTheDocument();
  });

  it('뒤로가기 버튼을 렌더링한다', () => {
    const mockOnBack = vi.fn();

    render(<ChatHeader storeName="테스트 가게" onBack={mockOnBack} />);

    const backButton = screen.getByRole('button');
    expect(backButton).toBeInTheDocument();
  });

  it('뒤로가기 버튼을 클릭하면 onBack이 호출된다', async () => {
    const user = await import('@testing-library/user-event').then((m) => m.default.setup());
    const mockOnBack = vi.fn();

    render(<ChatHeader storeName="테스트 가게" onBack={mockOnBack} />);

    const backButton = screen.getByRole('button');
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('storeName이 없으면 알 수 없음을 표시한다', () => {
    const mockOnBack = vi.fn();

    render(<ChatHeader storeName="" onBack={mockOnBack} />);

    expect(screen.getByText('알 수 없음')).toBeInTheDocument();
  });
});
