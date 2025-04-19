import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Tag {
  id: string;
  text: string;
  category: 'vegetation' | 'weather' | 'urban' | 'topography';
}

interface SiteAnalysisTagsProps {
  onTagsChange: (tags: Tag[]) => void;
  onDescriptionChange: (description: string) => void;
}

const TAG_CATEGORIES = {
  vegetation: { color: '#E9F7EF', textColor: '#2F855A' },  // Pale green
  weather: { color: '#FEFCE8', textColor: '#92400E' },     // Pale yellow
  urban: { color: '#F3F4F6', textColor: '#4B5563' },       // Pale gray
  topography: { color: '#FDF2F8', textColor: '#9D174D' }   // Pale pink
};

const INITIAL_TAGS: Tag[] = [
  { id: '1', text: 'Dense Vegetation', category: 'vegetation' },
  { id: '2', text: 'Hot-Humid', category: 'weather' },
  { id: '3', text: 'Historic District', category: 'urban' },
  { id: '4', text: 'Steep Terrain', category: 'topography' },
  { id: '5', text: 'Sparse Trees', category: 'vegetation' },
  { id: '6', text: 'Cross Ventilation', category: 'weather' },
  { id: '7', text: 'High Density', category: 'urban' },
  { id: '8', text: 'Valley', category: 'topography' }
];

const SUGGESTION_TAGS: Record<string, Tag[]> = {
  vegetation: [
    { id: 'v1', text: 'Mature Trees', category: 'vegetation' },
    { id: 'v2', text: 'Native Plants', category: 'vegetation' },
    { id: 'v3', text: 'Garden Space', category: 'vegetation' },
    { id: 'v4', text: 'Green Buffer', category: 'vegetation' }
  ],
  weather: [
    { id: 'w1', text: 'Seasonal Winds', category: 'weather' },
    { id: 'w2', text: 'Natural Shade', category: 'weather' },
    { id: 'w3', text: 'Rain Exposure', category: 'weather' },
    { id: 'w4', text: 'Solar Access', category: 'weather' }
  ],
  urban: [
    { id: 'u1', text: 'Mixed-Use', category: 'urban' },
    { id: 'u2', text: 'Pedestrian Zone', category: 'urban' },
    { id: 'u3', text: 'Cultural Hub', category: 'urban' },
    { id: 'u4', text: 'Transit Access', category: 'urban' }
  ],
  topography: [
    { id: 't1', text: 'Natural Slope', category: 'topography' },
    { id: 't2', text: 'Water Feature', category: 'topography' },
    { id: 't3', text: 'Rocky Ground', category: 'topography' },
    { id: 't4', text: 'Elevation Change', category: 'topography' }
  ]
};

const SiteAnalysisTags: React.FC<SiteAnalysisTagsProps> = ({
  onTagsChange,
  onDescriptionChange
}) => {
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>(INITIAL_TAGS);

  // Function to get a random tag from suggestions
  const getRandomSuggestion = (category: string): Tag => {
    const suggestions = SUGGESTION_TAGS[category];
    const unusedSuggestions = suggestions.filter(
      tag => !availableTags.some(t => t.id === tag.id)
    );
    if (unusedSuggestions.length === 0) return suggestions[0];
    return unusedSuggestions[Math.floor(Math.random() * unusedSuggestions.length)];
  };

  const handleTagClick = (tag: Tag) => {
    if (selectedTags.length >= 15) return;

    // Add tag to selected tags
    const newSelectedTags = [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);

    // Remove clicked tag and add a new suggestion
    const newAvailableTags = availableTags.filter(t => t.id !== tag.id);
    const newSuggestion = getRandomSuggestion(tag.category);
    newAvailableTags.push(newSuggestion);
    setAvailableTags(newAvailableTags);
  };

  const handleTagRemove = (tag: Tag) => {
    // Remove tag from selected
    const newSelectedTags = selectedTags.filter(t => t.id !== tag.id);
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  return (
    <div className="space-y-3 pb-3">
      {/* Description Input with Inline Tags */}
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onDescriptionChange(e.target.value);
          }}
          placeholder="Describe your site..."
          className="w-full h-28 p-3 border border-gray-300 rounded-lg resize-none
            focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        <div className="absolute bottom-3 left-3 right-3 whitespace-nowrap overflow-hidden">
          {selectedTags.slice(0, 4).map(tag => (
            <span
              key={tag.id}
              style={{
                backgroundColor: TAG_CATEGORIES[tag.category].color,
                color: TAG_CATEGORIES[tag.category].textColor
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium mr-1"
            >
              {tag.text.toLowerCase()}
              <button
                onClick={() => handleTagRemove(tag)}
                className="hover:bg-black/5 rounded-full p-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {selectedTags.length > 4 && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600"
              title={`${selectedTags.length - 4} more tags`}
            >
              +{selectedTags.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Available Tags */}
      <div className="flex flex-wrap gap-1.5">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag)}
            style={{
              backgroundColor: TAG_CATEGORIES[tag.category].color,
              color: TAG_CATEGORIES[tag.category].textColor
            }}
            className="px-2.5 py-0.5 rounded-full text-sm font-medium
              hover:ring-2 hover:ring-offset-1 hover:ring-purple-500
              transition-all duration-200"
            disabled={selectedTags.length >= 15}
          >
            {tag.text}
          </button>
        ))}
      </div>

      {/* Tag Limit Warning */}
      {selectedTags.length >= 15 && (
        <p className="text-sm text-amber-600">
          Maximum number of tags (15) reached
        </p>
      )}
    </div>
  );
};

export default SiteAnalysisTags; 