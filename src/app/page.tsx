'use client';

import Image from "next/image";
import Link from "next/link";
import ScrollArrow from "./components/ScrollArrow";
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';

export default function HomePage() {
  console.log('=== HomePage Debug ===');
  console.log('Rendering HomePage component');

  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="absolute w-full max-w-[1379px] h-[105px] left-1/2 -translate-x-1/2 top-[20px]">
        <div className="relative w-full h-full">
          {/* Logo */}
          <div className="absolute left-[35px] top-[60%] -translate-y-1/2 flex items-center">
            <Link href="/" className="block">
              <Image
                src="/studio-six-logo.svg"
                alt="Studio Six Logo"
                width={144}
                height={48}
                className="w-[144px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Menu */}
          <div className="flex flex-row items-center gap-[40px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link href="/subscription" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Pricing</Link>
            <Link href="/plugins" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Plugins</Link>
            <Link href="/help" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Help</Link>
            <Link href="/about" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">About Us</Link>
            <div className="flex items-center gap-2">
              <Link href="/teams" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">For Teams</Link>
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">New</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row items-center gap-[16px] absolute right-[20px] top-1/2 -translate-y-1/2">
            <Link 
              href="/sign-in" 
              className="flex justify-center items-center px-6 py-2.5 bg-[#F8F8F8] rounded-lg hover:bg-[#F0F0F0]"
            >
              <span className="font-poppins text-[16px] font-medium whitespace-nowrap text-black">Log in</span>
            </Link>
            <Link 
              href="/sign-in" 
              className="flex justify-center items-center px-6 py-2.5 border border-[#7144D3] rounded-lg transition-all duration-300 hover:bg-[#7144D3] group"
            >
              <span className="font-poppins text-[16px] font-medium whitespace-nowrap text-[#7144D3] group-hover:text-white">Create</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mt-[200px]">
        <div className="flex justify-between px-[173px]">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-7 w-[571px] pb-[30px]">
            <h1 className="font-inter font-bold text-[52px] leading-[60px] text-[#1B1464] w-[571px]">
              AI Design Assistant:<br />
              Design Smarter,<br />
              Render Faster
            </h1>
            <p className="font-inter text-[18px] leading-6 text-[#6B6B6B]">
              Join <span className="font-semibold">10,000+</span> happy designers and counting!
            </p>
            <Link 
              href="/sign-in"
              className="group relative flex justify-center items-center px-8 py-4 bg-[#7144D3] rounded-full transition-colors overflow-hidden hover:bg-[#8355E5] after:absolute after:content-[''] after:top-0 after:left-[-75%] after:w-[50%] after:h-full after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] after:skew-x-[-25deg] after:animate-shine"
            >
              <span className="font-inter font-semibold text-[18px] leading-5 text-white mr-2 relative z-10">Start Creating</span>
              <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-white transform rotate-45 relative z-10" />
            </Link>
            
            {/* Store buttons */}
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="transition-opacity hover:opacity-80">
                <div className="w-[180px] h-[60px] bg-black rounded-xl flex items-center justify-center px-6">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-white/80">Download on the</span>
                      <span className="text-[18px] font-semibold text-white leading-5">App Store</span>
                    </div>
                  </div>
                </div>
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <div className="w-[180px] h-[60px] bg-black rounded-xl flex items-center justify-center px-6">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                      <path fill="currentColor" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-white/80">GET IT ON</span>
                      <span className="text-[14px] font-semibold text-white leading-5 whitespace-nowrap">Google Play</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative w-[850px] h-[650px]">
            {/* Render Image (behind) */}
            <div className="absolute right-[-20px] top-[160px] w-[750px] h-[422px] bg-white rounded-[24px] shadow-lg overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl">
              <Image
                src="/render-example.jpg"
                alt="Rendered visualization"
                width={750}
                height={422}
                className="w-full h-full object-cover rounded-[24px]"
                priority
              />
            </div>
            {/* Sketch Image (on top) */}
            <div className="absolute right-[270px] top-[-30px] w-[515px] h-[286px] bg-white rounded-[24px] shadow-lg overflow-hidden z-10 transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-xl">
              <Image
                src="/sketch-example.jpg"
                alt="Architectural sketch"
                width={515}
                height={286}
                className="w-full h-full object-cover rounded-[24px]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll Arrow */}
        <ScrollArrow />
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative w-full max-w-[1728px] h-[1176px] bg-[#FFFDFD] mx-auto mt-[-60px] px-4">
        {/* Main Heading */}
        <h2 className="font-inter font-bold text-[64px] leading-[60px] text-[#1B1464] text-center mt-[109px] mb-[60px] mx-auto max-w-[790px]">
          How it Works
        </h2>

        {/* Steps Container */}
        <div className="relative max-w-[1407px] mx-auto">
          {/* Steps Content */}
          <div className="grid grid-cols-3 gap-x-[86px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-8">
                <div className="w-[82px] h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[60px] leading-[18px] text-white tracking-[0.08em]">1</span>
                </div>
                <h3 className="font-poppins font-bold text-[36px] leading-[50px] text-[#1B1464] text-center w-[393px]">
                  Upload Your Design
                </h3>
              </div>
              <p className="font-poppins font-normal text-[18px] leading-[30px] text-[#1B1464] text-center w-[378px] mt-[40px] mb-[48px]">
                Upload your architectural sketch, massing model, or 3D design. Whether it's a hand-drawn concept or a digital model, Studio Six instantly prepares it for rendering.
              </p>
              <div className="w-[450px] h-[280px] rounded-[24px] overflow-hidden">
                <Image
                  src="/upload-sketch.gif"
                  alt="Upload sketch interface"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-8">
                <div className="w-[82px] h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[60px] leading-[18px] text-white tracking-[0.08em]">2</span>
                </div>
                <h3 className="font-poppins font-bold text-[36px] leading-[50px] text-[#1B1464] text-center w-[393px]">
                  Select Your Style & Settings
                </h3>
              </div>
              <p className="font-poppins font-normal text-[18px] leading-[30px] text-[#1B1464] text-center w-[378px] mt-[40px] mb-[48px]">
                Choose your preferred render style—photorealistic, conceptual, or artistic. Adjust lighting, materials, and environmental settings to match your design intent.
              </p>
              <div className="w-[450px] h-[280px] rounded-[24px] overflow-hidden">
                <Image
                  src="/settings.gif"
                  alt="Style settings interface"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center gap-8">
                <div className="w-[82px] h-[82px] rounded-full bg-[#8326CD] flex items-center justify-center">
                  <span className="font-poppins font-bold text-[60px] leading-[18px] text-white tracking-[0.08em]">3</span>
                </div>
                <h3 className="font-poppins font-bold text-[36px] leading-[50px] text-[#1B1464] text-center w-[393px]">
                  AI-Powered Rendering in Minutes
                </h3>
              </div>
              <p className="font-poppins font-normal text-[18px] leading-[30px] text-[#1B1464] text-center w-[378px] mt-[40px] mb-[48px]">
                Our AI engine transforms your design into stunning visualizations in minutes, not hours. Get multiple variations and refine them until they're perfect.
              </p>
              <div className="w-[450px] h-[280px] rounded-[24px] overflow-hidden">
                <Image
                  src="/render-in-minutes.gif"
                  alt="Rendering process"
                  width={450}
                  height={280}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        {/* Try For Free Button */}
        <div className="flex flex-col items-center mt-[100px] gap-4">
          <button className="flex items-center justify-center px-[18px] py-[14px] w-[302px] h-[82px] bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[23px] shadow-[0px_1px_4px_rgba(25,33,61,0.08)] group">
            <span className="font-inter font-semibold text-[30px] leading-[20px] text-white">Try For Free</span>
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
            <div className="grid grid-cols-5 auto-rows-[250px] gap-3 p-3 flex-shrink-0">
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image1.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image4.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image6.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image7.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image9.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              {/* Additional row */}
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Second set of images (duplicate for continuous scroll) */}
            <div className="grid grid-cols-5 auto-rows-[250px] gap-3 p-3 flex-shrink-0">
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image1.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image4.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image6.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image7.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image9.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              {/* Additional row */}
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image2.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image3.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image5.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] row-span-2 rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image8.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
              <div className="w-[250px] rounded-lg border-[3px] border-white/90 overflow-hidden">
                <img src="/gallery/image10.jpg" alt="Gallery image" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-[60px]">
          <h1 className="font-inter font-bold text-[56px] leading-[68px] text-[#1B1464] text-center mb-[40px] max-w-[700px] -mt-[40px]">
            Join <span className="text-[#7144D3]">10,000+</span> Designers<br />
            Using Studio<span className="text-[#7144D3]">Six</span>
          </h1>

          {/* Sign In Form */}
          <div className="w-full max-w-[380px] bg-white rounded-[16px] shadow-[0px_4px_24px_rgba(0,0,0,0.1)] p-5 backdrop-blur-sm bg-white/95">
            <div className="flex flex-col items-center gap-4">
              {/* Logo */}
              <h2 className="font-poppins font-medium text-[24px] text-[#1B1464]">Sign in</h2>
              <p className="font-poppins text-sm text-[#1B1464]">Sign in to start rendering</p>

              {/* Google Sign In */}
              <button className="w-full h-[50px] bg-white border border-[#E5E7EB] shadow-sm rounded-[12px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
                <img
                  src="/google-icon.svg"
                  alt="Google"
                  width={18}
                  height={18}
                />
                <span className="font-poppins text-[14px] text-[#1B1464]">Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="font-poppins text-xs text-[#6B7280]">or</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              {/* Email & Password Form */}
              <div className="w-full space-y-4">
                <div>
                  <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Email</label>
                  <input 
                    type="email" 
                    className="w-full h-[45px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464]"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Password</label>
                  <input 
                    type="password" 
                    className="w-full h-[45px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#E5E7EB]" />
                    <span className="font-poppins text-sm text-[#1B1464]">Remember me</span>
                  </label>
                  <a href="#" className="font-poppins text-sm text-[#7144D3] hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button className="w-full h-[48px] bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[8px] font-poppins font-semibold text-lg text-white hover:opacity-90 transition-opacity">
                  Start Creating →
                </button>

                {/* Sign Up Link */}
                <p className="text-center">
                  <span className="font-poppins text-sm text-[#6B7280]">Don't have an account yet? </span>
                  <a href="#" className="font-poppins font-semibold text-sm text-[#7144D3] hover:underline">
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
      <section className="relative w-full max-w-[1728px] mx-auto bg-white py-[100px]">
        {/* CTA Content */}
        <div className="text-center mb-[100px]">
          <h2 className="font-poppins font-bold text-[48px] leading-[64px] text-[#1B1464] mb-8">
            Ready to create stunning<br />designs?
          </h2>
          <p className="font-inter text-[32px] leading-[40px] text-[#6B6B6B] mb-12">
            Sign Up & Start rendering for free
          </p>
          <button className="group flex items-center justify-center px-[18px] py-[14px] w-[302px] h-[82px] mx-auto bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] rounded-[23px] shadow-[0px_1px_4px_rgba(25,33,61,0.08)]">
            <span className="font-inter font-semibold text-[24px] leading-[20px] text-white mr-2">Try For Free</span>
            <span className="w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* FAQ Content */}
        <div className="max-w-[1320px] mx-auto">
          <h2 className="font-poppins font-bold text-[48px] leading-[64px] text-[#1B1464] text-center mb-16">
            Frequently Asked Questions
          </h2>
          
          <FAQ />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full max-w-[1728px] mx-auto h-[138px] bg-white">
        <div className="absolute left-[73px] top-[35px] flex items-center gap-4">
          <div className="w-[25px] h-[25px] rounded-full border border-[#6B6B6B]" />
          <div className="flex flex-col">
            <span className="font-inter text-[20px] leading-[40px] text-[#6B6B6B]">StudioSix, 2025</span>
            <span className="font-inter text-[20px] leading-[40px] text-[#6B6B6B]">Visionate (PTY) Ltd. All Rights Reserved</span>
          </div>
        </div>

        {/* Center Menu */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-[51px]">
            <Link href="/pricing" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Pricing</Link>
            <Link href="/plugins" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Plugins</Link>
            <Link href="/help" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Help</Link>
            <Link href="/about" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">About Us</Link>
            <Link href="/teams" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">For Teams</Link>
          </div>
        </div>

        {/* Social Icons */}
        <div className="absolute right-[160px] top-[46px] flex items-center gap-[18px]">
          <Link href="#" className="w-[37px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full text-black">
              <path fill="currentColor" d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
          </Link>
          <Link href="#" className="w-[36px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#9146FF" d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z"/>
            </svg>
          </Link>
          <Link href="#" className="w-[37px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
            </svg>
          </Link>
          <Link href="#" className="w-[48px] h-[48px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#5865F2" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.03-.07c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.04.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
          </Link>
        </div>
      </footer>
    </main>
  );
}