import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function ImageResolutionPage() {
  return (
    <HelpDetailLayout 
      title="Understanding Image Resolution" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Image resolution is a critical factor in architectural visualization. This guide explains the different resolution options available in Studio Six, how they affect your designs, and when to use each option for optimal results.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Resolution Basics</h2>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">What is Resolution?</h3>
          <p className="mb-4">
            In digital imaging, resolution refers to the number of pixels that make up an image. Higher resolution means more pixels, resulting in more detail and larger file sizes.
          </p>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Important Terminology</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Pixels:</strong> The smallest units of a digital image.
              </li>
              <li>
                <strong>PPI (Pixels Per Inch):</strong> Measures the pixel density of an image.
              </li>
              <li>
                <strong>Aspect Ratio:</strong> The proportional relationship between width and height.
              </li>
            </ul>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Available Resolution Options</h2>
          
          <p className="mb-6">
            Studio Six offers several resolution options for different needs:
          </p>
          
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Standard (1024×1024)</strong>: Good for drafts and iterations</li>
            <li><strong>High (2048×2048)</strong>: Better for presentations</li>
            <li><strong>Ultra (4096×4096)</strong>: Best for final deliverables and prints</li>
            <li><strong>Custom</strong>: Available for specific requirements (Pro plans only)</li>
          </ul>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Choosing Resolution</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Start Low, Finish High</h3>
              <p>
                Use standard resolution for initial designs, then increase for final versions.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Consider Credit Usage</h3>
              <p>
                Higher resolutions use more credits - budget accordingly.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Match to Output</h3>
              <p>
                Choose resolution based on how the image will be used (web, print, etc).
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Information</h2>
          
          <Link href="/help/features/credits" className="text-[#814ADA] hover:underline block mb-2">
            Understanding credits and cost implications
          </Link>
          <Link href="/help/features/optimizing-workflow" className="text-[#814ADA] hover:underline block">
            Optimizing your workflow with resolution strategies
          </Link>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 