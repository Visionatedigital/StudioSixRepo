import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function AIDesignAssistantPage() {
  return (
    <HelpDetailLayout 
      title="AI Design Assistant" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            The Studio Six AI Design Assistant is a powerful tool that helps architects and designers create, refine, and visualize architectural concepts quickly and efficiently. This guide explains how to use the AI assistant to its full potential and get the most out of its capabilities.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Key Features</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Natural Language Prompting</h3>
              <p className="mb-4">
                Describe your architectural vision in plain language, and the AI will interpret your requirements to generate matching designs. The more detailed your description, the better the results.
              </p>
              <div className="bg-[#F6F8FA] p-4 rounded-lg border border-[#E0DAF3] mb-4">
                <h4 className="font-medium text-[#1B1464] mb-1">Example prompt:</h4>
                <p className="italic">
                  "A modern minimalist kitchen with an island, white cabinetry, marble countertops, and large windows that let in natural light. The space should have wooden flooring and pendant lights above the island."
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Style Guidance</h3>
              <p className="mb-4">
                The AI assistant can generate designs in various architectural styles, from contemporary and minimalist to classical and traditional. Specify your preferred style in your prompt for more targeted results.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Modern</li>
                <li>Minimalist</li>
                <li>Industrial</li>
                <li>Scandinavian</li>
                <li>Mid-century modern</li>
                <li>Traditional</li>
                <li>Mediterranean</li>
                <li>Art Deco</li>
                <li>And many more...</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Design Variations</h3>
              <p className="mb-4">
                Once you've generated an initial design, you can create variations to explore different interpretations of your requirements. This helps you discover options you might not have considered.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Interactive Refinement</h3>
              <p className="mb-4">
                The assistant learns from your feedback. You can iteratively refine your design by adding more specific instructions based on the generated results.
              </p>
            </div>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Using the AI Design Assistant</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">1. Accessing the Assistant</h3>
              <p className="mb-4">
                From your dashboard, click on "New Design" and select "AI Assistant" from the design tools menu. This will open the AI assistant interface.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">2. Crafting Your Prompt</h3>
              <p className="mb-4">
                In the prompt field, describe your design requirements in detail. Include information about:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Space type (kitchen, living room, bedroom, etc.)</li>
                <li>Architectural style</li>
                <li>Materials and colors</li>
                <li>Furniture and fixtures</li>
                <li>Lighting conditions</li>
                <li>Spatial requirements</li>
                <li>Mood or atmosphere</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">3. Setting Parameters</h3>
              <p className="mb-4">
                Adjust the available parameters to guide the AI:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>Style Strength:</strong> How closely to adhere to the specified style</li>
                <li><strong>Creativity Level:</strong> How much creative freedom the AI has</li>
                <li><strong>View Type:</strong> Perspective, elevation, or plan view</li>
                <li><strong>Resolution:</strong> Image quality (higher consumes more credits)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">4. Generating Designs</h3>
              <p className="mb-4">
                Click "Generate" to create your design. The AI will process your request and produce a visualization based on your prompt and parameters. This typically takes 30-60 seconds.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">5. Refining Your Design</h3>
              <p className="mb-4">
                Once the initial design is generated, you can:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>Create variations:</strong> Generate alternative versions based on the current design</li>
                <li><strong>Edit prompt:</strong> Modify your description to refine specific aspects</li>
                <li><strong>Adjust parameters:</strong> Change settings for different results</li>
                <li><strong>Save design:</strong> Store the design in your project library</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Effective Results</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Be Specific and Detailed</h3>
              <p>
                The more specific your prompt, the better the results. Instead of "modern kitchen," try "modern kitchen with white cabinets, marble island, wooden flooring, and large windows."
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Reference Specific Materials</h3>
              <p>
                Mention specific materials like "walnut flooring," "brushed brass fixtures," or "Carrara marble countertops" for more accurate results.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Describe Lighting Conditions</h3>
              <p>
                Specifying lighting (e.g., "natural light through floor-to-ceiling windows" or "warm ambient lighting with accent spotlights") dramatically improves the atmosphere of generated designs.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use Reference Images</h3>
              <p>
                Upload reference images alongside your prompt to help the AI understand your vision better. This works particularly well for specific styles or unique design elements.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Iterate Progressively</h3>
              <p>
                Start with a basic prompt, then refine it based on the results you get. Each iteration brings you closer to your ideal design.
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Enhancing Your Designs</h2>
          
          <p className="mb-6">
            After generating your design with the AI assistant, you can further enhance it using these Studio Six features:
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/features/rendering-options" className="text-[#814ADA] hover:underline">
                Rendering options: Explore different rendering styles and settings
              </Link>
            </li>
            <li>
              <Link href="/help/features/image-resolution" className="text-[#814ADA] hover:underline">
                Image resolution: Understand resolution options for different needs
              </Link>
            </li>
            <li>
              <Link href="/help/features/video-generation" className="text-[#814ADA] hover:underline">
                Video generation: Create walkthrough videos of your designs
              </Link>
            </li>
            <li>
              <Link href="/help/features/optimizing-workflow" className="text-[#814ADA] hover:underline">
                Optimizing workflow: Streamline your design process
              </Link>
            </li>
          </ul>

          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mt-8 mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Pro Tip: Prompt Library</h3>
            <p className="mb-4">
              Save your most successful prompts in the prompt library for future use. This builds a personal collection of prompts that produce great results for your specific design needs.
            </p>
            <p>
              Access your prompt library from the dashboard by clicking on "My Prompts" in the sidebar.
            </p>
          </div>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 