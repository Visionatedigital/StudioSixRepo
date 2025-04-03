'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Canvas component with no SSR
const DynamicCanvas = dynamic(() => import('@/components/ai-companion/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-lg text-gray-600">Loading canvas...</div>
    </div>
  ),
});

export default function AICompanionPage() {
  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-hidden">
          <DynamicCanvas />
        </main>
      </div>
    </div>
  );
} 