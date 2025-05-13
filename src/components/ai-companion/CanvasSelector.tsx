'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import OriginalCanvas from './Canvas';
import DebugCanvas from './Canvas-debug';
import MockCanvas from './Canvas-mock';

interface Props {
  name: string;
  description: string;
  projectId: string;
}

// Creates a safe wrapper for error handling
const SafeComponent = ({
  children,
  fallback = <div className="p-4 bg-red-100 rounded">Component failed to render</div>
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <>{fallback}</>;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error rendering component:', error);
    setHasError(true);
    return <>{fallback}</>;
  }
};

export default function CanvasSelector({ name, description, projectId }: Props) {
  const [version, setVersion] = useState<'original' | 'debug' | 'mock'>('mock');
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-50 p-2 border-b border-blue-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Canvas Debug Panel</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setVersion('original')}
            className={`px-3 py-1 rounded ${version === 'original' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Original
          </button>
          <button
            onClick={() => setVersion('debug')}
            className={`px-3 py-1 rounded ${version === 'debug' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Debug
          </button>
          <button
            onClick={() => setVersion('mock')}
            className={`px-3 py-1 rounded ${version === 'mock' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Mock
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {version === 'original' && (
          <SafeComponent fallback={<div className="p-4 bg-red-100">Original Canvas failed to render</div>}>
            <OriginalCanvas 
              name={name}
              description={description}
              projectId={projectId}
            />
          </SafeComponent>
        )}
        
        {version === 'debug' && (
          <SafeComponent fallback={<div className="p-4 bg-red-100">Debug Canvas failed to render</div>}>
            <DebugCanvas 
              name={name}
              description={description}
              projectId={projectId}
            />
          </SafeComponent>
        )}
        
        {version === 'mock' && (
          <SafeComponent fallback={<div className="p-4 bg-red-100">Mock Canvas failed to render</div>}>
            <MockCanvas 
              name={name}
              description={description}
              projectId={projectId}
            />
          </SafeComponent>
        )}
      </div>
    </div>
  );
} 