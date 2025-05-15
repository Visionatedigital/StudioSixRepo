import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function AccountSetupPage() {
  return (
    <HelpDetailLayout 
      title="Account setup" 
      category="Account"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Setting up your Studio Six account properly ensures you get the most out of our architectural AI platform. This guide will walk you through the essential steps to configure your profile, preferences, and notification settings.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Initial Account Setup</h2>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Creating your account</h3>
          <p className="mb-4">
            If you haven't already created an account, you can sign up using:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Email and password</li>
            <li>Google account</li>
            <li>Apple ID</li>
          </ul>
          
          <p className="mb-4">
            During signup, you'll be asked to verify your email address. Make sure to check your inbox (and spam folder) for the verification email.
          </p>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Choosing a subscription plan</h3>
          <p className="mb-4">
            You can start with our free tier to explore basic features, but for full access to Studio Six's capabilities, we offer several subscription plans:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Free Tier</strong>: Limited access with a small number of credits to try the platform</li>
            <li><strong>Basic</strong>: Good for occasional use with a moderate monthly credit allocation</li>
            <li><strong>Professional</strong>: Ideal for regular users with more credits and advanced features</li>
            <li><strong>Enterprise</strong>: For teams and businesses with custom credit allocations and priority support</li>
          </ul>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Pro Tip</h3>
            <p>
              You can start with a lower-tier plan and upgrade later as your needs grow. We prorate charges when you upgrade mid-cycle.
            </p>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Setting Up Your Profile</h2>
          
          <p className="mb-4">
            A complete profile helps personalize your experience and makes collaboration easier if you're working with a team.
          </p>
          
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">1. Access Your Profile Settings</h3>
              <p className="mb-4">
                Click on your avatar in the top-right corner of the dashboard and select "Profile Settings" from the dropdown menu.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">2. Add a Profile Picture</h3>
              <p className="mb-4">
                Upload a professional photo or avatar by clicking on the profile picture placeholder and selecting an image from your device.
              </p>
              <p className="mb-4">
                Recommended image specifications:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Square format (1:1 ratio)</li>
                <li>Minimum resolution: 400×400 pixels</li>
                <li>Maximum file size: 5MB</li>
                <li>Supported formats: JPG, PNG, GIF</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">3. Complete Your Bio</h3>
              <p className="mb-4">
                Add information about yourself, including:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Full name</li>
                <li>Job title or profession</li>
                <li>Company or organization (if applicable)</li>
                <li>Professional bio (short paragraph about your experience and interests)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">4. Add Professional Links</h3>
              <p className="mb-4">
                Connect your professional profiles by adding links to:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Personal or company website</li>
                <li>LinkedIn profile</li>
                <li>Portfolio links</li>
                <li>Social media profiles</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="customizing-settings" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Customizing Your Preferences</h2>
          
          <p className="mb-6">
            Studio Six offers several customization options to tailor the platform to your workflow.
          </p>
          
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Interface Settings</h3>
              <p className="mb-4">
                Customize your workspace with these options:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Theme</strong>: Choose between Light, Dark, or System Default</li>
                <li><strong>Dashboard Layout</strong>: Grid view or List view for your projects</li>
                <li><strong>Default Sorting</strong>: By date created, last modified, or alphabetically</li>
                <li><strong>Thumbnail Size</strong>: Small, Medium, or Large</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Creation Defaults</h3>
              <p className="mb-4">
                Set your preferred default settings for new designs:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Default Resolution</strong>: Choose your preferred starting resolution</li>
                <li><strong>Default Style</strong>: Select a go-to architectural style for new projects</li>
                <li><strong>Auto-save Frequency</strong>: How often your work is automatically saved</li>
                <li><strong>Default Project Privacy</strong>: Public, Private, or Team Only</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="notification-settings" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Notification Settings</h2>
          
          <p className="mb-6">
            Control which notifications you receive and how they're delivered.
          </p>
          
          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">Email Notifications</h3>
              <p className="mb-4">
                Configure which updates should be sent to your email:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Account Updates</strong>: Billing and subscription information</li>
                <li><strong>Generation Completions</strong>: Notifications when designs finish rendering</li>
                <li><strong>Comments and Feedback</strong>: When others comment on your shared designs</li>
                <li><strong>Product Updates</strong>: New features and improvements</li>
                <li><strong>Tips and Tutorials</strong>: Educational content to improve your skills</li>
                <li><strong>Promotional Emails</strong>: Special offers and discounts</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1B1464] mb-2">In-App Notifications</h3>
              <p className="mb-4">
                Set which alerts appear within the platform:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li><strong>Generation Completions</strong>: Alerts when designs are ready</li>
                <li><strong>Comments and Mentions</strong>: When you're tagged or your work receives comments</li>
                <li><strong>Credit Usage Alerts</strong>: Notifications when credits are running low</li>
                <li><strong>System Messages</strong>: Important platform updates and maintenance notices</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Important</h3>
            <p>
              While you can customize most notifications, some critical account and security notifications cannot be disabled to ensure you receive important information about your account.
            </p>
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Optimal Setup</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Enable Two-Factor Authentication</h3>
              <p>
                For enhanced security, enable two-factor authentication (2FA) in your account security settings. This adds an extra layer of protection to your account.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Connect Cloud Storage</h3>
              <p>
                Link your Google Drive, Dropbox, or OneDrive accounts for seamless file sharing and backup of your designs.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Create Project Templates</h3>
              <p>
                If you frequently work on similar projects, create and save templates to streamline your workflow and maintain consistency.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Add Payment Methods</h3>
              <p>
                Add a backup payment method to ensure uninterrupted service if your primary method fails during renewal.
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Next Steps</h2>
          <p className="mb-4">
            Now that your account is set up, you might want to explore:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/getting-started/first-design" className="text-[#814ADA] hover:underline">
                Creating your first design
              </Link>
            </li>
            <li>
              <Link href="/help/features/credits" className="text-[#814ADA] hover:underline">
                Understanding credits and how they work
              </Link>
            </li>
            <li>
              <Link href="/help/account/team-collaboration" className="text-[#814ADA] hover:underline">
                Setting up team collaboration
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 