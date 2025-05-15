import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/Icons';

export default function LiveChatPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="pt-[110px] bg-[#F6F8FA]">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/help" className="hover:text-[#814ADA]">Help Center</Link>
            <Icon name="chevron-right" className="w-4 h-4 mx-2" />
            <span className="text-[#814ADA]">Live Chat Support</span>
          </div>
        </div>
      </div>
      
      {/* Content Header */}
      <div className="bg-[#F6F8FA] pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-[32px] md:text-[42px] font-bold text-[#1B1464]">Live Chat Support</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="bg-white p-8 rounded-lg border border-[#E0DAF3]">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-[#F6F8FA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="message-circle" className="w-10 h-10 text-[#814ADA]" />
              </div>
              <h2 className="text-[24px] font-bold text-[#1B1464] mb-4">Connect with Our Support Team</h2>
              <p className="text-gray-600 max-w-[600px] mx-auto">
                Our support specialists are available to help you with any questions about Studio Six.
                Live chat is available during business hours.
              </p>
            </div>
            
            <div className="mb-12">
              <h3 className="text-[18px] font-semibold text-[#1B1464] mb-4">Chat Support Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3]">
                  <h4 className="font-medium text-[#1B1464] mb-2">Weekdays</h4>
                  <p className="text-gray-600">9:00 AM - 8:00 PM Eastern Time</p>
                </div>
                <div className="bg-[#F6F8FA] p-5 rounded-lg border border-[#E0DAF3]">
                  <h4 className="font-medium text-[#1B1464] mb-2">Weekends</h4>
                  <p className="text-gray-600">10:00 AM - 6:00 PM Eastern Time</p>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <h3 className="text-[18px] font-semibold text-[#1B1464] mb-4">Before You Chat</h3>
              <p className="text-gray-600 mb-4">
                To help us assist you more efficiently, please have the following information ready:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Your account email address</li>
                <li>Subscription plan type</li>
                <li>A clear description of your issue or question</li>
                <li>Any error messages you're seeing (screenshots are helpful)</li>
                <li>Steps you've already taken to resolve the issue</li>
              </ul>
            </div>
            
            <div className="border-t border-[#E0DAF3] pt-8 mb-8">
              <h3 className="text-[18px] font-semibold text-[#1B1464] mb-4">Start a Live Chat Session</h3>
              <div className="flex flex-col items-center">
                <button className="bg-[#814ADA] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#6E3BBC] transition-colors flex items-center">
                  <Icon name="message-circle" className="w-5 h-5 mr-2" />
                  Start Chat Now
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  Average wait time: 2-5 minutes
                </p>
              </div>
            </div>
            
            <div className="bg-[#F6F8FA] p-6 rounded-lg border border-[#E0DAF3] mt-8">
              <h3 className="text-[18px] font-semibold text-[#1B1464] mb-4">Other Support Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-[#1B1464] mb-2">Email Support</h4>
                  <p className="text-gray-600 mb-2">
                    For non-urgent issues or detailed questions
                  </p>
                  <a 
                    href="mailto:support@studiosix.com"
                    className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
                  >
                    support@studiosix.com
                    <Icon name="arrow-right" className="ml-1 w-4 h-4" />
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-[#1B1464] mb-2">Help Center</h4>
                  <p className="text-gray-600 mb-2">
                    Browse our comprehensive documentation
                  </p>
                  <Link 
                    href="/help"
                    className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
                  >
                    Visit Help Center
                    <Icon name="arrow-right" className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 