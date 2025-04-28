'use client';

import { useEffect, useState } from 'react';
import { CaseStudy } from '@/lib/scraper/base';

export default function TestPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await fetch('/api/case-studies/test');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setCaseStudies(data.results);
        }
      } catch (err) {
        setError('Failed to fetch case studies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  if (loading) return <div className="p-4">Loading case studies...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Case Studies Test</h1>
      <div className="grid grid-cols-1 gap-8">
        {caseStudies.map((study) => (
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
  );
} 