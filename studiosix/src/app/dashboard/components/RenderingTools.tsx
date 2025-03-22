'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const RenderingTool = ({ title, image, href }: { title: string; image: string; href: string }) => {
  // Split the title to separate "AI" from the rest
  const titleParts = title.split('AI');
  const mainText = titleParts[0].trim();
  const hasAI = title.includes('AI');

  return (
    <Link
      href={href}
      className="relative group rounded-2xl overflow-hidden bg-gray-100"
      style={{ aspectRatio: '16/9' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 transition-opacity group-hover:opacity-60 z-10" />
      <Image
        src={image}
        alt={title}
        width={400}
        height={225}
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center">
          <h3 className="text-white text-2xl">
            {mainText}
            {hasAI && (
              <span className="inline-flex items-center ml-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 border-2 border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  <span className="font-bold">AI</span>
                </span>
              </span>
            )}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default function RenderingTools() {
  const tools = [
    {
      title: 'Exterior AI',
      image: '/thumbnails/exterior.jpg',
      href: '/generate/exterior'
    },
    {
      title: 'Interior AI',
      image: '/thumbnails/interior.jpg',
      href: '/generate/interior'
    },
    {
      title: 'Render Enhancer ✨',
      image: '/thumbnails/enhancer.jpg',
      href: '/generate/enhance'
    },
    {
      title: 'Landscape AI',
      image: '/thumbnails/landscape.jpg',
      href: '/generate/landscape'
    },
    {
      title: 'Video AI',
      image: '/thumbnails/video.jpg',
      href: '/generate/video'
    }
  ];

  return (
    <div className="grid grid-cols-5 gap-6">
      {tools.map((tool) => (
        <RenderingTool
          key={tool.title}
          {...tool}
        />
      ))}
    </div>
  );
} 