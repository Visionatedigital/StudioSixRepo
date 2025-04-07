'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

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

  return (
    <div className="h-full w-full">
      <main className="h-full w-full">
        <DynamicCanvas 
          name={name || ''}
          description={description || ''}
          projectId={projectId || ''}
        />
      </main>
    </div>
  );
} 