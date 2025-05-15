import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function RenderingFailuresPage() {
  return (
    <HelpDetailLayout 
      title="Troubleshooting Rendering Failures" 
      category="Troubleshooting"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            If you're experiencing issues with renderings not completing successfully, this guide will help you identify and resolve common rendering problems in Studio Six.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Common Causes of Rendering Failures</h2>
          <p className="mb-4">
            Understand the most frequent reasons why renderings might fail and how to address them.
          </p>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Troubleshooting Steps</h2>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Prevention Tips</h2>
          
          <ul className="space-y-4 mb-6">
            {/* Tips will be added in a future update */}
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Information</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/troubleshooting/common-issues" className="text-[#814ADA] hover:underline">
                Common issues: Solutions to other frequent problems
              </Link>
            </li>
            <li>
              <Link href="/help/troubleshooting/performance-optimization" className="text-[#814ADA] hover:underline">
                Performance optimization: Tips to improve rendering performance
              </Link>
            </li>
            <li>
              <Link href="/help/features/rendering-options" className="text-[#814ADA] hover:underline">
                Rendering options: Learn about different rendering settings
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 