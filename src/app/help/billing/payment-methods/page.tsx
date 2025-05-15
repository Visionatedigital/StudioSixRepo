import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  return (
    <HelpDetailLayout 
      title="Payment Methods" 
      category="Billing & Subscriptions"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            This guide explains the different payment options available on Studio Six and how to manage your payment methods.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Available Payment Methods</h2>
          <p className="mb-4">
            Studio Six supports various payment methods to make it convenient for users worldwide.
          </p>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Managing Payment Methods</h2>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Troubleshooting Payment Issues</h2>
          
          <ul className="space-y-4 mb-6">
            {/* Tips will be added in a future update */}
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Information</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/billing/managing-subscription" className="text-[#814ADA] hover:underline">
                Managing your subscription: Learn how to upgrade, downgrade or cancel
              </Link>
            </li>
            <li>
              <Link href="/help/billing/educational-discounts" className="text-[#814ADA] hover:underline">
                Educational discounts: See if you qualify for our educational discount program
              </Link>
            </li>
            <li>
              <Link href="/help/features/credits" className="text-[#814ADA] hover:underline">
                Understanding credits: Learn how credits work with your subscription
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </HelpDetailLayout>
  );
} 