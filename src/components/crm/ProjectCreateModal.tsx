"use client";
import React, { useState, useRef } from 'react';
import { Icon } from '@/components/Icons';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
}

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMilestone = () => setMilestones([...milestones, '']);
  const handleMilestoneChange = (i: number, value: string) => {
    setMilestones(milestones.map((m, idx) => (idx === i ? value : m)));
  };
  const handleRemoveMilestone = (i: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description,
          clientName,
          clientEmail,
          clientPhone,
          clientAddress,
          milestones,
        }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      if (onProjectCreated) onProjectCreated();
      onClose();
    } catch (err) {
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <Icon name="x" size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" value={projectName} onChange={e => setProjectName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Description</label>
            <textarea className="w-full border rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client Name</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Email</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2" value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Phone</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Address</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timeline (Milestones)</label>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" className="flex-1 border rounded-lg px-3 py-2" value={m} onChange={e => handleMilestoneChange(i, e.target.value)} placeholder={`Milestone ${i + 1}`} />
                  {milestones.length > 1 && (
                    <button type="button" onClick={() => handleRemoveMilestone(i)} className="text-red-500 hover:text-red-700"><Icon name="trash" size={18} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddMilestone} className="text-purple-600 hover:underline text-sm mt-1">+ Add Milestone</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Thumbnail</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleThumbnailChange} className="w-full" />
            {thumbnail && <div className="mt-2 text-xs text-gray-500">Selected: {thumbnail.name}</div>}
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
        </form>
      </div>
    </div>
  );
} 