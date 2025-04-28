'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use window
const PricingContent = dynamic(() => import('./PricingContent'), {
  ssr: false,
});

export default function PricingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
} 