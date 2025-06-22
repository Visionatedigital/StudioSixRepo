'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MoodBoard from '@/components/visual-planning/MoodBoard';
import ColorPaletteGenerator from '@/components/visual-planning/ColorPaletteGenerator';
import MaterialTextureBoard from '@/components/visual-planning/MaterialTextureBoard';

const TABS = [
  { label: 'Mood Boards', key: 'mood', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 4v4a2 2 0 0 0 2 2h4"/></svg>
  ) },
  { label: 'Color Palette Generator', key: 'palette', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="15.5" cy="10.5" r="1"/><circle cx="12" cy="14" r="1"/></svg>
  ) },
  { label: 'Material/Texture Library', key: 'material', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
  ) },
];

export default function VisualPlanningPage() {
  const [activeTab, setActiveTab] = useState('mood');

  return (
    <DashboardLayout currentPage="Visual Planning">
      <div className="px-6 py-8">
        <div className="w-full flex justify-center">
          <div className="flex bg-white px-4 py-2 rounded-xl shadow-sm">
            {TABS.map((tab, idx) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium text-base focus:outline-none
                  ${activeTab === tab.key
                    ? 'bg-white shadow border border-gray-200 text-black z-10'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                `}
                style={{ marginRight: idx !== TABS.length - 1 ? 16 : 0 }}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="flex items-center">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          {activeTab === 'mood' && (
            <MoodBoard />
          )}
          {activeTab === 'palette' && (
            <ColorPaletteGenerator />
          )}
          {activeTab === 'material' && (
            <MaterialTextureBoard />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 