import React, { useState } from 'react';
import { Icon } from '@/components/Icons';

interface ImageUploadProps {
  onImagesSelected: (images: File[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesSelected, maxImages = 4 }) => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit the number of images
    const newFiles = files.slice(0, maxImages - images.length);

    // Create preview URLs and update state
    const newImages = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => {
      const updated = [...prev, ...newImages].slice(0, maxImages);
      onImagesSelected(updated.map(img => img.file));
      return updated;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onImagesSelected(updated.map(img => img.file));
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    // Limit the number of images
    const newFiles = files.slice(0, maxImages - images.length);

    // Create preview URLs and update state
    const newImages = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => {
      const updated = [...prev, ...newImages].slice(0, maxImages);
      onImagesSelected(updated.map(img => img.file));
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          isDragging
            ? 'border-[#844BDC] bg-[#844BDC]/10'
            : 'border-[#E0DAF3] hover:border-[#844BDC] hover:bg-[#844BDC]/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Icon name="image" className="w-8 h-8 text-[#844BDC]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[#1B1464]">
              Drag and drop site photos here
            </p>
            <p className="text-xs text-[#4D4D4D]">
              or click to select files (max {maxImages} images)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload Images"
          />
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.preview}
                alt={`Site photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 