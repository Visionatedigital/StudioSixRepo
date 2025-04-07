'use client';

import { usePathname } from 'next/navigation';
import LocomotiveScrollProvider from './LocomotiveScrollProvider';

export default function ClientScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <LocomotiveScrollProvider enableSmoothScroll={isHomePage}>
      {children}
    </LocomotiveScrollProvider>
  );
} 