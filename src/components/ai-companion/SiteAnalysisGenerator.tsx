import React, { useState } from 'react';
import SiteAnalysisTags from './SiteAnalysisTags';
import { Loader2 } from 'lucide-react';

interface Tag {
  id: string;
  text: string;
  category: 'vegetation' | 'weather' | 'urban' | 'topography';
}

interface SiteAnalysisGeneratorProps {
  projectBrief: string;
  onGenerated: (content: GeneratedContent) => void;
}

interface GeneratedContent {
  siteStatement: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  keyCharacteristics: string[];
}

const SiteAnalysisGenerator: React.FC<SiteAnalysisGeneratorProps> = ({
  projectBrief,
  onGenerated
}) => {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [abstractionLevel, setAbstractionLevel] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/site-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectBrief,
          siteDescription: description,
          tags,
          abstractionLevel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate site analysis');
      }

      const data: GeneratedContent = await response.json();
      onGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tags and Description */}
      <SiteAnalysisTags
        onTagsChange={setTags}
        onDescriptionChange={setDescription}
      />

      {/* Slider and Generate Button Row */}
      <div className="flex gap-6 items-start">
        {/* Abstraction Level Slider */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              How abstract do you want your site statement?
            </label>
            <span className="text-sm text-gray-500">
              {abstractionLevel}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={abstractionLevel}
            onChange={(e) => setAbstractionLevel(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-runnable-track]:rounded-lg
              [&::-webkit-slider-runnable-track]:bg-gradient-to-r
              [&::-webkit-slider-runnable-track]:from-purple-600
              [&::-webkit-slider-runnable-track]:from-[length:var(--range-progress)]
              [&::-webkit-slider-runnable-track]:to-gray-200
              [&::-webkit-slider-runnable-track]:to-[length:var(--range-progress)]
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-purple-600
              [&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.1)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:relative
              [&::-webkit-slider-thumb]:z-20
              [&::-webkit-slider-thumb]:hover:shadow-[0_3px_6px_rgba(0,0,0,0.15)]
              [&::-webkit-slider-thumb]:transition-shadow"
            style={{ '--range-progress': `${abstractionLevel}%` } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>📝 Literal</span>
            <span>Balanced</span>
            <span>✨ Poetic</span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !description || tags.length === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2
              transition-colors duration-200 ${
                isGenerating || !description || tags.length === 0
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Generating...' : 'Generate Site Statement'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default SiteAnalysisGenerator; 