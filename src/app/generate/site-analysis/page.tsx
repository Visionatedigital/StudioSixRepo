'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Map from '@/components/Map';
import ImageUpload from '@/components/ImageUpload';
import { useRouter } from 'next/navigation';

// Predefined tags by category
const tagCategories = {
  feelings: [
    { id: 'enclosed', label: 'Enclosed', color: 'border-blue-300 bg-blue-50 text-blue-700' },
    { id: 'permeable', label: 'Permeable', color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { id: 'layered', label: 'Layered', color: 'border-blue-300 bg-blue-50 text-blue-700' },
    { id: 'intimate', label: 'Intimate', color: 'border-rose-300 bg-rose-50 text-rose-700' },
    { id: 'ethereal', label: 'Ethereal', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
    { id: 'dynamic', label: 'Dynamic', color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { id: 'serene', label: 'Serene', color: 'border-blue-300 bg-blue-50 text-blue-700' },
    { id: 'textured', label: 'Textured', color: 'border-amber-300 bg-amber-50 text-amber-700' }
  ],
  climate: [
    { id: 'tropical', label: 'Tropical' },
    { id: 'temperate', label: 'Temperate' },
    { id: 'arid', label: 'Arid' },
    { id: 'mediterranean', label: 'Mediterranean' },
  ],
  context: [
    { id: 'urban', label: 'Urban' },
    { id: 'suburban', label: 'Suburban' },
    { id: 'rural', label: 'Rural' },
    { id: 'coastal', label: 'Coastal' },
  ],
  terrain: [
    { id: 'flat', label: 'Flat' },
    { id: 'sloped', label: 'Sloped' },
    { id: 'mountainous', label: 'Mountainous' },
    { id: 'valley', label: 'Valley' },
  ],
  vegetation: [
    { id: 'dense', label: 'Dense Vegetation' },
    { id: 'moderate', label: 'Moderate Vegetation' },
    { id: 'sparse', label: 'Sparse Vegetation' },
    { id: 'none', label: 'No Vegetation' },
  ],
  challenges: [
    { id: 'flood-prone', label: 'Flood Prone' },
    { id: 'high-winds', label: 'High Winds' },
    { id: 'soil-issues', label: 'Soil Issues' },
    { id: 'noise', label: 'Noise Pollution' },
  ],
};

interface AnalysisData {
  elevation: number | null;
  features: any[];
  coordinates: { lng: number; lat: number };
}

// Extended feeling vocabulary system
const feelingCategories = {
  spatial: {
    enclosed: ['intimate', 'sheltered', 'compressed'],
    expansive: ['open', 'boundless', 'vast'],
    layered: ['stratified', 'nested', 'overlapping'],
    permeable: ['porous', 'flowing', 'connected'],
    elevated: ['floating', 'suspended', 'lifted'],
    grounded: ['anchored', 'rooted', 'stable']
  },
  atmospheric: {
    ethereal: ['luminous', 'airy', 'diffused'],
    serene: ['tranquil', 'peaceful', 'contemplative'],
    dynamic: ['energetic', 'fluid', 'rhythmic'],
    mysterious: ['enigmatic', 'veiled', 'intriguing'],
    dramatic: ['bold', 'intense', 'powerful'],
    harmonious: ['balanced', 'unified', 'coherent']
  },
  sensory: {
    textured: ['tactile', 'rough', 'varied'],
    smooth: ['polished', 'sleek', 'refined'],
    warm: ['cozy', 'inviting', 'comfortable'],
    cool: ['crisp', 'fresh', 'clear'],
    acoustic: ['resonant', 'quiet', 'echoing'],
    luminous: ['bright', 'glowing', 'radiant']
  },
  temporal: {
    timeless: ['enduring', 'eternal', 'classic'],
    ephemeral: ['transient', 'fleeting', 'temporary'],
    evolving: ['changing', 'growing', 'transforming'],
    cyclical: ['recurring', 'periodic', 'rhythmic']
  }
};

// Extended feeling tags with rich colors
const extendedFeelingTags = {
  // Spatial Feelings
  enclosed: { id: 'enclosed', label: 'Enclosed', color: 'border-indigo-300 bg-indigo-50 text-indigo-700', category: 'spatial' },
  expansive: { id: 'expansive', label: 'Expansive', color: 'border-sky-300 bg-sky-50 text-sky-700', category: 'spatial' },
  layered: { id: 'layered', label: 'Layered', color: 'border-violet-300 bg-violet-50 text-violet-700', category: 'spatial' },
  permeable: { id: 'permeable', label: 'Permeable', color: 'border-amber-300 bg-amber-50 text-amber-700', category: 'spatial' },
  elevated: { id: 'elevated', label: 'Elevated', color: 'border-blue-300 bg-blue-50 text-blue-700', category: 'spatial' },
  grounded: { id: 'grounded', label: 'Grounded', color: 'border-stone-300 bg-stone-50 text-stone-700', category: 'spatial' },

  // Atmospheric Feelings
  ethereal: { id: 'ethereal', label: 'Ethereal', color: 'border-emerald-300 bg-emerald-50 text-emerald-700', category: 'atmospheric' },
  serene: { id: 'serene', label: 'Serene', color: 'border-cyan-300 bg-cyan-50 text-cyan-700', category: 'atmospheric' },
  dynamic: { id: 'dynamic', label: 'Dynamic', color: 'border-orange-300 bg-orange-50 text-orange-700', category: 'atmospheric' },
  mysterious: { id: 'mysterious', label: 'Mysterious', color: 'border-purple-300 bg-purple-50 text-purple-700', category: 'atmospheric' },
  dramatic: { id: 'dramatic', label: 'Dramatic', color: 'border-rose-300 bg-rose-50 text-rose-700', category: 'atmospheric' },
  harmonious: { id: 'harmonious', label: 'Harmonious', color: 'border-teal-300 bg-teal-50 text-teal-700', category: 'atmospheric' },

  // Sensory Feelings
  textured: { id: 'textured', label: 'Textured', color: 'border-amber-300 bg-amber-50 text-amber-700', category: 'sensory' },
  smooth: { id: 'smooth', label: 'Smooth', color: 'border-slate-300 bg-slate-50 text-slate-700', category: 'sensory' },
  warm: { id: 'warm', label: 'Warm', color: 'border-red-300 bg-red-50 text-red-700', category: 'sensory' },
  cool: { id: 'cool', label: 'Cool', color: 'border-cyan-300 bg-cyan-50 text-cyan-700', category: 'sensory' },
  acoustic: { id: 'acoustic', label: 'Acoustic', color: 'border-blue-300 bg-blue-50 text-blue-700', category: 'sensory' },
  luminous: { id: 'luminous', label: 'Luminous', color: 'border-yellow-300 bg-yellow-50 text-yellow-700', category: 'sensory' },

  // Temporal Feelings
  timeless: { id: 'timeless', label: 'Timeless', color: 'border-gray-300 bg-gray-50 text-gray-700', category: 'temporal' },
  ephemeral: { id: 'ephemeral', label: 'Ephemeral', color: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700', category: 'temporal' },
  evolving: { id: 'evolving', label: 'Evolving', color: 'border-lime-300 bg-lime-50 text-lime-700', category: 'temporal' },
  cyclical: { id: 'cyclical', label: 'Cyclical', color: 'border-violet-300 bg-violet-50 text-violet-700', category: 'temporal' }
};

// Vocabulary relationships for suggestions
const feelingVocabulary = {
  // Spatial relationships
  enclosed: ['grounded', 'warm', 'intimate', 'acoustic'],
  expansive: ['luminous', 'dynamic', 'elevated', 'cool'],
  layered: ['textured', 'mysterious', 'dynamic', 'cyclical'],
  permeable: ['dynamic', 'evolving', 'expansive', 'ethereal'],
  elevated: ['expansive', 'ethereal', 'luminous', 'dynamic'],
  grounded: ['enclosed', 'timeless', 'harmonious', 'warm'],

  // Atmospheric relationships
  ethereal: ['luminous', 'ephemeral', 'serene', 'elevated'],
  serene: ['harmonious', 'cool', 'timeless', 'ethereal'],
  dynamic: ['evolving', 'dramatic', 'permeable', 'expansive'],
  mysterious: ['ephemeral', 'acoustic', 'layered', 'cool'],
  dramatic: ['dynamic', 'expansive', 'luminous', 'warm'],
  harmonious: ['serene', 'grounded', 'timeless', 'smooth'],

  // Sensory relationships
  textured: ['layered', 'warm', 'dynamic', 'acoustic'],
  smooth: ['cool', 'serene', 'luminous', 'harmonious'],
  warm: ['enclosed', 'textured', 'dramatic', 'grounded'],
  cool: ['smooth', 'ethereal', 'expansive', 'serene'],
  acoustic: ['mysterious', 'enclosed', 'serene', 'layered'],
  luminous: ['ethereal', 'expansive', 'dramatic', 'elevated'],

  // Temporal relationships
  timeless: ['grounded', 'harmonious', 'serene', 'smooth'],
  ephemeral: ['ethereal', 'mysterious', 'dynamic', 'luminous'],
  evolving: ['dynamic', 'permeable', 'cyclical', 'layered'],
  cyclical: ['evolving', 'harmonious', 'dynamic', 'layered']
};

export default function SiteAnalysisPage() {
  const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [siteDescription, setSiteDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [siteImages, setSiteImages] = useState<File[]>([]);
  const [availableFeelings, setAvailableFeelings] = useState<string[]>(
    ['enclosed', 'expansive', 'ethereal', 'dynamic', 'textured', 'warm', 'mysterious'].slice(0, 7)
  );
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [siteSelectionStatus, setSiteSelectionStatus] = useState<'none' | 'searching' | 'selected'>('none');
  const router = useRouter();
  const [slopeValue, setSlopeValue] = useState(0);

  const handleAnalysisComplete = (data: AnalysisData) => {
    setAnalysisData(data);
  };

  const handleLocationSelect = (location: { lng: number; lat: number }) => {
    setSelectedLocation(location);
    setSiteSelectionStatus('selected');
  };

  const handleFeelingTagClick = (tagId: string) => {
    // Add the tag to selected feelings
    setSelectedFeelings(prev => [...prev, tagId]);

    // Get the category of the selected tag
    const selectedCategory = extendedFeelingTags[tagId as keyof typeof extendedFeelingTags].category;

    // Get related feelings that exist in extendedFeelingTags
    const relatedFeelings = feelingVocabulary[tagId as keyof typeof feelingVocabulary]
      .filter(feeling => feeling in extendedFeelingTags);

    // Get unused feelings from the same category
    const sameCategoryFeelings = Object.entries(extendedFeelingTags)
      .filter(([id, tag]) => 
        tag.category === selectedCategory && 
        !selectedFeelings.includes(id) && 
        id !== tagId &&
        !relatedFeelings.includes(id)
      )
      .map(([id]) => id);

    // Get unused feelings from other categories
    const otherCategoryFeelings = Object.entries(extendedFeelingTags)
      .filter(([id, tag]) => 
        tag.category !== selectedCategory && 
        !selectedFeelings.includes(id) && 
        id !== tagId &&
        !relatedFeelings.includes(id)
      )
      .map(([id]) => id);

    // Combine and prioritize suggestions
    const newSuggestions = [
      ...relatedFeelings,
      ...sameCategoryFeelings,
      ...otherCategoryFeelings
    ]
      .filter(feeling => !selectedFeelings.includes(feeling)) // Ensure no selected feelings are included
      .slice(0, 7); // Show 7 suggestions at a time

    setAvailableFeelings(newSuggestions);
  };

  const handleImagesSelected = (images: File[]) => {
    setSiteImages(images);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSlopeChange = (value: number) => {
    setSlopeValue(value);
    let slope = 'flat';
    if (value > 75) slope = 'steep';
    else if (value > 50) slope = 'moderate';
    else if (value > 25) slope = 'gentle';
    
    // Remove any existing slope tag
    setSelectedTags(prev => prev.filter(tag => !tag.startsWith('slope-')));
    // Add the new slope tag
    handleTagClick(`slope-${slope}`);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const prepareAnalysisPayload = async () => {
    if (!selectedLocation || !siteDescription) {
      throw new Error('Location and description are required');
    }

    // Extract slope value
    const slopeTag = selectedTags.find(tag => tag.startsWith('slope-'));
    const slope = slopeTag ? slopeTag.split('-')[1] : 'flat';

    // Extract vegetation density
    const vegetationTag = selectedTags.find(tag => tag.startsWith('vegetation-'));
    const vegetation = vegetationTag ? vegetationTag.split('-')[1] : 'none';

    // Extract setting
    const settingTag = selectedTags.find(tag => tag.startsWith('setting-'));
    const setting = settingTag ? settingTag.split('-')[1] : '';

    // Extract views
    const viewsTag = selectedTags.find(tag => tag.startsWith('views-'));
    const views = viewsTag ? viewsTag.split('-')[1] : '';

    // Extract climate
    const climateTag = selectedTags.find(tag => tag.startsWith('climate-'));
    const climate = climateTag ? climateTag.split('-')[1] : '';

    // Extract access difficulty
    const accessTag = selectedTags.find(tag => tag.startsWith('access-'));
    const access = accessTag ? accessTag.split('-')[1] : '';

    // Extract environmental challenges
    const environmentalChallenges = selectedTags
      .filter(tag => tag.startsWith('environmental-'))
      .map(tag => tag.split('-')[1]);

    return {
      location: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      },
      description: siteDescription,
      feelings: selectedFeelings.map(feeling => ({
        primary: feeling,
        related: feelingVocabulary[feeling as keyof typeof feelingVocabulary] || []
      })),
      analysisData: {
        elevation: analysisData?.elevation || null,
        features: analysisData?.features || []
      },
      siteCharacteristics: {
        topography: {
          slope,
          vegetation,
        },
        context: {
          setting,
          views,
          climate,
        },
        challenges: {
          access,
          environmental: environmentalChallenges,
        }
      }
    };
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    { message: "Traveling to your site", icon: "/icons/travel-icon.svg" },
    { message: "Taking site photos", icon: "/icons/camera-icon.svg" },
    { message: "Taking some measurements", icon: "/icons/measure-icon.svg" },
    { message: "Finalizing recommendations", icon: "/icons/finalize-icon.svg" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000); // Change message every 3 seconds
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <DashboardLayout currentPage="Site Analysis">
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1B1464] mb-2">Site Analysis AI</h1>
          <p className="text-[#4D4D4D] text-lg mb-8">
            Analyze site conditions and generate comprehensive reports with AI assistance
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
            {/* Map Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#1B1464]">Select Site Location</h2>
                <div className="flex items-center gap-2">
                  {siteSelectionStatus === 'searching' && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="w-3 h-3 border-2 border-amber-600 rounded-full animate-spin border-t-transparent" />
                      <span className="text-sm font-medium">Searching location...</span>
                    </div>
                  )}
                  {siteSelectionStatus === 'selected' && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium">Site selected</span>
                    </div>
                  )}
                  {siteSelectionStatus === 'none' && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">No site selected</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-[400px] rounded-xl overflow-hidden">
                <Map 
                  onLocationSelect={handleLocationSelect} 
                  onAnalysisComplete={handleAnalysisComplete}
                  onSearchStart={() => setSiteSelectionStatus('searching')}
                />
              </div>
              
              {/* Analysis Results */}
              {analysisData && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-[#F6F8FA] rounded-lg">
                    <h3 className="font-medium text-[#1B1464] mb-2">Site Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#4D4D4D]">
                          Coordinates: {analysisData.coordinates.lat.toFixed(6)}, {analysisData.coordinates.lng.toFixed(6)}
                        </p>
                        {analysisData.elevation && (
                          <p className="text-sm text-[#4D4D4D]">
                            Elevation: {analysisData.elevation.toFixed(1)} meters
                          </p>
                        )}
                      </div>
                      <div>
                        {analysisData.features.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-[#4D4D4D]">Nearby Features:</p>
                            <ul className="text-sm text-[#4D4D4D]">
                              {analysisData.features.map((feature, index) => (
                                <li key={index}>
                                  {feature.layer.id}: {feature.properties.type || feature.properties.class}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Site Visit Description</h2>
              <div className="relative w-full rounded-xl border border-[#E0DAF3] focus-within:border-[#844BDC] focus-within:ring-1 focus-within:ring-[#844BDC] transition-colors">
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Describe your site visit observations... How does the site make you feel? What sensory experiences stand out? What's the atmosphere like?"
                  className="w-full h-40 p-4 rounded-xl outline-none resize-none"
                />
                
                {/* Selected Tags */}
                {selectedFeelings.length > 0 && (
                  <div className="px-4 py-2 border-t border-[#E0DAF3]">
                    <div className="flex flex-wrap items-center text-sm text-gray-600">
                      {selectedFeelings.map((tagId, index) => {
                        const tag = extendedFeelingTags[tagId as keyof typeof extendedFeelingTags];
                        return (
                          <React.Fragment key={tag.id}>
                            <span className="font-medium">{tag.label}</span>
                            {index < selectedFeelings.length - 1 && (
                              <span className="mx-2 text-gray-400">•</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-t border-[#E0DAF3]" />
                
                {/* Feeling Tag Suggestions */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-[#4D4D4D] mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableFeelings.map(tagId => {
                      const tag = extendedFeelingTags[tagId as keyof typeof extendedFeelingTags];
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleFeelingTagClick(tag.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tag.color}`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Site Photos Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Site Photos</h2>
              <ImageUpload onImagesSelected={handleImagesSelected} maxImages={4} />
            </div>

            {/* Site Characteristics Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Site Characteristics</h2>
              
              {/* Topography & Terrain */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏔️</span>
                  <h3 className="text-lg font-medium text-[#1B1464]">Topography & Terrain</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Slope</label>
                    <div className="flex items-center gap-2 pt-6">
                      <div className="flex-1 relative">
                        <div className="absolute -top-4 left-0 right-0 flex justify-between text-xs text-[#4D4D4D] px-1">
                          <span>Flat</span>
                          <span>Gentle</span>
                          <span>Moderate</span>
                          <span>Steep</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={slopeValue}
                          onChange={(e) => handleSlopeChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-[#E0DAF3] rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #844BDC 0%, #844BDC ${slopeValue}%, #E0DAF3 ${slopeValue}%, #E0DAF3 100%)`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#4D4D4D] min-w-[80px] text-center">
                        {slopeValue > 75 ? 'Steep' :
                         slopeValue > 50 ? 'Moderate' :
                         slopeValue > 25 ? 'Gentle' : 'Flat'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Elevation</label>
                    <div className="flex flex-wrap gap-2">
                      {['lowland', 'upland', 'mountainous'].map(option => (
                        <button
                          key={option}
                          onClick={() => handleTagClick(`elevation-${option}`)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(`elevation-${option}`)
                              ? 'bg-[#844BDC] text-white'
                              : 'bg-[#F6F8FA] text-[#4D4D4D] hover:bg-[#E0DAF3]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Vegetation</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#E0DAF3] rounded-lg overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            selectedTags.includes('vegetation-dense') ? 'bg-green-500 w-full' :
                            selectedTags.includes('vegetation-moderate') ? 'bg-green-400 w-2/3' :
                            selectedTags.includes('vegetation-sparse') ? 'bg-green-300 w-1/3' : 'bg-gray-200 w-0'
                          }`}
                        />
                      </div>
                      <div className="flex gap-1">
                        {['sparse', 'moderate', 'dense'].map(option => (
                          <button
                            key={option}
                            onClick={() => handleTagClick(`vegetation-${option}`)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              selectedTags.includes(`vegetation-${option}`)
                                ? 'bg-green-500'
                                : 'bg-[#E0DAF3]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context & Surroundings */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏙️</span>
                  <h3 className="text-lg font-medium text-[#1B1464]">Context & Surroundings</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Setting</label>
                    <select
                      value={selectedTags.find(tag => tag.startsWith('setting-'))?.split('-')[1] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          handleTagClick(`setting-${value}`);
                        }
                      }}
                      className="w-full p-2 rounded-lg border border-[#E0DAF3] bg-white text-[#4D4D4D] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC]"
                    >
                      <option value="">Select setting</option>
                      {['urban', 'suburban', 'rural', 'wilderness'].map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Views</label>
                    <div className="flex flex-wrap gap-2">
                      {['panoramic', 'partial', 'enclosed'].map(option => (
                        <button
                          key={option}
                          onClick={() => handleTagClick(`views-${option}`)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(`views-${option}`)
                              ? 'bg-[#844BDC] text-white'
                              : 'bg-[#F6F8FA] text-[#4D4D4D] hover:bg-[#E0DAF3]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Climate</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['tropical', 'temperate', 'arid', 'mediterranean'].map(option => (
                        <button
                          key={option}
                          onClick={() => handleTagClick(`climate-${option}`)}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTags.includes(`climate-${option}`)
                              ? 'bg-[#844BDC] text-white'
                              : 'bg-[#F6F8FA] text-[#4D4D4D] hover:bg-[#E0DAF3]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenges & Constraints */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">⚠️</span>
                  <h3 className="text-lg font-medium text-[#1B1464]">Challenges & Constraints</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Environmental</label>
                    <div className="flex flex-wrap gap-2">
                      {['flood-prone', 'erosion', 'wind-exposed', 'noise'].map(option => (
                        <button
                          key={option}
                          onClick={() => handleTagClick(`environmental-${option}`)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(`environmental-${option}`)
                              ? 'bg-[#844BDC] text-white'
                              : 'bg-[#F6F8FA] text-[#4D4D4D] hover:bg-[#E0DAF3]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4D4D4D]">Access</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#E0DAF3] rounded-lg overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            selectedTags.includes('access-difficult') ? 'bg-red-500 w-full' :
                            selectedTags.includes('access-moderate') ? 'bg-yellow-500 w-2/3' :
                            selectedTags.includes('access-easy') ? 'bg-green-500 w-1/3' : 'bg-gray-200 w-0'
                          }`}
                        />
                      </div>
                      <div className="flex gap-1">
                        {['easy', 'moderate', 'difficult'].map(option => (
                          <button
                            key={option}
                            onClick={() => handleTagClick(`access-${option}`)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              selectedTags.includes(`access-${option}`)
                                ? option === 'easy' ? 'bg-green-500' :
                                  option === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                : 'bg-[#E0DAF3]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Button and Loading States */}
            <div className="mt-8">
              <div className="flex flex-col items-center gap-4">
                <button
                  className="px-6 py-3 bg-[#844BDC] text-white rounded-xl font-medium hover:bg-[#6E3BBC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
                  onClick={async () => {
                    if (!selectedLocation || !analysisData) {
                      alert('Please select a location on the map first');
                      return;
                    }

                    try {
                      // Check and deduct credits first
                      const creditResponse = await fetch('/api/credits/deduct', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ amount: 30 }),
                      });

                      const creditData = await creditResponse.json();

                      if (!creditResponse.ok) {
                        if (creditData.error === 'Insufficient credits') {
                          alert(`Insufficient credits. You have ${creditData.currentCredits} credits remaining. This analysis requires 30 credits.`);
                        } else {
                          alert(creditData.error || 'Failed to process credits');
                        }
                        return;
                      }

                      const analysisPayload = await prepareAnalysisPayload();

                      // Save analysis data to session storage
                      sessionStorage.setItem('analysisData', JSON.stringify(analysisPayload));

                      // Navigate to report page
                      router.push('/generate/site-analysis/report');
                    } catch (error) {
                      console.error('Error preparing analysis:', error);
                      alert('There was an error preparing the analysis. Please try again.');
                    }
                  }}
                  disabled={!selectedLocation || !analysisData}
                >
                  <div className="flex flex-col items-center">
                    <span>Generate Analysis Report</span>
                    <span className="text-sm opacity-80">(30 Credits)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 