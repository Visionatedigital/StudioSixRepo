'use client';

import React, { useEffect, useRef } from 'react';
import 'locomotive-scroll/dist/locomotive-scroll.css';

interface LocomotiveScrollProviderProps {
  children: React.ReactNode;
  enableSmoothScroll?: boolean;
}

export default function LocomotiveScrollProvider({ 
  children,
  enableSmoothScroll = false 
}: LocomotiveScrollProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const locomotiveScrollRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !enableSmoothScroll) return;

    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      
      if (!locomotiveScrollRef.current && containerRef.current) {
        locomotiveScrollRef.current = new LocomotiveScroll({
          el: containerRef.current,
          smooth: true,
          multiplier: 0.5,
          class: 'is-reveal'
        });
      }
    })();

    return () => {
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
        locomotiveScrollRef.current = null;
      }
    };
  }, [enableSmoothScroll]);

  if (!enableSmoothScroll) {
    return <>{children}</>;
  }

  return (
    <div data-scroll-container ref={containerRef}>
      {children}
    </div>
  );
} 