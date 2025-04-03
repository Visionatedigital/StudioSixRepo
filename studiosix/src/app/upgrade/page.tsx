'use client';
import styles from './upgrade.module.css';
import { useState } from 'react';
import FaqAccordion from '@/components/FaqAccordion';

export default function UpgradePage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = {
    starter: { monthly: 39, yearly: 421 },  // 39 * 12 * 0.9
    pro: { monthly: 69, yearly: 745 },      // 69 * 12 * 0.9
    studio: { monthly: 99, yearly: 1069 }    // 99 * 12 * 0.9
  };

  const faqItems = [
    {
      question: "How do I get started with Studio Six?",
      answer: "Getting started with Studio Six is easy! Simply sign up for an account, choose your preferred plan, and start uploading your sketches. Our AI will transform them into stunning architectural visualizations within minutes. We offer a user-friendly interface and comprehensive tutorials to help you make the most of our platform."
    },
    {
      question: "What's included in the free plan?",
      answer: "Our free plan includes 3 test renders per month, access to basic AI features, and standard resolution outputs. It's perfect for trying out our platform and understanding how our AI technology can transform your architectural designs. Upgrade to a paid plan for unlimited renders and advanced features."
    },
    {
      question: "Do I need any design experience to use Studio Six?",
      answer: "No, you don't need professional design experience to use Studio Six! Our AI is designed to work with basic sketches and rough concepts. Whether you're a professional architect or just starting out, our platform adapts to your skill level and helps you create professional-quality visualizations."
    },
    {
      question: "Do you offer team or enterprise plans?",
      answer: "Yes, we offer customized team and enterprise plans for organizations of all sizes. These plans include features like collaborative workspaces, advanced project management tools, and dedicated support. Contact our sales team to discuss a plan that fits your organization's needs."
    },
    {
      question: "Can I adjust the lighting and shadows in my render?",
      answer: "Absolutely! Studio Six provides comprehensive control over lighting and shadows in your renders. You can adjust time of day, light sources, shadow intensity, and even add custom lighting scenarios. Our AI also suggests optimal lighting conditions based on your design's architecture."
    },
    {
      question: "Does Studio Six integrate with other design software?",
      answer: "Yes, Studio Six seamlessly integrates with popular design software including AutoCAD, SketchUp, and Revit. We support various file formats and provide plugins for major design applications. This ensures a smooth workflow between your existing tools and our AI visualization platform."
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-scroll-section>
      <div className="box-border relative w-full max-w-[1728px] mx-auto px-4">
        {/* Plans Container */}
        <div className="flex flex-col items-center gap-5 py-11" data-scroll data-scroll-speed="0.2">
          {/* Logo */}
          <div className="w-[120px] h-[89px] relative flex items-center justify-center" data-scroll data-scroll-speed="0.3">
            <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.1029 0H38.2904L13.3902 28.4085C13.3902 28.4085 -1.7703 25.539 7.82101 11.1912L17.1029 0Z" fill="#76B3F8"/>
              <path d="M30.102 30.9909L18.6543 44.1908C18.6543 44.1908 -13.9098 39.3011 7.01165 12.4766C7.01165 12.4766 0.709234 25.8257 13.3945 28.4083L30.102 30.9909Z" fill="#A0EAF6"/>
              <path d="M36.9688 55.2386H15.7812L40.6815 26.8301C40.6815 26.8301 55.842 29.6996 46.2507 44.0474L36.9688 55.2386Z" fill="#965BF9"/>
              <path d="M23.9688 24.2487L35.4164 11.0488C35.4164 11.0488 67.9805 15.9385 47.0591 42.7631C47.0591 42.7631 53.3615 29.4139 40.6762 26.8313L23.9688 24.2487Z" fill="#DA7AD4"/>
            </svg>
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-[#202126] text-center" data-scroll data-scroll-speed="0.2">
            Find the perfect plan to power your creativity
          </h1>

          {/* Payment Options */}
          <div className="flex items-center p-1.5 gap-2.5 w-[372px] h-[52px] bg-[#F6F8FA] border border-[#CDD0D5] rounded-xl" data-scroll data-scroll-speed="0.1">
            <button 
              onClick={() => setIsYearly(false)}
              className={`flex justify-center items-center px-3 py-2.5 flex-1 rounded-lg ${!isYearly ? styles['gradient-button'] : 'bg-white'}`}
            >
              <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-[#202126]'}`}>Pay Monthly</span>
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`flex justify-center items-center px-4 py-2.5 flex-1 rounded-lg ${isYearly ? styles['gradient-button'] : 'bg-white'}`}
            >
              <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-[#202126]'}`}>Pay Yearly</span>
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[921px] mt-5" data-scroll data-scroll-speed="0.1">
            {/* Starter Plan */}
            <div className={styles['pricing-card']}>
              <div className={styles['plan-icon']}>
                <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.1029 0H38.2904L13.3902 28.4085C13.3902 28.4085 -1.7703 25.539 7.82101 11.1912L17.1029 0Z" fill="#76B3F8"/>
                  <path d="M30.102 30.9909L18.6543 44.1908C18.6543 44.1908 -13.9098 39.3011 7.01165 12.4766C7.01165 12.4766 0.709234 25.8257 13.3945 28.4083L30.102 30.9909Z" fill="#A0EAF6"/>
                  <path d="M36.9688 55.2386H15.7812L40.6815 26.8301C40.6815 26.8301 55.842 29.6996 46.2507 44.0474L36.9688 55.2386Z" fill="#965BF9"/>
                  <path d="M23.9688 24.2487L35.4164 11.0488C35.4164 11.0488 67.9805 15.9385 47.0591 42.7631C47.0591 42.7631 53.3615 29.4139 40.6762 26.8313L23.9688 24.2487Z" fill="#DA7AD4"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#202126]">Starter Plan</h2>
              <p className="text-sm text-[#202126]">For hobbyists and beginners exploring AI-powered design.</p>
              <div className="text-3xl font-medium text-[#202126]">
                ${isYearly ? plans.starter.yearly : plans.starter.monthly}
                {isYearly && <span className="text-sm ml-1">/year</span>}
                {!isYearly && <span className="text-sm ml-1">/month</span>}
              </div>
              {isYearly && (
                <div className="text-sm text-green-600">Save 10% with yearly billing</div>
              )}
              <button className={`w-full py-2.5 px-3 border border-[#D3BBFB] rounded-lg text-sm font-medium ${styles['gradient-text']}`}>
                Get Started Now
              </button>
              <div className={styles['plan-features']}>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">1,500 Credits</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">50 AI-Generated Designs</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">Seamless Integration</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">Enhanced privacy</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">Decentralized Applications</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`${styles['pricing-card']} bg-gradient-to-b from-[#2A0856] to-[#3E0B80] text-white`}>
              <div className={styles['plan-icon']}>
                <svg width="47" height="51" viewBox="0 0 47 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.2928 1.98633H32.378L12.2946 26.686C12.2946 26.686 0.0757356 24.1859 7.80479 11.7156L15.2928 1.98633Z" fill="white" stroke="#2B0958" stroke-width="2" stroke-miterlimit="10"/>
                  <path d="M25.7779 28.9306L16.5423 40.4069C16.5423 40.4069 -9.71843 36.1597 7.15591 12.8457C7.15591 12.8457 2.07853 24.4425 12.3086 26.6865L25.7779 28.9306Z" fill="white" stroke="#2B0958" stroke-width="2" stroke-miterlimit="10"/>
                  <path d="M31.3079 50.0004H14.2227L34.3061 25.3008C34.3061 25.3008 46.525 27.8009 38.7959 40.2712L31.3079 50.0004Z" fill="white" stroke="#2B0958" stroke-width="2" stroke-miterlimit="10"/>
                  <path d="M20.8203 23.0564L30.056 11.5801C30.056 11.5801 56.3167 15.8272 39.4424 39.1413C39.4424 39.1413 44.5197 27.5445 34.2897 25.3004L20.8203 23.0564Z" fill="white" stroke="#2B0958" stroke-width="2" stroke-miterlimit="10"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Pro Plan</h2>
              <p className="text-sm">For professionals looking to elevate their workflow.</p>
              <div className="text-3xl font-medium">
                ${isYearly ? plans.pro.yearly : plans.pro.monthly}
                {isYearly && <span className="text-sm ml-1">/year</span>}
                {!isYearly && <span className="text-sm ml-1">/month</span>}
              </div>
              {isYearly && (
                <div className="text-sm text-green-300">Save 10% with yearly billing</div>
              )}
              <button className={`w-full py-2.5 px-4 ${styles['gradient-button']} rounded-lg text-base font-medium text-white`}>
                Get Started Now
              </button>
              <div className={styles['plan-features']}>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">5,000 Credits</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">200 AI-Generated Designs</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">50 AI Videos</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">4K Image Generation</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">Save & Download Designs</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium">Commercial License</span>
                </div>
              </div>
            </div>

            {/* Studio Plan */}
            <div className={styles['pricing-card']}>
              <div className={styles['plan-icon']}>
                <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.1029 0H38.2904L13.3902 28.4085C13.3902 28.4085 -1.7703 25.539 7.82101 11.1912L17.1029 0Z" fill="#76B3F8"/>
                  <path d="M30.102 30.9909L18.6543 44.1908C18.6543 44.1908 -13.9098 39.3011 7.01165 12.4766C7.01165 12.4766 0.709234 25.8257 13.3945 28.4083L30.102 30.9909Z" fill="#A0EAF6"/>
                  <path d="M36.9688 55.2386H15.7812L40.6815 26.8301C40.6815 26.8301 55.842 29.6996 46.2507 44.0474L36.9688 55.2386Z" fill="#965BF9"/>
                  <path d="M23.9688 24.2487L35.4164 11.0488C35.4164 11.0488 67.9805 15.9385 47.0591 42.7631C47.0591 42.7631 53.3615 29.4139 40.6762 26.8313L23.9688 24.2487Z" fill="#DA7AD4"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#202126]">Studio Plan</h2>
              <p className="text-sm text-[#202126]">For agencies and brands needing high-volume creation.</p>
              <div className="text-3xl font-medium text-[#202126]">
                ${isYearly ? plans.studio.yearly : plans.studio.monthly}
                {isYearly && <span className="text-sm ml-1">/year</span>}
                {!isYearly && <span className="text-sm ml-1">/month</span>}
              </div>
              {isYearly && (
                <div className="text-sm text-green-600">Save 10% with yearly billing</div>
              )}
              <button className={`w-full py-2.5 px-3 border border-[#D3BBFB] rounded-lg text-sm font-medium ${styles['gradient-text']}`}>
                Get Started Now
              </button>
              <div className={styles['plan-features']}>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">10,000 Credits</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">1,000 AI-Generated Designs</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">125 AI Videos</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">4K & 8K HD Rendering</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">Priority Processing</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">AI-Powered Enhancements</span>
                </div>
                <div className={styles['feature-item']}>
                  <span className="text-sm font-medium text-[#202126]">Dedicated Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* One Time Credits */}
          <div className={`${styles['pricing-card']} mt-6 max-w-[273px]`}>
            <div className={styles['plan-icon']}>
              <div className="w-[35px] h-[39px] relative">
                <div className="absolute bg-[#76B3F8]" />
                <div className="absolute bg-[#A0EAF6]" />
                <div className="absolute bg-[#965BF9]" />
                <div className="absolute bg-[#DA7AD4]" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-[#202126]">One Time Credits</h2>
            <p className="text-sm text-[#202126]">No subscription! No problem!</p>
            <div className="text-3xl font-medium text-[#202126]">$49</div>
            <button className={`w-full py-2.5 px-3 border border-[#D3BBFB] rounded-lg text-sm font-medium ${styles['gradient-text']}`}>
              Get Started Now
            </button>
            <div className={styles['plan-features']}>
              <div className={styles['feature-item']}>
                <span className="text-sm font-medium text-[#202126]">1,500 Credits</span>
              </div>
              <div className={styles['feature-item']}>
                <span className="text-sm font-medium text-[#202126]">50 AI-Generated Designs</span>
              </div>
              <div className={styles['feature-item']}>
                <span className="text-sm font-medium text-[#202126]">Seamless Integration</span>
              </div>
              <div className={styles['feature-item']}>
                <span className="text-sm font-medium text-[#202126]">Enhanced privacy</span>
              </div>
              <div className={styles['feature-item']}>
                <span className="text-sm font-medium text-[#202126]">Decentralized Applications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Offers Section */}
        <div className={styles['special-offers']} data-scroll data-scroll-section>
          <h2 className="text-3xl font-bold text-center mb-8" data-scroll data-scroll-speed="0.2">Special offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1200px] mx-auto px-4" data-scroll data-scroll-speed="0.1">
            {/* Education Discount */}
            <div className={styles['offer-card']}>
              <h3 className="text-2xl font-semibold">Educational Discount</h3>
              <p className="text-2xl font-semibold">📚 Education Discount – Students & educators get 30% off.</p>
              <button className={`w-full py-3.5 px-4.5 ${styles['gradient-button']} rounded-lg text-xl font-semibold text-white`}>
                Apply for the discount
              </button>
            </div>

            {/* Enterprise Discount */}
            <div className={styles['offer-card']}>
              <h3 className="text-2xl font-semibold">Enterprise Discount</h3>
              <p className="text-2xl font-semibold">🏢 Enterprise Plans – Need a custom solution?</p>
              <button className={`w-full py-3.5 px-4.5 ${styles['gradient-button']} rounded-lg text-xl font-semibold text-white`}>
                Contact us
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16" data-scroll data-scroll-section>
          <h2 className="text-5xl font-bold text-[#1B1464] text-center mb-12" data-scroll data-scroll-speed="0.2">
            Frequently Asked Questions
          </h2>
          <div className="max-w-[1200px] mx-auto px-4" data-scroll data-scroll-speed="0.1">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </div>
    </div>
  );
} 