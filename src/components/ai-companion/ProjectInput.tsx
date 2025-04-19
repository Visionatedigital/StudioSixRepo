import React, { useState } from 'react';
import FileUploadContainer from './FileUploadContainer';

interface ProjectInputProps {
  onSave: (data: {
    brief: string;
    files: File[];
  }) => void;
}

const ProjectInput: React.FC<ProjectInputProps> = ({ onSave }) => {
  const [brief, setBrief] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ brief, files });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Project Brief Input */}
      <div>
        <label
          htmlFor="brief"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Project Brief
        </label>
        <textarea
          id="brief"
          rows={6}
          className="w-full rounded-lg border border-gray-300 shadow-sm p-3
            focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          placeholder="Enter your project requirements or brief description..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
      </div>

      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Files
        </label>
        <FileUploadContainer
          onFilesChange={setFiles}
          maxFiles={5}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
          }}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-white font-medium
            transition-colors duration-200 ${
              isSaving
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
        >
          {isSaving ? 'Saving...' : 'Save Input'}
        </button>
      </div>
    </div>
  );
};

export default ProjectInput; 