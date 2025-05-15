import React from 'react';
import HelpDetailLayout from '../../HelpDetailLayout';
import Link from 'next/link';

export default function ManagingSubscriptionPage() {
  return (
    <HelpDetailLayout 
      title="Managing Your Subscription" 
      category="Billing & Subscriptions"
    >
      <div className="prose max-w-none">
        <section id="overview">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Overview</h2>
          <p className="mb-4">
            This guide explains how to manage your Studio Six subscription, including upgrading, downgrading, and cancellation processes.
          </p>
        </section>

        <section id="getting-started" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Understanding Your Subscription</h2>
          <p className="mb-4">
            Studio Six offers several subscription tiers designed to fit different needs and budgets. This section provides information about managing your current plan.
          </p>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="step-by-step" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Subscription Management</h2>
          
          <div className="space-y-6">
            {/* Content will be added in a future update */}
          </div>
        </section>

        <section id="tips-tricks" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Tips & Best Practices</h2>
          
          <ul className="space-y-4 mb-6">
            {/* Tips will be added in a future update */}
          </ul>
        </section>

        <section id="related-articles" className="mt-8">
          <h2 className="text-2xl font-bold text-[#1B1464] mb-4">Related Information</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/help/billing/payment-methods" className="text-[#814ADA] hover:underline">
                Payment methods: Understand the payment options available
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