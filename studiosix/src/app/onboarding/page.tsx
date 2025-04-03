'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PaystackProvider from '@/components/PaystackProvider';
import { formatDisplayAmount, convertUSDToZAR } from '@/lib/paystack';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { User as NextAuthUser } from 'next-auth';

interface User extends NextAuthUser {
  subscriptionPlan?: string;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

const pricingPlans = [
  {
    name: 'Starter Plan',
    priceUSD: 1,
    description: 'Perfect for individuals starting their creative journey with AI.',
    features: [
      '1,500 Monthly Credits',
      '50 AI-Generated Designs',
      'Basic Design Templates',
      'Standard Image Resolution',
      'Email Support',
      'Community Access',
      'Basic Export Options'
    ],
    buttonText: 'Get Started Now',
    popular: false
  },
  {
    name: 'Pro Plan',
    priceUSD: 39,
    description: 'Ideal for professionals who need more power and flexibility.',
    features: [
      '5,000 Monthly Credits',
      'Unlimited AI-Generated Designs',
      'Premium Design Templates',
      'High-Resolution Images',
      'Priority Support',
      'Advanced Export Options',
      'Custom Branding',
      'API Access'
    ],
    buttonText: 'Get Started Now',
    popular: true
  },
  {
    name: 'Enterprise Plan',
    priceUSD: 99,
    description: 'For teams and organizations requiring maximum capabilities.',
    features: [
      '15,000 Monthly Credits',
      'Unlimited AI-Generated Designs',
      'All Design Templates',
      'Ultra-High Resolution Images',
      '24/7 Priority Support',
      'All Export Options',
      'Custom Branding',
      'API Access',
      'Team Management',
      'Custom Integration Support'
    ],
    buttonText: 'Get Started Now',
    popular: false
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Set the Pro plan as initially selected
  useEffect(() => {
    const defaultPlan = pricingPlans.find(plan => plan.popular)?.name || pricingPlans[0].name;
    setSelectedPlan(defaultPlan);
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show pricing page to everyone, but require login for payment
  const handlePlanSelection = () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    // Continue with payment flow for logged in users
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#1B1464] mb-2">Welcome to StudioSix!</h1>
          <p className="text-xl text-gray-600">Choose a plan to get started with your creative journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {pricingPlans.map((plan) => {
            const zarPrice = convertUSDToZAR(plan.priceUSD);
            const isHighlighted = plan.name === selectedPlan;
            
            return (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex flex-col h-full transform hover:scale-105 hover:shadow-xl ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white border-transparent' 
                    : 'bg-white border-[#E0DAF3] hover:border-purple-400'
                } ${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-[#814ADA] text-white text-sm font-medium rounded-full whitespace-nowrap shadow-lg">
                      🔥 Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-5">
                  <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                    <path d="M17.1029 0H38.2904L13.3902 28.4085C13.3902 28.4085 -1.7703 25.539 7.82101 11.1912L17.1029 0Z" fill={isHighlighted ? "#fff" : "#76B3F8"}/>
                    <path d="M30.102 30.9909L18.6543 44.1908C18.6543 44.1908 -13.9098 39.3011 7.01165 12.4766C7.01165 12.4766 0.709234 25.8257 13.3945 28.4083L30.102 30.9909Z" fill={isHighlighted ? "#fff" : "#A0EAF6"}/>
                    <path d="M36.9688 55.2386H15.7812L40.6815 26.8301C40.6815 26.8301 55.842 29.6996 46.2507 44.0474L36.9688 55.2386Z" fill={isHighlighted ? "#fff" : "#965BF9"}/>
                    <path d="M23.9688 24.2487L35.4164 11.0488C35.4164 11.0488 67.9805 15.9385 47.0591 42.7631C47.0591 42.7631 53.3615 29.4139 40.6762 26.8313L23.9688 24.2487Z" fill={isHighlighted ? "#fff" : "#DA7AD4"}/>
                  </svg>
                  <h3 className={`text-lg font-bold mb-2 ${isHighlighted ? 'text-white' : 'text-[#1B1464]'}`}>
                    {plan.name} {plan.name === 'Enterprise Plan' && '🚀'}
                  </h3>
                  <p className={`text-sm ${isHighlighted ? 'text-white/80' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className={`text-3xl font-bold ${isHighlighted ? 'text-white' : 'text-[#1B1464]'}`}>
                    ${plan.priceUSD}
                    <span className={`text-base font-normal ${isHighlighted ? 'text-white/70' : 'text-gray-500'}`}>
                      /mo
                    </span>
                  </div>
                  <div className={`text-sm mt-1 ${isHighlighted ? 'text-white/80' : 'text-gray-500'}`}>
                    Approx. {formatDisplayAmount(zarPrice, 'ZAR')}/mo
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path d="M19.5 12c0-4.1-3.4-7.5-7.5-7.5s-7.5 3.4-7.5 7.5 3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5z" stroke={isHighlighted ? "white" : "#6B7280"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.1 12l1.9 1.9 3.8-3.8" stroke={isHighlighted ? "white" : "#6B7280"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={`text-sm ${isHighlighted ? 'text-white/90' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spacer to push button to bottom */}
                <div className="flex-grow"></div>

                {/* Action Button */}
                <div className="w-full">
                  {session?.user ? (
                    <PaystackProvider
                      config={{
                        amount: zarPrice,
                        currency: 'ZAR',
                        email: session.user.email || '',
                        metadata: {
                          type: 'SUBSCRIPTION',
                          packageId: plan.name.toLowerCase().replace(' ', '-'),
                        },
                      }}
                    >
                      <button
                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                          isHighlighted
                            ? 'bg-white text-[#1B1464] hover:bg-opacity-90'
                            : 'text-white'
                        }`}
                        style={{ 
                          background: isHighlighted ? 'white' : 'transparent',
                          border: 'none',
                          outline: 'none'
                        }}
                      >
                        {plan.buttonText}
                      </button>
                    </PaystackProvider>
                  ) : (
                    <button
                      onClick={handlePlanSelection}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                        isHighlighted
                          ? 'bg-white text-[#1B1464] hover:bg-opacity-90'
                          : 'text-white'
                      }`}
                      style={{ 
                        background: isHighlighted ? 'white' : 'transparent',
                        border: 'none',
                        outline: 'none'
                      }}
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}