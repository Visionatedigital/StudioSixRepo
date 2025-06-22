import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface SpatialPlanningMenuProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onClose: () => void;
}

const spatialPlanningTools = [
  {
    id: 'wall',
    name: 'Wall',
    icon: '/icons/wall icon.svg',
    activeIcon: '/icons/wall icon white.svg'
  } as const,
  {
    id: 'door',
    name: 'Door',
    icon: '/icons/opening.svg',
    activeIcon: '/icons/opening-white.svg'
  } as const,
  {
    id: 'window',
    name: 'Window',
    icon: '/icons/window.svg',
    activeIcon: '/icons/window-white.svg'
  } as const,
  {
    id: 'dimension',
    name: 'Dimension',
    icon: '/icons/dimension-line-width-svgrepo-com.svg',
    activeIcon: '/icons/dimension-line-width-svgrepo-com (1).svg'
  } as const,
  {
    id: 'annotation',
    name: 'Annotation',
    icon: '/icons/annotation.svg',
    activeIcon: '/icons/annotation white.svg'
  } as const,
  {
    id: 'fill',
    name: 'Fill',
    icon: '/icons/fill-svgrepo-com.svg',
    activeIcon: '/icons/fill-svgrepo-com (1).svg'
  } as const,
  {
    id: 'measure',
    name: 'Measure',
    icon: '/icons/measure-svgrepo-com.svg',
    activeIcon: '/icons/measure-svgrepo-com (1).svg'
  } as const
];

export default function SpatialPlanningMenu({ selectedTool, onToolSelect, onClose }: SpatialPlanningMenuProps) {
  // Default position: bottom center
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize default position on mount
  useEffect(() => {
    if (!isInitialized && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const centerX = (window.innerWidth - rect.width) / 2;
      const bottomY = window.innerHeight - rect.height - 16; // 16px from bottom
      setPosition({ x: centerX, y: bottomY });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!menuRef.current) return;
    
    const rect = menuRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep menu within viewport bounds
    const maxX = window.innerWidth - (menuRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (menuRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-40 cursor-move"
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: isInitialized ? 1 : 0 // Hide until positioned
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 select-none">
        <div className="flex items-center space-x-1">
          {spatialPlanningTools.map((tool) => (
            <button
              key={tool.id}
              onClick={(e) => {
                e.stopPropagation();
                onToolSelect(tool.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`px-3 py-2 rounded-lg transition-all duration-200 group relative cursor-pointer ${
                selectedTool === tool.id
                  ? 'bg-[#E91E63] text-white shadow-sm'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
                             title={tool.name}
             >
               <Image
                 src={selectedTool === tool.id ? (tool as any).activeIcon : (tool as any).icon}
                 alt={tool.name}
                 width={tool.id === 'dimension' ? 32 : tool.id === 'annotation' ? 30 : 28}
                 height={tool.id === 'dimension' ? 32 : tool.id === 'annotation' ? 30 : 28}
                 className="object-contain"
               />
               
               {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tool.name}
              </div>
            </button>
          ))}
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            title="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 