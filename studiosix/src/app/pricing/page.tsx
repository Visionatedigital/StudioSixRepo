'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import PaystackProvider from '@/components/PaystackProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDisplayAmount, convertUSDToZAR } from '@/lib/paystack';

// Types from wallet page
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY' | 'UGX' | 'KES' | 'ZAR';

type CurrencyInfo = {
  symbol: string;
  name: string;
};

// Currency configuration
const currencies: Record<CurrencyCode, CurrencyInfo> = {
  USD: { symbol: '$', name: 'USD' },
  EUR: { symbol: '€', name: 'EUR' },
  GBP: { symbol: '£', name: 'GBP' },
  AUD: { symbol: 'A$', name: 'AUD' },
  CAD: { symbol: 'C$', name: 'CAD' },
  JPY: { symbol: '¥', name: 'JPY' },
  UGX: { symbol: 'USh', name: 'UGX' },
  KES: { symbol: 'KSh', name: 'KES' },
  ZAR: { symbol: 'R', name: 'ZAR' },
};

// Pricing plans data
const pricingPlans = [
  {
    name: 'Starter Plan',
    icon: '/icons/logo.svg',
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
    icon: '/icons/logo.svg',
    priceUSD: 69,
    description: 'Ideal for professionals seeking advanced AI design capabilities.',
    features: [
      '5,000 Monthly Credits',
      '300 AI-Generated Designs',
      '50 AI Video Generations',
      '4K Image Resolution',
      'Priority Email Support',
      'Advanced Templates Library',
      'Commercial Usage Rights'
    ],
    buttonText: 'Get Started Now',
    popular: true
  },
  {
    name: 'Studio Plan',
    icon: '/icons/logo.svg',
    priceUSD: 99,
    description: 'Full-scale solution for agencies and creative teams.',
    features: [
      '10,000 Monthly Credits',
      'Unlimited AI Designs',
      'Unlimited Video Generation',
      '8K Ultra HD Resolution',
      '24/7 Priority Support',
      'API Access & Integration',
      'Custom Branding Tools'
    ],
    buttonText: 'Get Started Now',
    popular: false
  }
];

