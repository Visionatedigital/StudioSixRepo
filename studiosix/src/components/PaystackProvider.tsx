import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PaystackConfig, formatAmountForPaystack, generateTransactionReference } from '@/lib/paystack';

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
  const handlerRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const currentTransactionRef = useRef<string | null>(null);

  const resetState = useCallback(() => {
    setIsLoading(false);
    handlerRef.current = null;
    isProcessingRef.current = false;
    currentTransactionRef.current = null;
  }, []);

  const initializePayment = useCallback(async () => {
    // Strict mutex lock
    if (isProcessingRef.current || handlerRef.current) {
      console.log('Payment initialization already in progress');
      return;
    }

    try {
      // Generate reference before making the request
      const reference = generateTransactionReference();
      currentTransactionRef.current = reference;
      
      // Set mutex lock
      isProcessingRef.current = true;
      setIsLoading(true);
      
      console.log('Initializing payment with reference:', reference);
      
      // Initialize payment with backend
      const response = await fetch('/api/payments/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: formatAmountForPaystack(Number(config.amount)),
          currency: config.currency,
          type: config.metadata?.type,
          packageId: config.metadata?.packageId,
          reference, // Send our generated reference
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      if (!data.authorizationUrl) {
        throw new Error('Failed to initialize payment');
      }

      // Verify the reference matches
      if (data.reference !== reference) {
        console.error('Reference mismatch:', { sent: reference, received: data.reference });
        throw new Error('Transaction reference mismatch');
      }

      // Open Paystack popup
      handlerRef.current = window.PaystackPop.setup({
        ...config,
        amount: formatAmountForPaystack(Number(config.amount)),
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        ref: reference, // Use our generated reference
        callback: (response: any) => {
          // Verify the reference matches what we sent
          if (response.reference !== reference) {
            console.error('Reference mismatch in callback:', { 
              original: reference, 
              received: response.reference 
            });
            onError?.(new Error('Transaction reference mismatch'));
            router.push('/payment/error');
            resetState();
            return;
          }

          if (response.status === 'success') {
            onSuccess?.(response);
            router.push(`/payment/success?reference=${reference}`);
          } else {
            onError?.(response);
            router.push('/payment/error');
          }
          resetState();
        },
        onClose: () => {
          onClose?.();
          resetState();
        },
      });

      handlerRef.current.openIframe();
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      resetState();
      onError?.(error);
      // Show error message to user
      alert(error.message || 'Payment initialization failed. Please try again.');
    }
  }, [config, onSuccess, onError, onClose, router, resetState]);

  // Cleanup function to reset states when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isProcessingRef.current && !handlerRef.current) {
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