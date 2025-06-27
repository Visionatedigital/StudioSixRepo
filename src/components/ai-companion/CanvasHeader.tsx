'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '../Icons';
import { useSession, signOut } from 'next-auth/react';
import MessageInbox from '../MessageInbox';
import RenderProgressTracker from '../RenderProgressTracker';
import { UserPlus } from 'lucide-react';
import { VerifiedBadge } from '../VerifiedBadge';
import { saveAsTemplate } from '@/lib/canvas-utils';
import { Stage } from 'konva/lib/Stage';

interface Collaborator {
  id: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR';
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface CanvasHeaderProps {
  projectName: string;
  onInviteClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSaving: boolean;
  onSave: () => void;
  projectId?: string;
  stageRef?: React.RefObject<Stage>;
}

// Collaborator Avatars Component
const CollaboratorAvatars = ({ projectId }: { projectId?: string }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const defaultAvatar = '/profile-icons/profile-icon-01.png';
  
  useEffect(() => {
    if (!projectId) return;
    
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(`/api/collaborators?projectId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setCollaborators(data);
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollaborators();
  }, [projectId]);
  
  if (loading || !collaborators.length) return null;
  
  // Show max 3 avatars + count indicator if more
  const displayCount = Math.min(collaborators.length, 3);
  const hasMore = collaborators.length > 3;
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        {collaborators.slice(0, displayCount).map((collaborator, index) => (
          <div 
            key={collaborator.id}
            className="relative rounded-full border-2 border-white"
            style={{ zIndex: 10 - index }}
          >
            <Image 
              src={collaborator.user.image || defaultAvatar}
              alt={collaborator.user.name || 'Collaborator'}
              width={32}
              height={32}
              className="rounded-full h-8 w-8 object-cover"
            />
            {collaborator.role === 'EDITOR' && (
              <span className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full w-3 h-3 border border-white"></span>
            )}
          </div>
        ))}
        {hasMore && (
          <div 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border-2 border-white"
            style={{ zIndex: 10 - displayCount }}
          >
            +{collaborators.length - displayCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CanvasHeader({
  projectName,
  onInviteClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isSaving,
  onSave,
  projectId,
  stageRef
}: CanvasHeaderProps) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const defaultAvatar = '/profile-icons/profile-icon-01.png';

  // Handle clicks outside the profile dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  const handleSaveAsTemplate = async () => {
    if (!stageRef?.current) return;

    try {
      await saveAsTemplate(
        stageRef.current,
        `${projectName} Template`,
        `Template based on ${projectName}`,
        'concept',
        true
      );
      // Show success message
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-2 bg-gray-50">
      {/* Left Container */}
      <div className="flex items-center space-x-4 bg-white rounded-lg px-4 py-2 shadow-sm">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/icons/logo.svg"
            alt="StudioSix Logo"
            width={32}
            height={32}
            className="mr-2"
          />
        </Link>
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{projectName}</span>
        </div>
      </div>

      {/* Right Container */}
      <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm">
        {/* Render Progress Tracker */}
        <div className="mr-2">
          <RenderProgressTracker />
        </div>
        
        <button
          onClick={onInviteClick}
          className="invite-button flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <UserPlus size={16} />
          <span>Invite</span>
        </button>
        
        {/* Show collaborators if projectId is provided */}
        {projectId && (
          <div className="ml-2">
            <CollaboratorAvatars projectId={projectId} />
          </div>
        )}

        <div className="h-5 w-px bg-gray-300 mx-2" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-colors ${
            canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <Image
            src="/icons/arrow-counter-clockwise.svg"
            alt="Undo"
            width={20}
            height={20}
          />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-colors ${
            canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <Image
            src="/icons/arrow-clockwise.svg"
            alt="Redo"
            width={20}
            height={20}
          />
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors disabled:bg-purple-400"
        >
          {isSaving ? (
            <>
              <Icon name="refresh" size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Icon name="save" size={16} />
              <span>Save</span>
            </>
          )}
        </button>

        <button
          onClick={handleSaveAsTemplate}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border border-purple-600 text-purple-600 hover:bg-purple-100 rounded-md transition-colors"
        >
          <Icon name="template" size={16} />
          <span>Save as Template</span>
        </button>

        <div className="h-5 w-px bg-gray-300 mx-2" />

        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
          <Icon name="search" size={20} />
        </button>

        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
          <Icon name="notifications" size={20} />
        </button>

        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 transition-colors">
          <Icon name="message" size={20} />
        </button>

        {/* Profile Button and Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D3BBFB] hover:border-[#844BDC] transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <Image
              src={session?.user?.image || defaultAvatar}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </button>

          {/* Profile Dropdown */}
          <div className={`absolute right-0 mt-2 w-[240px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out z-[50] ${
            isProfileOpen 
              ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
              : 'opacity-0 -translate-y-2 invisible pointer-events-none'
          }`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={session?.user?.image || defaultAvatar}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-medium text-[#202126] leading-none">
                      {session?.user?.name?.split(' ')[0] || 'Designer'}
                    </h3>
                    {session?.user?.verified && <VerifiedBadge className="translate-y-[-2px]" />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {session?.user?.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <Link href="/profile" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                View Profile
              </Link>
              <Link href="/settings" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                Account Settings
              </Link>
              <Link href="/pricing" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                Billing & Plans
              </Link>
            </div>
            <div className="p-2 border-t border-gray-100">
              <button 
                onClick={() => signOut({ callbackUrl: 'https://studiosix.ai' })}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 