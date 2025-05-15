'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import { CaseStudy } from '@/lib/scraper/base';
import { fallbackCaseStudies } from '@/lib/scraper/fallbackData';

export default function CaseStudyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    const fetchCaseStudy = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First check if we have it in local storage
        const savedStudies = localStorage.getItem('savedCaseStudies');
        const savedStudiesArray = savedStudies ? JSON.parse(savedStudies) : [];
        
        // Try to find this case study ID in the saved studies
        const savedStudy = savedStudiesArray.find((study: CaseStudy) => study.id === id);
        if (savedStudy) {
          setCaseStudy(savedStudy);
          setSaved(true);
          setIsLoading(false);
          return;
        }
        
        // Try to fetch from the API
        const response = await fetch(`/api/case-studies/detail?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch case study details');
        }
        
        const data = await response.json();
        if (data.caseStudy) {
          setCaseStudy(data.caseStudy);
          
          // Check if the study is saved
          const isAlreadySaved = savedStudiesArray.some((study: CaseStudy) => study.id === data.caseStudy.id);
          setSaved(isAlreadySaved);
        } else {
          // Try to find in fallback data
          const fallbackStudy = fallbackCaseStudies.find(study => study.id === id);
          if (fallbackStudy) {
            setCaseStudy(fallbackStudy);
          } else {
            throw new Error('Case study not found');
          }
        }
      } catch (err) {
        console.error('Error fetching case study:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchCaseStudy();
    }
  }, [id]);
  
  const handleSaveToCollection = () => {
    if (!caseStudy) return;
    
    try {
      // Get saved case studies from local storage
      const savedStudies = localStorage.getItem('savedCaseStudies');
      const savedStudiesArray = savedStudies ? JSON.parse(savedStudies) : [];
      
      if (saved) {
        // Remove from saved collection
        const updatedSavedStudies = savedStudiesArray.filter((study: CaseStudy) => study.id !== caseStudy.id);
        localStorage.setItem('savedCaseStudies', JSON.stringify(updatedSavedStudies));
        setSaved(false);
      } else {
        // Add to saved collection
        const updatedSavedStudies = [...savedStudiesArray, caseStudy];
        localStorage.setItem('savedCaseStudies', JSON.stringify(updatedSavedStudies));
        setSaved(true);
      }
    } catch (err) {
      console.error('Error saving case study:', err);
    }
  };
  
  const handleGoBack = () => {
    router.back();
  };
  
  if (isLoading) {
    return (
      <DashboardLayout currentPage="Case Study">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3] flex items-center justify-center h-96">
              <div className="w-10 h-10 border-4 border-t-transparent border-[#844BDC] rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !caseStudy) {
    return (
      <DashboardLayout currentPage="Case Study">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3] text-center">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="error" className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Case Study Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The requested case study could not be found.'}</p>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-[#844BDC] text-white rounded-xl font-medium hover:bg-[#6E3BBC] transition-colors"
              >
                Back to Case Studies
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout currentPage="Case Study">
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E0DAF3] mb-8">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center text-[#4D4D4D] hover:text-[#1B1464] mb-4"
                >
                  <Icon name="arrow-left" className="w-4 h-4 mr-1" />
                  <span>Back to Case Studies</span>
                </button>
                <h1 className="text-3xl font-bold text-[#1B1464]">{caseStudy.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{caseStudy.architect}</p>
              </div>
              <button
                onClick={handleSaveToCollection}
                className={`p-2 rounded-full ${saved ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}
                title={saved ? 'Remove from saved' : 'Save to collection'}
              >
                <Icon name={saved ? 'collection-filled' : 'collection'} className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E0DAF3]">
                <div className="relative w-full h-[500px]">
                  {caseStudy.images.main ? (
                    <img 
                      src={caseStudy.images.main}
                      alt={caseStudy.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <p className="text-gray-500">No main image available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Other Images */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Project Drawings & Renders</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Floor Plans */}
                  {caseStudy.images.floorPlans?.length > 0 ? (
                    caseStudy.images.floorPlans.map((url, i) => (
                      <div key={`floor-${i}`} className="relative aspect-square">
                        <img 
                          src={url}
                          alt={`Floor Plan ${i+1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to a placeholder on error
                            e.currentTarget.src = "https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          Floor Plan
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative aspect-square">
                      <img 
                        src="https://images.unsplash.com/photo-1595514535215-b831ad654afd?auto=format&w=400&h=300"
                        alt="Floor Plan"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Floor Plan
                      </div>
                    </div>
                  )}
                  
                  {/* Sections */}
                  {caseStudy.images.sections?.length > 0 ? (
                    caseStudy.images.sections.map((url, i) => (
                      <div key={`section-${i}`} className="relative aspect-square">
                        <img 
                          src={url}
                          alt={`Section ${i+1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to a placeholder on error
                            e.currentTarget.src = "https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          Section
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative aspect-square">
                      <img 
                        src="https://images.unsplash.com/photo-1572297794401-874f6e512788?auto=format&w=400&h=300"
                        alt="Section"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Section
                      </div>
                    </div>
                  )}
                  
                  {/* Renders */}
                  {caseStudy.images.renders?.length > 0 && caseStudy.images.renders.map((url, i) => (
                    <div key={`render-${i}`} className="relative aspect-square">
                      <img 
                        src={url}
                        alt={`Render ${i+1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to a placeholder on error
                          e.currentTarget.src = "https://images.unsplash.com/photo-1545049459-9c723dd14199?auto=format&w=400&h=300";
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Render
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Project Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{caseStudy.description}</p>
                
                <div className="mt-6">
                  <a 
                    href={caseStudy.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>View original source on {caseStudy.source}</span>
                    <Icon name="external-link" className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="space-y-8">
              {/* Project Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Project Information</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Location:</dt>
                    <dd className="font-medium text-right">{caseStudy.location || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Year:</dt>
                    <dd className="font-medium text-right">{caseStudy.year || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Area:</dt>
                    <dd className="font-medium text-right">{caseStudy.characteristics.area || 0} m²</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Type:</dt>
                    <dd className="font-medium text-right">{caseStudy.typology || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Client:</dt>
                    <dd className="font-medium text-right">{caseStudy.metadata.client || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Spatial Organization:</dt>
                    <dd className="font-medium text-right">{caseStudy.characteristics.spatialOrganization || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>
              
              {/* Materials */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Materials</h2>
                {caseStudy.metadata.materials && caseStudy.metadata.materials.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.metadata.materials.map((material, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No materials specified</p>
                )}
              </div>
              
              {/* Key Features */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Key Features</h2>
                {caseStudy.characteristics.keyFeatures && caseStudy.characteristics.keyFeatures.length > 0 ? (
                  <ul className="space-y-2">
                    {caseStudy.characteristics.keyFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Icon name="check-circle" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No key features specified</p>
                )}
              </div>
              
              {/* Sustainability */}
              {caseStudy.metadata.sustainability && caseStudy.metadata.sustainability.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                  <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Sustainability Features</h2>
                  <ul className="space-y-2">
                    {caseStudy.metadata.sustainability.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Icon name="leaf" className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Design Challenges */}
              {caseStudy.characteristics.designChallenges && caseStudy.characteristics.designChallenges.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0DAF3]">
                  <h2 className="text-xl font-semibold text-[#1B1464] mb-4">Design Challenges</h2>
                  <ul className="space-y-2">
                    {caseStudy.characteristics.designChallenges.map((challenge, i) => (
                      <li key={i} className="flex items-start">
                        <Icon name="lightbulb" className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 