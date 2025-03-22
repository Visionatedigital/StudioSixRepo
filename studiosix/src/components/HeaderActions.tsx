'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from './Icons';
import MessageInbox from './MessageInbox';

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  isRead?: boolean;
}

interface MessageItemProps {
  sender: string;
  avatar: string;
  message: string;
  time: string;
  isRead?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ title, description, time, isRead = false }) => (
  <div className={`p-4 hover:bg-gray-50 cursor-pointer ${!isRead ? 'bg-purple-50/50' : ''}`}>
    <div className="flex justify-between items-start mb-1">
      <h3 className="text-sm font-medium text-[#202126]">{title}</h3>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

const MessageItem: React.FC<MessageItemProps> = ({ sender, avatar, message, time, isRead = false }) => (
  <div className={`p-4 hover:bg-gray-50 cursor-pointer ${!isRead ? 'bg-purple-50/50' : ''}`}>
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image src={avatar} alt={sender} width={40} height={40} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-sm font-medium text-[#202126]">{sender}</h3>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{message}</p>
      </div>
    </div>
  </div>
);

// Sample data
const notifications = [
  {
    title: "Credits Running Low",
    description: "You have 10 credits remaining. Top up now to continue creating!",
    time: "2m ago",
    isRead: false
  },
  {
    title: "New Feature Available",
    description: "Try our new AI-powered sketch enhancement tool!",
    time: "1h ago",
    isRead: false
  },
  {
    title: "Weekly Summary",
    description: "You've created 15 designs this week. Great work!",
    time: "3h ago",
    isRead: true
  }
];

export default function HeaderActions() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showMessageInbox, setShowMessageInbox] = useState(false);
  const [messages] = useState(() => [
    {
      sender: "Sarah Chen",
      avatar: "/profile-icons/profile-icon-02.png",
      message: "Your latest design looks amazing! Could you share some tips?",
      time: "5m ago",
      isRead: false
    },
    {
      sender: "Alex Thompson",
      avatar: "/profile-icons/profile-icon-03.png",
      message: "I'd love to collaborate on the new project you posted.",
      time: "2h ago",
      isRead: false
    },
    {
      sender: "Maria Garcia",
      avatar: "/profile-icons/profile-icon-04.png",
      message: "Thanks for the feedback on my design!",
      time: "1d ago",
      isRead: true
    }
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }

    if (isNotificationsOpen || isSearchExpanded || isMessagesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isNotificationsOpen, isSearchExpanded, isMessagesOpen]);

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Expandable Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className={`flex items-center transition-all duration-300 ease-in-out ${
            isSearchExpanded 
              ? 'w-[300px] bg-white/95 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#CDD0D5]' 
              : 'w-12'
          }`}>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full"
            >
              <Icon name="searchbar" size={24} className={isSearchExpanded ? 'text-[#202126]' : ''} />
            </button>
            <input
              type="text"
              placeholder="Search..."
              className={`outline-none bg-transparent text-[#202126] text-sm placeholder:text-[#6C7275] w-full pr-4 ${
                isSearchExpanded ? 'opacity-100 ml-1' : 'opacity-0 w-0 p-0'
              } transition-all duration-300`}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
          >
            <Icon name="notifications" size={24} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          
          {/* Notifications Dropdown */}
          <div 
            className={`absolute right-0 mt-2 w-[380px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
              isNotificationsOpen 
                ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className="sticky top-0 p-4 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-medium text-[#202126]">Notifications</h2>
                <button 
                  className="text-sm text-purple-600 hover:text-purple-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Scrollable Notifications List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <NotificationItem key={index} {...notification} />
                ))}
              </div>
            </div>

            {/* See More Footer */}
            <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-gray-50">
              <a 
                href="#" 
                className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                See all notifications
              </a>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="relative" ref={messagesRef}>
          <button 
            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full relative"
            onClick={(e) => {
              e.stopPropagation();
              setIsMessagesOpen(!isMessagesOpen);
            }}
          >
            <Icon name="message" size={24} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          
          {/* Messages Dropdown */}
          <div 
            className={`absolute right-0 mt-2 w-[380px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${
              isMessagesOpen 
                ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className="sticky top-0 p-4 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-medium text-[#202126]">Messages</h2>
                <button 
                  className="text-sm text-purple-600 hover:text-purple-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Scrollable Messages List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              <div className="divide-y divide-gray-100">
                {messages.map((message, index) => (
                  <MessageItem key={index} {...message} />
                ))}
              </div>
            </div>

            {/* See More Footer */}
            <div className="sticky bottom-0 p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMessageInbox(true);
                  setIsMessagesOpen(false);
                }}
                className="block w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Open Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Inbox Modal */}
      {showMessageInbox && (
        <MessageInbox onClose={() => setShowMessageInbox(false)} />
      )}
    </>
  );
} 