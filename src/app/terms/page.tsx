'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

export default function TermsPage() {
  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <Header />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[180px] pb-20">
        <h1 className="text-[40px] font-semibold text-center mb-8 font-poppins">
          Terms and Conditions
        </h1>

        <p className="text-[24px] font-light mb-12 font-poppins leading-[36px]">
          Welcome to Studio Six. By accessing or using our services, you agree to be bound by these terms and conditions. Please read them carefully before using our platform.
        </p>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            1. Acceptance of Terms
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            By accessing and using Studio Six, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            2. User Accounts
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            To use certain features of our platform, you must create an account. You are responsible for:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and current information</li>
            <li>Notifying us of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            3. Intellectual Property
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            All content and materials available on Studio Six, including but not limited to text, graphics, logos, button icons, images, audio clips, data compilations, and software, are the property of Studio Six or its content suppliers and protected by international copyright laws.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            4. User Content
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            By submitting, posting, or displaying content on or through our platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            5. Prohibited Activities
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            You agree not to engage in any of the following activities:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Violating laws or regulations</li>
            <li>Infringing on intellectual property rights</li>
            <li>Transmitting harmful code or malware</li>
            <li>Interfering with the proper functioning of the platform</li>
            <li>Attempting to gain unauthorized access to our systems</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            6. Limitation of Liability
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            Studio Six and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            7. Changes to Terms
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our platform. Your continued use of Studio Six after such modifications constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            8. Contact Information
          </h2>
          <p className="text-[24px] font-light font-poppins leading-[36px]">
            If you have any questions about these Terms and Conditions, please contact us at support@studiosix.com
          </p>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 