'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userId: string, role: 'VIEWER' | 'EDITOR') => void;
}

export default function InviteCollaboratorModal({ isOpen, onClose, onInvite }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
  };

  const handleInvite = () => {
    if (selectedUser) {
      onInvite(selectedUser.id, role);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Invite Collaborator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {isLoading && (
            <div className="mt-2 text-center text-gray-500">
              Searching...
            </div>
          )}

          {searchResults.length > 0 && !selectedUser && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {user.name?.[0] || user.email?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="mt-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                {selectedUser.image ? (
                  <Image
                    src={selectedUser.image}
                    alt={selectedUser.name || ''}
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {selectedUser.name?.[0] || selectedUser.email?.[0] || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="VIEWER"
                checked={role === 'VIEWER'}
                onChange={(e) => setRole(e.target.value as 'VIEWER' | 'EDITOR')}
                className="mr-2"
              />
              Viewer
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="EDITOR"
                checked={role === 'EDITOR'}
                onChange={(e) => setRole(e.target.value as 'VIEWER' | 'EDITOR')}
                className="mr-2"
              />
              Editor
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={!selectedUser}
            className={`px-4 py-2 bg-purple-600 text-white rounded-lg ${
              !selectedUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
} 