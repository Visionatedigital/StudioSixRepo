'use client';

import React from 'react';
import DashboardHero from './DashboardHero';
import RenderingTools from './RenderingTools';
import MostUsedItem from './MostUsedItem';
import CommunityGallery from './CommunityGallery';

export default function DashboardContent() {
  return (
    <div className="w-full h-[calc(100vh-6rem)] bg-[radial-gradient(18.31%_18.31%_at_50%_50%,#F0C6FF_0%,#F6F8FA_100%)] rounded-2xl overflow-hidden">
      <div className="p-5 flex flex-col gap-8">
        {/* New Dashboard Hero Section */}
        <DashboardHero />

        {/* Rendering Tools Section */}
        <RenderingTools />

        {/* Most Used Section */}
        <div className="flex flex-col gap-4">
          <h2 className="font-roboto font-medium text-xl text-[#1B1464]">
            Most Used
          </h2>
          <div className="flex flex-wrap gap-4">
            <MostUsedItem
              icon="edit"
              title="Edit"
              subtitle="Last edited 2h ago"
            />
            <MostUsedItem
              icon="edit"
              title="Generate Images"
              subtitle="Last edited 2h ago"
            />
            <MostUsedItem
              icon="video"
              title="Video Library"
              subtitle="Last edited 2h ago"
            />
            <MostUsedItem
              icon="video"
              title="Video Library"
              subtitle="Last edited 2h ago"
            />
          </div>
        </div>

        {/* Community Section */}
        <div className="flex flex-col gap-4">
          <h2 className="font-poppins font-bold text-xl text-[#1B1464]">
            Get inspired from Community
          </h2>
          <CommunityGallery />
        </div>
      </div>
    </div>
  );
} 