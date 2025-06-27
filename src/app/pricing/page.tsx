'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import components that use window
const DashboardPricing = dynamic(() => import('./DashboardPricing'), {
  ssr: false,
});

const HomePricing = dynamic(() => import('./HomePricing'), {
  ssr: false,
});

export default function PricingPage() {
  const pathname = usePathname();
  const [isInDashboard, setIsInDashboard] = useState(false);
  
  useEffect(() => {
    // If the URL includes /dashboard/ or /app/ or similar protected routes
    const dashboardPattern = /\/(dashboard|app|account|generate|wallet|settings)/;
    setIsInDashboard(pathname ? dashboardPattern.test(pathname) : false);
  }, [pathname]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isInDashboard ? <DashboardPricing /> : <HomePricing />}
    </Suspense>
  );
} 