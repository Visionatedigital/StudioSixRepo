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
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setError(null);
    isProcessingRef.current = false;
  }, []);

  const initializePayment = useCallback(async () => {
    // Strict mutex lock
    if (isProcessingRef.current) {
      console.log('Payment initialization already in progress');
      return;
    }

    try {
      // Reset error state
      setError(null);
      
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

      // Store the reference in sessionStorage for verification
      sessionStorage.setItem('paystack_reference', data.reference);
      
      // Redirect to Paystack's authorization URL
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      setError(error.message || 'Payment initialization failed. Please try again.');
      resetState();
      onError?.(error);
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
    <div className="w-full">
      <div 
        onClick={handleClick}
        className={`w-full px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-lg transition-all cursor-pointer ${
          (isLoading || isProcessingRef.current) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as any);
          }
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : children}
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
} 