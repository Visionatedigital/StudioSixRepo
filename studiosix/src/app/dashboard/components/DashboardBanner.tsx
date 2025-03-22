'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/Icons';

const tools = [
  {
    id: 'exterior',
    title: 'Exterior AI',
    description: 'Transform your architectural concepts into stunning exterior visualizations',
    image: '/Banner Images/AdobeStock_977859853.jpeg',
    href: '/generate/exterior'
  },
  {
    id: 'interior',
    title: 'Interior AI',
    description: 'Create beautiful interior spaces with AI-powered design assistance',
    image: '/Banner Images/AdobeStock_598273885.jpeg',
    href: '/generate/interior'
  },
  {
    id: 'enhancer',
    title: 'Render Enhancer ✨',
    description: 'Elevate your renders with AI-powered enhancement tools',
    image: '/Banner Images/Render Enhancer.jpg',
    href: '/generate/enhance'
  },
  {
    id: 'landscape',
    title: 'Landscape AI',
    description: 'Design breathtaking landscapes with intelligent assistance',
    image: '/Banner Images/Landscape.jpeg',
    href: '/generate/landscape'
  }
];

export default function DashboardBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % tools.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tools.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tools.length) % tools.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="space-y-8">
      {/* Main Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#1B1464]">
          Make ideas truly extraordinary
        </h1>
        <p className="text-lg text-[#6D758F]">
          Transform concepts into remarkable creations with innovation
        </p>
      </div>

      {/* Carousel */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden group">
        {/* Slides */}
        <div 
          className="h-full transition-transform duration-500 ease-out flex"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {tools.map((tool) => (
            <div key={tool.id} className="w-full h-full flex-shrink-0 relative">
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                className="object-cover animate-kenburns"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-12 text-white max-w-2xl">
                <h2 className="text-5xl font-bold mb-4">{tool.title}</h2>
                <p className="text-xl text-white/90 mb-8">{tool.description}</p>
                <Link 
                  href={tool.href}
                  className="inline-flex items-center gap-2 bg-white text-[#1B1464] hover:bg-white/90 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                >
                  Try Now
                  <Icon name="arrow-right" size={24} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="chevron-left" size={32} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="chevron-right" size={32} className="text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 right-8 flex gap-2">
          {tools.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E0DAF3] hover:border-[#844BDC] transition-all hover:shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#844BDC]/10 flex items-center justify-center group-hover:bg-[#844BDC]/20 transition-colors">
              <Icon name={tool.id} size={22} className="text-[#844BDC]" />
            </div>
            <div>
              <h3 className="font-medium text-base text-[#1B1464] group-hover:text-[#844BDC] transition-colors">
                {tool.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 