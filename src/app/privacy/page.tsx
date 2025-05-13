'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

export default function PrivacyPage() {
  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <Header />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[180px] pb-20">
        <h1 className="text-[40px] font-semibold text-center mb-8 font-poppins">
          Privacy Policy
        </h1>

        <p className="text-[24px] font-light mb-12 font-poppins leading-[36px]">
          At Studio Six, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
        </p>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            1. Information We Collect
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We collect several types of information for various purposes:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Personal Information (name, email address, contact details)</li>
            <li>Account Information (login credentials, preferences)</li>
            <li>Usage Data (how you interact with our platform)</li>
            <li>Design Content (artwork, designs, and assets you create)</li>
            <li>Technical Data (IP address, browser type, device information)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            2. How We Use Your Information
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            Your information helps us to:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Provide and maintain our services</li>
            <li>Improve and personalize your experience</li>
            <li>Process your transactions</li>
            <li>Send you important updates and communications</li>
            <li>Analyze usage patterns and optimize our platform</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            3. Data Security
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We implement robust security measures to protect your personal information, including:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Encryption of transmitted data</li>
            <li>Regular security assessments</li>
            <li>Secure data storage systems</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            4. Data Sharing and Disclosure
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We may share your information with:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners with your consent</li>
            <li>Other users according to your privacy settings</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            5. Your Privacy Rights
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            You have the right to:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            6. Cookies and Tracking
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences. We use these technologies to:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Remember your preferences</li>
            <li>Analyze usage patterns</li>
            <li>Provide personalized content</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            7. Children's Privacy
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            Our services are not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            8. Contact Us
          </h2>
          <p className="text-[24px] font-light font-poppins leading-[36px]">
            If you have questions about this Privacy Policy or our practices, please contact us at privacy@studiosix.com
          </p>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 