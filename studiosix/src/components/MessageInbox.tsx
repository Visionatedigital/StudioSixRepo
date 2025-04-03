import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  verified: boolean;
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

interface MessageInboxProps {
  onClose: () => void;
  initialConversation?: Conversation | null;
}

export default function MessageInbox({ onClose, initialConversation }: MessageInboxProps) {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(initialConversation || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.users);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await fetch(`/api/messages?userId=${selectedConversation.userId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Update selected conversation when initialConversation changes
  useEffect(() => {
    if (initialConversation) {
      setSelectedConversation(initialConversation);
    }
  }, [initialConversation]);

  const handleStartConversation = async (user: User) => {
    // Create a new conversation or switch to existing one
    setSelectedConversation({
      id: user.id,
      userId: user.id,
      userName: user.name || 'Unknown User',
      userImage: user.image || '/profile-icons/Profile-icon-01.svg',
      lastMessage: '',
      unreadCount: 0,
      updatedAt: new Date(),
    });
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageInput,
          receiverId: selectedConversation.userId,
        }),
      });

      if (response.ok) {
        // Add message to the UI
        const newMessage: Message = {
          id: Date.now().toString(), // Temporary ID until we get the real one
          content: messageInput,
          senderId: session?.user?.id || '',
          receiverId: selectedConversation.userId,
          createdAt: new Date(),
        };
        setMessages([...messages, newMessage]);
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 isolate" style={{ zIndex: 999999 }}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div ref={modalRef} className="bg-white rounded-xl w-[80vw] h-[80vh] flex overflow-hidden relative">
          {/* Left Panel - Conversations List */}
          <div className="w-1/3 border-r border-[#E0DAF3] flex flex-col">
            <div className="p-4 border-b border-[#E0DAF3] space-y-4">
              <h2 className="text-xl font-semibold text-[#202126]">Messages</h2>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  placeholder="Search users..."
                  className="w-full rounded-lg border border-[#E0DAF3] pl-10 pr-4 py-2 focus:outline-none focus:border-purple-600"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isSearching && searchQuery ? (
                // Search Results
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartConversation(user)}
                    className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-10 h-10">
                      <Image
                        src={user.image || '/profile-icons/Profile-icon-01.svg'}
                        alt={user.name || 'User'}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[#202126] flex items-center gap-1">
                        {user.name || user.email}
                        {user.verified && (
                          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                // Existing Conversations
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="relative w-10 h-10">
                      <Image
                        src={conversation.userImage}
                        alt={conversation.userName}
                        fill
                        className="rounded-full object-cover"
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
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#E0DAF3] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 relative">
                      <Image
                        src={selectedConversation.userImage}
                        alt={selectedConversation.userName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <h2 className="font-semibold text-[#202126]">
                      {selectedConversation.userName}
                    </h2>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[60%] rounded-xl px-3 py-1.5 text-sm ${
                          message.senderId === session?.user?.id
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-gray-100 text-[#202126]'
                        }`}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                        <span className="text-[10px] opacity-60 mt-1 block">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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