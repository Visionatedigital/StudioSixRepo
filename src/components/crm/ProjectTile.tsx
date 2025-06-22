'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icons';

interface ProjectTileProps {
  project: {
    id: string;
    name: string;
    client: string;
    status: string;
    thumbnail?: string;
  };
  onThumbnailUpdate?: (id: string, url: string) => void;
}

export default function ProjectTile({ project, onThumbnailUpdate }: ProjectTileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Stub: Upload to /api/projects/[id]/thumbnail
    const formData = new FormData();
    formData.append('thumbnail', file);
    const res = await fetch(`/api/projects/${project.id}/thumbnail`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (onThumbnailUpdate) onThumbnailUpdate(project.id, data.url);
    } else {
      alert('Failed to upload image');
    }
  };

  return (
    <div className="block rounded-2xl bg-white shadow hover:shadow-lg transition p-0 border border-gray-100 overflow-hidden group relative">
      {/* Thumbnail with edit icon overlay */}
      <div className="w-full h-36 bg-gray-100 flex items-center justify-center relative">
        <Link href={`/client-hub/${project.id}`} className="absolute inset-0 z-10" />
        <img
          src={project.thumbnail || '/images/project-placeholder.jpg'}
          alt={project.name}
          className="object-cover w-full h-full"
        />
        <button
          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 z-20 opacity-0 group-hover:opacity-100 transition"
          onClick={handleEditClick}
          title="Edit Thumbnail"
        >
          <Icon name="edit" size={18} className="text-gray-700" />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{project.status}</span>
        </div>
        <div className="text-sm text-gray-500">Client: <span className="font-medium text-gray-700">{project.client}</span></div>
      </div>
    </div>
  );
} 