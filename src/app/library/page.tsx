'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import { getRandomProfileIcon, getConsistentProfileIcon } from '@/utils/profileIcons';
import { useSession } from 'next-auth/react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import AddToCollectionButton from '@/components/AddToCollectionButton';

// Lazy load the components
const CommunityView = lazy(() => import('@/components/community/CommunityView'));
const LikedFeed = lazy(() => import('@/components/LikedFeed'));
const CollectionsFeed = lazy(() => import('@/components/CollectionsFeed'));

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #F6F8FA;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E0DAF3;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #814ADA;
  }
`;

// Level badge mapping
const levelBadges: Record<number, string> = {
  1: '/level-icons/Level-icon-01.svg',
  2: '/level-icons/Level-icon-02.svg',
  3: '/level-icons/Level-icon-03.svg',
  4: '/level-icons/Level-icon-04.svg',
  5: '/level-icons/Level-icon-04.svg'
};

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  likes: number;
  isLiked?: boolean;
  shares: number;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
}

// Add fallback function for images
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  // Only log specific errors if needed, but avoid console flooding
  // console.error(`Image failed to load: ${e.currentTarget.src}`);
  
  // Set a placeholder image
  e.currentTarget.src = "/images/placeholder-render.jpg";
  
  // Add a class to indicate this is a placeholder
  e.currentTarget.classList.add('placeholder-image');
};

export default function LibraryPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('Your Feed');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});
  const [recommendedProfiles, setRecommendedProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likeStates, setLikeStates] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  
  // New states for post creation
  const [postContent, setPostContent] = useState('');
  const [postAttachments, setPostAttachments] = useState<File[]>([]);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'document' | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  // Fetch recommended profiles
  useEffect(() => {
    const fetchRecommendedProfiles = async () => {
      try {
        const response = await fetch('/api/recommended-profiles');
        if (response.ok) {
          const data = await response.json();
          setRecommendedProfiles(data.profiles);
        }
      } catch (error) {
        console.error('Error fetching recommended profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProfiles();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        if (response.ok) {
          const loadedPosts = data.posts;
          setPosts(loadedPosts);
          
          // Initialize like states and counts
          const initialLikeStates: { [key: string]: boolean } = {};
          const initialLikeCounts: { [key: string]: number } = {};
          
          loadedPosts.forEach((post: Post) => {
            initialLikeStates[post.id] = post.isLiked || false;
            initialLikeCounts[post.id] = post.likes || 0;
          });
          
          setLikeStates(initialLikeStates);
          setLikeCounts(initialLikeCounts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Show empty state
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [session]);

  const tabs = [
    { 
      name: 'Community', 
      icon: 'edit', 
      iconWhite: 'edit-white', 
      regularIconSize: 16,
      activeIconSize: 20
    },
    { 
      name: 'Your Feed', 
      icon: 'heart', 
      iconWhite: 'heart-white',
      regularIconSize: 20,
      activeIconSize: 16
    },
    { name: 'Liked Feed', icon: 'like', iconWhite: 'like-white', iconSize: 18 },
    { name: 'Collections', icon: 'frame', iconWhite: 'frame-white', iconSize: 18 }
  ];

  // Close modal when clicking outside or pressing escape
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Handle escape key press
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [selectedImage]);

  // Sample feed data
  const feedPosts = [
    {
      id: 1,
      author: {
        name: 'James Smith',
        avatar: getRandomProfileIcon(),
        level: 2,
        levelTitle: 'Designer',
        isOnline: true
      },
      content: 'Just finished this modern villa render using the new lighting presets. The morning sun really brings out the texture of the wooden panels. What do you think about the shadow play?',
      image: '/gallery/image1.jpg',
      timeAgo: '12h ago',
      likes: 234,
      comments: 45
    },
    {
      id: 2,
      author: {
        name: 'Sarah Chen',
        avatar: getRandomProfileIcon(),
        level: 4,
        levelTitle: 'Designer',
        isOnline: false
      },
      content: 'Experimenting with Studio Six\'s new water reflection engine. The way it handles the pool area and glass facades is incredible. Swipe for before/after comparison.',
      image: '/gallery/image2.jpg',
      timeAgo: '1d ago',
      likes: 189,
      comments: 32
    },
    {
      id: 3,
      author: {
        name: 'Marcus Rodriguez',
        avatar: getRandomProfileIcon(),
        level: 3,
        levelTitle: 'Designer',
        isOnline: true
      },
      content: 'Quick tip: Use the new material presets in the latest update for ultra-realistic concrete textures. Here\'s a brutalist design I created using the new workflow.',
      image: '/gallery/image3.jpg',
      timeAgo: '2d ago',
      likes: 156,
      comments: 28
    },
    {
      id: 4,
      author: {
        name: 'Emma Watson',
        avatar: getRandomProfileIcon(),
        level: 5,
        levelTitle: 'Designer',
        isOnline: false
      },
      content: 'Love how the new vegetation system handles large-scale landscapes. Created this tropical villa scene in half the time it usually takes. The palm trees and grass movement look so natural!',
      image: '/gallery/image4.jpg',
      timeAgo: '3d ago',
      likes: 312,
      comments: 67
    }
  ];

  const toggleFollow = async (profileId: string) => {
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId: profileId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingStates(prev => ({
          ...prev,
          [profileId]: data.followed
        }));
        
        // Refresh recommended profiles
        const profilesResponse = await fetch('/api/recommended-profiles');
        if (profilesResponse.ok) {
          const profilesData = await profilesResponse.json();
          setRecommendedProfiles(profilesData.profiles);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikeStates(prev => ({
          ...prev,
          [postId]: data.liked,
        }));
        setLikeCounts(prev => ({
          ...prev,
          [postId]: data.likeCount,
        }));
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Handle file selection for Image, Video, Document
  const handleAttachmentClick = (type: 'image' | 'video' | 'document') => {
    setAttachmentType(type);
    if (fileInputRef.current) {
      // Set accepted file types based on attachment type
      switch (type) {
        case 'image':
          fileInputRef.current.accept = 'image/*';
          break;
        case 'video':
          fileInputRef.current.accept = 'video/*';
          break;
        case 'document':
          fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
          break;
      }
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setPostAttachments(files);
      
      // Generate preview URLs for images
      const newPreviews = files.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      
      setAttachmentPreviews(newPreviews);
    }
  };

  // Handle post submission
  const handlePostSubmit = async () => {
    if (!postContent.trim() && postAttachments.length === 0) {
      // Don't submit if no content or attachments
      return;
    }

    setIsPosting(true);

    try {
      // Create a FormData object for multipart form data submission
      const formData = new FormData();
      formData.append('content', postContent);
      
      // Add attachments to form data
      postAttachments.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });
      
      // Add attachment type
      if (attachmentType) {
        formData.append('attachmentType', attachmentType);
      }

      // API call to create a new post
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Clean up preview URLs
        attachmentPreviews.forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
        
        // Reset form
        setPostContent('');
        setPostAttachments([]);
        setAttachmentPreviews([]);
        setAttachmentType(null);
        
        // Reload posts
        const postsResponse = await fetch('/api/posts');
        const data = await postsResponse.json();
        if (postsResponse.ok) {
          setPosts(data.posts);
          
          // Initialize like states and counts for new posts
          const initialLikeStates: { [key: string]: boolean } = { ...likeStates };
          const initialLikeCounts: { [key: string]: number } = { ...likeCounts };
          
          data.posts.forEach((post: Post) => {
            if (!initialLikeStates[post.id]) {
              initialLikeStates[post.id] = post.isLiked || false;
              initialLikeCounts[post.id] = post.likes || 0;
            }
          });
          
          setLikeStates(initialLikeStates);
          setLikeCounts(initialLikeCounts);
        }
      } else {
        console.error('Error creating post:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Remove an attachment
  const removeAttachment = (index: number) => {
    setPostAttachments(prev => prev.filter((_, i) => i !== index));
    
    // Also clean up the preview URL
    if (attachmentPreviews[index]) {
      URL.revokeObjectURL(attachmentPreviews[index]);
    }
    
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    
    if (postAttachments.length <= 1) {
      setAttachmentType(null);
    }
  };

  return (
    <DashboardLayout currentPage="Library">
      <style jsx global>{scrollbarStyles}</style>
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Centered Tab Navigation */}
          <div className="flex justify-center px-8 py-2 bg-[#F6F8FA]">
            <div className="flex items-center p-1.5 gap-2.5 w-[870px] h-[52px] bg-white border border-[#CDD0D5] rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    if (activeTab !== tab.name) {
                      console.log(`Switching tab from ${activeTab} to ${tab.name}`);
                      // If we're switching away from Community, we'll unmount it completely
                      setActiveTab(tab.name);
                    }
                  }}
                  className={`flex justify-center items-center px-3 py-2.5 gap-1 flex-1 rounded-[10px] transition-all duration-200 ${
                    activeTab === tab.name
                      ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0]'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon
                    name={activeTab === tab.name ? tab.iconWhite : tab.icon}
                    size={
                      tab.regularIconSize
                        ? (activeTab === tab.name ? tab.activeIconSize : tab.regularIconSize)
                        : tab.iconSize
                    }
                  />
                  <span
                    className={`font-roboto font-medium text-sm ${
                      activeTab === tab.name ? 'text-white' : 'text-[#202126]'
                    }`}
                  >
                    {tab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex gap-5 p-6 h-[calc(100%-76px)] overflow-hidden">
            {activeTab === 'Community' ? (
              <Suspense fallback={<div>Loading Community View...</div>}>
                <CommunityView />
              </Suspense>
            ) : activeTab === 'Liked Feed' ? (
              <Suspense fallback={<div>Loading Liked Feed...</div>}>
                <LikedFeed />
              </Suspense>
            ) : activeTab === 'Collections' ? (
              <Suspense fallback={<div>Loading Collections...</div>}>
                <CollectionsFeed />
              </Suspense>
            ) : (
              <>
                {/* Main Feed Column - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                  {/* Create Post Card - Modified to be more subtle */}
                  {activeTab === 'Your Feed' && (
                    <div className="bg-white rounded-xl border border-[#E0DAF3] p-3 mb-5 shadow-sm">
                      <div className="text-base font-medium text-[#202126] mb-3">Share your render</div>
                      
                      {/* Show image previews if available */}
                      {attachmentPreviews.length > 0 && attachmentPreviews[0] && (
                        <div className="mb-3">
                          <div className="relative rounded-lg overflow-hidden flex justify-center items-center bg-gray-100" style={{ minHeight: '250px' }}>
                            <img 
                              src={attachmentPreviews[0]} 
                              alt="Preview" 
                              className="max-h-[350px] object-contain"
                              style={{ maxWidth: '100%' }}
                            />
                            <button 
                              onClick={() => removeAttachment(0)}
                              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                            >
                              <Icon name="close" size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Caption textarea */}
                      <div className="flex items-center gap-3 mb-3">
                        <textarea 
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder={attachmentPreviews.length > 0 ? "Add a caption to your render..." : "Share your architectural renders, design techniques, or ask for feedback..."}
                          className="w-full min-h-[70px] p-2 rounded-lg border border-[#E0DAF3] resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
                        />
                      </div>

                      {/* Show selected attachments (for non-images or multiple files) */}
                      {postAttachments.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {postAttachments.map((file, index) => (
                              <div key={index} className="relative bg-gray-100 p-1.5 rounded border border-[#E0DAF3] text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Icon 
                                    name={
                                      file.type.startsWith('image/') ? 'image' : 
                                      file.type.startsWith('video/') ? 'video' : 'file'
                                    } 
                                    size={14} 
                                  />
                                  <span className="truncate max-w-[180px]">{file.name}</span>
                                  {index > 0 && (
                                    <button 
                                      onClick={() => removeAttachment(index)}
                                      className="text-gray-500 hover:text-red-500"
                                    >
                                      <Icon name="close" size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            multiple={false}
                          />
                          <button 
                            onClick={() => handleAttachmentClick('image')}
                            className={`flex items-center gap-1.5 text-sm ${
                              attachmentType === 'image' ? 'text-purple-600' : 'text-[#202126] hover:text-purple-600'
                            } transition-colors`}
                          >
                            <Icon name="image" size={16} />
                            <span>Image</span>
                          </button>
                          <button 
                            onClick={() => handleAttachmentClick('video')}
                            className={`flex items-center gap-1.5 text-sm ${
                              attachmentType === 'video' ? 'text-purple-600' : 'text-[#202126] hover:text-purple-600'
                            } transition-colors`}
                          >
                            <Icon name="video" size={16} />
                            <span>Video</span>
                          </button>
                          <button 
                            onClick={() => handleAttachmentClick('document')}
                            className={`flex items-center gap-1.5 text-sm ${
                              attachmentType === 'document' ? 'text-purple-600' : 'text-[#202126] hover:text-purple-600'
                            } transition-colors`}
                          >
                            <Icon name="file" size={16} />
                            <span>Document</span>
                          </button>
                        </div>
                        <button 
                          onClick={handlePostSubmit}
                          disabled={isPosting || (!postContent.trim() && postAttachments.length === 0)}
                          className={`px-3 py-1.5 text-sm ${
                            isPosting || (!postContent.trim() && postAttachments.length === 0)
                              ? 'bg-purple-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-[#814ADA] to-[#392CA0] hover:opacity-90'
                          } text-white rounded transition-opacity`}
                        >
                          {isPosting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New Activity Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-red-500 font-medium">
                      {activeTab === 'Liked Feed' ? 'Posts you liked' : 'New activity'}
                    </span>
                    <div className="h-[1px] flex-1 bg-[#E0DAF3]"></div>
                  </div>

                  {/* Feed Posts */}
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : (activeTab === 'Liked Feed' ? posts.length === 0 : posts.length === 0) ? (
                      <div className="text-center py-4 text-gray-500">
                        {activeTab === 'Liked Feed' ? 'No liked posts yet' : 'No activity yet'}
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl border border-[#E0DAF3] p-6 mb-4">
                          {/* User Info - Enhanced size and spacing */}
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#E0DAF3]">
                              <Image
                                src={post.user.image || getRandomProfileIcon()}
                                alt={post.user.name || 'User'}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-base text-[#202126]">{post.user.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Caption */}
                          {post.caption && (
                            <p className="text-base text-gray-700 mb-4">{post.caption}</p>
                          )}

                          {/* Post Image - Clickable Container with improved sizing */}
                          {post.imageUrl && (
                            <div 
                              className="relative rounded-lg overflow-hidden cursor-pointer mb-4 bg-gray-100 flex justify-center items-center"
                              onClick={() => setSelectedImage(post.imageUrl)}
                              style={{ minHeight: '300px' }}
                            >
                              {/* Add image with direct URL */}
                              <img
                                src={post.imageUrl.startsWith('/') ? (typeof window !== 'undefined' ? `${window.location.origin}${post.imageUrl}` : post.imageUrl) : post.imageUrl}
                                alt="Shared render"
                                className="max-h-[500px] w-auto object-contain"
                                style={{ maxWidth: '100%' }}
                                onError={handleImageError}
                              />
                            </div>
                          )}

                          {/* Engagement */}
                          <div className="flex items-center space-x-6 mt-6">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center space-x-2.5 transition-colors ${
                                likeStates[post.id] ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
                              }`}
                            >
                              <Icon name={likeStates[post.id] ? 'heart-filled' : 'heart'} size={24} />
                              <span className="text-base">
                                {likeCounts[post.id] || 0} likes
                              </span>
                            </button>
                            <button className="flex items-center space-x-2.5 text-gray-500 hover:text-purple-600 transition-colors">
                              <Icon name="share" size={24} />
                              <span className="text-base">{post.shares} shares</span>
                            </button>
                            <AddToCollectionButton postId={post.id} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Sticky */}
                <div className="w-[380px] shrink-0 sticky top-6">
                  {/* Recommended Profiles */}
                  <div className="bg-white rounded-xl border border-[#E0DAF3] p-4 mb-4">
                    <h3 className="text-lg font-medium text-[#202126] mb-4">Recommended profiles</h3>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : recommendedProfiles.length > 0 ? (
                        recommendedProfiles.map((profile) => (
                          <div key={profile.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                  src={profile.avatar}
                                  alt={profile.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // If image fails to load, use a default avatar
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null; // Prevent infinite loop
                                    target.src = getConsistentProfileIcon(profile.id);
                                  }}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 leading-none">
                                  <div className="font-medium text-[#202126] leading-none">{profile.name}</div>
                                  {profile.verified && <VerifiedBadge size={16} className="translate-y-[-4px]" />}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Image
                                    src={levelBadges[profile.level]}
                                    alt={`Level ${profile.level}`}
                                    width={16}
                                    height={16}
                                  />
                                  <span className="text-sm text-gray-500">
                                    Level {profile.level} {profile.levelTitle}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {profile.followers} followers • {profile.following} following
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => toggleFollow(profile.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                                followingStates[profile.id]
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-[#F6F8FA] hover:text-purple-600'
                              }`}
                            >
                              {!followingStates[profile.id] && (
                                <Icon name="plus" size={14} />
                              )}
                              <span className="text-sm font-medium">
                                {followingStates[profile.id] ? 'Following' : 'Follow'}
                              </span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No recommended profiles at the moment
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Events Section */}
                  <div className="bg-white rounded-xl border border-[#E0DAF3] p-4 h-[calc(100vh-26rem)] flex flex-col">
                    <h3 className="text-lg font-medium text-[#202126] mb-4">Upcoming Events</h3>
                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">Advanced Lighting Techniques</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Learn professional lighting techniques for architectural visualization from industry experts.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Tomorrow, 2:00 PM</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>45 attending</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">Material Creation Workshop</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Master the art of creating photorealistic materials for your 3D renders.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Fri, 11:00 AM</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>32 attending</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">Portfolio Review Session</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Get feedback on your work from senior designers and improve your portfolio.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Next Week</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>28 attending</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">3D Modeling Masterclass</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Deep dive into advanced 3D modeling techniques with industry veterans.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Next Mon, 3:00 PM</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>52 attending</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">Rendering Optimization Workshop</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Learn how to optimize your renders for better performance without sacrificing quality.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Next Tue, 1:00 PM</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>38 attending</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Card */}
                      <div className="p-3 bg-[#F6F8FA] rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-[#202126] mb-1">Color Theory in Architecture</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">Explore the impact of color in architectural visualization and design psychology.</p>
                          </div>
                          <div className="bg-purple-100 p-1.5 rounded">
                            <Icon name="calendar" size={16} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="clock" size={14} />
                            <span>Next Wed, 4:00 PM</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Icon name="users" size={14} />
                            <span>41 attending</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View All Events Button */}
                    <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      View All Events
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div 
              className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="w-full h-full object-contain"
                style={{ maxHeight: '90vh' }}
                onError={handleImageError}
              />
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center"
              >
                <Icon name="close" size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}
    </div>
    </DashboardLayout>
  );
} 