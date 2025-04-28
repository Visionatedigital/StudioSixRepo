'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use window
const OnboardingContent = dynamic(() => import('./OnboardingContent'), {
  ssr: false,
});

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}