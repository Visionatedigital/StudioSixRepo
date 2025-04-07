'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';

// Sample billing history data
const billingHistory = [
  {
    planName: 'Annual',
    paymentDate: '30 Oct, 2023',
    expireDate: '30 Oct, 2024',
    amount: 64.00,
  },
  {
    planName: 'Annual',
    paymentDate: '30 Oct, 2022',
    expireDate: '30 Oct, 2023',
    amount: 64.00,
  },
  {
    planName: 'Annual',
    paymentDate: '30 Oct, 2021',
    expireDate: '30 Oct, 2022',
    amount: 64.00,
  },
  {
    planName: 'Annual',
    paymentDate: '30 Oct, 2020',
    expireDate: '30 Oct, 2021',
    amount: 64.00,
  },
];

export default function SubscriptionPage() {
  return (
    <DashboardLayout currentPage="Subscription">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-hidden pt-2 px-6 pb-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-[#202126]">My Subscription</h1>

          {/* Current Plan Card */}
          <div className="bg-[#F3F0FF] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-[#202126]">Current Plan</h2>
                <span className="text-base text-gray-600 mt-1">Free Plan (Personal)</span>
              </div>
              <button className="px-6 py-2.5 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                <Icon name="crown" size={20} className="text-yellow-300" />
                Upgrade
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl border border-[#E0DAF3]">
            <div className="p-6 border-b border-[#E0DAF3]">
              <h2 className="text-lg font-medium text-[#202126]">Billing History</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 text-sm text-gray-500 pb-4">
                <div>Plan Name</div>
                <div>Payment Date</div>
                <div>Expire Date</div>
                <div>Amount</div>
                <div>Invoice</div>
              </div>
              <div className="space-y-4">
                {billingHistory.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 items-center text-[#202126]">
                    <div>{item.planName}</div>
                    <div>{item.paymentDate}</div>
                    <div>{item.expireDate}</div>
                    <div>${item.amount.toFixed(2)}</div>
                    <div>
                      <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
                        <span>Download Invoice</span>
                        <Icon name="download" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 