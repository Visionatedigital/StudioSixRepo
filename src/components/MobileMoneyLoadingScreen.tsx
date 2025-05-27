import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/Icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { getPaymentConfig } from '@/config/payment';

interface MobileMoneyLoadingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string;
  paymentId: string;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Add payment status type
const STATUS_PENDING = 'pending';
const STATUS_SUCCESS = 'success';
const STATUS_FAILED = 'failed';

type PaymentStatus = typeof STATUS_PENDING | typeof STATUS_SUCCESS | typeof STATUS_FAILED;

export default function MobileMoneyLoadingScreen({
  isOpen,
  onClose,
  provider,
  paymentId,
  onSuccess,
  onFailure
}: MobileMoneyLoadingScreenProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(STATUS_PENDING);
  const [statusMessage, setStatusMessage] = useState('Please enter your PIN on your phone to complete the payment.');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingActiveRef = useRef(false);
  const router = useRouter();
  const config = getPaymentConfig();
  
  // Reset polling state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPollCount(0);
      setIsPolling(false);
      pollingActiveRef.current = false;
      setPaymentStatus(STATUS_PENDING);
      setStatusMessage('Please enter your PIN on your phone to complete the payment.');
      setTimeElapsed(0);
    }
  }, [isOpen]);
  
  // Start timer when component mounts
  useEffect(() => {
    if (!isOpen) return;
    if (paymentStatus !== STATUS_PENDING) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isOpen, paymentStatus]);
  
  // Poll for payment status with robust stop logic
  useEffect(() => {
    if (!isOpen || !paymentId || isPolling || paymentStatus !== STATUS_PENDING) return;
    const MAX_POLL_SECONDS = 120; // 2 minutes
    const POLL_INTERVAL = 5000;
    pollingActiveRef.current = true;
    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      pollingActiveRef.current = false;
      setIsPolling(false);
    };
    const pollPaymentStatus = async () => {
      if (!pollingActiveRef.current) return;
      try {
        // If we've been polling for more than MAX_POLL_SECONDS, show failed
        if (timeElapsed >= MAX_POLL_SECONDS) {
          stopPolling();
          setPaymentStatus(STATUS_FAILED);
          setStatusMessage('Payment status check timeout. Please check your payment status manually.');
          onFailure('Payment status check timeout. Please check your payment status manually.');
          return;
        }
        const response = await fetch(`/api/payments/mobilemoney/status?paymentId=${paymentId}`);
        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          // Ignore parse errors, just keep polling
          return;
        }
        if (data && data.payment && typeof data.payment.status === 'string') {
          const status = data.payment.status.toLowerCase();
          if (status === 'success') {
            stopPolling();
            setPaymentStatus(STATUS_SUCCESS);
            setStatusMessage('Payment successful! Your credits will be added automatically.');
            onSuccess();
            return;
          } else if (status === 'failed' || status === 'cancelled') {
            stopPolling();
            setPaymentStatus(STATUS_FAILED);
            setStatusMessage('Payment failed or was cancelled. Please try again.');
            onFailure(data.payment.message || 'Payment failed or was cancelled');
            return;
          }
          // else, still pending, keep polling
        }
        // else, missing/invalid data, just keep polling
      } catch (error) {
        // Ignore all errors, just keep polling
      }
    };
    pollIntervalRef.current = setInterval(pollPaymentStatus, POLL_INTERVAL);
    setIsPolling(true);
    pollPaymentStatus();
    return () => {
      stopPolling();
    };
  }, [isOpen, paymentId, onSuccess, onFailure, isPolling, paymentStatus, timeElapsed]);
  
  if (!isOpen) return null;
  
  // Visual indicators
  const renderStatusIndicator = () => {
    if (paymentStatus === STATUS_PENDING) {
      return (
        <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-100 rounded-full animate-spin"></div>
      );
    }
    if (paymentStatus === STATUS_SUCCESS) {
      return (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-2">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M7 13l3 3 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      );
    }
    if (paymentStatus === STATUS_FAILED) {
      return (
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-2">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x" size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center py-6">
          {/* Provider logo */}
          <div className="relative w-24 h-24 mb-6">
            <Image
              src={`/icons/Payment images/${provider.toLowerCase()}.png`}
              alt={`${provider} Mobile Money`}
              fill
              className="object-contain"
            />
          </div>
          
          {/* Status indicator */}
          <div className="mb-6">
            {renderStatusIndicator()}
          </div>
          
          {/* Status message */}
          <h2 className="text-xl font-semibold text-[#202126] mb-2">
            Mobile Money Payment
          </h2>
          <p className="text-gray-600 mb-4">
            {statusMessage}
          </p>
          
          {paymentStatus === STATUS_PENDING && (
            <>
              <p className="text-gray-600 mb-4">
                Once you've approved the payment, your credits will be added automatically.
              </p>
              {/* Timer */}
              <p className="text-sm text-gray-500">
                Time elapsed: {formatTime(timeElapsed)}
              </p>
            </>
          )}
          {paymentStatus === STATUS_SUCCESS && (
            <p className="text-green-700 font-medium mb-4">Credits will be added to your account shortly.</p>
          )}
          {paymentStatus === STATUS_FAILED && (
            <p className="text-red-700 font-medium mb-4">No credits were added. Please try again.</p>
          )}
          
          {/* Close button always visible */}
          <button
            onClick={onClose}
            className={`mt-6 px-6 py-2 rounded-lg transition-colors ${paymentStatus === STATUS_SUCCESS ? 'bg-green-100 text-green-700 hover:bg-green-200' : paymentStatus === STATUS_FAILED ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
          >
            Close this window
          </button>
        </div>
      </div>
    </div>
  );
} 