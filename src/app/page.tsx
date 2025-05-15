'use client';

import Image from "next/image";
import Link from "next/link";
import ScrollArrow from "./components/ScrollArrow";
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';
import { useState } from "react";
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function HomePage() {
  console.log('=== HomePage Debug ===');
  console.log('Rendering HomePage component');

  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <Header />

      {/* Hero Section */}
      <section className="relative mt-[90px] px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start px-0 md:px-[173px] gap-8 md:gap-0 pt-8 md:pt-16">
          {/* Left Content */}
          <div className="flex flex-col items-center md:items-start gap-5 md:gap-7 w-full md:w-[571px] pb-[30px]">
            <h1 className="font-inter font-bold text-[32px] md:text-[52px] leading-[38px] md:leading-[60px] text-[#1B1464] w-full md:w-[571px] text-center md:text-left">
              AI Design Assistant:<br />
              Design Smarter,<br />
              Render Faster
            </h1>
            <p className="font-inter text-[16px] md:text-[18px] leading-6 text-[#6B6B6B] text-center md:text-left">
              Join <span className="font-semibold">10,000+</span> happy designers and counting!
            </p>
            <Link 
              href="/sign-in"
              className="group relative flex justify-center items-center px-6 md:px-10 py-3 md:py-5 bg-[#7144D3] rounded-full transition-colors overflow-hidden hover:bg-[#8355E5] after:absolute after:content-[''] after:top-0 after:left-[-75%] after:w-[50%] after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] after:skew-x-[-25deg] after:animate-shine"
            >
              <span className="font-inter font-semibold text-[16px] md:text-[22px] leading-6 text-white mr-3 relative z-10">Start Creating</span>
              <span className="w-2 md:w-3 h-2 md:h-3 border-t-2 border-r-2 border-white transform rotate-45 relative z-10" />
            </Link>
            {/* Store buttons - replaced with taglines */}
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-4 md:mt-8 w-full justify-center md:justify-start">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#7144D3]">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8">
                    <path fill="currentColor" d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
                  </svg>
                </div>
                <span className="text-[20px] md:text-[28px] font-semibold text-[#1B1464]">Smart</span>
              </div>
              
              <div className="text-[20px] md:text-[28px] font-light text-gray-400 hidden sm:block">|</div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#7144D3]">
                  <Image 
                    src="/icons/lightning-svgrepo-com.svg"
                    alt="Fast icon"
                    width={32}
                    height={32}
                    className="w-6 h-6 md:w-8 md:h-8"
                  />
                </div>
                <span className="text-[20px] md:text-[28px] font-semibold text-[#1B1464]">Fast</span>
              </div>
              
              <div className="text-[20px] md:text-[28px] font-light text-gray-400 hidden sm:block">|</div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#7144D3]">
                  <Image 
                    src="/icons/target-svgrepo-com.svg"
                    alt="Precise icon"
                    width={32}
                    height={32}
                    className="w-6 h-6 md:w-8 md:h-8"
                  />
                </div>
                <span className="text-[20px] md:text-[28px] font-semibold text-[#1B1464]">Precise</span>
              </div>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative w-full md:w-[700px] h-[280px] md:h-[550px] mb-8 md:mb-0 flex-shrink-0">
            {/* Render Image (behind) */}
            <div className="absolute right-[5%] md:right-[-20px] top-[120px] md:top-[140px] w-[90%] md:w-[600px] h-[160px] md:h-[350px] bg-white rounded-[18px] md:rounded-[24px] shadow-lg overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl">
              <Image
                src="/render-example.jpg"
                alt="Rendered visualization"
                width={600}
                height={350}
                className="w-full h-full object-cover rounded-[18px] md:rounded-[24px]"
                priority
              />
            </div>
            {/* Sketch Image (on top) */}
            <div className="absolute right-[15%] md:right-[220px] top-[20px] md:top-[-20px] w-[75%] md:w-[430px] h-[110px] md:h-[240px] bg-white rounded-[18px] md:rounded-[24px] shadow-lg overflow-hidden z-10 transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-xl">
              <Image
                src="/hero-sketch.jpg"
                alt="Architectural sketch"
                width={430}
                height={240}
                className="w-full h-full object-cover rounded-[18px] md:rounded-[24px]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll Arrow */}
        <ScrollArrow />
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative w-full max-w-[1728px] bg-[#FFFDFD] mx-auto mt-[-60px] px-4 py-12 md:py-0 md:h-[1176px]">
        {/* Main Heading */}
        <h2 className="font-inter font-bold text-[36px] md:text-[64px] leading-[40px] md:leading-[60px] text-[#1B1464] text-center mt-[50px] md:mt-[109px] mb-[30px] md:mb-[60px] mx-auto max-w-[790px]">
          How it Works
        </h2>
        {/* Steps Container */}
        <div className="relative max-w-[1407px] mx-auto">
          {/* Steps Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-0 md:gap-x-[86px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-4 md:gap-8">
                <div className="w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[40px] md:text-[60px] leading-[18px] text-white tracking-[0.08em]">1</span>
                </div>
                <h3 className="font-poppins font-bold text-[24px] md:text-[36px] leading-[30px] md:leading-[50px] text-[#1B1464] text-center w-full md:w-[393px]">
                  Upload Your Design
                </h3>
              </div>
              <p className="font-poppins font-normal text-[16px] md:text-[18px] leading-[24px] md:leading-[30px] text-[#1B1464] text-center w-full max-w-[378px] mt-[20px] md:mt-[40px] mb-[24px] md:mb-[48px]">
                Upload your architectural sketch, massing model, or 3D design. Whether it's a hand-drawn concept or a digital model, Studio Six instantly prepares it for rendering.
              </p>
              <div className="w-full max-w-[450px] h-[200px] md:h-[280px] rounded-[16px] md:rounded-[24px] overflow-hidden flex items-center justify-center bg-white shadow-md">
                <Image
                  src="/upload-sketch.gif"
                  alt="Upload sketch interface"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover md:object-contain"
                  unoptimized
                />
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-4 md:gap-8">
                <div className="w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[40px] md:text-[60px] leading-[18px] text-white tracking-[0.08em]">2</span>
                </div>
                <h3 className="font-poppins font-bold text-[24px] md:text-[36px] leading-[30px] md:leading-[50px] text-[#1B1464] text-center w-full md:w-[393px]">
                  Select Your Style & Settings
                </h3>
              </div>
              <p className="font-poppins font-normal text-[16px] md:text-[18px] leading-[24px] md:leading-[30px] text-[#1B1464] text-center w-full max-w-[378px] mt-[20px] md:mt-[40px] mb-[24px] md:mb-[48px]">
                Choose your preferred render style—photorealistic, conceptual, or artistic. Adjust lighting, materials, and environmental settings to match your design intent.
              </p>
              <div className="w-full max-w-[450px] h-[200px] md:h-[280px] rounded-[16px] md:rounded-[24px] overflow-hidden flex items-center justify-center bg-white shadow-md">
                <Image
                  src="/settings.gif"
                  alt="Style settings interface"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover md:object-contain"
                  unoptimized
                />
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-4 md:gap-8">
                <div className="w-[60px] h-[60px] md:w-[82px] md:h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[40px] md:text-[60px] leading-[18px] text-white tracking-[0.08em]">3</span>
                </div>
                <h3 className="font-poppins font-bold text-[24px] md:text-[36px] leading-[30px] md:leading-[50px] text-[#1B1464] text-center w-full md:w-[393px]">
                  AI-Powered Rendering in Minutes
                </h3>
              </div>
              <p className="font-poppins font-normal text-[16px] md:text-[18px] leading-[24px] md:leading-[30px] text-[#1B1464] text-center w-full max-w-[378px] mt-[20px] md:mt-[40px] mb-[24px] md:mb-[48px]">
                Our AI engine transforms your design into stunning visualizations in minutes, not hours. Get multiple variations and refine them until they're perfect.
              </p>
              <div className="w-full max-w-[450px] h-[200px] md:h-[280px] rounded-[16px] md:rounded-[24px] overflow-hidden flex items-center justify-center bg-white shadow-md">
                <Image
                  src="/render-in-minutes.gif"
                  alt="Rendering process"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover md:object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Try For Free Button */}
        <div className="flex flex-col items-center mt-[50px] md:mt-[100px] gap-4">
          <button className="flex items-center justify-center px-[18px] py-[14px] w-[250px] md:w-[302px] h-[60px] md:h-[82px] bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[23px] shadow-[0px_1px_4px_rgba(25,33,61,0.08)] group">
            <span className="font-inter font-semibold text-[24px] md:text-[30px] leading-[20px] text-white">Try For Free</span>
            <span className="ml-[3px] w-[12px] h-[12px] border-t-2 border-r-2 border-white transform rotate-45 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="font-inter font-normal text-[16px] leading-[24px] text-[#6B6B6B]">
            Join <span className="font-semibold">1,000,000+</span> happy designers and counting!
          </p>
        </div>
      </section>

      {/* Gallery/Sign In Section */}
      <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white/30 to-[#5D4FF1]/30">
        {/* Background with scrolling images */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient overlay for top fade */}
          <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-white via-white/95 to-transparent z-[1]"></div>
          
          <div className="flex animate-scroll-left">
            {/* First set of images */}
            <div className="grid grid-cols-3 md:grid-cols-5 auto-rows-[180px] md:auto-rows-[250px] gap-2 md:gap-3 p-2 md:p-3 flex-shrink-0">
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image1.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image4.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image6.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image7.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image9.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              {/* Additional row */}
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Second set of images (duplicate for continuous scroll) */}
            <div className="grid grid-cols-3 md:grid-cols-5 auto-rows-[180px] md:auto-rows-[250px] gap-2 md:gap-3 p-2 md:p-3 flex-shrink-0">
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image1.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image4.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image6.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image7.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image9.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              {/* Additional row */}
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] row-span-2 rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block w-full md:w-[250px] rounded-lg border-[2px] md:border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-[60px]">
          <h1 className="font-inter font-bold text-[36px] sm:text-[42px] md:text-[56px] leading-[42px] sm:leading-[50px] md:leading-[68px] text-[#1B1464] text-center mb-[30px] md:mb-[40px] max-w-[700px] -mt-[40px]">
            Join <span className="text-[#7144D3]">10,000+</span> Designers<br />
            Using Studio<span className="text-[#7144D3]">Six</span>
          </h1>

          {/* Sign In Form */}
          <div className="w-full max-w-[340px] md:max-w-[380px] bg-white rounded-[14px] md:rounded-[16px] shadow-[0px_4px_24px_rgba(0,0,0,0.1)] p-3 md:p-5 backdrop-blur-sm bg-white/95">
            <div className="flex flex-col items-center gap-2 md:gap-4">
              {/* Logo */}
              <h2 className="font-poppins font-medium text-[20px] md:text-[24px] text-[#1B1464]">Sign in</h2>
              <p className="font-poppins text-xs md:text-sm text-[#1B1464]">Sign in to start rendering</p>

              {/* Google Sign In */}
              <button className="w-full h-[40px] md:h-[50px] bg-white border border-[#E5E7EB] shadow-sm rounded-[10px] md:rounded-[12px] flex items-center justify-center gap-2 md:gap-3 hover:bg-gray-50 transition-colors">
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  width={16}
                  height={16}
                  className="w-4 h-4 md:w-[18px] md:h-[18px]"
                />
                <span className="font-poppins text-[13px] md:text-[14px] text-[#1B1464]">Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="w-full flex items-center gap-3 md:gap-4 my-1 md:my-2">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="font-poppins text-[10px] md:text-xs text-[#6B7280]">or</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              {/* Email & Password Form */}
              <div className="w-full space-y-2 md:space-y-4">
                <div>
                  <label className="font-poppins text-xs md:text-sm text-[#1B1464] block mb-1 md:mb-1.5">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-[36px] md:h-[45px] px-3 md:px-4 text-xs md:text-sm bg-[#F3F4F6] rounded-[6px] md:rounded-[8px] font-poppins text-[#1B1464]"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="font-poppins text-xs md:text-sm text-[#1B1464] block mb-1 md:mb-1.5">Password</label>
                  <input 
                    type="password" 
                    className="w-full h-[36px] md:h-[45px] px-3 md:px-4 text-xs md:text-sm bg-[#F3F4F6] rounded-[6px] md:rounded-[8px] font-poppins text-[#1B1464]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3 h-3 md:w-4 md:h-4 rounded border-[#E5E7EB]" />
                    <span className="font-poppins text-[10px] md:text-sm text-[#1B1464]">Remember me</span>
                  </label>
                  <a href="#" className="font-poppins text-[10px] md:text-sm text-[#7144D3] hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button className="w-full h-[38px] md:h-[48px] bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[6px] md:rounded-[8px] font-poppins font-semibold text-sm md:text-lg text-white hover:opacity-90 transition-opacity">
                  Start Creating →
                </button>

                {/* Sign Up Link */}
                <p className="text-center">
                  <span className="font-poppins text-[10px] md:text-sm text-[#6B7280]">Don't have an account yet? </span>
                  <a href="#" className="font-poppins font-semibold text-[10px] md:text-sm text-[#7144D3] hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA and FAQ Section */}
      <section className="relative w-full max-w-[1728px] mx-auto bg-white py-[50px] md:py-[100px] px-4 md:px-0">
        {/* CTA Content */}
        <div className="text-center mb-[50px] md:mb-[100px]">
          <h2 className="font-poppins font-bold text-[32px] md:text-[48px] leading-[40px] md:leading-[64px] text-[#1B1464] mb-4 md:mb-8">
            Ready to create stunning<br />designs?
          </h2>
          <p className="font-inter text-[22px] md:text-[32px] leading-[30px] md:leading-[40px] text-[#6B6B6B] mb-8 md:mb-12">
            Sign Up & Start rendering for free
          </p>
          <button className="group flex items-center justify-center px-[16px] md:px-[18px] py-[12px] md:py-[14px] w-[240px] md:w-[302px] h-[60px] md:h-[82px] mx-auto bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[20px] md:rounded-[23px] shadow-[0px_1px_4px_rgba(25,33,61,0.08)]">
            <span className="font-inter font-semibold text-[20px] md:text-[24px] leading-[20px] text-white mr-2">Try For Free</span>
            <span className="w-2 md:w-3 h-2 md:h-3 border-t-2 border-r-2 border-white transform rotate-45 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* FAQ Content */}
        <div className="max-w-[1320px] mx-auto">
          <h2 className="font-poppins font-bold text-[32px] md:text-[48px] leading-[40px] md:leading-[64px] text-[#1B1464] text-center mb-8 md:mb-16">
            Frequently Asked Questions
          </h2>
          
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}