"use client";
import React, { useState, useEffect } from 'react';
import ProjectTile from './ProjectTile';
import ProjectCreateModal from './ProjectCreateModal';

export default function ClientHubDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (e) {
      setProjects([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Client Hub</h1>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-purple-700 transition"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Project
        </button>
      </div>
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-400">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No projects found.</div>
        ) : (
          projects.map((project) => (
            <ProjectTile key={project.id} project={project} />
          ))
        )}
      </div>
    </div>
  );
} 