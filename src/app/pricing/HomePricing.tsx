'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePricingContent from './HomePricingContent';

export default function HomePricing() {
  return (
    <main className="bg-white">
      <Header />
      <div className="pt-[110px] pb-12 max-w-[1728px] mx-auto">
        <HomePricingContent />
      </div>
      <Footer />
    </main>
  );
} 