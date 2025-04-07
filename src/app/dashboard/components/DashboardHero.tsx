'use client';

import React from 'react';
import Image from 'next/image';

interface Achievement {
  title: string;
  emoji: string;
  earnedAt: string;
}

const RecentAchievement = ({ achievement }: { achievement: Achievement }) => (
  <div className="flex items-center gap-2 bg-white/50 rounded-lg p-2 backdrop-blur-sm">
    <span className="text-2xl">{achievement.emoji}</span>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-[#1B1464]">{achievement.title}</span>
      <span className="text-xs text-[#6D758F]">{achievement.earnedAt}</span>
    </div>
  </div>
);

export default function DashboardHero() {
  const recentAchievements: Achievement[] = [
    {
      title: "Classical Master",
      emoji: "🏛️",
      earnedAt: "Today"
    },
    {
      title: "Sustainable Sage",
      emoji: "🌍",
      earnedAt: "Yesterday"
    },
    {
      title: "Light & Shadow Sage",
      emoji: "🌓",
      earnedAt: "2 days ago"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
      <div className="flex items-start gap-8">
        {/* Left: Level Badge */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-24">
            <Image
              src="/level-icons/level-2.svg"
              alt="Level 2 Badge"
              width={96}
              height={96}
              className="w-full h-full"
              priority
            />
          </div>
        </div>

        {/* Middle: Welcome and Progress Info */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-[#1B1464] mb-2">
            Hello Mike <span className="text-[#6D758F] font-normal">(User)</span>
          </h1>
          <p className="text-lg text-[#844BDC] font-medium mb-4">Ready to start creating?</p>
          
          {/* Progress Stats */}
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-sm text-[#6D758F]">Current Level</span>
              <span className="text-xl font-medium text-[#1B1464]">Silver</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-[#6D758F]">Progress to Next Level</span>
              <span className="text-xl font-medium text-[#1B1464]">75%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-[#6D758F]">Total Achievements</span>
              <span className="text-xl font-medium text-[#1B1464]">24/100</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Achievements */}
        <div className="flex-shrink-0 w-[300px]">
          <h3 className="text-sm font-medium text-[#6D758F] mb-3">Recent Achievements</h3>
          <div className="flex flex-col gap-2">
            {recentAchievements.map((achievement, index) => (
              <RecentAchievement key={index} achievement={achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 