import { useState } from 'react';
import Layout from '@/components/Layout';
import { Search, Send } from 'lucide-react';

const mockChats = [
  {
    id: '1',
    storeName: '맛있는 한식당',
    lastMessage: '네, 예약 가능합니다!',
    time: '오후 2:30',
    unread: 2,
    storeImage:
      'https://images.unsplash.com/photo-1629642621587-9947ce328799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NjUxNTg3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    storeName: '아늑한 카페',
    lastMessage: '감사합니다!',
    time: '오전 11:20',
    unread: 0,
    storeImage:
      'https://images.unsplash.com/photo-1642647916334-82e513d9cc48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY1MjAwMjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    storeName: '동네 빵집',
    lastMessage: '오늘 케이크 예약하고 싶은데요',
    time: '어제',
    unread: 0,
    storeImage:
      'https://images.unsplash.com/photo-1658740877393-7d001187d867?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeXxlbnwxfHx8fDE3NjUxNjQzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'user',
    content: '안녕하세요, 오늘 저녁 예약 가능한가요?',
    time: '오후 2:28',
  },
  {
    id: '2',
    sender: 'store',
    content: '안녕하세요! 몇 시쯤 예약하시려나요?',
    time: '오후 2:29',
  },
  {
    id: '3',
    sender: 'user',
    content: '7시에 4명 예약하고 싶습니다.',
    time: '오후 2:29',
  },
  {
    id: '4',
    sender: 'store',
    content: '네, 예약 가능합니다! 성함과 연락처 부탁드립니다.',
    time: '오후 2:30',
  },
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // Send message logic
      setMessage('');
    }
  };

  if (!selectedChat) {
    return (
      <div>
        <div className="flex flex-col h-full bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="채팅 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className="w-full flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden shrink-0">
                  <img
                    src={chat.storeImage}
                    alt={chat.storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900">{chat.storeName}</span>
                    <span className="text-gray-500 text-sm">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 text-sm truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentChat = mockChats.find((chat) => chat.id === selectedChat);

  return (
    <div>
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <button onClick={() => setSelectedChat(null)} className="text-gray-600">
            ←
          </button>
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
            <img
              src={currentChat?.storeImage}
              alt={currentChat?.storeName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-gray-900">{currentChat?.storeName}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                } rounded-lg px-4 py-2`}
              >
                <p>{msg.content}</p>
                <span
                  className={`text-xs ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  } block mt-1`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="text-blue-600 disabled:text-gray-400"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
