'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/Icons';
import { useSession } from 'next-auth/react';

interface Collection {
  id: string;
  name: string;
  postCount: number;
}

interface AddToCollectionButtonProps {
  postId: string;
  buttonSize?: number;
  className?: string;
  iconOnly?: boolean;
}

export default function AddToCollectionButton({
  postId,
  buttonSize = 24,
  className = '',
  iconOnly = false,
}: AddToCollectionButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inCollections, setInCollections] = useState<Record<string, boolean>>({});
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isInAnyCollection, setIsInAnyCollection] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collections when opening the dropdown
  useEffect(() => {
    const fetchCollections = async () => {
      if (!isOpen || !session?.user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        if (response.ok) {
          setCollections(data.collections);
          
          // Determine which collections this post is already in
          const postCollections: Record<string, boolean> = {};
          let savedInAny = false;
          
          data.collections.forEach((collection: Collection & { posts: any[] }) => {
            const isInCollection = collection.posts.some(
              (post: { id: string }) => post.id === postId
            );
            
            postCollections[collection.id] = isInCollection;
            if (isInCollection) savedInAny = true;
          });
          
          setInCollections(postCollections);
          setIsInAnyCollection(savedInAny);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, [isOpen, session, postId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNewCollection(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle post in collection
  const toggleInCollection = async (collectionId: string) => {
    if (!session?.user) return;
    
    // Optimistically update UI
    const isCurrentlyInCollection = inCollections[collectionId] || false;
    
    // Update collection state
    setInCollections(prev => ({
      ...prev,
      [collectionId]: !isCurrentlyInCollection
    }));
    
    // Determine if the post is in any collection after this toggle
    const updatedCollections = {
      ...inCollections,
      [collectionId]: !isCurrentlyInCollection
    };
    
    const stillInSomeCollection = Object.values(updatedCollections).some(value => value);
    setIsInAnyCollection(stillInSomeCollection);
    
    try {
      if (isCurrentlyInCollection) {
        // Remove from collection
        await fetch(`/api/collections/posts?postId=${postId}&collectionId=${collectionId}`, {
          method: 'DELETE'
        });
      } else {
        // Add to collection
        await fetch('/api/collections/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, collectionId })
        });
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
      // Revert optimistic update on error
      setInCollections(prev => ({
        ...prev,
        [collectionId]: isCurrentlyInCollection
      }));
      
      // Recalculate if in any collection after error
      const revertedCollections = {
        ...inCollections,
        [collectionId]: isCurrentlyInCollection
      };
      setIsInAnyCollection(Object.values(revertedCollections).some(value => value));
    }
  };
  
  // Create new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !session?.user) return;
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Add post to the newly created collection
        const addResponse = await fetch('/api/collections/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            postId, 
            collectionId: data.collection.id 
          })
        });
        
        if (addResponse.ok) {
          // Refresh collections
          const collectionsResponse = await fetch('/api/collections');
          const collectionsData = await collectionsResponse.json();
          setCollections(collectionsData.collections);
          
          // Update inCollections state
          const postCollections: Record<string, boolean> = { ...inCollections };
          postCollections[data.collection.id] = true;
          setInCollections(postCollections);
          setIsInAnyCollection(true);
        }
        
        // Reset form and close new collection input
        setNewCollectionName('');
        setShowNewCollection(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!session?.user) {
    return null; // Don't show the button if not logged in
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 transition-colors hover:text-purple-600 ${className}`}
        aria-label="Add to collection"
      >
        <Icon name={isInAnyCollection ? "collection-filled" : "collection"} size={buttonSize} className={isInAnyCollection ? "text-purple-600" : ""} />
        {!iconOnly && <span className="text-base">Save</span>}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2 max-h-72 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">Save to Collection</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {collections.length === 0 && !showNewCollection ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  <p className="mb-2">No collections yet</p>
                  <button
                    onClick={() => setShowNewCollection(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Create your first collection
                  </button>
                </div>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {collections.map(collection => (
                    <li key={collection.id} className="px-1">
                      <button
                        onClick={() => toggleInCollection(collection.id)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
                      >
                        <span className="truncate">{collection.name}</span>
                        <span className={inCollections[collection.id] ? 'text-purple-600' : 'text-gray-400'}>
                          <Icon 
                            name={inCollections[collection.id] ? 'check-circle-filled' : 'circle-outline'} 
                            size={18} 
                          />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {showNewCollection ? (
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Collection name"
                      className="flex-1 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim() || isCreating}
                      className={`p-2 rounded ${
                        !newCollectionName.trim() || isCreating
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {isCreating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Icon name="plus" size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={() => setShowNewCollection(true)}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <Icon name="plus" size={16} />
                    <span>Create new collection</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
} 