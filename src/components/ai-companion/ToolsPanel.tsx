'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';
import DrawingToolsTray from './DrawingToolsTray';

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
  onToolSelect: (toolId: Tool, templateId?: string, drawingTool?: 'pencil' | 'marker' | 'eraser') => void;
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
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'pencil' | 'marker' | 'eraser'>('pencil');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const handleContainerSelect = (templateId: string) => {
    onToolSelect('container', templateId);
    setShowContainerSubmenu(false);
  };

  const handleDrawingToolSelect = (tool: 'pencil' | 'marker' | 'eraser') => {
    setSelectedDrawingTool(tool);
    onToolSelect('draw', undefined, tool);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Here you would also update the canvas stroke color
  };

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);
    // Here you would also update the canvas stroke width
  };

  const tools: ToolDefinition[] = [
    {
      id: 'text',
      name: 'Text',
      icon: '/icons/text-icon.svg',
      activeIcon: '/icons/text-white-icon.svg'
    },
    {
      id: 'draw',
      name: 'Draw',
      icon: '/icons/edit-pen-icon.svg',
      activeIcon: '/icons/edit-pen-icon-white.svg'
    },
    {
      id: 'note',
      name: 'Note',
      icon: '/icons/sticky-note-icon.svg',
      activeIcon: '/icons/sticky-note-white-icon.svg'
    },
    {
      id: 'prompt',
      name: 'Imagine',
      icon: '/icons/visualize-icon.svg',
      activeIcon: '/icons/visualize-white-icon.svg'
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
    <>
      <div className="fixed left-0 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 w-[68px]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
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
              'w-12 h-12 rounded-lg transition-colors relative group flex items-center justify-center',
              selectedTool === tool.id
                ? 'bg-gradient-to-r from-[#814ADA] to-[#4130A7]'
                : 'hover:bg-gray-50'
            )}
            title={tool.name}
          >
            <div className="w-8 h-8 relative">
              <Image
                src={selectedTool === tool.id && tool.activeIcon ? tool.activeIcon : tool.icon}
                alt={tool.name}
                fill
                className="object-contain"
              />
            </div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {tool.name}
            </div>
          </button>
        ))}
        
        {showContainerSubmenu && (
          <ContainerSubmenu
            onSelect={handleContainerSelect}
            onClose={() => setShowContainerSubmenu(false)}
          />
        )}
      </div>

      {/* Drawing Tools Tray */}
      {selectedTool === 'draw' && (
        <DrawingToolsTray
          selectedTool={selectedDrawingTool}
          selectedColor={selectedColor}
          strokeWidth={strokeWidth}
          onToolSelect={handleDrawingToolSelect}
          onColorSelect={handleColorSelect}
          onStrokeWidthChange={handleStrokeWidthChange}
        />
      )}
    </>
  );
} 