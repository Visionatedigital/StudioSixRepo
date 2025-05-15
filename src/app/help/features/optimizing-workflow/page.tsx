import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function OptimizingWorkflowPage() {
  return (
    <HelpDetailLayout 
      title="Optimizing Your Workflow" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Learn how to maximize your productivity in Studio Six with workflow optimization strategies. This guide will help you streamline your design process and get the most out of the platform's features.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Organizing Your Workspace</h2>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Project Organization</h3>
          <p className="mb-4">
            A well-organized workspace helps you maintain focus and efficiency:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Create dedicated projects for each client or concept</li>
            <li>Use descriptive names for your designs</li>
            <li>Archive completed projects to reduce clutter</li>
            <li>Utilize tags for easy filtering and searching</li>
          </ul>

          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Creating Project Templates</h3>
          <p className="mb-4">
            For recurring project types, create templates to maintain consistency and save time:
          </p>
          <ol className="list-decimal pl-5 mb-6 space-y-2">
            <li>Create a design with your preferred settings and style</li>
            <li>Click the "Save as Template" option</li>
            <li>Name your template and add a description</li>
            <li>Access your templates when starting new projects</li>
          </ol>

          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Pro Tip</h3>
            <p>
              Create separate templates for different architectural styles or room types to quickly start new designs with consistent aesthetics.
            </p>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Efficiency Techniques</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Prompt Libraries</h3>
              <p className="mb-4">
                Building a library of effective prompts can significantly speed up your workflow:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Save successful prompts in a dedicated section</li>
                <li>Categorize prompts by style, room type, or project category</li>
                <li>Create modular prompt components you can mix and match</li>
                <li>Document which prompts work best for specific outcomes</li>
              </ul>
              <p className="mb-4">
                Access your prompt library from the dashboard by clicking on "My Prompts" in the sidebar.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Batch Processing</h3>
              <p className="mb-4">
                Generate multiple designs in batches to save time:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Use the "Batch Generate" feature for creating variations</li>
                <li>Queue up to 10 designs at once</li>
                <li>Set up batches before breaks to maximize productivity</li>
                <li>Review and refine completed batches all at once</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Keyboard Shortcuts</h3>
              <p className="mb-4">
                Master these keyboard shortcuts to navigate the platform more efficiently:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-[#1B1464] mb-2">Navigation</h4>
                  <ul className="space-y-1">
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+H</kbd> - Dashboard home</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+N</kbd> - New design</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+P</kbd> - Projects view</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+S</kbd> - Save current design</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-[#1B1464] mb-2">Design Tools</h4>
                  <ul className="space-y-1">
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+D</kbd> - Duplicate design</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+Z</kbd> - Undo last action</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+E</kbd> - Export options</li>
                    <li><kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Ctrl+G</kbd> - Generate design</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Advanced Workflow Tips</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use Version Control</h3>
              <p>
                Enable automatic versioning in your account settings to track design iterations. This allows you to revert to previous versions if needed without creating duplicate files.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Integrate with Cloud Storage</h3>
              <p>
                Connect Studio Six to your Google Drive, Dropbox, or OneDrive for seamless file management and automatic backups of your designs.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Schedule Generation Times</h3>
              <p>
                Use the scheduling feature to run complex generations during off-hours, ensuring they're ready when you start work the next day.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Create Custom Workflows</h3>
              <p>
                In the Professional and Enterprise plans, you can create custom workflows that automate sequences of design operations, such as generating multiple views of the same space.
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Team Collaboration</h2>
          
          <p className="mb-6">
            For users on team plans, optimize your collaborative workflow:
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Role Assignment</h3>
              <p className="mb-4">
                Assign specific roles to team members to streamline collaboration:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Admin:</strong> Manages account settings and billing</li>
                <li><strong>Project Manager:</strong> Organizes projects and assigns tasks</li>
                <li><strong>Designer:</strong> Creates and refines designs</li>
                <li><strong>Viewer:</strong> Can view and comment but not edit</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Feedback System</h3>
              <p className="mb-4">
                Streamline feedback collection:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Use the built-in annotation tools for specific feedback</li>
                <li>Set up review stages for each project</li>
                <li>Schedule automated reminders for feedback deadlines</li>
                <li>Create shareable links for external stakeholders</li>
              </ul>
            </div>

            <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Using AI Assistants</h3>
              <p className="mb-4">
                The Enterprise plan includes AI workflow assistants that can:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Suggest process improvements based on your team's usage patterns</li>
                <li>Automate routine tasks like file organization</li>
                <li>Generate progress reports for stakeholders</li>
                <li>Provide insights on resource utilization</li>
              </ul>
              <p>
                Enable AI assistants in your team settings to start receiving customized workflow recommendations.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[#E0DAF3]">
          <p className="text-gray-600">
            Remember that improving your workflow is an ongoing process. We recommend reviewing your processes quarterly to identify new optimization opportunities and take advantage of new platform features.
          </p>
        </div>
      </div>
    </HelpDetailLayout>
  );
} 