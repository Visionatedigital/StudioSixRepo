'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

export default function AboutPage() {
  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <Header />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-[120px] sm:pt-[150px] md:pt-[180px] pb-12 md:pb-20">
        <h1 className="text-[32px] sm:text-[36px] md:text-[40px] font-semibold text-center mb-6 sm:mb-8 font-poppins text-[#1B1464]">
          About Studio Six
        </h1>

        <p className="text-[18px] sm:text-[20px] md:text-[24px] font-light mb-8 sm:mb-12 font-poppins leading-[1.5] md:leading-[36px] text-center max-w-[900px] mx-auto">
          Studio Six is a revolutionary AI-powered design platform that empowers creators to bring their ideas to life. Our mission is to democratize design and make creative tools accessible to everyone.
        </p>

        <section className="mb-10 md:mb-12">
          <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold mb-4 sm:mb-6 font-poppins text-center text-[#1B1464]">
            Our Story
          </h2>
          <p className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-6 sm:mb-8 font-poppins leading-[1.5] md:leading-[36px] max-w-[900px] mx-auto">
            Founded in 2023, Studio Six emerged from a vision to transform the creative industry. We recognized that traditional design tools were often complex, expensive, and inaccessible to many aspiring creators. Our platform combines cutting-edge AI technology with intuitive interfaces to make professional-quality design accessible to everyone.
          </p>
        </section>

        <section className="mb-10 md:mb-12">
          <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold mb-4 sm:mb-6 font-poppins text-center text-[#1B1464]">
            Our Mission
          </h2>
          <p className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-4 sm:mb-6 font-poppins leading-[1.5] md:leading-[36px] max-w-[900px] mx-auto">
            We're on a mission to:
          </p>
          <ul className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-6 sm:mb-8 font-poppins leading-[1.5] md:leading-[36px] list-disc pl-8 max-w-[800px] mx-auto">
            <li className="mb-2">Democratize design by making professional tools accessible to everyone</li>
            <li className="mb-2">Empower creators with AI-powered solutions that enhance their workflow</li>
            <li className="mb-2">Foster a community of creative professionals and enthusiasts</li>
            <li>Drive innovation in the creative industry through technology</li>
          </ul>
        </section>

        <section className="mb-10 md:mb-12">
          <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold mb-4 sm:mb-6 font-poppins text-center text-[#1B1464]">
            Our Values
          </h2>
          <p className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-4 sm:mb-6 font-poppins leading-[1.5] md:leading-[36px] max-w-[900px] mx-auto">
            At Studio Six, we believe in:
          </p>
          <ul className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-6 sm:mb-8 font-poppins leading-[1.5] md:leading-[36px] list-disc pl-8 max-w-[800px] mx-auto">
            <li className="mb-2">Innovation and continuous improvement</li>
            <li className="mb-2">User-centric design and development</li>
            <li className="mb-2">Transparency and trust</li>
            <li className="mb-2">Community and collaboration</li>
            <li>Ethical AI development and usage</li>
          </ul>
        </section>

        <section className="mb-10 md:mb-12">
          <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-semibold mb-4 sm:mb-6 font-poppins text-center text-[#1B1464]">
            Join Our Team
          </h2>
          <p className="text-[16px] sm:text-[18px] md:text-[24px] font-light mb-6 sm:mb-8 font-poppins leading-[1.5] md:leading-[36px] text-center max-w-[900px] mx-auto">
            We're always looking for talented individuals who share our passion for creativity and technology. Join us in shaping the future of design.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/careers" 
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-[#7144D3] text-white rounded-lg hover:bg-[#5A35A9] transition-colors duration-300 font-poppins text-[16px] sm:text-[18px]"
            >
              View Open Positions
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 