'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/Icons';
import Link from 'next/link';

interface HelpDetailLayoutProps {
  title: string;
  category: string;
  children: React.ReactNode;
}

export default function HelpDetailLayout({ title, category, children }: HelpDetailLayoutProps) {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="pt-[110px] bg-[#F6F8FA]">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/help" className="hover:text-[#814ADA]">Help Center</Link>
            <Icon name="chevron-right" className="w-4 h-4 mx-2" />
            <Link href={`/help?category=${category.replace(/\s+/g, '-').toLowerCase()}`} className="hover:text-[#814ADA]">{category}</Link>
            <Icon name="chevron-right" className="w-4 h-4 mx-2" />
            <span className="text-[#814ADA]">{title}</span>
          </div>
        </div>
      </div>
      
      {/* Content Header */}
      <div className="bg-[#F6F8FA] pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[32px] md:text-[42px] font-bold text-[#1B1464]">{title}</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-white p-6 rounded-lg border border-[#E0DAF3] sticky top-[120px]">
                <h3 className="font-semibold text-[#1B1464] mb-4">In This Article</h3>
                <nav className="space-y-2">
                  <a href="#overview" className="block text-gray-600 hover:text-[#814ADA]">Overview</a>
                  <a href="#getting-started" className="block text-gray-600 hover:text-[#814ADA]">Getting Started</a>
                  <a href="#step-by-step" className="block text-gray-600 hover:text-[#814ADA]">Step-by-Step Guide</a>
                  <a href="#tips-tricks" className="block text-gray-600 hover:text-[#814ADA]">Tips & Tricks</a>
                  <a href="#related-articles" className="block text-gray-600 hover:text-[#814ADA]">Related Articles</a>
                </nav>
                
                <div className="mt-8 pt-6 border-t border-[#E0DAF3]">
                  <h3 className="font-semibold text-[#1B1464] mb-4">Was This Helpful?</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#F6F8FA] hover:bg-[#E0DAF3] rounded-lg text-sm transition-colors">
                      Yes
                    </button>
                    <button className="px-4 py-2 bg-[#F6F8FA] hover:bg-[#E0DAF3] rounded-lg text-sm transition-colors">
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4">
              <div className="bg-white p-8 rounded-lg border border-[#E0DAF3]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Articles */}
      <div className="py-12 bg-[#F6F8FA]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[24px] font-bold text-[#1B1464] mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-lg border border-[#E0DAF3] hover:shadow-md transition-shadow">
              <h3 className="text-[18px] font-semibold text-[#1B1464]">Troubleshooting Common Issues</h3>
              <p className="mt-2 text-[#4D4D4D] mb-4">Learn how to solve the most common problems users encounter.</p>
              <Link 
                href="/help/troubleshooting/common-issues" 
                className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
              >
                Read more
                <Icon name="chevron-right" className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-[#E0DAF3] hover:shadow-md transition-shadow">
              <h3 className="text-[18px] font-semibold text-[#1B1464]">Optimizing Your Workflow</h3>
              <p className="mt-2 text-[#4D4D4D] mb-4">Tips and tricks to make your design process faster and more efficient.</p>
              <Link 
                href="/help/features/optimizing-workflow" 
                className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
              >
                Read more
                <Icon name="chevron-right" className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white p-5 rounded-lg border border-[#E0DAF3] hover:shadow-md transition-shadow">
              <h3 className="text-[18px] font-semibold text-[#1B1464]">Understanding Image Resolution</h3>
              <p className="mt-2 text-[#4D4D4D] mb-4">Learn about the different resolution options and when to use them.</p>
              <Link 
                href="/help/features/image-resolution" 
                className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
              >
                Read more
                <Icon name="chevron-right" className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Support */}
      <div className="py-12">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-[24px] font-bold text-[#1B1464] mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-8">Our support team is available to help you with any questions or issues you may have.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@studiosix.com"
              className="inline-flex items-center justify-center gap-2 bg-[#814ADA] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6E3BBC] transition-colors"
            >
              <Icon name="mail" className="w-5 h-5" />
              Email Support
            </a>
            <Link 
              href="/help/live-chat"
              className="inline-flex items-center justify-center gap-2 border border-[#814ADA] text-[#814ADA] px-6 py-3 rounded-lg font-medium hover:bg-[#F6F8FA] transition-colors"
            >
              <Icon name="message-circle" className="w-5 h-5" />
              Live Chat
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 