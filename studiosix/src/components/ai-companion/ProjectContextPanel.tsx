'use client';

import { useState, useRef } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Tab from './ProjectContextTab';
import FileUpload from './FileUpload';

interface ProjectContextPanelProps {
  onContextUpdate?: (context: any) => void;
  onCreateNote: (position: { x: number; y: number }) => void;
}

type TabType = 'site-plan' | 'location' | 'brief' | 'references';

interface TabData {
  id: TabType;
  label: string;
  icon: string;
  hasContent: boolean;
}

export default function ProjectContextPanel({ onContextUpdate, onCreateNote }: ProjectContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('site-plan');
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  const tabs: TabData[] = [
    { id: 'site-plan', label: 'Site Plan', icon: '🗺️', hasContent: false },
    { id: 'location', label: 'Location', icon: '📍', hasContent: false },
    { id: 'brief', label: 'Project Brief', icon: '📝', hasContent: false },
    { id: 'references', label: 'References', icon: '📚', hasContent: false },
  ];

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return;

    const newWidth = e.clientX;
    const maxWidth = window.innerWidth * 0.4;
    const minWidth = 320;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleFileUpload = async (file: File, tabId: TabType) => {
    // TODO: Implement file upload logic
    console.log(`File uploaded for ${tabId}:`, file);
  };

  const handleContextUpdate = (data: any, tabId: TabType) => {
    // TODO: Implement context update logic
    console.log(`Context updated for ${tabId}:`, data);
    onContextUpdate?.(data);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    // Create a ghost image for dragging
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150">
        <rect width="150" height="150" fill="#FFF9C4" rx="4"/>
      </svg>
    `);
    e.dataTransfer.setDragImage(dragImage, 75, 75);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleDrag = (e: React.DragEvent) => {
    if (!e.clientX && !e.clientY) return; // Ignore invalid drag events
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drop
    
    // Calculate the drop position relative to the canvas
    const canvasRect = document.querySelector('.konvajs-content')?.getBoundingClientRect();
    if (canvasRect) {
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      onCreateNote({ x, y });
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white text-gray-800 shadow-lg hover:bg-gray-50 transition-colors ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Context Panel */}
      <div
        ref={panelRef}
        className={`fixed left-0 top-0 h-full bg-white/95 backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize hover:bg-blue-500 transition-colors"
          onMouseDown={handleResizeStart}
        />

        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Project Context</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.hasContent && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="h-[calc(100%-8rem)] overflow-y-auto p-4">
          <Tab
            id={activeTab}
            onFileUpload={handleFileUpload}
            onContextUpdate={handleContextUpdate}
          />
        </div>
      </div>

      {/* Draggable Note Button */}
      <div
        ref={dragRef}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 w-16 flex flex-col items-center py-4 ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div
          className={`w-12 h-12 bg-yellow-100 rounded-lg shadow-md flex items-center justify-center cursor-move hover:bg-yellow-200 transition-colors ${
            isDragging ? 'opacity-50' : ''
          }`}
        >
          <DocumentTextIcon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </>
  );
} 