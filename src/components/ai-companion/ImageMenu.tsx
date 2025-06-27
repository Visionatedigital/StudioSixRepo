'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Crop, Download, Trash2, GripVertical, Palette, Copy } from 'lucide-react';

interface ImageMenuProps {
  position: { x: number; y: number };
  imageName: string | undefined;
  imageUrl: string;
  imageType: 'uploaded' | 'generated';
  onCrop: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onClose: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onRegenerate?: () => void; // Only for generated images
  onCopyPrompt?: () => void; // Only for generated images
}

export default function ImageMenu({
  position,
  imageName,
  imageUrl,
  imageType,
  onCrop,
  onDownload,
  onDelete,
  onClose,
  onPositionChange,
  onRegenerate,
  onCopyPrompt
}: ImageMenuProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setCurrentPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const truncateFileName = (name: string | undefined, maxLength: number = 25) => {
    if (!name) return imageType === 'uploaded' ? 'Untitled Image' : 'Generated Image';
    if (name.length <= maxLength) return name;
    
    // For uploaded images, preserve file extension
    if (imageType === 'uploaded' && name.includes('.')) {
      const extension = name.split('.').pop();
      const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
      const truncated = nameWithoutExt.substring(0, maxLength - (extension?.length || 0) - 4) + '...';
      return `${truncated}.${extension}`;
    }
    
    // For generated images (prompts), just truncate and add ellipsis
    return name.substring(0, maxLength) + '...';
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px] max-w-[250px]"
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3 drag-handle cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold"
        >
          ×
        </button>
      </div>

      {/* Image Preview */}
      <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-md">
        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageName || (imageType === 'uploaded' ? 'Untitled Image' : 'Generated Image')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-xs">No Preview</div>
          )}
        </div>
        <div className="flex-1 min-w-0 max-w-[140px]">
          <p className="text-sm font-medium text-gray-900 truncate leading-tight" title={imageName || (imageType === 'uploaded' ? 'Untitled Image' : 'Generated Image')}>
            {truncateFileName(imageName)}
          </p>
          <p className="text-xs text-gray-500 capitalize">{imageType} Image</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCrop();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Crop className="w-4 h-4" />
          Crop Image
        </button>
        
        {/* Generated image specific actions */}
        {imageType === 'generated' && onRegenerate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Palette className="w-4 h-4" />
            Regenerate
          </button>
        )}
        
        {imageType === 'generated' && onCopyPrompt && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyPrompt();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Prompt
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
} 