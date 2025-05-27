import React from 'react';
import { ShapeElement } from '@/types/canvas';

interface ShapePropertiesMenuProps {
  position: { x: number; y: number };
  shape: ShapeElement;
  onChange: (changes: Partial<ShapeElement>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const colors = [
  '#FFD700', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#FFEEAD', // Cream
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E74C3C', // Red
];

export default function ShapePropertiesMenu({
  position,
  shape,
  onChange,
  onDelete,
  onClose
}: ShapePropertiesMenuProps) {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg p-4 z-50"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px'
      }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Shape Properties</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Fill Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fill Color</label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border ${
                  shape.fill === color ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onChange({ fill: color })}
              />
            ))}
          </div>
        </div>

        {/* Stroke Color */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Stroke Color</label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border ${
                  shape.stroke === color ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onChange({ stroke: color })}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Stroke Width: {shape.strokeWidth}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={shape.strokeWidth}
            onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Opacity: {Math.round(shape.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={shape.opacity * 100}
            onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
            className="w-full"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Rotation: {Math.round(shape.rotation)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={shape.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
} 