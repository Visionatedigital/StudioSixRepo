'use client';

import { useEffect, useRef } from 'react';
import { createPayFastPayment, generatePaymentId } from '@/lib/payfast';

interface PayFastButtonProps {
  amount: number;
  itemName: string;
  itemDescription?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, any>;
}

export function PayFastButton({
  amount,
  itemName,
  itemDescription,
  email,
  firstName,
  lastName,
  metadata = {},
}: PayFastButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = useRef(false);

  const handlePayment = async () => {
    if (isSubmitting.current || !formRef.current) return;
    
    try {
      isSubmitting.current = true;
      
      const paymentId = generatePaymentId();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      
      const payment = await createPayFastPayment({
        amount,
        item_name: itemName,
        item_description: itemDescription,
        email_address: email,
        name_first: firstName,
        name_last: lastName,
        m_payment_id: paymentId,
        return_url: `${appUrl}/payment/success`,
        cancel_url: `${appUrl}/payment/error`,
        notify_url: `${appUrl}/api/payments/payfast/notify`,
        custom_str1: JSON.stringify(metadata),
      });

      // Create hidden form inputs
      Object.entries(payment).forEach(([key, value]) => {
        if (key === 'url') return;
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        formRef.current?.appendChild(input);
      });

      // Set form action and submit
      formRef.current.action = payment.url;
      formRef.current.submit();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
    } finally {
      isSubmitting.current = false;
    }
  };

  // Cleanup form inputs on unmount
  useEffect(() => {
    return () => {
      if (formRef.current) {
        formRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isSubmitting.current}
        className="w-full px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting.current ? 'Processing...' : 'Purchase Credits'}
      </button>
      
      <form
        ref={formRef}
        method="POST"
        target="_blank"
        className="hidden"
      />
    </>
  );
} 