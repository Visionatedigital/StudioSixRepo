import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaystackConfig, formatAmountForPaystack, convertUSDToZAR } from '@/lib/paystack';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

type PaystackProviderProps = {
  config: Omit<PaystackConfig, 'callback' | 'onClose' | 'publicKey'> & {
    amount: string | number;
  };
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
  children: React.ReactNode;
};

export default function PaystackProvider({
  config,
  onSuccess,
  onError,
  onClose,
  children
}: PaystackProviderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);

  const resetState = useCallback(() => {
    setIsLoading(false);
    isProcessingRef.current = false;
  }, []);

  const initializePayment = useCallback(async () => {
    // Strict mutex lock
    if (isProcessingRef.current) {
      console.log('Payment initialization already in progress');
      return;
    }

    try {
      // Set mutex lock
      isProcessingRef.current = true;
      setIsLoading(true);
      
      // Initialize payment with backend
      const response = await fetch('/api/payments/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: config.amount,
          currency: 'ZAR',
          type: config.metadata?.type,
          packageId: config.metadata?.packageId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (!data.authorizationUrl) {
        throw new Error('Failed to initialize payment');
      }

      // Redirect to Paystack's authorization URL
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      resetState();
      onError?.(error);
      // Show error message to user
      alert(error.message || 'Payment initialization failed. Please try again.');
    }
  }, [config, onError, resetState]);

  // Cleanup function to reset states when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isProcessingRef.current) {
      initializePayment();
    }
  }, [initializePayment]);

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading || isProcessingRef.current}
      className={`w-full px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-lg transition-all ${
        (isLoading || isProcessingRef.current) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
      }`}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
} 