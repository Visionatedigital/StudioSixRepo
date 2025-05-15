'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import DashboardBanner from '@/app/dashboard/components/DashboardBanner';
import CommunityGallery from '@/app/dashboard/components/CommunityGallery';
import DashboardLayout from '@/components/DashboardLayout';

// Client component that uses search params
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const sessionRefreshed = searchParams.get('session_refreshed');
  const paymentStatus = searchParams.get('payment_status');

  useEffect(() => {
    if (sessionRefreshed === 'true') {
      toast.success('Session refreshed successfully');
    }
    if (paymentStatus === 'success') {
      toast.success('Payment successful!');
    }
    if (paymentStatus === 'cancelled') {
      toast.error('Payment cancelled.');
    }
  }, [sessionRefreshed, paymentStatus]);

  return (
    <DashboardLayout currentPage="Dashboard">
      {/* Main Content - Updated with better container styling */}
      <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8 w-full max-w-full overflow-x-hidden">
        {/* Banner Section */}
        <section className="w-full">
          <DashboardBanner />
        </section>

        {/* Community Gallery Section - Added width and overflow control */}
        <section className="w-full overflow-visible pb-16">
          <CommunityGallery />
        </section>
      </div>
    </DashboardLayout>
  );
}

// Page component with Suspense boundary
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
} 