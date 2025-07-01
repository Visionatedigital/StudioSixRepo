'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon as UiIcon } from '@/components/ui/Icon';
import { Icon as ImgIcon } from '@/components/Icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function AIDesignAssistantPage() {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Please sign in to create a project');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description,
        }),
      });

      let data;
      try {
        const text = await response.text();
        console.log('[CREATE_PROJECT] Raw response:', text);
        data = JSON.parse(text);
      } catch (e) {
        console.error('[CREATE_PROJECT] Failed to parse response:', e);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        console.error('[CREATE_PROJECT] Server error:', data);
        throw new Error(typeof data === 'object' && data?.message ? data.message : 'Failed to create project');
      }

      console.log('[CREATE_PROJECT] Project created successfully:', data);
      toast.success('Project created successfully!');
      setShowModal(false);
      router.push(`/ai-companion?name=${encodeURIComponent(projectName)}&description=${encodeURIComponent(description)}&projectId=${data.id}&isNew=true`);
    } catch (error) {
      console.error('[CREATE_PROJECT] Error details:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout currentPage="AI Design Assistant">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Project Section */}
          <div className="flex flex-col items-center mt-48">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#FF3366] via-[#814ADA] to-[#4F46E5] text-transparent bg-clip-text flex items-center justify-center gap-3">
                AI Design Assistant
                <ImgIcon name="sparkles" className="w-8 h-8 text-[#814ADA]" />
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Create stunning architectural designs with intelligent assistance. Start a new project or continue working on your existing designs.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-6 py-3 bg-[#814ADA] text-white rounded-lg hover:bg-[#6B3EB8] transition-colors"
              >
                <Image
                  src="/icons/plus-white-icon.svg"
                  alt="Create New Project"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span className="font-medium">Create New Project</span>
              </button>
              <Link href="/ai-design-assistant/projects" className="flex items-center px-6 py-3 bg-[#814ADA]/10 rounded-lg hover:bg-[#814ADA]/20 transition-colors">
                <ImgIcon name="library" className="w-5 h-5 mr-2 text-[#814ADA]" />
                <span className="text-[#814ADA] font-medium">My Projects</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[500px] max-w-[90vw]">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#814ADA] focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#814ADA] focus:border-transparent h-32 resize-none"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#814ADA] text-white rounded-lg hover:bg-[#6B3EB8] transition-colors flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <UiIcon name="spinner" className="w-4 h-4 animate-spin text-white" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 