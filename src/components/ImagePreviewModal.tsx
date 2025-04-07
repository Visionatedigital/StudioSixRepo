import React from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          onClick={onClose}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img
          src={imageUrl}
          alt="Full size preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
} 