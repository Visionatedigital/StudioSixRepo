'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3Icon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { StickyNoteStyle } from '@/types/canvas';

export interface StickyNoteProps {
  id: string;
  x: number;
  y: number;
  text: string;
  style: StickyNoteStyle;
  onUpdate: (id: string, text: string, style: StickyNoteStyle) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  scale: number;
}

export default function StickyNote({ id, x, y, text, style, onUpdate, onDelete, onMove, isSelected, onSelect, scale }: StickyNoteProps) {
  const [content, setContent] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    onSelect(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart.current) return;
      const deltaX = (e.clientX - dragStart.current.x) / scale;
      const deltaY = (e.clientY - dragStart.current.y) / scale;
      const newX = position.x + deltaX;
      const newY = position.y + deltaY;
      setPosition({ x: newX, y: newY });
      dragStart.current = { x: e.clientX, y: e.clientY };
      onMove(id, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, scale, id, onMove]);

  return (
    <div
      ref={noteRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '200px',
        height: '200px',
        backgroundColor: style.backgroundColor,
        borderRadius: '8px',
        boxShadow: `0 4px 6px ${style.shadowColor}`,
        padding: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging || isSelected ? 1000 : 999,
        transform: 'translate(0, 0)',
        transformOrigin: '0 0',
        border: isSelected ? '2px solid #814ADA' : 'none'
      }}
      onMouseDown={handleDragStart}
      onClick={() => onSelect(id)}
    >
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onUpdate(id, e.target.value, style);
        }}
        className="w-full h-full resize-none bg-transparent border-none focus:outline-none"
        style={{
          color: style.textColor,
          fontSize: `${style.fontSize}px`,
          fontFamily: 'sans-serif',
          cursor: 'text',
          position: 'relative',
          zIndex: 1000
        }}
        placeholder="Write your note here..."
        onClick={(e) => e.stopPropagation()}
        readOnly={!isEditing}
      />
      
      {/* Toolbar */}
      {isSelected && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-2 py-1 flex items-center gap-1">
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => setIsEditing(!isEditing)}
          >
            <PencilIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <TrashIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
} 