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
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[180px] pb-20">
        <h1 className="text-[40px] font-semibold text-center mb-8 font-poppins">
              About Studio Six
            </h1>

        <p className="text-[24px] font-light mb-12 font-poppins leading-[36px]">
          Studio Six is a revolutionary AI-powered design platform that empowers creators to bring their ideas to life. Our mission is to democratize design and make creative tools accessible to everyone.
        </p>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            Our Story
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            Founded in 2023, Studio Six emerged from a vision to transform the creative industry. We recognized that traditional design tools were often complex, expensive, and inaccessible to many aspiring creators. Our platform combines cutting-edge AI technology with intuitive interfaces to make professional-quality design accessible to everyone.
            </p>
          </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            Our Mission
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We're on a mission to:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Democratize design by making professional tools accessible to everyone</li>
            <li>Empower creators with AI-powered solutions that enhance their workflow</li>
            <li>Foster a community of creative professionals and enthusiasts</li>
            <li>Drive innovation in the creative industry through technology</li>
          </ul>
          </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            Our Values
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            At Studio Six, we believe in:
          </p>
          <ul className="text-[24px] font-light mb-8 font-poppins leading-[36px] list-disc pl-8">
            <li>Innovation and continuous improvement</li>
            <li>User-centric design and development</li>
            <li>Transparency and trust</li>
            <li>Community and collaboration</li>
            <li>Ethical AI development and usage</li>
          </ul>
          </section>

        <section className="mb-12">
          <h2 className="text-[30px] font-semibold mb-6 font-poppins">
            Join Our Team
          </h2>
          <p className="text-[24px] font-light mb-8 font-poppins leading-[36px]">
            We're always looking for talented individuals who share our passion for creativity and technology. Join us in shaping the future of design.
            </p>
          <Link 
            href="/careers" 
            className="inline-block px-8 py-3 bg-[#7144D3] text-white rounded-lg hover:bg-[#5A35A9] transition-colors duration-300 font-poppins text-[18px]"
          >
            View Open Positions
              </Link>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 