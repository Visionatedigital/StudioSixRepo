import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: Date;
}

export default function MessageInbox({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Mock data - Replace with real data from your API
  const conversations: Conversation[] = [
    {
      id: '1',
      userId: '1',
      userName: 'John Doe',
      userImage: '/profile-icons/Profile-icon-01.svg',
      lastMessage: 'Hey, I loved your latest design!',
      unreadCount: 2,
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: '2',
      userName: 'Jane Smith',
      userImage: '/profile-icons/Profile-icon-02.svg',
      lastMessage: 'Could you share more details about the project?',
      unreadCount: 0,
      updatedAt: new Date(),
    },
  ];

  const messages: Message[] = selectedConversation ? [
    {
      id: '1',
      content: 'Hey, I loved your latest design!',
      senderId: selectedConversation.userId,
      receiverId: session?.user?.id || '',
      createdAt: new Date(),
    },
    {
      id: '2',
      content: 'Thank you! I appreciate the feedback.',
      senderId: session?.user?.id || '',
      receiverId: selectedConversation.userId,
      createdAt: new Date(),
    },
  ] : [];

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    // Add logic to send message
    console.log('Sending message:', messageInput);
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 isolate" style={{ zIndex: 999999 }}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div ref={modalRef} className="bg-white rounded-xl w-[80vw] h-[80vh] flex overflow-hidden relative">
          {/* Left Panel - Conversations List */}
          <div className="w-1/3 border-r border-[#E0DAF3] flex flex-col">
            <div className="p-4 border-b border-[#E0DAF3]">
              <h2 className="text-xl font-semibold text-[#202126]">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="relative">
                    <Image
                      src={conversation.userImage}
                      alt={conversation.userName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#202126]">{conversation.userName}</h3>
                    <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {conversation.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#E0DAF3] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={selectedConversation.userImage}
                      alt={selectedConversation.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <h2 className="font-semibold text-[#202126]">
                      {selectedConversation.userName}
                    </h2>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.senderId === session?.user?.id
                            ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                            : 'bg-gray-100 text-[#202126]'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70">
                          {message.createdAt.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[#E0DAF3]">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 rounded-lg border border-[#E0DAF3] px-4 py-2 focus:outline-none focus:border-purple-600"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 