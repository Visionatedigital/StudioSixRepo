import React from 'react';
import { Button } from './ui/button';

interface PayFastButtonProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const PayFastButton: React.FC<PayFastButtonProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const handlePayment = async () => {
    try {
      // Implement PayFast payment logic here
      // This is a placeholder - you'll need to implement the actual payment integration
      console.log('Initiating PayFast payment for amount:', amount);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error as Error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Pay with PayFast
    </Button>
  );
}; 