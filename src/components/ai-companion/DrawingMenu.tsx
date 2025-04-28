import React from 'react';
import { ColorPicker } from './ColorPicker';

interface DrawingMenuProps {
  position: { x: number; y: number };
  onColorChange: (color: string) => void;
  onDelete: () => void;
  currentColor: string;
}

export default function DrawingMenu({ position, onColorChange, onDelete, currentColor }: DrawingMenuProps) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 z-50"
      style={{
        left: position.x,
        top: position.y - 40, // Position above the drawing
        transform: 'translate(-50%, 0)',
      }}
    >
      <ColorPicker
        value={currentColor}
        onChange={onColorChange}
        className="w-6 h-6"
      />
      <button
        onClick={onDelete}
        className="p-1 hover:bg-red-50 rounded-full text-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 