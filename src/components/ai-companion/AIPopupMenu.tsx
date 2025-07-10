import React, { useState, useRef } from 'react';
import { useRenderTasks } from '@/contexts/RenderTaskContext';

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [useOpenAI, setUseOpenAI] = useState(true); // Default to OpenAI API
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  const { addTask, updateTask } = useRenderTasks();

  // Update image previews when uploadedFiles changes
  React.useEffect(() => {
    // Clean up previous URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    
    if (uploadedFiles.length > 0) {
      const newUrls = uploadedFiles.map(file => {
        const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);
        return isImage ? URL.createObjectURL(file) : null;
      }).filter(Boolean) as string[];
      
      setImagePreviewUrls(newUrls);
      
      // Cleanup function
      return () => {
        newUrls.forEach(url => URL.revokeObjectURL(url));
      };
    } else {
      setImagePreviewUrls([]);
    }
  }, [uploadedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGenerate = async () => {
    setError(null);
    setEnhancedPrompt(null);
    
    if (uploadedFiles.length === 0 || !prompt.trim()) {
      setError('Please provide at least one image and a prompt.');
      return;
    }

    console.log(`🎬 AIPopupMenu: Generate clicked using ${useOpenAI ? 'OpenAI API' : 'ChatGPT Proxy'} with prompt:`, prompt);
    console.log('🎬 AIPopupMenu: About to add render task with', uploadedFiles.length, 'images');

    // Use first image for progress tracker thumbnail
    const uploadedImageUrl = imagePreviewUrls.length > 0 ? imagePreviewUrls[0] : URL.createObjectURL(uploadedFiles[0]);

    // Add task to render tracker with uploaded image
    const taskId = addTask(prompt, useOpenAI ? 60000 : 198000, uploadedImageUrl); // OpenAI: 1min, ChatGPT: 3m18s
    console.log('🎬 AIPopupMenu: Added render task with ID:', taskId);
    
    setLoading(true);
    setCurrentTaskId(taskId);
    
    // Update task to processing status
    updateTask(taskId, { status: 'processing' });
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      
      // Add all uploaded images to the form data
      uploadedFiles.forEach((file, index) => {
        formData.append(`image${index}`, file);
      });
      formData.append('imageCount', uploadedFiles.length.toString());
      
      // Choose endpoint based on useOpenAI setting
      const endpoint = useOpenAI ? '/api/openai-image' : '/api/chatgpt-proxy/image';
      console.log(`🎬 AIPopupMenu: Using endpoint: ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        updateTask(taskId, { 
          status: 'error', 
          error: data.error || 'Failed to generate image.'
        });
        setError(data.error || 'Failed to generate image.');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const imageUrl = data.image;
      
      // Store enhanced prompt if available (from OpenAI endpoint)
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        console.log('🎬 AIPopupMenu: Enhanced prompt received:', data.enhancedPrompt);
      }
      
      updateTask(taskId, { 
        status: 'completed', 
        imageUrl: imageUrl,
        completedAt: new Date()
      });
      
      if (onAddToCanvas && imageUrl) {
        onAddToCanvas(imageUrl, prompt);
      }
      
      setError(null);
      setLoading(false);
      setCurrentTaskId(null);
      
    } catch (err: any) {
      updateTask(taskId, { 
        status: 'error', 
        error: err.message || 'Unknown error occurred.'
      });
      setError(err.message || 'Unknown error occurred.');
      setLoading(false);
      setCurrentTaskId(null);
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
        className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4 bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer ${
          uploadedFiles.length > 0 ? 'p-2' : 'p-6'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadedFiles.length > 0 ? (
          <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative">
                  {imagePreviewUrls[index] ? (
              <img
                      src={imagePreviewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
              />
            ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-xs text-gray-500 text-center px-1">{file.name}</span>
                    </div>
            )}
            <button
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    onClick={e => { e.stopPropagation(); removeFile(index); }}
            >
                    ×
            </button>
                </div>
              ))}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">{uploadedFiles.length} image{uploadedFiles.length > 1 ? 's' : ''} uploaded</span>
              <br />
              <span className="text-xs text-gray-400">Click to add more images</span>
            </div>
          </div>
        ) : (
          <>
            <span className="text-gray-500 text-base mb-2">Drag & drop or click to upload</span>
            <span className="text-xs text-gray-400">(Multiple images supported)</span>
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Generation Method</label>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-700">
                    {useOpenAI ? 'OpenAI API (Fast)' : 'ChatGPT Proxy (Advanced)'}
                  </span>
                </div>
                <button
                  onClick={() => setUseOpenAI(!useOpenAI)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    useOpenAI ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      useOpenAI ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            {/* Add more advanced settings as needed */}
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      {/* Enhanced Prompt Display (OpenAI only) */}
      {enhancedPrompt && useOpenAI && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs font-medium text-green-800 mb-1">✨ Enhanced Prompt by GPT-4 Vision:</div>
          <div className="text-xs text-green-700 max-h-20 overflow-y-auto">
            {enhancedPrompt}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold text-base shadow-md hover:from-purple-600 hover:to-pink-500 transition-colors disabled:opacity-60"
        style={{ marginTop: 8 }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {useOpenAI ? 'Generating with OpenAI...' : 'Generating with ChatGPT...'}
          </div>
        ) : (
          '🚀 Generate'
        )}
      </button>
      
      {currentTaskId && (
        <div className="mt-2 text-xs text-center text-gray-500">
          Track progress in the header taskbar ↗️
        </div>
      )}
    </div>
  );
} 