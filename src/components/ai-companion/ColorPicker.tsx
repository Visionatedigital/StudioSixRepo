import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full cursor-pointer opacity-0 absolute inset-0"
      />
      <div
        className="w-full h-full rounded border border-gray-200"
        style={{ backgroundColor: value }}
      />
    </div>
  );
} 