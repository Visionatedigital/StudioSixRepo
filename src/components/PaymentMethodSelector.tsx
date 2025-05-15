import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';

type PaymentMethod = 'card' | 'mobile' | 'west-africa';
type MobileProvider = 'mtn' | 'airtel' | '';

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod, data?: any) => void;
  amount: number;
  currency: string;
}

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  onSelect,
  amount,
  currency
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<MobileProvider>('');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = {
    card: {
      title: 'Credit card',
      description: 'Pay with Visa, Mastercard, or American Express',
      icons: [
        { src: '/icons/Payment images/visa.png', alt: 'Visa' },
        { src: '/icons/Payment images/mastercard.png', alt: 'Mastercard' },
        { src: '/icons/Payment images/amex.png', alt: 'American Express' }
      ]
    },
    mobile: {
      title: 'Mobile Money',
      description: 'Pay with MTN Mobile Money or Airtel Money',
      icons: [
        { src: '/icons/Payment images/mtn.png', alt: 'MTN Mobile Money' },
        { src: '/icons/Payment images/airtel.png', alt: 'Airtel Money' }
      ]
    },
    'west-africa': {
      title: 'West Africa Payments',
      description: 'Pay with popular West African payment methods',
      icons: [
        { src: '/payment-icons/west-africa.svg', alt: 'West Africa Payments' }
      ]
    }
  };

  const handleMethodClick = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method === 'mobile') {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    // For the API, we need a phone number starting with 0 followed by 9 digits
    const phoneRegex = /^0[0-9]{9}$/;
    
    if (!phoneRegex.test(number)) {
      setPhoneError('Please enter a valid phone number (e.g., 0772123456)');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Clear error when user types
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleContinue = () => {
    if (selectedMethod === 'mobile') {
      if (!selectedProvider) {
        setPhoneError('Please select a provider (MTN or Airtel)');
        return;
      }
      
      if (!phoneNumber) {
        setPhoneError('Please enter your phone number');
        return;
      }

      // Format and validate phone number
      let formattedNumber = phoneNumber;
      
      // If number starts with +256, remove it and add 0
      if (formattedNumber.startsWith('+256')) {
        formattedNumber = '0' + formattedNumber.substring(4);
      }
      // If number starts with 256, remove it and add 0
      else if (formattedNumber.startsWith('256')) {
        formattedNumber = '0' + formattedNumber.substring(3);
      }
      
      if (!validatePhoneNumber(formattedNumber)) {
        return;
      }
      
      onSelect(selectedMethod, { phoneNumber: formattedNumber, provider: selectedProvider });
    } else {
      onSelect(selectedMethod);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x" size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#202126]">Select Payment Method</h2>
          <p className="text-gray-500 mt-1">Amount: {currency}{amount}</p>
        </div>

        {/* Payment methods */}
        <div className="space-y-3">
          {(Object.keys(paymentMethods) as PaymentMethod[]).map((method) => (
            <div key={method}>
              <button
                onClick={() => handleMethodClick(method)}
                className={`w-full p-4 rounded-xl border transition-all ${
                  selectedMethod === method
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === method ? 'border-purple-500' : 'border-gray-300'
                    }`}>
                      {selectedMethod === method && (
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-[#202126]">
                        {paymentMethods[method].title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {paymentMethods[method].description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentMethods[method].icons.map((icon, index) => (
                      <div 
                        key={index} 
                        className={`relative ${
                          method === 'mobile' ? 'w-12 h-12' : 'w-8 h-8'
                        }`}
                      >
                        <Image
                          src={icon.src}
                          alt={icon.alt}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </button>
              
              {/* Mobile Money Options */}
              {method === 'mobile' && selectedMethod === 'mobile' && isExpanded && (
                <div className="mt-3 p-4 border border-purple-100 rounded-xl bg-purple-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Provider
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedProvider('mtn')}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border ${
                          selectedProvider === 'mtn' 
                            ? 'border-purple-500 bg-white' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="relative w-10 h-10">
                          <Image
                            src="/icons/Payment images/mtn.png"
                            alt="MTN Mobile Money"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium">MTN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProvider('airtel')}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border ${
                          selectedProvider === 'airtel' 
                            ? 'border-purple-500 bg-white' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="relative w-10 h-10">
                          <Image
                            src="/icons/Payment images/airtel.png"
                            alt="Airtel Money"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium">Airtel</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., 0772123456"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className={`w-full p-2 border ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    {phoneError ? (
                      <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                    ) : (
                    <p className="text-xs text-gray-500 mt-1">
                        Enter your phone number in local format (e.g., 0772123456)
                    </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Continue with {paymentMethods[selectedMethod].title}
        </button>
      </div>
    </div>
  );
} 