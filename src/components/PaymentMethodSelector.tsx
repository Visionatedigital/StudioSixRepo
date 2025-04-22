import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';

type PaymentMethod = 'card' | 'mobile' | 'west-africa';

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
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
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`w-full p-4 rounded-xl border transition-all ${
                selectedMethod === method
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedMethod === method ? 'border-purple-500' : 'border-gray-300'}">
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
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={() => onSelect(selectedMethod)}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Continue with {paymentMethods[selectedMethod].title}
        </button>
      </div>
    </div>
  );
} 