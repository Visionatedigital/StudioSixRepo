'use client';

import dynamic from 'next/dynamic';

// Dynamically import Canvas with SSR disabled
const DynamicCanvas = dynamic(
  () => import('@/components/ai-companion/Canvas'),
  { ssr: false }
);

export default function AICompanionPage() {
  return (
    <div className="h-full w-full">
      <main className="h-full w-full">
        <DynamicCanvas />
      </main>
    </div>
  );
} 