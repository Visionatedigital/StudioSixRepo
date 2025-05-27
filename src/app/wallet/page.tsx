"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import PaystackProvider from '@/components/PaystackProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import MobileMoneyLoadingScreen from '@/components/MobileMoneyLoadingScreen';

// Types
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
  // Add more currencies as needed
};

// Sample transaction data
const recentTransactions = [
  {
    id: 1,
    type: 'credit',
    amount: 500,
    description: 'Added credits',
    date: 'Today, 2:30 PM',
    status: 'completed'
  },
  {
    id: 2,
    type: 'debit',
    amount: 12,
    description: 'Modern Villa Render',
    date: 'Today, 11:45 AM',
    status: 'completed'
  },
  {
    id: 3,
    type: 'debit',
    amount: 8,
    description: 'Interior Scene Generation',
    date: 'Yesterday, 4:20 PM',
    status: 'completed'
  },
  {
    id: 4,
    type: 'credit',
    amount: 100,
    description: 'Referral Bonus',
    date: 'Yesterday, 2:15 PM',
    status: 'completed'
  },
  {
    id: 5,
    type: 'debit',
    amount: 15,
    description: 'Landscape Design Render',
    date: '2 days ago',
    status: 'completed'
  }
];

// Credit package options
const creditPackages = [
  {
    credits: 100,
    priceUSD: 5,
    perCreditUSD: 0.05,
    popular: false,
    icon: '/icons/100-credits-icon.svg'
  },
  {
    credits: 500,
    priceUSD: 20,
    perCreditUSD: 0.04,
    popular: true,
    icon: '/icons/500-credits-icon.svg'
  },
  {
    credits: 1000,
    priceUSD: 35,
    perCreditUSD: 0.035,
    popular: false,
    icon: '/icons/1000-credits-icon.svg'
  }
];

type Transaction = {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'REFUND' | 'BONUS' | 'USAGE';
  description: string;
  createdAt: string;
};

const FIXED_USD_TO_UGX = 3870;

