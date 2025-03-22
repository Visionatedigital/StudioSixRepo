'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardBanner from './components/DashboardBanner';
import CommunityGallery from './components/CommunityGallery';

export default function DashboardPage() {
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