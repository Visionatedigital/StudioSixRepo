'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';
import DrawingToolsTray from './DrawingToolsTray';
import LibraryPanel from './LibraryPanel';
import { Fragment } from 'react';
import { Tool } from '@/types/canvas';

interface ContainerTemplate {
  id: string;
  name: string;
  description?: string;
}

interface ToolDefinition {
  id: Tool;
  name: string;
  icon: string;
  activeIcon?: string;
}

interface ToolsPanelProps {
  onToolSelect: (toolId: Tool, templateId?: string, drawingTool?: 'pencil' | 'marker' | 'eraser') => void;
  selectedTool: Tool;
  showShapesMenu?: boolean;
  setShowShapesMenu?: (show: boolean) => void;
  selectedShape?: string;
  onShapeSelect?: (shapeId: string) => void;
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

const SHAPES = [
  { id: 'line', label: 'Line', icon: '/icons/line-svgrepo-com.svg' },
  { id: 'arrow', label: 'Arrow', icon: '/icons/arrow-up-right-svgrepo-com.svg' },
  { id: 'elbow', label: 'Elbow', icon: '/icons/arrow-elbow-right-fill-svgrepo-com.svg' },
  { id: 'bent-arrow', label: 'Bent Arrow', icon: '/icons/curved-arrow-svgrepo-com.svg' },
  { id: 'square', label: 'Square', icon: '/icons/square-svgrepo-com.svg' },
  { id: 'circle', label: 'Circle', icon: '/icons/circle-svgrepo-com.svg' },
  { id: 'diamond', label: 'Diamond', icon: '/icons/diamond-round-880-svgrepo-com.svg' },
  { id: 'star', label: 'Star', icon: '/icons/star-svgrepo-com.svg' },
  { id: 'triangle', label: 'Triangle', icon: '/icons/triangle-svgrepo-com.svg' },
  { id: 'speech', label: 'Speech Bubble', icon: '/icons/speech-bubble-15-svgrepo-com.svg' },
];

function ShapesMenu({ selectedShape, onSelectShape }: { selectedShape: string; onSelectShape: (id: string) => void }) {
  return (
    <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-[320px] z-50 border border-blue-400" style={{ minHeight: 220 }}>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {SHAPES.map(shape => (
          <button
            key={shape.id}
            onClick={() => onSelectShape(shape.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border ${selectedShape === shape.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
          >
            <img src={shape.icon} alt={shape.label} className="w-7 h-7 mb-1" />
            <span className="text-xs text-gray-700">{shape.label}</span>
          </button>
        ))}
      </div>
      <button className="w-full py-2 rounded bg-gray-100 text-gray-700 text-base font-medium mt-2">More shapes</button>
    </div>
  );
}

export default function ToolsPanel({ onToolSelect, selectedTool, showShapesMenu, setShowShapesMenu, selectedShape, onShapeSelect }: ToolsPanelProps) {
  const [showContainerSubmenu, setShowContainerSubmenu] = useState(false);
  const [showLibraryPanel, setShowLibraryPanel] = useState(false);
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

  const handleLibraryAssetSelect = (asset: any) => {
    // This prop will be passed to the Canvas to handle adding the asset
    console.log('Library asset selected in ToolsPanel:', asset);
    // We can also close the panel on selection if desired
    // setShowLibraryPanel(false);
  };

  const handleLibraryClose = () => {
    setShowLibraryPanel(false);
    // Switch back to mouse tool when closing library
    onToolSelect('mouse');
  };

  const tools = [
    {
      id: 'mouse',
      name: 'Select',
      icon: '/icons/pointer-tool-svgrepo-com.svg',
      activeIcon: '/icons/pointer-tool-white-svgrepo-com.svg'
    },
    {
      id: 'ai',
      name: 'AI',
      icon: '/icons/effect-magic-sparkles-svgrepo-com.svg',
      activeIcon: '/icons/effect-magic-sparkles-white.svg'
    },
    {
      id: 'spatialPlanning',
      name: 'Spatial Planning',
      icon: '/icons/set-square-geometry-svgrepo-com.svg',
      activeIcon: '/icons/set-square-geometry-svgrepo-com (1).svg'
    },
    {
      id: 'libraries',
      name: 'Libraries',
      icon: '/icons/cube-alt-2-svgrepo-com.svg',
      activeIcon: '/icons/cube-alt-2-svgrepo-com white.svg'
    },
    {
      id: 'text',
      name: 'Text',
      icon: '/icons/text-icon.svg',
      activeIcon: '/icons/text-white-icon.svg'
    },
    {
      id: 'simpleDraw',
      name: 'Draw',
      icon: '/icons/pencil-svgrepo-com (2).svg',
      activeIcon: '/icons/pencil-svgrepo-com (3).svg'
    },
    {
      id: 'simplestickynote',
      name: 'Sticky Note',
      icon: '/icons/sticky-note-icon.svg',
      activeIcon: '/icons/sticky-note-white-icon.svg'
    },
    {
      id: 'shapes',
      name: 'Shapes',
      icon: '/icons/shapes-svgrepo-com.svg',
      activeIcon: '/icons/shapes-white-svgrepo-com.svg'
    },
    {
      id: 'stickers',
      name: 'Stickers',
      icon: '/icons/sticker-smile-circle-2-svgrepo-com.svg',
      activeIcon: '/icons/sticker-smile-circle-2-white-svgrepo-com.svg'
    },
    {
      id: 'upload',
      name: 'Upload',
      icon: '/icons/upload-minimalistic-svgrepo-com.svg',
      activeIcon: '/icons/upload-minimalistic-white-svgrepo-com.svg'
    },
    {
      id: 'table',
      name: 'Table',
      icon: '/icons/container-icon.svg',
      activeIcon: '/icons/container-white-icon.svg'
    },
    {
      id: 'trash',
      name: 'Delete',
      icon: '/icons/trash-icon.svg',
      activeIcon: '/icons/trash-white-icon.svg'
    }
  ];

  return (
    <>
      <div className="fixed left-0 bg-white shadow-lg rounded-lg p-1.5 flex flex-col gap-1.5 w-[60px]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        {tools.map((tool) => (
          <button
            key={tool.id}
            data-tool={tool.id}
            onClick={() => {
              if (tool.id === 'container') {
                setShowContainerSubmenu(!showContainerSubmenu);
                setShowShapesMenu?.(false);
                setShowLibraryPanel(false);
              } else if (tool.id === 'shapes') {
                setShowShapesMenu?.(true);
                setShowContainerSubmenu(false);
                setShowLibraryPanel(false);
                onToolSelect(tool.id as Tool);
              } else if (tool.id === 'libraries') {
                setShowLibraryPanel(!showLibraryPanel);
                setShowContainerSubmenu(false);
                setShowShapesMenu?.(false);
                onToolSelect(tool.id as Tool);
              } else {
                onToolSelect(tool.id as Tool);
                setShowContainerSubmenu(false);
                setShowShapesMenu?.(false);
                setShowLibraryPanel(false);
              }
            }}
            className={clsx(
              'w-11 h-11 rounded-lg transition-colors relative group flex items-center justify-center',
              selectedTool === tool.id
                ? 'bg-gradient-to-r from-[#814ADA] to-[#4130A7]'
                : 'hover:bg-gray-50'
            )}
            title={tool.name}
          >
            <div className={`relative ${tool.id === 'simpleDraw' ? 'w-9 h-9' : 'w-7 h-7'}`}>
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
        {showShapesMenu && (
          <ShapesMenu selectedShape={selectedShape || 'square'} onSelectShape={onShapeSelect!} />
        )}
        {showLibraryPanel && (
          <LibraryPanel
            onAssetSelect={handleLibraryAssetSelect}
            onClose={handleLibraryClose}
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