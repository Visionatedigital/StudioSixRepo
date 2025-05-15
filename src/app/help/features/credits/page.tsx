import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function CreditsPage() {
  return (
    <HelpDetailLayout 
      title="Understanding credits" 
      category="Features & Tools"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Studio Six uses a credit system to manage usage of our AI design capabilities. This guide explains how credits work, how they are consumed, and how to manage them effectively.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Credit Basics</h2>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">What are credits?</h3>
          <p className="mb-4">
            Credits are the currency used within Studio Six to generate AI designs. Each design operation consumes a specific number of credits depending on the complexity, resolution, and other factors.
          </p>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">How to obtain credits</h3>
          <p className="mb-4">
            Credits can be obtained in several ways:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Free credits when you create a new account</li>
            <li>Monthly credit allocations with subscription plans</li>
            <li>One-time credit purchases</li>
            <li>Special promotions and referral bonuses</li>
          </ul>

          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">💡 Good to Know</h3>
            <p>
              Subscription credits are added to your account automatically at the beginning of each billing cycle. Unused credits from subscription plans expire at the end of each month, while purchased credits never expire.
            </p>
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">How Credits Are Consumed</h2>
          
          <p className="mb-6">
            Different features consume different amounts of credits. Here's a breakdown of the main operations and their credit costs:
          </p>
          
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-[#E0DAF3] rounded-lg">
              <thead className="bg-[#F6F8FA]">
                <tr>
                  <th className="py-3 px-4 text-left text-[#1B1464] font-semibold border-b border-[#E0DAF3]">Operation</th>
                  <th className="py-3 px-4 text-left text-[#1B1464] font-semibold border-b border-[#E0DAF3]">Credit Cost</th>
                  <th className="py-3 px-4 text-left text-[#1B1464] font-semibold border-b border-[#E0DAF3]">Factors Affecting Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Standard Design Generation</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">5-10 credits</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Resolution, complexity</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">High-Resolution Design</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">15-25 credits</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Output size, detail level</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Variations of Existing Design</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">3-8 credits</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Number of variations, resolution</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Style Transfer</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">8-12 credits</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Resolution, complexity of style</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Floor Plan Generation</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">10-15 credits</td>
                  <td className="py-3 px-4 border-b border-[#E0DAF3]">Size of space, detail level</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">3D Model Export</td>
                  <td className="py-3 px-4">20-35 credits</td>
                  <td className="py-3 px-4">Format type, model complexity</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Resolution Settings</h3>
          <p className="mb-4">
            Higher resolution designs consume more credits but provide more detailed results. You can adjust resolution settings before generating to control credit consumption:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Standard (1024×1024)</strong>: 5-10 credits</li>
            <li><strong>High (2048×2048)</strong>: 15-20 credits</li>
            <li><strong>Ultra (4096×4096)</strong>: 25-35 credits</li>
          </ul>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips for Efficient Credit Usage</h2>
          
          <ul className="space-y-4 mb-6">
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Start with Lower Resolutions</h3>
              <p>
                Use standard resolution for initial designs and iterations. Only increase resolution for final versions that you plan to save or export.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use Variations Strategically</h3>
              <p>
                Generating variations of an existing design costs fewer credits than creating entirely new designs. Use this to refine a design you're already satisfied with.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Refine Your Prompts</h3>
              <p>
                Well-crafted prompts produce better results on the first try, reducing the need for multiple generations and saving credits.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Use the Preview Option</h3>
              <p>
                For certain operations, a preview option is available that consumes fewer credits but gives you a good idea of what the final result will look like.
              </p>
            </li>
            
            <li className="bg-white p-4 rounded-lg border border-[#E0DAF3]">
              <h3 className="text-lg font-semibold text-[#1B1464] mb-1">Choose the Right Subscription</h3>
              <p>
                If you use Studio Six regularly, a subscription plan usually provides better value than purchasing credits individually.
              </p>
            </li>
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Managing Your Credits</h2>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Viewing your balance</h3>
          <p className="mb-4">
            You can view your current credit balance in the top-right corner of the dashboard or in your account settings under the "Credits & Billing" section.
          </p>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Credit history</h3>
          <p className="mb-4">
            Your credit history shows all credit transactions, including:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>Credits earned through subscriptions</li>
            <li>Credits purchased</li>
            <li>Credits consumed by design operations</li>
            <li>Credits earned through promotions or referrals</li>
          </ul>
          
          <p className="mb-4">
            You can access your credit history in your account settings under "Credits & Billing" → "Credit History."
          </p>
          
          <h3 className="text-xl font-semibold text-[#1B1464] mb-3">Purchasing additional credits</h3>
          <p className="mb-4">
            To purchase additional credits:
          </p>
          <ol className="list-decimal pl-5 mb-6 space-y-2">
            <li>Go to your account settings</li>
            <li>Navigate to "Credits & Billing"</li>
            <li>Click on "Purchase Credits"</li>
            <li>Select the credit package you want to purchase</li>
            <li>Complete the payment process</li>
          </ol>
          
          <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3] mb-6">
            <h3 className="text-lg font-semibold text-[#1B1464] mb-2">Note</h3>
            <p>
              Larger credit packages typically offer better value, with bonus credits added to larger purchases.
            </p>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[#E0DAF3]">
          <p className="text-gray-600 italic">
            Credit costs are subject to change as we optimize our AI systems. Check our <Link href="/pricing" className="text-[#814ADA] hover:underline">pricing page</Link> for the most up-to-date information.
          </p>
        </div>
      </div>
    </HelpDetailLayout>
  );
} 