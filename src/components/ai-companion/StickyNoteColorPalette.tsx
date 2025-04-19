import React from 'react';

export interface StickyNoteStyle {
  backgroundColor: string;
  shadowColor: string;
  textColor: string;
}

interface StickyNoteColorPaletteProps {
  onSelect: (style: StickyNoteStyle) => void;
  selectedStyle?: StickyNoteStyle;
}

const STICKY_NOTE_STYLES: StickyNoteStyle[] = [
  { backgroundColor: '#FEF3C7', shadowColor: 'rgba(245, 158, 11, 0.2)', textColor: '#92400E' }, // Yellow
  { backgroundColor: '#FCE7F3', shadowColor: 'rgba(236, 72, 153, 0.2)', textColor: '#831843' }, // Pink
  { backgroundColor: '#DBEAFE', shadowColor: 'rgba(59, 130, 246, 0.2)', textColor: '#1E40AF' }, // Blue
  { backgroundColor: '#D1FAE5', shadowColor: 'rgba(16, 185, 129, 0.2)', textColor: '#065F46' }, // Green
  { backgroundColor: '#EDE9FE', shadowColor: 'rgba(139, 92, 246, 0.2)', textColor: '#5B21B6' }, // Purple
  { backgroundColor: '#FEE2E2', shadowColor: 'rgba(239, 68, 68, 0.2)', textColor: '#991B1B' }, // Red
];

export default function StickyNoteColorPalette({ onSelect, selectedStyle }: StickyNoteColorPaletteProps) {
  return (
    <div className="absolute top-full mt-2 bg-white rounded-lg shadow-lg p-3 grid grid-cols-3 gap-2 border border-gray-200">
      {STICKY_NOTE_STYLES.map((style, index) => (
        <button
          key={index}
          className={`w-12 h-12 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
            selectedStyle?.backgroundColor === style.backgroundColor ? 'ring-2 ring-purple-500' : ''
          }`}
          style={{
            backgroundColor: style.backgroundColor,
            boxShadow: `0 4px 6px ${style.shadowColor}`,
          }}
          onClick={() => onSelect(style)}
        />
      ))}
    </div>
  );
} 