import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function VideoGenerationPage() {
  return (
    <HelpDetailLayout 
      title="Video Generation" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Studio Six allows you to create stunning architectural walkthrough videos from your designs. This guide explains how to use the video generation feature to create immersive videos that showcase your architectural concepts in motion.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Video Generation Capabilities</h2>
          
          <p className="mb-6">
            With Studio Six's video generation feature, you can create professional-quality architectural videos without specialized animation skills. The AI handles camera movement, lighting transitions, and scene composition automatically.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Available Video Types</h3>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  <strong>Walkthroughs:</strong> First-person perspective moving through your space
                </li>
                <li>
                  <strong>Flyovers:</strong> Aerial views moving around or above your design
                </li>
                <li>
                  <strong>Orbits:</strong> 360-degree rotation around a focal point of your design
                </li>
                <li>
                  <strong>Focus transitions:</strong> Moves between key points of interest in your design
                </li>
                <li>
                  <strong>Day-to-night transitions:</strong> Shows your design across different lighting conditions
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Video Specifications</h3>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>Duration:</strong> 10-60 seconds (adjustable)</li>
                <li><strong>Resolution:</strong> Up to 4K (3840 × 2160)</li>
                <li><strong>Frame rate:</strong> 30 fps</li>
                <li><strong>Output formats:</strong> MP4, MOV</li>
                <li><strong>Audio:</strong> Optional background music or ambient sounds</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Credit Requirements</h3>
              <p className="mb-4">
                Video generation requires more computational resources than still images, so it consumes more credits:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>15-second HD video:</strong> 25-35 credits</li>
                <li><strong>30-second HD video:</strong> 45-60 credits</li>
                <li><strong>15-second 4K video:</strong> 50-70 credits</li>
                <li><strong>30-second 4K video:</strong> 90-120 credits</li>
              </ul>
              <p className="text-gray-600 italic">
                Note: Credit costs may vary based on complexity and special effects.
              </p>
            </div>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Creating a Video Walkthrough</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">1. Start with a Design</h3>
              <p className="mb-4">
                Video generation works with your existing designs. You can:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Use a design you've already created</li>
                <li>Generate a new design specifically for video creation</li>
                <li>Import a 3D model (supported formats: OBJ, FBX, GLTF)</li>
              </ul>
              <p className="mb-4">
                For best results, designs should have complete spatial definition, including properly defined rooms, doorways, and circulation paths.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">2. Access Video Generation</h3>
              <p className="mb-4">
                From your dashboard:
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Select the design you want to create a video from</li>
                <li>Click the "Create Video" button in the top action bar</li>
                <li>This will open the video generation interface</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">3. Choose a Video Type</h3>
              <p className="mb-4">
                Select the type of video you want to create from the available options. Each type has a brief preview to show the typical camera movement pattern.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">4. Set the Path and Focal Points</h3>
              <p className="mb-4">
                Depending on the video type, you'll need to specify:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>For walkthroughs:</strong> Starting point, path waypoints, and ending point</li>
                <li><strong>For flyovers:</strong> Flight path and altitude</li>
                <li><strong>For orbits:</strong> Central focal point and orbit radius</li>
                <li><strong>For focus transitions:</strong> Multiple points of interest to transition between</li>
              </ul>
              <p className="mb-4">
                You can either:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Use AI-suggested paths based on your design's layout</li>
                <li>Manually place waypoints on your design to create a custom path</li>
                <li>Use a combination of both approaches</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">5. Adjust Video Settings</h3>
              <p className="mb-4">
                Configure the technical aspects of your video:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>Duration:</strong> How long the video should be</li>
                <li><strong>Resolution:</strong> Select from HD (1080p) to 4K options</li>
                <li><strong>Camera settings:</strong> Field of view, movement speed, etc.</li>
                <li><strong>Lighting:</strong> Choose from static or dynamic lighting options</li>
                <li><strong>Atmosphere:</strong> Add environmental effects like sun rays, mist, etc.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">6. Add Audio (Optional)</h3>
              <p className="mb-4">
                Enhance your video with audio elements:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li><strong>Background music:</strong> Choose from our royalty-free music library</li>
                <li><strong>Ambient sounds:</strong> Add environmental sounds matching your design</li>
                <li><strong>Custom audio:</strong> Upload your own audio track (Pro plans only)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">7. Generate Your Video</h3>
              <p className="mb-4">
                Once you've configured all settings:
              </p>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Review your settings in the summary panel</li>
                <li>Check the estimated credit cost</li>
                <li>Click "Generate Video" to start the process</li>
              </ol>
              <p className="mb-4">
                Video generation typically takes 5-15 minutes depending on length, complexity, and resolution. You'll receive a notification when your video is ready.
              </p>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Professional Videos</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Plan Your Camera Path</h3>
              <p>
                Think cinematically about your walkthrough. Start with an establishing shot that shows the overall space, then move through logical paths a person would take, highlighting key design features along the way.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Control Camera Speed</h3>
              <p>
                Slower camera movements typically look more professional than fast ones. Allow viewers time to take in the space—a common mistake is moving too quickly through the design.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use Natural Camera Height</h3>
              <p>
                For walkthrough videos, set the camera height to average eye level (about 5'6" or 168cm) for a realistic human perspective. Avoid positioning the camera too high or too low unless for specific effect.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Consider Lighting Transitions</h3>
              <p>
                Day-to-night transitions can add dramatic effect to showcase how your design looks under different lighting conditions. These work particularly well for exterior views and spaces with large windows.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Match Music to Design Style</h3>
              <p>
                Choose background music that complements the aesthetic of your design. For minimalist modern designs, consider ambient or minimalist music; for classical designs, classical music often works well.
              </p>
            </li>
          </ul>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Pro Tip: Credit-Efficient Strategy</h3>
            <p className="mb-4">
              To optimize credit usage, create a draft video at HD resolution and shorter duration first. Review it for camera path and pacing, then create your final version at higher resolution and length once you're satisfied with the general approach.
            </p>
          </div>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Video Post-Processing</h2>
          
          <p className="mb-6">
            After generating your video, you have several options:
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Download:</strong> Save the video file to your device</li>
            <li><strong>Share:</strong> Get a shareable link to send to clients or colleagues</li>
            <li><strong>Embed:</strong> Get an embed code to add the video to websites or presentations</li>
            <li><strong>Edit:</strong> Make adjustments and regenerate (will consume additional credits)</li>
          </ul>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Advanced Editing (Pro Plans)</h3>
            <p className="mb-4">
              Professional and Enterprise plan users can access additional post-processing features:
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Add text overlays and annotations</li>
              <li>Apply video filters and color grading</li>
              <li>Add transitions between multiple videos</li>
              <li>Create picture-in-picture effects</li>
              <li>Export in additional specialized formats</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[#E0DAF3]">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/features/ai-design-assistant" className="text-[#814ADA] hover:underline">
                AI Design Assistant: Create designs to use in your videos
              </Link>
            </li>
            <li>
              <Link href="/help/features/rendering-options" className="text-[#814ADA] hover:underline">
                Rendering options: Control the visual style of your videos
              </Link>
            </li>
            <li>
              <Link href="/help/features/credits" className="text-[#814ADA] hover:underline">
                Understanding credits: Learn about the cost of video generation
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </HelpDetailLayout>
  );
} 