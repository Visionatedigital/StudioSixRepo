'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

interface ContainerTemplate {
  id: string;
  name: string;
  description?: string;
}

type Tool = 'text' | 'board' | 'container' | 'note' | 'image' | 'upload' | 'draw' | 'trash' | 'prompt';

interface ToolDefinition {
  id: Tool;
  name: string;
  icon: string;
  activeIcon?: string;
}

interface ToolsPanelProps {
  onToolSelect: (toolId: Tool, templateId?: string) => void;
  selectedTool: Tool;
}

function ContainerSubmenu({ onSelect, onClose }: { 
  onSelect: (templateId: string) => void;
  onClose: () => void;
}) {
  const templates: ContainerTemplate[] = [
    { id: 'concept-development', name: 'Concept Development' },
    { id: 'design-exploration', name: 'Design Exploration' },
    { id: 'visual-presentation', name: 'Visual Presentation' },
    { id: 'custom', name: 'Custom Template' }
  ];

  return (
    <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-[280px] z-50">
      <h3 className="text-lg font-semibold mb-4">Select Template</h3>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <p className="font-medium">{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ToolsPanel({ onToolSelect, selectedTool }: ToolsPanelProps) {
  const [showContainerSubmenu, setShowContainerSubmenu] = useState(false);

  const handleContainerSelect = (templateId: string) => {
    onToolSelect('container', templateId);
    setShowContainerSubmenu(false);
  };

  const tools: ToolDefinition[] = [
    {
      id: 'draw',
      name: 'Draw',
      icon: '/icons/edit-icon.svg'
    },
    {
      id: 'prompt',
      name: 'Imagine',
      icon: '/icons/visualize-icon.svg',
      activeIcon: '/icons/visualize-white-icon.svg'
    },
    {
      id: 'text',
      name: 'Text',
      icon: '/icons/text-icon.svg',
      activeIcon: '/icons/text-white-icon.svg'
    },
    {
      id: 'board',
      name: 'Board',
      icon: '/icons/library-icon.svg'
    },
    {
      id: 'container',
      name: 'Template',
      icon: '/icons/container-icon.svg',
      activeIcon: '/icons/container-white-icon.svg'
    },
    {
      id: 'note',
      name: 'Note',
      icon: '/icons/sticky-note-icon.svg',
      activeIcon: '/icons/sticky-note-white-icon.svg'
    },
    {
      id: 'image',
      name: 'Add Image',
      icon: '/icons/image-icon.svg'
    },
    {
      id: 'upload',
      name: 'Upload',
      icon: '/icons/download-icon.svg'
    },
    {
      id: 'trash',
      name: 'Trash',
      icon: '/icons/trash-icon.svg'
    }
  ];

  return (
    <div className="fixed left-0 bg-white shadow-lg rounded-lg p-2.5 flex flex-col gap-2 w-[68px]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => {
            if (tool.id === 'container') {
              setShowContainerSubmenu(!showContainerSubmenu);
            } else {
              onToolSelect(tool.id);
              setShowContainerSubmenu(false);
            }
          }}
          className={clsx(
            'p-2.5 rounded-lg transition-colors relative group flex flex-col items-center gap-0.5 aspect-square',
            selectedTool === tool.id
              ? 'bg-gradient-to-r from-[#814ADA] to-[#4130A7] text-white'
              : 'hover:bg-gray-50'
          )}
          title={tool.name}
        >
          <div className="w-6 h-6 relative">
            <Image
              src={selectedTool === tool.id && tool.activeIcon ? tool.activeIcon : tool.icon}
              alt={tool.name}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-medium leading-tight text-center">{tool.name}</span>
        </button>
      ))}
      
      {showContainerSubmenu && (
        <ContainerSubmenu
          onSelect={handleContainerSelect}
          onClose={() => setShowContainerSubmenu(false)}
        />
      )}
    </div>
  );
} 