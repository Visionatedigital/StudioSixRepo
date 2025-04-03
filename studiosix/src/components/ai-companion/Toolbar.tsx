'use client';

import { useState } from 'react';

interface ToolbarProps {
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onGenerateImage: () => void;
  currentTool: string;
  currentColor: string;
  currentStrokeWidth: number;
}

export default function Toolbar({
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onGenerateImage,
  currentTool,
  currentColor,
  currentStrokeWidth,
}: ToolbarProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-4">
        {/* Basic Tools */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`px-3 py-1 rounded ${
                currentTool === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => onToolChange('brush')}
            >
              Brush
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentTool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => onToolChange('select')}
            >
              Select
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentTool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => onToolChange('text')}
            >
              Text
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentTool === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => onToolChange('shape')}
            >
              Shape
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Color</h3>
          <div className="relative">
            <button
              className="w-full h-8 rounded border"
              style={{ backgroundColor: currentColor }}
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            />
            {isColorPickerOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onColorChange(color);
                      setIsColorPickerOpen(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Stroke Width</h3>
          <input
            type="range"
            min="1"
            max="20"
            value={currentStrokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* AI Generation */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">AI Tools</h3>
          <button
            className="w-full px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600"
            onClick={onGenerateImage}
          >
            Generate Image
          </button>
        </div>
      </div>
    </div>
  );
} 