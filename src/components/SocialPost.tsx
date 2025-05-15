'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getRandomProfileIcon } from '@/utils/profileIcons';
import AddToCollectionButton from '@/components/AddToCollectionButton';

interface User {
  id: string;
  name: string;
  image: string | null;
  level?: number;
  verified?: boolean;
}

interface Attachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
}

interface SocialPostProps {
  id: string;
  user: User;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  shares: number;
  attachments?: Attachment[];
  onLike?: (postId: string) => void;
  onShare?: (postId: string) => void;
  isDetailView?: boolean;
  className?: string;
}

export default function SocialPost({
  id,
  user,
  content,
  imageUrl,
  createdAt,
  likes,
  isLiked = false,
  shares,
  attachments = [],
  onLike,
  onShare,
  isDetailView = false,
  className = '',
}: SocialPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [imageHeight, setImageHeight] = useState(isDetailView ? 500 : 300);
  
  // Format the image URL properly
  useEffect(() => {
    if (!imageUrl) return;
    
    // Log the incoming URL for debugging
    console.log(`SocialPost received imageUrl: ${imageUrl}`);
    
    try {
      if (imageUrl.startsWith('/')) {
        // For server-relative URLs like /uploads/file.jpg
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = `${origin}${imageUrl}`;
        console.log(`Setting fullImageUrl to: ${fullUrl}`);
        setFullImageUrl(fullUrl);
      } else if (imageUrl.startsWith('http')) {
        // For absolute URLs, use as is
        console.log(`Using absolute URL: ${imageUrl}`);
        setFullImageUrl(imageUrl);
      } else {
        // For other cases, treat as relative and add a leading slash
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = `${origin}/${imageUrl}`;
        console.log(`Treating as relative URL: ${fullUrl}`);
        setFullImageUrl(fullUrl);
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
      setImageError(true);
      setImageLoaded(true);
    }
  }, [imageUrl]);

  // Handle image loading error
  const handleImageError = () => {
    console.error(`Failed to load image: ${fullImageUrl}`);
    // Try to diagnose the issue
    if (fullImageUrl.includes('undefined')) {
      console.error('URL contains undefined - possible window.location issue');
    }
    if (!fullImageUrl.startsWith('http') && typeof window !== 'undefined') {
      console.error('URL is not absolute, might not resolve correctly');
    }
    setImageError(true);
    setImageLoaded(true); // Mark as loaded even though it's an error
  };

  // Format the timestamp nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-[#E0DAF3] p-5 ${className}`}>
      {/* User Info */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#E0DAF3] flex-shrink-0">
          <Image
            src={user.image || getRandomProfileIcon()}
            alt={user.name || 'User'}
            width={48}
            height={48}
            className="w-full h-full object-cover rounded-full"
          />
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <Icon name="verified" size={16} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[#202126] truncate">{user.name}</p>
            {user.level && (
              <div className="flex items-center justify-center bg-purple-100 rounded-full w-5 h-5">
                <span className="text-purple-700 text-xs font-medium">{user.level}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      {content && (
        <p className="text-base text-gray-700 mb-4 whitespace-pre-line">{content}</p>
      )}

      {/* Post Image with better loading handling */}
      {imageUrl && (
        <div 
          className={`rounded-lg overflow-hidden bg-gray-100 ${imageError ? 'border border-red-200' : 'border border-[#E0DAF3]'}`}
        >
          <div 
            className="relative w-full flex justify-center items-center transition-opacity duration-300"
            style={{ 
              minHeight: `${imageHeight}px`,
              opacity: imageLoaded ? 1 : 0.5
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}
            
            <img
              src={fullImageUrl || '/images/placeholder-render.jpg'}
              alt={content || "Post image"}
              className={`w-full h-auto object-contain max-h-[600px] transition-all duration-300 ${imageError ? 'opacity-60' : ''}`}
              style={{
                display: imageLoaded ? 'block' : 'none',
                maxHeight: `${imageHeight * 2}px`
              }}
              onLoad={() => {
                console.log(`Successfully loaded image: ${fullImageUrl}`);
                setImageLoaded(true);
              }}
              onError={handleImageError}
            />
            
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50 bg-opacity-80">
                <Icon name="image" size={48} className="text-gray-400 mb-2" />
                <p className="text-sm">Image could not be loaded</p>
                <p className="text-xs text-gray-400 mt-1">{fullImageUrl ? fullImageUrl.substring(0, 50) + '...' : 'No URL provided'}</p>
                <button 
                  className="mt-3 px-3 py-1 bg-purple-100 text-purple-600 rounded-md text-xs"
                  onClick={() => {
                    // Try to load the default placeholder image
                    setFullImageUrl('/images/placeholder-render.jpg');
                    setImageError(false);
                    setImageLoaded(false);
                  }}
                >
                  Use Placeholder Image
                </button>
              </div>
            )}
            
            {/* Image controls - only shown when image is properly loaded */}
            {imageLoaded && !imageError && (
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <button 
                  className="p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                  onClick={() => setImageHeight(prevHeight => prevHeight === 300 ? 500 : 300)}
                >
                  <Icon name="expand" size={20} className="text-white" />
                </button>
                <a 
                  href={fullImageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-all"
                >
                  <Icon name="download" size={20} className="text-white" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attachments - for non-image files */}
      {attachments && attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {attachments.map((attachment, index) => {
            if (attachment.type === 'image') return null; // Skip images as they're handled above
            
            return (
              <div 
                key={index} 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <Icon 
                  name={attachment.type === 'video' ? 'video' : 'file'} 
                  size={24} 
                  className="text-blue-500 mr-3" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {attachment.name || `${attachment.type} attachment`}
                  </p>
                  {attachment.size && (
                    <p className="text-xs text-gray-500">
                      {Math.round(attachment.size / 1024)} KB
                    </p>
                  )}
                </div>
                <a 
                  href={attachment.url} 
                  download
                  className="p-2 text-gray-500 hover:text-blue-500"
                >
                  <Icon name="download" size={20} />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center space-x-5 mt-5">
        <button 
          onClick={() => onLike && onLike(id)}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          <Icon name={isLiked ? 'heart-filled' : 'heart'} size={22} />
          <span className="text-sm font-medium">{likes || 0}</span>
        </button>
        
        <button 
          onClick={() => onShare && onShare(id)}
          className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors"
        >
          <Icon name="share" size={22} />
          <span className="text-sm font-medium">{shares || 0}</span>
        </button>
        
        <AddToCollectionButton 
          postId={id} 
          buttonSize={22} 
          iconOnly={false} 
          className="text-gray-500" 
        />
      </div>
    </div>
  );
} 