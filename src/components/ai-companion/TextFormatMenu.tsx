import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';
import { Bold, AlignLeft, AlignCenter, AlignRight, Lock, X } from 'lucide-react';

interface TextFormatMenuProps {
  onFontSizeChange: (size: number) => void;
  onBoldToggle: () => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  onLockToggle: () => void;
  onDelete: () => void;
  fontSize: number;
  isBold: boolean;
  textAlign: 'left' | 'center' | 'right';
  isLocked: boolean;
  position: { x: number; y: number };
}

export default function TextFormatMenu({
  onFontSizeChange,
  onBoldToggle,
  onAlignChange,
  onLockToggle,
  onDelete,
  fontSize,
  isBold,
  textAlign,
  isLocked,
  position
}: TextFormatMenuProps) {
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-4px'
      }}
    >
      <div className="flex items-center gap-1">
        <select
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
          className="text-sm border rounded px-1 py-0.5"
        >
          {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          onClick={onBoldToggle}
          className={`p-1 rounded ${isBold ? 'bg-gray-200' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlignChange('left')}
          className={`p-1 rounded ${textAlign === 'left' ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlignChange('center')}
          className={`p-1 rounded ${textAlign === 'center' ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlignChange('right')}
          className={`p-1 rounded ${textAlign === 'right' ? 'bg-gray-200' : ''}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          onClick={onLockToggle}
          className={`p-1 rounded ${isLocked ? 'bg-gray-200' : ''}`}
        >
          <Lock className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-100 text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 