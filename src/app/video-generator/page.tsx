'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ShareModal from '@/components/ShareModal';

export default function VideoGeneratorPage() {
  const [videoPrompt, setVideoPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8 p-8">
        {/* ... existing code ... */}
        
        {/* Video Preview Section */}
        {generatedVideoUrl && (
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Generated Video</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8A53DD] to-[#372B9F] rounded-lg hover:opacity-90 transition-opacity"
                >
                  <span>Share</span>
                </button>
              </div>
            </div>
            <video
              src={generatedVideoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          mediaUrl={generatedVideoUrl}
          mediaType="video"
        />
      </div>
    </DashboardLayout>
  );
} 