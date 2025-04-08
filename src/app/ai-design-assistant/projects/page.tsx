'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import SharedProjects from '@/components/SharedProjects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      console.log('[PROJECTS_GET] Response status:', response.status);
      
      let data;
      try {
        const text = await response.text();
        console.log('[PROJECTS_GET] Raw response:', text);
        data = JSON.parse(text);
      } catch (e) {
        console.error('[PROJECTS_GET] Failed to parse response:', e);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        console.error('[PROJECTS_GET] Server error:', data);
        throw new Error(typeof data === 'object' && data?.message ? data.message : 'Failed to fetch projects');
      }

      console.log('[PROJECTS_GET] Projects fetched:', data);
      setProjects(data);
    } catch (error) {
      console.error('[PROJECTS_GET] Error details:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch projects. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from triggering the project navigation
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      toast.success('Project deleted successfully');
      fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('[PROJECTS_DELETE] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  };

  if (!session?.user) {
    return (
      <DashboardLayout currentPage="My Projects">
        <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Please sign in to view your projects</h1>
              <Link href="/sign-in" className="text-[#814ADA] hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="My Projects">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">My Projects</h1>
            <Link
              href="/ai-design-assistant"
              className="flex items-center px-4 py-2 bg-[#814ADA] text-white rounded-lg hover:bg-[#6B3EB8] transition-colors"
            >
              <Image
                src="/icons/plus-white-icon.svg"
                alt="Create New Project"
                width={20}
                height={20}
                className="mr-2"
              />
              New Project
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Icon name="spinner" className="w-8 h-8 animate-spin text-[#814ADA]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No projects yet</h2>
              <p className="text-gray-600 mb-6">Create your first project to get started</p>
              <Link
                href="/ai-design-assistant"
                className="inline-flex items-center px-4 py-2 bg-[#814ADA] text-white rounded-lg hover:bg-[#6B3EB8] transition-colors"
              >
                <Image
                  src="/icons/plus-white-icon.svg"
                  alt="Create Project"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                  onClick={() => router.push(`/ai-companion?name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}&projectId=${project.id}`)}
                >
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete project"
                  >
                    <Image
                      src="/icons/trashbin-icon.svg"
                      alt="Delete project"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  </button>
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Icon name="calendar" className="w-4 h-4 mr-2" />
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!isLoading && (
            <div className="my-10 border-t border-gray-200"></div>
          )}
          
          <SharedProjects />
        </div>
      </div>
    </DashboardLayout>
  );
} 