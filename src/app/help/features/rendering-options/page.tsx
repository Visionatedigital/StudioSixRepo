import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function RenderingOptionsPage() {
  return (
    <HelpDetailLayout 
      title="Rendering Options" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Studio Six offers a range of rendering styles and settings to help you present your architectural designs in different ways. This guide explains the available rendering options and how to use them effectively for different purposes.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Rendering Styles</h2>
          
          <p className="mb-6">
            Studio Six provides several rendering styles, each with a distinct appearance and suitable for different presentation contexts:
          </p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Photorealistic</h3>
              <p className="mb-3">
                The most detailed and lifelike rendering style, ideal for final presentations and client deliverables.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Characteristics:</strong> High level of detail, realistic lighting, accurate material representation</li>
                <li><strong>Best for:</strong> Client presentations, marketing materials, final design approval</li>
                <li><strong>Credit cost:</strong> Highest (10-20 credits depending on resolution)</li>
              </ul>
              <div className="bg-gray-100 h-[200px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Photorealistic rendering example image</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Concept Sketch</h3>
              <p className="mb-3">
                A drawing-like style that conveys architectural ideas while maintaining a hand-drawn quality, perfect for early design phases.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Characteristics:</strong> Line work, gentle shading, sketch-like appearance</li>
                <li><strong>Best for:</strong> Early design concepts, quick iterations, design development</li>
                <li><strong>Credit cost:</strong> Low (3-5 credits)</li>
              </ul>
              <div className="bg-gray-100 h-[200px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Concept sketch example image</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Technical Visualization</h3>
              <p className="mb-3">
                A clean, precise rendering style that emphasizes clarity of form and spatial relationships.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Characteristics:</strong> Clear lines, simplified materials, focus on spatial arrangement</li>
                <li><strong>Best for:</strong> Technical presentations, explaining spatial concepts, team collaboration</li>
                <li><strong>Credit cost:</strong> Medium (5-8 credits)</li>
              </ul>
              <div className="bg-gray-100 h-[200px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Technical visualization example image</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Stylized</h3>
              <p className="mb-3">
                An artistic interpretation that applies distinctive visual styles to your designs, from watercolor to abstract.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Characteristics:</strong> Artistic effects, creative interpretation, unique aesthetic</li>
                <li><strong>Best for:</strong> Creative presentations, design competitions, portfolio pieces</li>
                <li><strong>Credit cost:</strong> Medium-High (8-12 credits)</li>
              </ul>
              <div className="bg-gray-100 h-[200px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Stylized rendering example image</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Diagrammatic</h3>
              <p className="mb-3">
                A simplified rendering style that highlights functional aspects, circulation, and spatial organization.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Characteristics:</strong> Color-coded areas, simplified forms, emphasis on function</li>
                <li><strong>Best for:</strong> Explaining design concepts, showing functional relationships</li>
                <li><strong>Credit cost:</strong> Low (3-5 credits)</li>
              </ul>
              <div className="bg-gray-100 h-[200px] rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Diagrammatic rendering example image</p>
              </div>
            </div>
          </div>
        </section>

        <section id="step-by-step" className="mt-12">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Adjusting Rendering Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Accessing Rendering Options</h3>
              <p className="mb-4">
                You can adjust rendering settings at two points in the design process:
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li><strong>Before generation:</strong> In the initial design creation panel, click on "Rendering Options" to set your preferences before generating</li>
                <li><strong>After generation:</strong> Select an existing design and click "Re-render" to apply different rendering styles to the same design</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Available Settings</h3>
              <p className="mb-4">
                Beyond the main rendering style, you can adjust these parameters:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  <strong>Lighting scenario:</strong> Choose from options like "Morning", "Midday", "Evening", "Night", "Studio", or "Custom"
                </li>
                <li>
                  <strong>Lighting intensity:</strong> Adjust the overall brightness of the scene
                </li>
                <li>
                  <strong>Color temperature:</strong> Make the scene warmer (yellowish) or cooler (bluish)
                </li>
                <li>
                  <strong>Material fidelity:</strong> Control how detailed and realistic materials appear
                </li>
                <li>
                  <strong>Depth of field:</strong> Create a focus effect with the background slightly blurred
                </li>
                <li>
                  <strong>Atmosphere:</strong> Add effects like slight fog, dust particles, or rain
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Saving and Reusing Settings</h3>
              <p className="mb-4">
                You can save your favorite rendering configurations for future use:
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Set up your rendering parameters as desired</li>
                <li>Click the "Save Settings" button at the bottom of the rendering panel</li>
                <li>Name your preset (e.g., "Client Presentation" or "Concept Review")</li>
                <li>Access saved presets from the "Presets" dropdown in the rendering panel</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Different Situations</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">For Concept Development</h3>
              <p>
                Use the Concept Sketch or Diagrammatic styles during early design phases. These styles render quickly, consume fewer credits, and focus on communicating the essential ideas rather than details.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">For Client Presentations</h3>
              <p>
                Choose Photorealistic rendering with carefully considered lighting scenarios that highlight the best aspects of your design. Morning or evening lighting often creates more dramatic and appealing shadows.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">For Technical Reviews</h3>
              <p>
                Use Technical Visualization with midday lighting for maximum clarity. This combination ensures all elements are clearly visible and spatial relationships are easy to understand.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">For Portfolio Pieces</h3>
              <p>
                Consider Stylized renderings that make your work stand out. Alternatively, use Photorealistic rendering with dramatic lighting and depth of field to create visually striking images.
              </p>
            </li>
          </ul>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Pro Tip</h3>
            <p>
              Generate the same design with different rendering styles to tell a complete story. Use sketches to show the design process, technical visualizations to explain function, and photorealistic renderings for the final emotional impact.
            </p>
          </div>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Features</h2>
          
          <p className="mb-4">
            Enhance your rendering workflow with these related features:
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/features/image-resolution" className="text-[#814ADA] hover:underline">
                Image resolution: Understand resolution options for different output needs
              </Link>
            </li>
            <li>
              <Link href="/help/features/video-generation" className="text-[#814ADA] hover:underline">
                Video generation: Create walkthrough videos with your chosen rendering style
              </Link>
            </li>
            <li>
              <Link href="/help/features/ai-design-assistant" className="text-[#814ADA] hover:underline">
                AI Design Assistant: Generate designs to apply rendering styles to
              </Link>
            </li>
            <li>
              <Link href="/help/features/optimizing-workflow" className="text-[#814ADA] hover:underline">
                Optimizing workflow: Streamline your rendering process
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 