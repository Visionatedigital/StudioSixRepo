'use client';

import React, { useState, useEffect } from 'react';
import CommunitySidebar from './CommunitySidebar';
import CommunityContent from './CommunityContent';

interface Category {
  id: string;
  name: string;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  categoryId: string;
}

export default function CommunityView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Add logging when component mounts/unmounts
  useEffect(() => {
    console.log('CommunityView component mounted');
    
    return () => {
      console.log('CommunityView component unmounted');
    };
  }, []);
  
  useEffect(() => {
    // Fetch categories and channels from the API
    const fetchCommunityData = async () => {
      try {
        console.log('Fetching community data');
        const response = await fetch('/api/community/channels');
        if (!response.ok) {
          throw new Error('Failed to fetch community data');
        }
        
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          
          // Set the first category and channel as active by default
          const firstCategory = data.categories[0];
          const firstChannel = firstCategory.channels[0];
          
          setActiveCategory(firstCategory);
          setActiveChannelId(firstChannel.id);
          console.log('Initial channel set:', firstChannel.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoading(false);
      }
    };
    
    fetchCommunityData();
  }, []);

  const handleCategoryChange = (categoryId: string, channelId: string) => {
    console.log('Changing active channel to:', channelId);
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setActiveCategory(category);
      setActiveChannelId(channelId);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] bg-white overflow-hidden rounded-xl shadow-sm items-center justify-center">
        Loading community...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white overflow-hidden rounded-xl shadow-sm w-full">
      <CommunitySidebar 
        categories={categories}
        activeCategoryId={activeCategory?.id || ''}
        activeChannelId={activeChannelId}
        onChannelSelect={handleCategoryChange}
      />
      <div className="flex-1 overflow-hidden">
        {activeCategory && activeChannelId && (
          <CommunityContent 
            categoryId={activeCategory.id}
            categoryName={activeCategory.name}
            channelId={activeChannelId}
            channelName={activeCategory.channels.find(c => c.id === activeChannelId)?.name || ''}
          />
        )}
      </div>
    </div>
  );
} 