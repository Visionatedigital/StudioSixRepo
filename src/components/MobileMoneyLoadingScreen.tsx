import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MobileMoneyLoadingScreenProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'mtn' | 'airtel';
}

export default function MobileMoneyLoadingScreen({
  isOpen,
  onClose,
  provider
}: MobileMoneyLoadingScreenProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const router = useRouter();
  
  // Just track time elapsed for user information
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
            <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-100 rounded-full animate-spin"></div>
          </div>
          
          {/* Status message */}
          <h2 className="text-xl font-semibold text-[#202126] mb-2">
            Mobile Money Payment
          </h2>
          <p className="text-gray-600 mb-4">
            Please enter your PIN on your phone to complete the payment.
          </p>
          <p className="text-gray-600 mb-4">
            Once you've approved the payment, your credits will be added automatically.
          </p>
          
          {/* Timer */}
          <p className="text-sm text-gray-500">
            Time elapsed: {formatTime(timeElapsed)}
          </p>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Close this window
          </button>
        </div>
      </div>
    </div>
  );
} 