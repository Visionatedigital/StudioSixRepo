'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TemplateSelectionModal from '@/components/TemplateSelectionModal';
import ProjectAccessGuard from '@/components/ProjectAccessGuard';

// Dynamically import Canvas with SSR disabled
const DynamicCanvas = dynamic(
  () => import('@/components/ai-companion/Canvas'),
  { ssr: false }
);

export default function AICompanionPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const description = searchParams.get('description');
  const projectId = searchParams.get('projectId');
  const isNewProject = searchParams.get('isNew') === 'true';
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    // Show template modal for new projects
    if (isNewProject && projectId) {
      setShowTemplateModal(true);
    }
  }, [isNewProject, projectId]);

  return (
    <div className="h-full w-full">
      <main className="h-full w-full">
        {projectId ? (
          <ProjectAccessGuard projectId={projectId}>
            <DynamicCanvas 
              name={name || ''}
              description={description || ''}
              projectId={projectId}
            />
            
            {/* Template Selection Modal */}
            <TemplateSelectionModal
              isOpen={showTemplateModal}
              onClose={() => setShowTemplateModal(false)}
              projectId={projectId}
            />
          </ProjectAccessGuard>
        ) : (
          <DynamicCanvas 
            name={name || ''}
            description={description || ''}
            projectId=""
          />
        )}
      </main>
    </div>
  );
} 