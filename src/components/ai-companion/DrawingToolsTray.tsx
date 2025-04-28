import { useState, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

interface DrawingToolsTrayProps {
  onToolSelect: (tool: 'pencil' | 'marker' | 'eraser') => void;
  onColorSelect: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  selectedTool: 'pencil' | 'marker' | 'eraser';
  selectedColor: string;
  strokeWidth: number;
}

const colors = [
  '#1A237E',  // Rich Dark Blue
  '#FF8BA7',  // Brighter Pastel Pink
  '#98FB98',  // Mint Green
  '#FFA07A',  // Light Salmon
  '#87CEEB',  // Sky Blue
  '#DDA0DD',  // Plum
];

const DEFAULT_TOOL_SETTINGS = {
  pencil: {
    minWidth: 1,
    maxWidth: 10,
    defaultWidth: 2,
    opacity: 1,
    pressure: 0.5,
  },
  marker: {
    minWidth: 5,
    maxWidth: 30,
    defaultWidth: 15,
    opacity: 0.6,
    pressure: 0.3,
  },
  eraser: {
    minWidth: 10,
    maxWidth: 50,
    defaultWidth: 20,
    opacity: 1,
    pressure: 1,
  },
};

export default function DrawingToolsTray({
  onToolSelect,
  onColorSelect,
  onStrokeWidthChange,
  selectedTool,
  selectedColor,
  strokeWidth
}: DrawingToolsTrayProps) {
  const [toolSettings, setToolSettings] = useState(DEFAULT_TOOL_SETTINGS);

  const tools = [
    {
      id: 'pencil',
      name: 'Pencil',
      icon: '/icons/pencil-svgrepo-com (1).svg',
      cursor: '/cursors/pencil-cursor.png',
      cursorOffset: { x: 0, y: 24 }
    },
    {
      id: 'marker',
      name: 'Marker',
      icon: '/icons/marker-svgrepo-com.svg',
      cursor: '/cursors/marker-cursor.png',
      cursorOffset: { x: 0, y: 28 }
    },
    {
      id: 'eraser',
      name: 'Eraser',
      icon: '/icons/eraser-svgrepo-com.svg',
      cursor: '/cursors/eraser-cursor.png',
      cursorOffset: { x: 8, y: 8 }
    }
  ] as const;

  useEffect(() => {
    // Add cursor styles to the document head
    const style = document.createElement('style');
    tools.forEach((tool) => {
      style.textContent += `
        .cursor-${tool.id} {
          cursor: url('${tool.cursor}') ${tool.cursorOffset.x} ${tool.cursorOffset.y}, auto !important;
        }
      `;
    });
    document.head.appendChild(style);

    // Update body class based on selected tool
    if (selectedTool) {
      document.body.classList.add(`cursor-${selectedTool}`);
    }

    return () => {
      document.head.removeChild(style);
      if (selectedTool) {
        document.body.classList.remove(`cursor-${selectedTool}`);
      }
    };
  }, [selectedTool]);

  // Handle tool selection with appropriate default settings
  const handleToolSelect = (toolId: 'pencil' | 'marker' | 'eraser') => {
    onToolSelect(toolId);
    // Set the default width for the selected tool
    onStrokeWidthChange(toolSettings[toolId].defaultWidth);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg p-3 flex items-center gap-4 transition-all transform translate-y-0 hover:translate-y-[-8px] z-50">
      {/* Drawing Tools */}
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={clsx(
              'w-10 h-10 rounded-lg transition-all flex items-center justify-center',
              selectedTool === tool.id
                ? 'bg-gray-100 transform scale-110'
                : 'hover:bg-gray-50'
            )}
            title={tool.name}
          >
            <div className="w-6 h-6 relative">
              <Image
                src={tool.icon}
                alt={tool.name}
                fill
                className="object-contain"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200" />

      {/* Color Selector */}
      <div className="flex gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={clsx(
              'w-6 h-6 rounded-full transition-transform',
              selectedColor === color && 'scale-110 ring-2 ring-offset-2 ring-gray-400'
            )}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200" />

      {/* Stroke Width Selector */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={selectedTool ? toolSettings[selectedTool].minWidth : 1}
          max={selectedTool ? toolSettings[selectedTool].maxWidth : 20}
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-24 h-2 accent-purple-500"
        />
        <span className="text-sm text-gray-600 min-w-[2ch]">{strokeWidth}</span>
      </div>
    </div>
  );
} 