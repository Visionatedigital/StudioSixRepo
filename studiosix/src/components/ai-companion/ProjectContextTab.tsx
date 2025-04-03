'use client';

import { useState } from 'react';
import FileUpload from './FileUpload';

interface TabProps {
  id: 'site-plan' | 'location' | 'brief' | 'references';
  onFileUpload: (file: File, tabId: string) => void;
  onContextUpdate: (data: any, tabId: string) => void;
}

export default function Tab({ id, onFileUpload, onContextUpdate }: TabProps) {
  const [locationData, setLocationData] = useState({
    address: '',
    coordinates: '',
    notes: '',
  });
  const [briefContent, setBriefContent] = useState('');
  const [references, setReferences] = useState<Array<{ url: string; title: string }>>([]);

  const handleLocationChange = (field: keyof typeof locationData, value: string) => {
    const newData = { ...locationData, [field]: value };
    setLocationData(newData);
    onContextUpdate(newData, id);
  };

  const handleBriefChange = (value: string) => {
    setBriefContent(value);
    onContextUpdate(value, id);
  };

  const handleAddReference = () => {
    const newReference = { url: '', title: '' };
    setReferences([...references, newReference]);
  };

  const handleReferenceChange = (index: number, field: 'url' | 'title', value: string) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setReferences(newReferences);
    onContextUpdate(newReferences, id);
  };

  const renderContent = () => {
    switch (id) {
      case 'site-plan':
        return (
          <div className="space-y-4">
            <FileUpload
              onUpload={(file) => onFileUpload(file, id)}
              accept="image/*,.pdf,.dwg"
              label="Upload Site Plan"
              description="Drag and drop your site plan file here, or click to browse. Supports images, PDFs, and DWG files."
            />
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={locationData.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coordinates
              </label>
              <input
                type="text"
                value={locationData.coordinates}
                onChange={(e) => handleLocationChange('coordinates', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter GPS coordinates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={locationData.notes}
                onChange={(e) => handleLocationChange('notes', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any additional location details..."
              />
            </div>
            <FileUpload
              onUpload={(file) => onFileUpload(file, id)}
              accept="image/*"
              label="Upload Location Photos"
              description="Add supporting photos of the site location"
            />
          </div>
        );

      case 'brief':
        return (
          <div className="space-y-4">
            <FileUpload
              onUpload={(file) => onFileUpload(file, id)}
              accept=".pdf,.docx,.txt"
              label="Upload Project Brief"
              description="Upload your project brief document"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Brief Notes
              </label>
              <textarea
                value={briefContent}
                onChange={(e) => handleBriefChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter or edit project brief details..."
              />
            </div>
          </div>
        );

      case 'references':
        return (
          <div className="space-y-4">
            <FileUpload
              onUpload={(file) => onFileUpload(file, id)}
              accept="image/*,.pdf"
              label="Upload References"
              description="Upload case studies, mood boards, or reference images"
            />
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reference Links
                </label>
                <button
                  onClick={handleAddReference}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Link
                </button>
              </div>
              <div className="space-y-2">
                {references.map((ref, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ref.title}
                      onChange={(e) => handleReferenceChange(index, 'title', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Title"
                    />
                    <input
                      type="url"
                      value={ref.url}
                      onChange={(e) => handleReferenceChange(index, 'url', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => {
                        const newReferences = references.filter((_, i) => i !== index);
                        setReferences(newReferences);
                        onContextUpdate(newReferences, id);
                      }}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="h-full">{renderContent()}</div>;
} 