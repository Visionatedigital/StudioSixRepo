'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';

export default function PromptPage() {
  return (
    <DashboardLayout currentPage="Prompt">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Coming Soon Section */}
          <div className="flex flex-col items-center mt-48">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#FF3366] via-[#814ADA] to-[#4F46E5] text-transparent bg-clip-text flex items-center justify-center gap-3">
                AI Design Assistant
                <Icon name="sparkles" className="w-8 h-8 text-[#814ADA]" />
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Our AI Design Assistant is coming soon! This powerful tool will help you create
                stunning architectural designs with intelligent assistance.
              </p>
            </div>
            <div className="flex items-center px-6 py-3 bg-[#814ADA]/10 rounded-lg mt-8">
              <span className="text-[#814ADA] font-medium">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 