export default function WalletPage() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages[0] | null>(null);
  const [showMobileMoneyLoading, setShowMobileMoneyLoading] = useState(false);
  const [mobileMoneyPaymentId, setMobileMoneyPaymentId] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'mtn' | 'airtel'>('mtn');
  const router = useRouter();

  // Extract the fetchCredits function for reuse
  const fetchCredits = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await fetch('/api/credits/balance');
      const data = await response.json();
      if (response.ok) {
        setCredits(data.credits);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
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
        
        // Map country to currency (simplified version)
        const currencyMap: Record<string, string> = {
          US: 'USD',
          GB: 'GBP',
          EU: 'EUR',
          AU: 'AUD',
          CA: 'CAD',
          JP: 'JPY',
          UG: 'UGX',
          KE: 'KES',
          ZA: 'ZAR',
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

  // Update the convertPrice function to ensure proper number output
  const convertPrice = (priceUSD: number, forDisplay: boolean = true) => {
    if (!exchangeRates[selectedCurrency]) {
      return forDisplay ? priceUSD.toFixed(2) : priceUSD;
    }
    
    const converted = priceUSD * exchangeRates[selectedCurrency];
    
    if (forDisplay) {
      // For display purposes, format with locale string
      if (['UGX', 'KES', 'JPY'].includes(selectedCurrency)) {
        return Math.round(converted).toLocaleString();
      }
      return converted.toFixed(2);
    }
    
    // For payment processing, return the exact number
    return Number(converted.toFixed(2));
  };

  const handlePurchaseClick = (pkg: typeof creditPackages[0]) => {
    setSelectedPackage(pkg);
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = async (method: 'card' | 'mobile' | 'west-africa', data?: any) => {
    if (!selectedPackage || !session?.user?.email) return;

    switch (method) {
      case 'card':
        // Show Paystack payment modal
        const paystackButton = document.getElementById('paystack-button');
        if (paystackButton) {
          paystackButton.click();
        }
        break;
      case 'mobile':
        if (!data?.phoneNumber || !data?.provider) {
          toast.error('Please provide your phone number and select a provider');
          return;
        }
        
        try {
          setShowPaymentSelector(false);
          
          const toastId = toast.loading('Initiating mobile money payment...');
          
          // Calculate UGX amount
          let ugxAmount = 0;
          if (selectedCurrency === 'UGX') {
            // Use the package's UGX price
            if (selectedPackage.credits === 100) ugxAmount = 20000;
            else if (selectedPackage.credits === 500) ugxAmount = 90000;
            else if (selectedPackage.credits === 1000) ugxAmount = 170000;
          } else {
            // Convert USD price to UGX using fixed rate
            ugxAmount = Math.round(selectedPackage.priceUSD * FIXED_USD_TO_UGX);
          }
          
          // Call the Mobile Money API endpoint
          const response = await fetch('/api/payments/mobilemoney', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              packageId: selectedPackage.credits === 100 ? 'basic' : 
                         selectedPackage.credits === 500 ? 'standard' : 'premium',
              phoneNumber: data.phoneNumber,
              ugxAmount
            }),
          });
          
          const result = await response.json();
          
          // Always dismiss the loading toast
          toast.dismiss(toastId);
          
          if (response.ok && result.success) {
            console.log("Mobile money payment initiated:", result);
            setMobileMoneyPaymentId(result.payment.payment_id);
            setMobileMoneyProvider(data.provider);
            setShowMobileMoneyLoading(true);
          } else {
            console.error("Mobile money payment failed:", result);
            toast.error(result.error || 'Failed to initiate mobile money payment');
          }
        } catch (error) {
          console.error('Error initiating mobile money payment:', error);
          toast.dismiss();
          toast.error('An error occurred while processing your payment. Please try again.');
        }
        break;
      case 'west-africa':
        toast.info('West Africa payment coming soon!');
        break;
    }
  };

  const handleMobileMoneySuccess = () => {
    fetchCredits(false);
    toast.success('Payment successful! Your credits have been added.');
    setTimeout(() => {
      setShowMobileMoneyLoading(false);
      router.refresh();
    }, 2000);
  };

  const handleMobileMoneyFailure = (error: string) => {
    toast.error(error || 'Payment failed or was cancelled.');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Please sign in to view your wallet</p>
      </div>
    );
  }

  return (
    <DashboardLayout currentPage="Wallet">
      <div className="w-full h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-hidden pt-2 px-6 pb-6">
        <div className="flex flex-col gap-6">
          {/* Credits Balance Card */}
          <div className="bg-gradient-to-r from-[#814ADA] to-[#392CA0] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-medium opacity-90">Available Credits</span>
                <div className="flex items-center gap-3 mt-2">
                  <Icon name="coins" size={32} className="text-yellow-300" />
                  <span className="text-4xl font-bold">
                    {loading ? '...' : credits}
                  </span>
                </div>
              </div>
              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-opacity-90 transition-colors">
                Add Credits
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Credit Packages */}
            <div className="col-span-2 bg-white rounded-xl border border-[#E0DAF3] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-[#202126]">Credit Packages</h2>
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <div 
                    key={pkg.credits}
                    className={`relative p-4 rounded-xl border ${
                      pkg.popular ? 'border-purple-400' : 'border-[#E0DAF3]'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-medium rounded-full">
                          Most Popular 🔥
                        </span>
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <div className={`flex items-center justify-center mb-4 ${
                        pkg.credits === 100 ? 'gap-1' : 'gap-3'
                      }`}>
                        <Image
                          src={pkg.icon}
                          alt={`${pkg.credits} credits`}
                          width={64}
                          height={64}
                          className="w-16 h-16"
                        />
                        <span className="text-4xl font-bold text-[#202126]">{pkg.credits}</span>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        {currencies[selectedCurrency].symbol}{convertPrice(pkg.perCreditUSD)} per credit
                      </div>
                      <div className="text-xl font-bold text-[#202126] mb-4">
                        {currencies[selectedCurrency].symbol}{convertPrice(pkg.priceUSD)}
                      </div>
                      <button 
                        onClick={() => handlePurchaseClick(pkg)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[#E0DAF3] p-6">
              <h2 className="text-lg font-medium text-[#202126] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-[#F6F8FA] rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon name="gift" size={20} className="text-purple-600" />
                    <span className="font-medium">Redeem Code</span>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-[#F6F8FA] rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon name="users" size={20} className="text-purple-600" />
                    <span className="font-medium">Refer Friends</span>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-[#F6F8FA] rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon name="settings" size={20} className="text-purple-600" />
                    <span className="font-medium">Auto-reload Settings</span>
                  </div>
                  <Icon name="chevron-right" size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-[#E0DAF3] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#202126]">Recent Transactions</h2>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                View All
              </button>
            </div>
            <div className="h-[220px] overflow-y-auto custom-scrollbar pr-2">
              <div className="space-y-3">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No transactions yet</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-medium ${
                          transaction.type === 'USAGE' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'USAGE' ? '-' : '+'}
                          {Math.abs(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      {selectedPackage && (
        <>
          <PaymentMethodSelector
            isOpen={showPaymentSelector}
            onClose={() => setShowPaymentSelector(false)}
            onSelect={handlePaymentMethodSelect}
            amount={Number(convertPrice(selectedPackage.priceUSD, false))}
            currency={currencies[selectedCurrency].symbol}
          />
          
          <MobileMoneyLoadingScreen
            isOpen={showMobileMoneyLoading}
            onClose={() => setShowMobileMoneyLoading(false)}
            provider={mobileMoneyProvider}
            paymentId={mobileMoneyPaymentId}
            onSuccess={handleMobileMoneySuccess}
            onFailure={handleMobileMoneyFailure}
          />
          
          {/* Hidden Paystack button */}
          <div className="hidden">
            <PaystackProvider
              config={{
                email: session?.user?.email || '',
                amount: Math.round(Number(convertPrice(selectedPackage.priceUSD, false)) * 100), // Convert to cents and ensure it's a whole number
                currency: selectedCurrency, // Use the selected currency
                metadata: {
                  type: 'CREDITS',
                  packageId: selectedPackage.credits.toString(),
                },
              }}
              onSuccess={(response) => {
                toast.success('Payment successful!');
                router.refresh();
              }}
              onError={() => {
                toast.error('Payment failed. Please try again.');
              }}
            >
              <button id="paystack-button">Hidden Paystack Button</button>
            </PaystackProvider>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
