'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import { CaseStudy } from '@/lib/scraper/base';

interface SearchParameters {
  projectType: string;
  location: string;
  size: string;
  materials: string[];
  keywords: string;
}

export default function CaseStudiesPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParameters>({
    projectType: '',
    location: '',
    size: '',
    materials: [],
    keywords: ''
  });
  const [suggestedCaseStudies, setSuggestedCaseStudies] = useState<CaseStudy[]>([]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/case-studies/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();
      setSuggestedCaseStudies(data.caseStudies);
    } catch (error) {
      console.error('Error searching case studies:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <DashboardLayout currentPage="Case Studies">
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold text-[#1B1464]">Find Architectural Inspiration</h1>
            <p className="text-[#4D4D4D] text-lg">
              Let AI help you discover relevant architectural case studies based on your project parameters.
            </p>
          </div>

          {/* Search Parameters */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3] mb-8">
            <h2 className="text-xl font-semibold text-[#1B1464] mb-6">Project Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4D4D4D]">Project Type</label>
                <select
                  value={searchParams.projectType}
                  onChange={(e) => setSearchParams({ ...searchParams, projectType: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC]"
                >
                  <option value="">Select project type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="cultural">Cultural</option>
                  <option value="educational">Educational</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4D4D4D]">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Urban, Coastal, Mountainous"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4D4D4D]">Project Size</label>
                <select
                  value={searchParams.size}
                  onChange={(e) => setSearchParams({ ...searchParams, size: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC]"
                >
                  <option value="">Select size range</option>
                  <option value="small">Small (under 1,000m²)</option>
                  <option value="medium">Medium (1,000-5,000m²)</option>
                  <option value="large">Large (5,000-20,000m²)</option>
                  <option value="xlarge">Extra Large (20,000m²+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#4D4D4D]">Key Materials</label>
                <div className="flex flex-wrap gap-2">
                  {['Concrete', 'Steel', 'Wood', 'Glass', 'Brick', 'Stone'].map((material) => (
                    <button
                      key={material}
                      onClick={() => {
                        const materials = searchParams.materials.includes(material)
                          ? searchParams.materials.filter(m => m !== material)
                          : [...searchParams.materials, material];
                        setSearchParams({ ...searchParams, materials });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        searchParams.materials.includes(material)
                          ? 'bg-[#844BDC] text-white'
                          : 'bg-[#F6F8FA] text-[#4D4D4D] hover:bg-[#E0DAF3]'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-[#4D4D4D]">Additional Keywords</label>
                <input
                  type="text"
                  placeholder="e.g., sustainable, adaptive reuse, parametric design"
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                  className="w-full p-3 rounded-lg border border-[#E0DAF3] focus:border-[#844BDC] focus:ring-1 focus:ring-[#844BDC]"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-[#844BDC] text-white rounded-xl font-medium hover:bg-[#6E3BBC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Icon name="search" className="w-5 h-5" />
                    <span>Find Relevant Case Studies</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {suggestedCaseStudies.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#1B1464]">Suggested Case Studies</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#F6F8FA] rounded-lg">
                    <Icon name="filter" className="w-5 h-5 text-[#4D4D4D]" />
                  </button>
                  <button className="p-2 hover:bg-[#F6F8FA] rounded-lg">
                    <Icon name="sort" className="w-5 h-5 text-[#4D4D4D]" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {suggestedCaseStudies.map((study) => (
                  <div key={study.id} className="border rounded-lg p-6 bg-white shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Main Image */}
                      <div>
                        <img 
                          src={study.images.main} 
                          alt={study.title}
                          className="w-full h-[400px] object-cover rounded-lg mb-4"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          {study.images.floorPlans?.slice(0, 2).map((url, i) => (
                            <img key={`floor-${i}`} src={url} alt="Floor Plan" className="w-full h-20 object-cover rounded" />
                          ))}
                          {study.images.sections?.slice(0, 2).map((url, i) => (
                            <img key={`section-${i}`} src={url} alt="Section" className="w-full h-20 object-cover rounded" />
                          ))}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{study.title}</h2>
                        <p className="text-gray-600 mb-4">{study.architect}</p>
                        
                        <div className="space-y-4">
                          {/* Basic Info */}
                          <div>
                            <h3 className="font-medium text-gray-900">Project Information</h3>
                            <dl className="mt-2 text-sm">
                              <div className="grid grid-cols-2 gap-1">
                                <dt className="text-gray-600">Location:</dt>
                                <dd>{study.location || 'Not specified'}</dd>
                                <dt className="text-gray-600">Year:</dt>
                                <dd>{study.year || 'Not specified'}</dd>
                                <dt className="text-gray-600">Area:</dt>
                                <dd>{study.characteristics.area} m²</dd>
                                <dt className="text-gray-600">Type:</dt>
                                <dd>{study.typology || 'Not specified'}</dd>
                              </div>
                            </dl>
                          </div>

                          {/* Materials */}
                          {study.metadata.materials && study.metadata.materials.length > 0 && (
                            <div>
                              <h3 className="font-medium text-gray-900">Materials</h3>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {study.metadata.materials.map((material, i) => (
                                  <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                    {material}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Features */}
                          {study.characteristics.keyFeatures && study.characteristics.keyFeatures.length > 0 && (
                            <div>
                              <h3 className="font-medium text-gray-900">Key Features</h3>
                              <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                                {study.characteristics.keyFeatures.map((feature, i) => (
                                  <li key={i}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Description */}
                          <div>
                            <h3 className="font-medium text-gray-900">Description</h3>
                            <p className="mt-2 text-sm text-gray-600 line-clamp-4">{study.description}</p>
                          </div>

                          <a 
                            href={study.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View on ArchDaily
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 