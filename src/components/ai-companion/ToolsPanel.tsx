'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

type Tool = 'text' | 'board' | 'comment' | 'note' | 'image' | 'upload' | 'draw' | 'trash' | 'prompt';

interface ToolDefinition {
  id: Tool;
  name: string;
  icon: string;
  activeIcon?: string;
}

interface ToolsPanelProps {
  onToolSelect: (toolId: Tool) => void;
  selectedTool: Tool;
}

export default function ToolsPanel({ onToolSelect, selectedTool }: ToolsPanelProps) {
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
      id: 'comment',
      name: 'Comment',
      icon: '/icons/comment-icon.svg'
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
          onClick={() => onToolSelect(tool.id)}
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
    </div>
  );
} 