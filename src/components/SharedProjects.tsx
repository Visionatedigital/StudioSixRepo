import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR';
  project: {
    id: string;
    name: string;
    description: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  };
}

interface Invitation {
  id: string;
  projectId: string;
  projectName: string;
  role: 'VIEWER' | 'EDITOR';
  senderId: string;
  senderName: string | null;
  senderEmail: string;
  senderImage: string | null;
}

export default function SharedProjects() {
  const { data: session } = useSession();
  const [sharedProjects, setSharedProjects] = useState<ProjectCollaborator[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchSharedProjects();
      fetchPendingInvitations();
    }
  }, [session]);

  const fetchSharedProjects = async () => {
    try {
      const response = await fetch('/api/projects/shared');
      if (!response.ok) throw new Error('Failed to fetch shared projects');
      const data = await response.json();
      setSharedProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch('/api/notifications/pending-invitations');
      if (!response.ok) throw new Error('Failed to fetch pending invitations');
      const data = await response.json();
      console.log('Pending invitations:', data);
      setPendingInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const handleAcceptInvitation = async (notificationId: string, projectId: string, role: 'VIEWER' | 'EDITOR') => {
    try {
      const response = await fetch('/api/collaborators/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          projectId,
          action: 'ACCEPT',
          role
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }
      
      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(invitation => invitation.id !== notificationId));
      
      // Refresh shared projects list
      fetchSharedProjects();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      // You might want to show an error notification here
    }
  };

  const handleDeclineInvitation = async (notificationId: string) => {
    try {
      const response = await fetch('/api/collaborators/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          action: 'DECLINE'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline invitation');
      }
      
      // Remove from pending invitations
      setPendingInvitations(prev => prev.filter(invitation => invitation.id !== notificationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      // You might want to show an error notification here
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-xl font-semibold mb-4">Shared with me</h2>
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  // Adding debug output
  console.log('Pending invitations state:', pendingInvitations);
  console.log('Shared projects state:', sharedProjects);

  if (pendingInvitations.length === 0 && sharedProjects.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">Shared with me</h2>
      
      {pendingInvitations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium mb-3 text-gray-700">Pending Invitations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvitations.map((invitation) => (
              <div 
                key={invitation.id} 
                className="border border-purple-200 bg-white rounded-lg p-6 hover:shadow-md transition flex flex-col min-h-[180px]"
              >
                <div className="flex items-center mb-4">
                  {invitation.senderImage ? (
                    <Image 
                      src={invitation.senderImage}
                      alt={invitation.senderName || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {invitation.senderName?.charAt(0) || invitation.senderEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 text-lg">{invitation.projectName}</p>
                    <p className="text-sm text-gray-500">
                      from {invitation.senderName || invitation.senderEmail}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  You've been invited to collaborate on this project as a {invitation.role === 'EDITOR' ? 'Editor' : 'Viewer'}.
                  <span className="block mt-2 text-blue-600 font-medium">
                    Accept the invitation to access this project.
                  </span>
                </p>
                <div className="mt-auto flex space-x-2">
                  <button 
                    onClick={() => handleAcceptInvitation(invitation.id, invitation.projectId, invitation.role)}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm flex items-center justify-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm flex items-center justify-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {sharedProjects.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-3 text-gray-700">Shared Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedProjects.map((collaborator) => (
              <Link
                key={collaborator.id}
                href={`/ai-companion?projectId=${collaborator.project.id}&name=${encodeURIComponent(collaborator.project.name)}&description=${encodeURIComponent(collaborator.project.description || '')}`}
                className="border border-gray-200 bg-white rounded-lg p-6 hover:shadow-md transition flex flex-col min-h-[180px]"
              >
                <div className="flex items-center mb-4">
                  {collaborator.project.user.image ? (
                    <Image 
                      src={collaborator.project.user.image}
                      alt={collaborator.project.user.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {collaborator.project.user.name?.charAt(0) || collaborator.project.user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 text-lg">{collaborator.project.name}</p>
                    <p className="text-sm text-gray-500">
                      by {collaborator.project.user.name || collaborator.project.user.email}
                    </p>
                  </div>
                </div>
                {collaborator.project.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{collaborator.project.description}</p>
                )}
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {collaborator.role === 'EDITOR' ? 'Editor' : 'Viewer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(collaborator.project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 