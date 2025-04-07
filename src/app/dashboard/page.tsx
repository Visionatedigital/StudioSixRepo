'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardBanner from './components/DashboardBanner';
import CommunityGallery from './components/CommunityGallery';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();

  useEffect(() => {
    const sessionRefresh = searchParams.get('session_refresh');
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (sessionRefresh === 'true') {
      // Update the session to reflect the new subscription status
      update();
      
      // Show success message if payment was completed
      if (success === 'payment_completed') {
        toast.success('Payment successful! Your account has been updated.');
      }
      
      // Remove the query parameters from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('session_refresh');
      newUrl.searchParams.delete('success');
      router.replace(newUrl.pathname + newUrl.search);
    }

    if (error) {
      // Show error message
      toast.error(`Payment error: ${error.replace(/_/g, ' ')}`);
      
      // Remove the error parameter from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, update, router]);

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