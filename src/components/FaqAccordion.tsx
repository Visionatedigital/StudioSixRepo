'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-8">
      {items.map((item, index) => (
        <div
          key={index}
          className="border-b border-[#6B6B6B]/20 overflow-hidden transition-all duration-500 ease-in-out"
          data-scroll
          data-scroll-speed="0.1"
        >
          <div className="flex flex-col gap-6">
            <button
              className="w-full py-6 flex justify-between items-center text-left group hover:opacity-70 transition-opacity"
              onClick={() => toggleAccordion(index)}
            >
              <h3 className="text-2xl text-[#6B6B6B] pr-8">{item.question}</h3>
              <div 
                className={`transform transition-transform duration-500 text-[#6B6B6B] ${
                  openIndex === index ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === index 
                  ? 'max-h-[1000px] opacity-100 -translate-y-4 mb-6' 
                  : 'max-h-0 opacity-0 translate-y-2'
              }`}
            >
              <p className="text-lg text-[#6B6B6B]/80 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 