'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getRandomProfileIcon } from '@/utils/profileIcons';
import { useSession } from 'next-auth/react';
import AddToCollectionButton from '@/components/AddToCollectionButton';

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
  e.currentTarget.src = "/images/placeholder-render.jpg";
  e.currentTarget.classList.add('placeholder-image');
};

export default function LikedFeed() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [likeStates, setLikeStates] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch liked posts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/posts/liked');
        const data = await response.json();
        if (response.ok) {
          const loadedPosts = data.posts;
          setLikedPosts(loadedPosts);
          
          // Update like states and counts
          const updatedLikeStates: { [key: string]: boolean } = {};
          const updatedLikeCounts: { [key: string]: number } = {};
          
          loadedPosts.forEach((post: Post) => {
            updatedLikeStates[post.id] = post.isLiked || true;
            updatedLikeCounts[post.id] = post.likes || 0;
          });
          
          setLikeStates(updatedLikeStates);
          setLikeCounts(updatedLikeCounts);
        }
      } catch (error) {
        console.error('Error fetching liked posts:', error);
        setLikedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLikedPosts();
  }, [session]);

  // Close modal when clicking outside or pressing escape
  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Handle escape key press
  useEffect(() => {
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
        
        // If a post was unliked, remove it from the liked posts list
        if (!data.liked) {
          setLikedPosts(prev => prev.filter(post => post.id !== postId));
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-red-500 font-medium">Posts you liked</span>
        <div className="h-[1px] flex-1 bg-[#E0DAF3]"></div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : likedPosts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No liked posts yet
          </div>
        ) : (
          likedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-[#E0DAF3] p-6 mb-4">
              {/* User Info */}
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

              {/* Post Image */}
              {post.imageUrl && (
                <div 
                  className="relative rounded-lg overflow-hidden cursor-pointer mb-4 bg-gray-100 flex justify-center items-center"
                  onClick={() => setSelectedImage(post.imageUrl)}
                  style={{ minHeight: '300px' }}
                >
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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
              onClick={handleCloseModal}
            >
              <Icon name="close" size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size render" 
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
              onError={handleImageError}
            />
          </div>
        </div>
      )}
    </div>
  );
} 