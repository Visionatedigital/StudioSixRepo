'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import ShareModal from '@/components/ShareModal';
import { useSession } from 'next-auth/react';

// Add custom scrollbar styles
const scrollbarStyles = {
  scrollbarWidth: 'thin' as const,
  scrollbarColor: '#E0DAF3 transparent',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#E0DAF3',
    borderRadius: '20px',
    border: '3px solid transparent',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#844BDC',
  }
};

interface VideoConfig {
  movementType: 'pan' | 'zoom-in' | 'zoom-out' | 'horizontal';
  direction: 'none' | 'left' | 'right' | 'up' | 'down';
  prompt: string;
  negativePrompt: string;
}

export default function VideoPage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState<VideoConfig>({
    movementType: 'pan',
    direction: 'none',
    prompt: '',
    negativePrompt: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoUrl(null);
    
    try {
      // First, upload the file to get a URL
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url: imageUrl } = await uploadResponse.json();

      // Now generate the video
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          movementType: config.movementType,
          direction: config.direction,
          prompt: config.prompt,
          negativePrompt: config.negativePrompt,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate video');
      }

      const data = await response.json();
      setGeneratedVideoUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error generating video:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout currentPage="Generate Video">
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <div className="px-6 py-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-[#1B1464]">Generate Video</h1>
            <p className="text-[#4D4D4D] text-lg">
                Transform your static renders into dynamic videos with AI-powered motion.
            </p>
            </div>
          </div>
          </div>

        <div className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
              {/* Left Column - Scrollable Input Controls */}
              <div 
                className="lg:col-span-2 overflow-y-auto space-y-8 pr-2" 
                style={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  ...scrollbarStyles
                }}
              >
                {/* Upload Area */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
                  <h2 className="text-xl font-semibold text-[#1B1464] mb-6">Upload Render</h2>
                  
                  {previewUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-[#F6F8FA] rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={previewUrl} 
                          alt="Selected render"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#F6F8FA] rounded-lg">
                        <span className="text-sm text-[#4D4D4D] truncate">
                          {selectedFile?.name}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="text-[#FF4D4D] hover:text-[#CC3D3D]"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-[#E0DAF3] rounded-lg p-6 text-center cursor-pointer hover:border-[#844BDC] transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <Icon name="upload" className="w-12 h-12 text-[#844BDC] mx-auto mb-4" />
                      <p className="text-[#4D4D4D] mb-2">
                        Drag and drop your render here, or click to browse
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        Supports PNG, JPG up to 20MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Movement Configuration */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
                  <h2 className="text-xl font-semibold text-[#1B1464] mb-6">Movement Configuration</h2>
                  
                  {/* Movement Type */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-[#4D4D4D]">
                      Movement Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'pan', label: 'Pan' },
                        { id: 'zoom-in', label: 'Zoom In' },
                        { id: 'zoom-out', label: 'Zoom Out' },
                        { id: 'horizontal', label: 'Horizontal' }
                      ].map((type) => (
                      <button
                          key={type.id}
                          onClick={() => setConfig({ ...config, movementType: type.id as VideoConfig['movementType'] })}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            config.movementType === type.id
                            ? 'bg-[#844BDC] text-white border-[#844BDC]'
                            : 'border-[#E0DAF3] text-[#4D4D4D] hover:bg-[#F6F8FA]'
                        }`}
                      >
                          {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Direction */}
                  <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-[#4D4D4D]">
                      Direction
                  </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'left', label: 'Left' },
                        { id: 'right', label: 'Right' },
                        { id: 'up', label: 'Up' },
                        { id: 'down', label: 'Down' }
                      ].map((dir) => (
                        <button
                          key={dir.id}
                          onClick={() => setConfig({ ...config, direction: dir.id as VideoConfig['direction'] })}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            config.direction === dir.id
                              ? 'bg-[#844BDC] text-white border-[#844BDC]'
                              : 'border-[#E0DAF3] text-[#4D4D4D] hover:bg-[#F6F8FA]'
                          }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompts */}
                  <div className="space-y-4 mb-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-[#4D4D4D]">
                        Prompt
                      </label>
                      <textarea
                        value={config.prompt}
                        onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                        placeholder="Describe what you want to enhance or emphasize in the video..."
                        className="w-full h-32 p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC] resize-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-[#4D4D4D]">
                        Negative Prompt
                      </label>
                      <textarea
                        value={config.negativePrompt}
                        onChange={(e) => setConfig({ ...config, negativePrompt: e.target.value })}
                        placeholder="Describe what you want to avoid in the video..."
                        className="w-full h-32 p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC] resize-none"
                      />
                    </div>
                </div>

                {/* Generate Button */}
                  <div className="space-y-2">
                <button
                  onClick={handleGenerate}
                      disabled={isGenerating || !selectedFile}
                      className="w-full px-6 py-3 bg-white text-[#4D4D4D] rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#E0DAF3] shadow-sm"
                >
                  {isGenerating ? (
                    <>
                          <div className="w-4 h-4 border-2 border-[#844BDC] rounded-full animate-spin border-t-transparent" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                        <span className="flex items-center gap-2">
                          Generate Video
                          <span className="text-sm text-[#6B7280]">(50 credits)</span>
                        </span>
                  )}
                </button>
                </div>
              </div>
            </div>

              {/* Right Column - Fixed Generated Video */}
              <div className="lg:col-span-3 relative">
                <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
                    <h2 className="text-xl font-semibold text-[#1B1464] mb-6">Generated Video</h2>
                    <div className="aspect-video bg-[#F6F8FA] rounded-lg flex items-center justify-center overflow-hidden">
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-[#844BDC] rounded-full animate-spin border-t-transparent" />
                          <p className="text-[#4D4D4D]">Generating your video...</p>
                        </div>
                      ) : generatedVideoUrl ? (
                        <video 
                          controls 
                          className="w-full h-full object-contain"
                          src={generatedVideoUrl}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <Icon name="video" className="w-12 h-12 text-[#E0DAF3]" />
                    <p className="text-[#4D4D4D]">Your generated video will appear here</p>
                  </div>
                      )}
                </div>
              </div>

                  {/* Share and Export Container */}
                  {generatedVideoUrl && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E0DAF3]">
                      <div className="flex gap-2">
                        {/* Share Button */}
                        <button
                          onClick={() => setIsShareModalOpen(true)}
                          className="flex-1 px-4 py-2 bg-white text-[#4D4D4D] rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-[#E0DAF3] shadow-sm"
                        >
                          <Icon name="share" className="w-4 h-4" />
                          <span>Share</span>
                  </button>

                        {/* Export Button */}
                        <a
                          href={generatedVideoUrl}
                          download="generated-video.mp4"
                          className="flex-1 px-4 py-2 bg-white text-[#4D4D4D] rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-[#E0DAF3] shadow-sm"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      </div>
                </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        mediaUrl={generatedVideoUrl || ''}
        mediaType="video"
      />
    </DashboardLayout>
  );
} 