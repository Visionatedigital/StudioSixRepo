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
      {/* Main Content - Responsive container styling */}
      <div className="flex flex-col gap-y-8 px-2 sm:px-4 md:px-8 w-full max-w-screen-xl mx-auto overflow-x-hidden">
        {/* Banner Section */}
        <section className="w-full">
          <DashboardBanner />
        </section>

        {/* Community Gallery Section - Responsive width and overflow control */}
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