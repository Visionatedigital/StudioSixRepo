"use client";

import { useEffect, useState } from "react";

export default function ScrollArrow() {
  const [showScrollArrow, setShowScrollArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        const rect = howItWorksSection.getBoundingClientRect();
        setShowScrollArrow(rect.top > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`absolute bottom-[-20px] left-1/2 -translate-x-1/2 transition-opacity duration-500 ${showScrollArrow ? 'opacity-100' : 'opacity-0'}`}>
      <div className="animate-bounce">
        <div className="w-8 h-8 border-b-4 border-r-4 border-[#7144D3] transform rotate-45 rounded-br-[6px]" />
      </div>
    </div>
  );
} 