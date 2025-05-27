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
  return (
    <div className="flex flex-col h-full">
            <OriginalCanvas 
              name={name}
              description={description}
              projectId={projectId}
            />
    </div>
  );
} 