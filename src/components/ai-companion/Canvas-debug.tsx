'use client';

import React from 'react';

interface Props {
  name: string;
  description: string;
  projectId: string;
}

export default function Canvas({ name, description, projectId }: Props) {
  console.log('[DEBUG] Minimal Canvas component rendered with props:', { name, description, projectId });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Minimal Canvas Component</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {name || 'No name provided'}</p>
        <p><strong>Description:</strong> {description || 'No description provided'}</p>
        <p><strong>Project ID:</strong> {projectId || 'No project ID provided'}</p>
      </div>
    </div>
  );
} 