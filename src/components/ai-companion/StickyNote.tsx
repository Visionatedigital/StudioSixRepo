'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface StickyNoteProps {
  id: string;
  x: number;
  y: number;
  onUpdate: (id: string, content: string, style: any) => void;
  onClose: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  scale: number;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  bulletPoints: boolean;
  color: string;
  font: string;
}

interface Position {
  x: number;
  y: number;
}

export default function StickyNote({ id, x, y, onUpdate, onClose, onMove, scale }: StickyNoteProps) {
  const [content, setContent] = useState('');
  const [position, setPosition] = useState<Position>({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Update position when props change
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
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
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 999,
        transform: 'translate(0, 0)',
        transformOrigin: '0 0'
      }}
      onMouseDown={handleDragStart}
    >
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onUpdate(id, e.target.value, {
            width: 200,
            height: 200,
            backgroundColor: '#fef3c7',
            color: '#2D3748',
            fontSize: '14px'
          });
        }}
        className="w-full h-full resize-none bg-transparent border-none focus:outline-none"
        style={{
          color: '#2D3748',
          fontSize: '14px',
          fontFamily: 'sans-serif',
          cursor: 'text',
          position: 'relative',
          zIndex: 1000
        }}
        placeholder="Write your note here..."
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        style={{ 
          fontSize: '20px',
          position: 'absolute',
          zIndex: 1001
        }}
      >
        ×
      </button>
    </div>
  );
} 