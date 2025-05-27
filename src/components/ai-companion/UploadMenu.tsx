import React, { useRef } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface UploadMenuProps {
  files: UploadedFile[];
  onUpload: (files: FileList) => void;
  onRemove: (id: string) => void;
}

export default function UploadMenu({ files, onUpload, onRemove }: UploadMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-[360px] z-50 border border-blue-400" style={{ minHeight: 220 }}>
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{ minHeight: 120 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => e.target.files && onUpload(e.target.files)}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,.txt,.csv"
        />
        <span className="text-gray-500 text-base mb-2">Drag & drop files here or click to upload</span>
        <span className="text-xs text-gray-400">(Images, PDFs, Word, Excel, Zip, Text, CSV...)</span>
      </div>
      <div className="mt-2">
        <h4 className="text-sm font-semibold mb-2">Uploaded Files</h4>
        {files.length === 0 ? (
          <div className="text-xs text-gray-400">No files uploaded yet.</div>
        ) : (
          <div className="max-h-40 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className="relative group bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center p-2 transition-transform hover:scale-105"
                  style={{ minHeight: 80 }}
                >
                  {/* Delete button overlay */}
                  <button
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-300 hover:bg-red-100 hover:text-red-600 z-10"
                    onClick={e => { e.stopPropagation(); onRemove(file.id); }}
                    title="Remove file"
                    style={{ lineHeight: 0 }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-14 h-14 object-cover rounded mb-1 border" />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded mb-1 border text-gray-500 text-lg font-bold">
                      <span>{file.type.split('/')[1]?.toUpperCase() || file.type.split('.')[1]?.toUpperCase() || 'FILE'}</span>
                    </div>
                  )}
                  <div className="w-full truncate text-xs text-gray-800 text-center font-medium" title={file.name}>{file.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 