import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function EducationalDiscountsPage() {
  return (
    <HelpDetailLayout 
      title="Educational Discounts" 
      category="Billing & Subscriptions"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            Studio Six offers special pricing for students, teachers, and educational institutions. This guide explains our educational discount program and how to apply.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Eligibility Requirements</h2>
          <p className="mb-4">
            Learn who qualifies for our educational discounts and what verification is required.
          </p>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">How to Apply</h2>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Program Benefits</h2>
          
          <ul className="space-y-4 mb-6">
            {/* Content will be added in a future update */}
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
              <Link href="/help/billing/payment-methods" className="text-[#814ADA] hover:underline">
                Payment methods: Understand the payment options available
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