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
      {/* Main Content */}
      <div className="flex flex-col gap-8 p-8">
        {/* Banner Section */}
        <section>
          <DashboardBanner />
        </section>

        {/* Community Gallery Section */}
        <section>
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