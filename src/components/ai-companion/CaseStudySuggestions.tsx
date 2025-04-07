import React from 'react';
import Image from 'next/image';
import { CaseStudyReference } from '@/lib/types/case-study';

interface CaseStudySuggestionsProps {
  caseStudies: CaseStudyReference[];
  onSelectCaseStudy: (caseStudy: CaseStudyReference) => void;
}

export function CaseStudySuggestions({ caseStudies, onSelectCaseStudy }: CaseStudySuggestionsProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Similar Projects</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseStudies.map((caseStudy) => (
          <button
            key={caseStudy.id}
            onClick={() => onSelectCaseStudy(caseStudy)}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={caseStudy.images.main}
                alt={caseStudy.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 line-clamp-1">{caseStudy.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                {caseStudy.architect && (
                  <span className="line-clamp-1">{caseStudy.architect}</span>
                )}
                {caseStudy.location && (
                  <>
                    <span>•</span>
                    <span className="line-clamp-1">{caseStudy.location}</span>
                  </>
                )}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {caseStudy.characteristics.keyFeatures.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 