import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('메시지 입력 필드를 렌더링한다', () => {
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(<ChatInput message="" setMessage={mockSetMessage} onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    expect(input).toBeInTheDocument();
  });

  it('메시지를 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(<ChatInput message="" setMessage={mockSetMessage} onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await user.type(input, '안녕하세요');

    expect(mockSetMessage).toHaveBeenCalled();
  });

  it('전송 버튼을 클릭하면 onSend가 호출된다', async () => {
    const user = userEvent.setup();
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(<ChatInput message="테스트 메시지" setMessage={mockSetMessage} onSend={mockOnSend} />);

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).toHaveBeenCalled();
  });

  it('Enter 키를 누르면 onSend가 호출된다', async () => {
    const user = userEvent.setup();
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(<ChatInput message="테스트 메시지" setMessage={mockSetMessage} onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    await user.type(input, '{Enter}');

    expect(mockOnSend).toHaveBeenCalled();
  });

  it('빈 메시지는 전송되지 않는다', async () => {
    const user = userEvent.setup();
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(<ChatInput message="" setMessage={mockSetMessage} onSend={mockOnSend} />);

    const sendButton = screen.getByRole('button');
    await user.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('disabled 상태일 때 입력할 수 없다', () => {
    const mockSetMessage = vi.fn();
    const mockOnSend = vi.fn();

    render(
      <ChatInput message="" setMessage={mockSetMessage} onSend={mockOnSend} disabled={true} />,
    );

    const input = screen.getByPlaceholderText('메시지를 입력하세요');
    const sendButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
});
