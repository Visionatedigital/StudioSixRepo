'use client';

import DashboardLayout from '@/components/DashboardLayout';
import PricingContent from './PricingContent';

export default function DashboardPricing() {
  return (
    <DashboardLayout currentPage="Pricing">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <PricingContent />
      </div>
    </DashboardLayout>
  );
} 