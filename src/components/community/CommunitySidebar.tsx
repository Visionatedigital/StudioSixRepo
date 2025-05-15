'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icons';

interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  unreadCount?: number;
}

interface CommunitySidebarProps {
  categories: Category[];
  activeCategoryId: string;
  activeChannelId: string;
  onChannelSelect: (categoryId: string, channelId: string) => void;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, { icon: string, iconWhite: string, iconType: 'component' | 'image' }> = {
  'Announcements': {
    iconType: 'image',
    icon: '/icons/announcements.svg',
    iconWhite: '/icons/announcements-white.svg',
  },
  'Show Your Work': {
    iconType: 'component',
    icon: 'gallery',
    iconWhite: 'gallery',
  },
  'Tips & Workflows': {
    iconType: 'image',
    icon: '/icons/tips-white.svg',
    iconWhite: '/icons/tips.svg',
  },
  'Ask the Community': {
    iconType: 'image',
    icon: '/icons/ask-the-community.svg',
    iconWhite: '/icons/ask-the-community-white.svg',
  },
  'Bug Reports': {
    iconType: 'image',
    icon: '/icons/bug-droid.svg',
    iconWhite: '/icons/bug-droid-white.svg',
  },
  'Feature Suggestions': {
    iconType: 'image',
    icon: '/icons/features-white.svg',
    iconWhite: '/icons/features.svg',
  },
  // Default icon for any category not in the mapping
  'default': {
    iconType: 'component',
    icon: 'message-square',
    iconWhite: 'message-square',
  }
};

export default function CommunitySidebar({ categories, activeCategoryId, activeChannelId, onChannelSelect }: CommunitySidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    onlineUsers: 0
  });
  
  // Fetch user stats when component mounts
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/users/online');
        if (response.ok) {
          const data = await response.json();
          setUserStats({
            totalUsers: data.totalUsers,
            onlineUsers: data.onlineUsers
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
  }, []);

  // Get icon information for a category
  const getCategoryIcon = (categoryName: string) => {
    return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS['default'];
  };

  return (
    <div className="flex h-full">
      {/* Primary Sidebar */}
      <div className={`h-full bg-[#F6F8FA] border-r border-[#E0DAF3] ${expanded ? 'w-14' : 'w-14'} flex flex-col items-center py-4 transition-all duration-300`}>
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mb-6">
          <Icon name="users" size={20} className="text-white" />
        </div>
        
        {categories.map((category) => {
          const iconInfo = getCategoryIcon(category.name);
          return (
            <button
              key={category.id}
              onClick={() => {
                if (category.channels.length > 0) {
                  onChannelSelect(category.id, category.channels[0].id);
                }
                setExpanded(true);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                activeCategoryId === category.id 
                  ? 'bg-purple-600'
                  : 'bg-white hover:bg-purple-100 border border-[#E0DAF3]'
              }`}
              title={category.name}
            >
              {iconInfo.iconType === 'component' ? (
                <Icon 
                  name={iconInfo.icon as any} 
                  size={20} 
                  className={activeCategoryId === category.id ? 'text-white' : 'text-gray-700'}
                />
              ) : (
                <Image
                  src={activeCategoryId === category.id ? iconInfo.iconWhite : iconInfo.icon}
                  alt={category.name}
                  width={20}
                  height={20}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Sidebar (Channels) */}
      <div 
        className={`bg-white border-r border-[#E0DAF3] transition-all duration-300 overflow-hidden ${
          expanded ? 'w-56 md:w-64' : 'w-0'
        }`}
      >
        {expanded && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#202126] font-semibold text-sm md:text-base">{categories.find(c => c.id === activeCategoryId)?.name}</h3>
              <button 
                onClick={() => setExpanded(false)}
                className="text-gray-500 hover:text-purple-600"
              >
                <Icon name="chevron-left" size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {categories.find(c => c.id === activeCategoryId)?.channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(activeCategoryId, channel.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded mb-1 transition-colors ${
                    activeChannelId === channel.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-[#F6F8FA] hover:text-purple-600'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm truncate">{channel.name}</span>
                  </div>
                  {channel.unreadCount && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ml-1">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#E0DAF3]">
              <div className="flex items-center bg-[#F6F8FA] rounded-lg p-2 gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative flex-shrink-0">
                  <Image
                    src="/icons/online.svg"
                    alt="Online members"
                    width={20}
                    height={20}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                </div>
                <div className="text-xs text-gray-500 min-w-0">
                  <div className="font-medium text-[#202126]">Online</div>
                  <div className="truncate">{userStats.onlineUsers.toLocaleString()} members</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 