function PricingCard({ 
  title, 
  description, 
  price, 
  features, 
  type 
}: { 
  title: string; 
  description: string; 
  price: number; 
  features: string[]; 
  type: string;
}) {
  const { data: session } = useSession();
  const zarPrice = convertUSDToZAR(price);

  return (
    <div className="flex flex-col p-6 bg-white rounded-lg shadow-lg">
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-4 text-gray-500">{description}</p>
        <div className="mt-8">
          <div className="flex items-baseline gap-x-2">
            <span className="text-4xl font-bold tracking-tight text-gray-900">
              ${price}
            </span>
            <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
              /mo
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            (Approx. {formatDisplayAmount(zarPrice, 'ZAR')}/mo)
          </div>
        </div>
        <ul role="list" className="mt-8 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex">
              <Icon
                name="check-circle"
                className="h-6 w-6 flex-none text-indigo-600"
              />
              <span className="ml-3 text-sm text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      {session?.user?.email && (
        <PaystackProvider
          config={{
            amount: price,
            currency: 'USD',
            email: session.user.email,
            metadata: {
              type: 'SUBSCRIPTION',
              packageId: type.toLowerCase() + '-plan',
            },
          }}
        >
          Get Started
        </PaystackProvider>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('ZAR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/ZAR');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  // Detect user's location and set initial currency
  useEffect(() => {
    const detectUserLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserLocation(data.country);
        
        // Map country to currency
        const currencyMap: Record<string, string> = {
          ZA: 'ZAR',
          US: 'USD',
          GB: 'GBP',
          EU: 'EUR',
          AU: 'AUD',
          CA: 'CAD',
          JP: 'JPY',
          UG: 'UGX',
          KE: 'KES',
        };
        
        if (currencyMap[data.country]) {
          setSelectedCurrency(currencyMap[data.country] as CurrencyCode);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      }
    };

    detectUserLocation();
  }, []);

  // Convert price to selected currency
  const convertPrice = (priceUSD: number) => {
    if (!exchangeRates[selectedCurrency]) return priceUSD;
    const converted = priceUSD * exchangeRates[selectedCurrency];
    
    // Round to whole numbers for currencies that typically don't use decimals
    if (['UGX', 'KES', 'JPY'].includes(selectedCurrency)) {
      return Math.round(converted).toLocaleString();
    }
    
    return converted.toFixed(2);
  };

  // Calculate yearly price (20% discount)
  const getPrice = (basePrice: number) => {
    const price = billingCycle === 'yearly' ? basePrice * 0.8 : basePrice;
    return convertPrice(price);
  };

  return (
    <DashboardLayout currentPage="Pricing">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-y-auto">
        <div className="flex flex-col items-center max-w-[1200px] mx-auto px-6">
          {/* Title */}
          <h1 className="text-[28px] font-bold text-[#1B1464] text-center mt-6 mb-8">
            Find the perfect plan to power your creativity
          </h1>

          {/* Currency and Billing Cycle Controls */}
          <div className="flex items-center gap-4 mb-8">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
              className="px-3 py-1.5 bg-white border border-[#E0DAF3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(currencies).map(([code, { name }]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center bg-white rounded-full p-1 border border-[#E0DAF3]">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-[#1B1464] shadow-sm'
                    : 'text-gray-500 hover:text-[#1B1464]'
                }`}
                onClick={() => setBillingCycle('monthly')}
              >
                Pay Monthly
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-[#814ADA] text-white'
                    : 'text-gray-500 hover:text-[#1B1464]'
                }`}
                onClick={() => setBillingCycle('yearly')}
              >
                Pay Yearly
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-3 gap-5 w-full pb-6">
            {pricingPlans.map((plan) => {
              const isSelected = selectedPlan === plan.name;
              const isHighlighted = isSelected || (plan.popular && !selectedPlan);
              
              return (
                <div
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`rounded-2xl p-6 border cursor-pointer transition-all duration-300 ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white border-transparent transform hover:scale-105' 
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
                    <Image
                      src={isHighlighted ? '/icons/logo-white.svg' : '/icons/logo.svg'}
                      alt={`${plan.name} icon`}
                      width={32}
                      height={32}
                      className="mb-3"
                    />
                    <h3 className={`text-lg font-bold mb-2 ${isHighlighted ? 'text-white' : 'text-[#1B1464]'}`}>
                      {plan.name} {plan.name === 'Studio Plan' && '🚀'}
                    </h3>
                    <p className={`text-sm ${isHighlighted ? 'text-white/80' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className={`text-3xl font-bold ${isHighlighted ? 'text-white' : 'text-[#1B1464]'}`}>
                      {currencies[selectedCurrency].symbol}{getPrice(plan.priceUSD)}
                      <span className={`text-base font-normal ${isHighlighted ? 'text-white/70' : 'text-gray-500'}`}>
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className={`text-sm mt-1 ${isHighlighted ? 'text-white/80' : 'text-purple-600'}`}>
                        Save 20% with yearly billing
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Image 
                          src={isHighlighted ? '/icons/check-circle-white-icon.svg' : '/icons/check-circle-icon.svg'}
                          alt="check"
                          width={20}
                          height={20}
                          className="flex-shrink-0"
                        />
                        <span className={`text-sm ${isHighlighted ? 'text-white/90' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <PaystackProvider
                    config={{
                      amount: Number(getPrice(plan.priceUSD)),
                      currency: selectedCurrency,
                      metadata: {
                        type: 'SUBSCRIPTION',
                        packageId: plan.name.toLowerCase().replace(' ', '-'),
                      },
                    }}
                    onSuccess={(response) => {
                      toast.success('Payment successful! Your subscription has been activated.');
                      router.refresh();
                    }}
                    onError={() => {
                      toast.error('Payment failed. Please try again.');
                    }}
                  >
                    {plan.buttonText}
                  </PaystackProvider>
                </div>
              );
            })}
          </div>

          {/* Student/Educator Discount Banner */}
          <div className="w-full mt-8 mb-6">
            <div className="relative w-full h-[300px] rounded-2xl overflow-hidden">
              <Image
                src="/images/students-banner.jpg"
                alt="Students walking and smiling"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#814ADA]/60 to-[#392CA0]/60 flex items-center justify-center">
                <div className="max-w-2xl text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">Education Discount</h2>
                  <p className="text-lg mb-6">Students & educators get 30% off all plans</p>
                  <button 
                    className="px-8 py-3 bg-white text-[#1B1464] font-medium rounded-lg hover:bg-opacity-90 transition-colors"
                    onClick={() => {/* Handle discount application */}}
                  >
                    Apply for the discount
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="w-full max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-[#1B1464] text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How does billing work?",
                  answer: "Your subscription begins as soon as you complete your purchase. You'll be billed monthly or yearly depending on your chosen billing cycle. For yearly subscriptions, you'll receive a 20% discount. You can change your billing cycle at any time from your account settings."
                },
                {
                  question: "Can I change my plan later?",
                  answer: "Yes! You can upgrade, downgrade, or change your plan at any time. When you upgrade, you'll get immediate access to the new features, and we'll prorate your billing. If you downgrade, the changes will take effect at the start of your next billing cycle."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for business accounts. All payments are processed securely through our payment partners."
                },
                {
                  question: "How does the education discount work?",
                  answer: "Students and educators can receive a 30% discount on any plan. To qualify, you'll need to verify your status with a valid .edu email address or current school ID. Once verified, the discount will be automatically applied to your subscription."
                },
                {
                  question: "What happens if I run out of credits?",
                  answer: "If you run out of credits before your next billing cycle, you can purchase additional credits or upgrade to a higher tier plan. Unused credits from your monthly allocation roll over for up to one month."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-[#E0DAF3] overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                      <span className="font-medium text-[#1B1464]">{faq.question}</span>
                      <Icon
                        name="chevron-down"
                        className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 