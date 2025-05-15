import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function PerformanceOptimizationPage() {
  return (
    <HelpDetailLayout 
      title="Performance Optimization" 
      category="Troubleshooting"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            This guide provides tips and techniques to improve the performance of Studio Six on your device and make your workflow more efficient.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">System Requirements</h2>
          <p className="mb-4">
            Understanding the minimum and recommended system specifications for optimal performance.
          </p>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Optimization Techniques</h2>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Workflow Efficiency Tips</h2>
          
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
              <Link href="/help/troubleshooting/rendering-failures" className="text-[#814ADA] hover:underline">
                Rendering failures: What to do when your renders don't complete
              </Link>
            </li>
            <li>
              <Link href="/help/features/optimizing-workflow" className="text-[#814ADA] hover:underline">
                Optimizing workflow: Streamline your design process
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 