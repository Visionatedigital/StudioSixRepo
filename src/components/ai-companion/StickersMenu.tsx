import React from 'react';

const OPENMOJI_STICKERS = [
  // A small sample of OpenMoji SVGs from the CDN
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F60A.svg', // Smiling face
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F60D.svg', // Heart eyes
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F609.svg', // Wink
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F973.svg', // Party face
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F389.svg', // Party popper
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F525.svg', // Fire
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F44D.svg', // Thumbs up
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F680.svg', // Rocket
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4A9.svg', // Poop
  'https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F31F.svg', // Glowing star
];

interface StickersMenuProps {
  onSelectSticker: (url: string) => void;
}

export default function StickersMenu({ onSelectSticker }: StickersMenuProps) {
  return (
    <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-[320px] z-50 border border-yellow-400" style={{ minHeight: 220 }}>
      <div className="grid grid-cols-5 gap-3 mb-3">
        {OPENMOJI_STICKERS.map((url, idx) => (
          <button
            key={url}
            draggable
            onDragStart={e => e.dataTransfer.setData('text/plain', url)}
            className="flex items-center justify-center p-2 rounded-lg border border-transparent hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            title={`Sticker ${idx + 1}`}
          >
            <img src={url} alt={`Sticker ${idx + 1}`} className="w-10 h-10" />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 text-center">Powered by <a href="https://openmoji.org/" target="_blank" rel="noopener noreferrer" className="underline">OpenMoji</a></div>
    </div>
  );
} 