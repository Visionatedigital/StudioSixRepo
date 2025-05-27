import React, { useState, useRef } from 'react';

const TOOL_OPTIONS = [
  { value: 'interior', label: 'Interior AI' },
  { value: 'exterior', label: 'Exterior AI' },
  { value: 'enhancer', label: 'Render Enhancer' },
  { value: 'landscape', label: 'Landscape AI' },
];

interface AIPopupMenuProps {
  onAddToCanvas?: (imageUrl: string, prompt: string) => void;
}

export default function AIPopupMenu({ onAddToCanvas }: AIPopupMenuProps) {
  const [mode, setMode] = useState<'render' | 'refine'>('render');
  const [selectedTool, setSelectedTool] = useState(TOOL_OPTIONS[0].value);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGenerate = async () => {
    setError(null);
    if (!uploadedFile || !prompt.trim()) {
      setError('Please provide both an image and a prompt.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('file', uploadedFile);
      const res = await fetch('/api/generate-image-canvas', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate image.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      const imageUrl = data.imageUrl || data.image;
      if (onAddToCanvas && imageUrl) {
        onAddToCanvas(imageUrl, prompt);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-[420px] z-50 border border-purple-300" style={{ minHeight: 320 }}>
      {/* Top: Toggle and Tool Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${mode === 'render' ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
            onClick={() => setMode('render')}
          >
            Render
          </button>
          <button
            className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${mode === 'refine' ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
            onClick={() => setMode('refine')}
          >
            Refine
          </button>
        </div>
        <div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={selectedTool}
            onChange={e => setSelectedTool(e.target.value)}
          >
            {TOOL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{ minHeight: 120 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-gray-700 text-sm font-medium">{uploadedFile.name}</span>
            <button
              className="text-xs text-red-500 hover:text-red-700 underline"
              onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <span className="text-gray-500 text-base mb-2">Drag & drop or click to upload</span>
            <span className="text-xs text-gray-400">(Image, Sketch, or 3D Model)</span>
          </>
        )}
      </div>

      {/* Prompt Box */}
      <textarea
        className="w-full border border-gray-300 rounded-lg p-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        rows={3}
        placeholder="Describe what you want to generate..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      {/* Advanced Settings */}
      <div className="mb-4">
        <button
          className="text-xs text-purple-600 hover:underline mb-1"
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </button>
        {showAdvanced && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-1">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Reference Level</label>
              <input type="range" min={0} max={100} defaultValue={100} className="w-full" />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Detail Boost</label>
              <select className="w-full border border-gray-300 rounded px-2 py-1 text-xs">
                <option>Standard</option>
                <option>High Detail</option>
              </select>
            </div>
            {/* Add more advanced settings as needed */}
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      {/* Generate Button */}
      <button
        className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold text-base shadow-md hover:from-purple-600 hover:to-pink-500 transition-colors disabled:opacity-60"
        style={{ marginTop: 8 }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
} 