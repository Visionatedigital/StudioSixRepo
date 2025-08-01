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
      <div className={`h-full bg-gradient-to-b from-[#F8F9FF] via-[#F0F2FF] to-[#E8EBFF] border-r border-[#E0DAF3] ${expanded ? 'w-14' : 'w-14'} flex flex-col items-center py-4 transition-all duration-300`}>
        <div className="w-10 h-10 bg-gradient-to-r from-[#814ADA] to-[#AB4FF0] rounded-full flex items-center justify-center mb-6 shadow-lg">
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
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${
                activeCategoryId === category.id 
                  ? 'bg-gradient-to-r from-[#814ADA] to-[#AB4FF0] shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md border border-[#E0DAF3]'
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
        className={`bg-gradient-to-br from-white/90 via-white/95 to-white/80 backdrop-blur-sm border-r border-[#E0DAF3] transition-all duration-300 overflow-hidden ${
          expanded ? 'w-56 md:w-64' : 'w-0'
        }`}
      >
        {expanded && (
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#202126] font-semibold text-sm md:text-base">{categories.find(c => c.id === activeCategoryId)?.name}</h3>
              <button 
                onClick={() => setExpanded(false)}
                className="text-gray-500 hover:text-[#844BDC] transition-colors p-1 rounded-lg hover:bg-white/50"
              >
                <Icon name="chevron-left" size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {categories.find(c => c.id === activeCategoryId)?.channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(activeCategoryId, channel.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl mb-1 transition-all duration-200 ${
                    activeChannelId === channel.id
                      ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm truncate">{channel.name}</span>
                  </div>
                  {channel.unreadCount && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ml-1 shadow-sm">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#E0DAF3]/50">
              <div className="flex items-center bg-gradient-to-r from-[#F8F9FF] to-[#F0F2FF] rounded-xl p-3 gap-2 border border-[#E0DAF3]/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#814ADA] to-[#AB4FF0] flex items-center justify-center relative flex-shrink-0 shadow-sm">
                  <Image
                    src="/icons/online.svg"
                    alt="Online members"
                    width={20}
                    height={20}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
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