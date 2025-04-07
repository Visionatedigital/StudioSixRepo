'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, options: {
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfg_scale?: number;
    sampler_name?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function ImageGenerationModal({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [cfgScale, setCfgScale] = useState(7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(prompt, {
      negative_prompt: negativePrompt,
      width,
      height,
      steps,
      cfg_scale: cfgScale,
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <Dialog.Title className="text-lg font-medium mb-4">
            Generate Image with AI
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the image you want to generate..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
                placeholder="Describe what you don't want in the image..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Width
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={64}
                  max={2048}
                  step={64}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Height
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={64}
                  max={2048}
                  step={64}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Steps
                </label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={1}
                  max={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CFG Scale
                </label>
                <input
                  type="number"
                  value={cfgScale}
                  onChange={(e) => setCfgScale(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={1}
                  max={20}
                  step={0.5}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 