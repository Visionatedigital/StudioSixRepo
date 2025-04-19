import React, { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onDelete: (file: File) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Function to get preview URL for images
  const getPreviewUrl = () => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Function to get icon based on file type
  const getFileIcon = () => {
    if (file.type.includes('pdf')) {
      return '/icons/pdf-icon.svg';
    }
    if (file.type.includes('word') || file.type.includes('document')) {
      return '/icons/doc-icon.svg';
    }
    return '/icons/file-icon.svg';
  };

  return (
    <div
      className="relative w-24 h-24 rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview or Icon */}
      {getPreviewUrl() ? (
        <Image
          src={getPreviewUrl()}
          alt={file.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <Image
            src={getFileIcon()}
            alt={file.type}
            width={32}
            height={32}
          />
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2
          transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="text-white text-xs text-center truncate w-full">
          {file.name}
        </p>
        <button
          onClick={() => onDelete(file)}
          className="absolute top-1 right-1 p-1 rounded-full bg-white/20 hover:bg-white/40
            transition-colors duration-200"
        >
          <X size={12} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default FilePreview; 