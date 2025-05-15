'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { getRandomProfileIcon } from '@/utils/profileIcons';
import { useSession } from 'next-auth/react';

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

interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
  posts: Post[];
}

// Add fallback function for images
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "/images/placeholder-render.jpg";
  e.currentTarget.classList.add('placeholder-image');
};

export default function CollectionsFeed() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        if (response.ok) {
          setCollections(data.collections);
          if (data.collections.length > 0 && !selectedCollection) {
            setSelectedCollection(data.collections[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
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
  
  // Create new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Refresh collections
        const collectionsResponse = await fetch('/api/collections');
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections);
        
        // Select the newly created collection
        const newCollection = collectionsData.collections.find(
          (c: Collection) => c.id === data.collection.id
        );
        if (newCollection) {
          setSelectedCollection(newCollection);
        }
        
        // Reset form and close modal
        setNewCollectionName('');
        setNewCollectionDescription('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Remove post from collection
  const handleRemoveFromCollection = async (postId: string) => {
    if (!selectedCollection) return;
    
    try {
      const response = await fetch(`/api/collections/posts?postId=${postId}&collectionId=${selectedCollection.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Update local state
        setSelectedCollection(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            postCount: prev.postCount - 1,
            posts: prev.posts.filter(post => post.id !== postId)
          };
        });
        
        // Also update collections list
        setCollections(prev => 
          prev.map(collection => {
            if (collection.id === selectedCollection.id) {
              return {
                ...collection,
                postCount: collection.postCount - 1,
                posts: collection.posts.filter(post => post.id !== postId)
              };
            }
            return collection;
          })
        );
      }
    } catch (error) {
      console.error('Error removing post from collection:', error);
    }
  };

  return (
    <div className="flex flex-1 gap-5 overflow-hidden">
      {/* Collections Sidebar */}
      <div className="w-64 shrink-0 bg-white rounded-xl border border-[#E0DAF3] p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#202126]">Your Collections</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="mb-2">No collections yet</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Collection
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {collections.map(collection => (
              <li key={collection.id}>
                <button
                  onClick={() => setSelectedCollection(collection)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCollection?.id === collection.id 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="truncate flex-1">
                    <span className="font-medium">{collection.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{collection.postCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Collection Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {/* Collection Header */}
        {selectedCollection ? (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-[#202126] mb-1">{selectedCollection.name}</h1>
              <p className="text-gray-500">{selectedCollection.description || 'No description'}</p>
              <div className="text-sm text-gray-500 mt-1">
                {selectedCollection.postCount} {selectedCollection.postCount === 1 ? 'post' : 'posts'}
              </div>
            </div>
            
            {/* Collection Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {selectedCollection.posts.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-[#E0DAF3] text-gray-500">
                  <p className="mb-1">This collection is empty</p>
                  <p className="text-sm">Add posts to your collection by clicking the collection icon on any post</p>
                </div>
              ) : (
                selectedCollection.posts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl border border-[#E0DAF3] overflow-hidden group">
                    {/* Post Image */}
                    <div 
                      className="relative aspect-square overflow-hidden cursor-pointer bg-gray-100"
                      onClick={() => setSelectedImage(post.imageUrl)}
                    >
                      <img
                        src={post.imageUrl}
                        alt={post.caption || 'Collection image'}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                            <Icon name="expand" size={20} className="text-gray-800" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCollection(post.id);
                            }} 
                            className="p-2 bg-white rounded-full hover:bg-gray-100"
                          >
                            <Icon name="trash" size={20} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={post.user.image || getRandomProfileIcon()}
                            alt={post.user.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium truncate">{post.user.name}</div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {collections.length === 0 ? (
              <>
                <Icon name="collections-grid" size={48} className="mb-4 text-gray-300" />
                <h2 className="text-xl font-medium mb-2">No Collections Yet</h2>
                <p className="mb-4">Create a collection to organize your favorite posts</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Collection
                </button>
              </>
            ) : (
              <p>Select a collection from the sidebar</p>
            )}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-medium mb-4">Create New Collection</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Collection name"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={newCollectionDescription}
                onChange={e => setNewCollectionDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Add a description for your collection"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim() || isCreating}
                className={`px-4 py-2 rounded-lg ${
                  !newCollectionName.trim() || isCreating
                    ? 'bg-purple-300 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {isCreating ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

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