'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TemplateSelectionModal from '@/components/TemplateSelectionModal';
import ProjectAccessGuard from '@/components/ProjectAccessGuard';

// Add error boundary component
const ErrorBoundary = ({children}: {children: React.ReactNode}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught client-side error:', error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener('error', handleError);
    
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <details>
          <summary className="cursor-pointer">View error details</summary>
          <pre className="mt-2 p-2 bg-red-50 text-sm overflow-auto">
            {error?.stack || String(error)}
          </pre>
        </details>
      </div>
    );
  }

  return <>{children}</>;
};

// Debug wrapper to log component rendering
const DebugWrapper = ({name, children}: {name: string, children: React.ReactNode}) => {
  useEffect(() => {
    console.log(`[DEBUG] Component mounted: ${name}`);
    return () => console.log(`[DEBUG] Component unmounted: ${name}`);
  }, [name]);

  return <>{children}</>;
};

// Dynamically import CanvasSelector with SSR disabled
const DynamicCanvasSelector = dynamic(
  () => {
    console.log('[DEBUG] Loading CanvasSelector component');
    return import('@/components/ai-companion/CanvasSelector')
      .then(mod => {
        console.log('[DEBUG] CanvasSelector module loaded successfully');
        return mod;
      })
      .catch(err => {
        console.error('[DEBUG] Error loading CanvasSelector:', err);
        throw err;
      });
  },
  { 
    ssr: false,
    loading: () => <div className="p-4 text-gray-500">Loading canvas...</div>
  }
);

// Client component that uses search params
function AICompanionContent() {
  console.log('[DEBUG] Rendering AICompanionContent');
  const searchParams = useSearchParams();
  const name = searchParams?.get('name');
  const description = searchParams?.get('description');
  const projectId = searchParams?.get('projectId');
  const isNewProject = searchParams?.get('isNew') === 'true';
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    console.log('[DEBUG] AICompanionContent params:', { name, description, projectId, isNewProject });
    // Show template modal for new projects - TEMPORARILY DISABLED
    // TODO: Re-enable once actual templates are implemented
    // if (isNewProject && projectId) {
    //   setShowTemplateModal(true);
    // }
  }, [isNewProject, projectId]);

  return (
    <div className="h-full w-full">
      <main className="h-full w-full">
        {projectId ? (
          <DebugWrapper name="ProjectAccessGuard">
            <ProjectAccessGuard projectId={projectId}>
              <ErrorBoundary>
                <DebugWrapper name="DynamicCanvasSelector">
                  <DynamicCanvasSelector 
                    name={name || ''}
                    description={description || ''}
                    projectId={projectId}
                  />
                </DebugWrapper>
              </ErrorBoundary>
              
              {/* Template Selection Modal */}
              <TemplateSelectionModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                projectId={projectId}
              />
            </ProjectAccessGuard>
          </DebugWrapper>
        ) : (
          <DebugWrapper name="DynamicCanvasSelector-NoProject">
            <ErrorBoundary>
              <DynamicCanvasSelector 
                name={name || ''}
                description={description || ''}
                projectId=""
              />
            </ErrorBoundary>
          </DebugWrapper>
        )}
      </main>
    </div>
  );
}

export default function AICompanionPage() {
  console.log('[DEBUG] Rendering AICompanionPage');
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <AICompanionContent />
      </Suspense>
    </ErrorBoundary>
  );
} 