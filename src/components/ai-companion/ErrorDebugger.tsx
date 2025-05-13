'use client';

import React, { useEffect, useState } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ErrorDebugger({ 
  children, 
  fallback = <div className="p-6 bg-red-100 rounded-lg">An error occurred</div> 
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Set up global error handler
    const handleWindowError = (event: ErrorEvent) => {
      console.error('Global error caught by ErrorDebugger:', event);
      setHasError(true);
      setError({
        message: event.message,
        stack: event.error?.stack,
        type: 'window.error',
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    // Set up unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection caught by ErrorDebugger:', event);
      setHasError(true);
      setError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'unhandledRejection',
        source: 'Promise'
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Log component mounted
    console.log('[DEBUG] ErrorDebugger mounted');

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.log('[DEBUG] ErrorDebugger unmounted');
    };
  }, []);

  // Reset error state
  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-700">Error Detected</h2>
          <button 
            onClick={resetError}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset
          </button>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">Message:</p>
          <div className="p-2 bg-white rounded border border-red-200 text-red-800">
            {error?.message || 'Unknown error'}
          </div>
        </div>
        
        {error?.type && (
          <div className="mb-4">
            <p className="font-medium">Type:</p>
            <div className="p-2 bg-white rounded border border-red-200 text-red-800">
              {error.type}
            </div>
          </div>
        )}
        
        {error?.source && (
          <div className="mb-4">
            <p className="font-medium">Source:</p>
            <div className="p-2 bg-white rounded border border-red-200 text-red-800">
              {error.source} {error.lineno ? `(line ${error.lineno}${error.colno ? `, col ${error.colno}` : ''})` : ''}
            </div>
          </div>
        )}
        
        {error?.stack && (
          <div className="mb-4">
            <p className="font-medium">Stack Trace:</p>
            <pre className="p-2 bg-white rounded border border-red-200 text-red-800 overflow-auto max-h-64 text-xs">
              {error.stack}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Reload Page
          </button>
          {fallback}
        </div>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error caught in render phase:', error);
    setHasError(true);
    setError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: 'render',
      source: 'Component'
    });
    return null;
  }
} 