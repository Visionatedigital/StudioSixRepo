import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Image from 'next/image';
import Link from 'next/link';

export default function FirstDesignPage() {
  return (
    <HelpDetailLayout 
      title="Creating your first design" 
      category="Getting Started"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Studio Six makes it easy to create beautiful architectural designs using AI. This guide will walk you through creating your first design from scratch, explaining each step of the process.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Getting Started</h2>
          <p className="mb-4">
            Before you begin, make sure you have:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Created an account and logged in to Studio Six</li>
            <li>Credits available in your account (new users receive complimentary credits)</li>
            <li>A basic idea of what you want to design</li>
          </ul>

          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Pro Tip</h3>
            <p>
              Start with simpler designs while learning the platform. As you become more comfortable, you can tackle more complex projects.
            </p>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Step-by-Step Guide</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">1. Navigate to the Design Dashboard</h3>
              <p className="mb-2">
                After logging in, click on the "Create New" button in the top right corner of your dashboard.
              </p>
              {/* Placeholder for screenshot */}
              <div className="w-full h-[300px] bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <p className="text-gray-500">Screenshot: Dashboard with Create New button</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">2. Choose Your Design Type</h3>
              <p className="mb-2">
                Select the type of design you want to create. Options include:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Interior Space</li>
                <li>Exterior Building</li>
                <li>Landscape Design</li>
                <li>Floor Plan</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">3. Describe Your Vision</h3>
              <p className="mb-2">
                In the text prompt field, describe what you want to create. Be as specific as possible about the style, materials, colors, and spatial requirements.
              </p>
              
              <div className="bg-[#F6F8FA] p-4 rounded-lg border border-[#E0DAF3] mb-4">
                <h4 className="font-medium text-[#1B1464] mb-1">Example prompt:</h4>
                <p className="italic">
                  "Modern minimalist living room with large windows, light wood flooring, white walls, and Scandinavian furniture. The space should feel airy and bright with plants as accents."
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">4. Adjust Settings</h3>
              <p className="mb-2">
                Set your preferred dimensions, style preferences, and any other parameters available for your design type.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">5. Generate Your Design</h3>
              <p className="mb-4">
                Click the "Generate" button to create your design. This process typically takes 30-60 seconds depending on the complexity.
              </p>
              <p className="mb-2">
                Note that each generation will consume credits from your account.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">6. Review and Refine</h3>
              <p className="mb-2">
                Once generated, you can:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Save the design to your projects</li>
                <li>Download the image in various formats</li>
                <li>Make adjustments and regenerate</li>
                <li>Create variations based on the current design</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips & Tricks</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Be Specific in Your Prompts</h3>
              <p>
                The more detailed your description, the closer the result will match your vision. Include materials, colors, lighting, and style references.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use Reference Images</h3>
              <p>
                When available, upload reference images to help guide the AI in understanding your desired aesthetic.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Iterate Multiple Times</h3>
              <p>
                Don't expect perfection on the first try. Use each generation as a stepping stone, refining your prompt based on the results.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Save Favorite Prompts</h3>
              <p>
                Keep a record of prompts that produce good results so you can reuse and modify them for future projects.
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Next Steps</h2>
          <p className="mb-4">
            Now that you've created your first design, you might want to explore:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/features/credits" className="text-[#814ADA] hover:underline">
                Understanding credits and how they work
              </Link>
            </li>
            <li>
              <Link href="/help/features/advanced-prompting" className="text-[#814ADA] hover:underline">
                Advanced prompting techniques
              </Link>
            </li>
            <li>
              <Link href="/help/features/editing-designs" className="text-[#814ADA] hover:underline">
                Editing and refining your designs
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 