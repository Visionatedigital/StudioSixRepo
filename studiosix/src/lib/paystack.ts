// Add type declaration for @paystack/inline-js
declare module '@paystack/inline-js';

import { PaystackProps } from '@paystack/inline-js';

export type PaystackConfig = {
  publicKey: string;
  email: string;
  amount: number;
  currency: string;
  reference?: string;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
  metadata?: {
    type: 'CREDITS' | 'SUBSCRIPTION';
    packageId: string;
  };
};

export type PaystackResponse = {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
};

export const formatAmountForPaystack = (amount: number) => {
  // Paystack expects amount in kobo (multiply by 100)
  return Math.round(amount * 100);
};

export const generateTransactionReference = () => {
  const uuid = crypto.randomUUID();
  return `TX-${uuid}`;
};

export const CURRENCY_CODES = {
  NGN: 'NGN',
  USD: 'USD',
  GHS: 'GHS',
  ZAR: 'ZAR',
  KES: 'KES',
} as const;

export type SupportedCurrency = keyof typeof CURRENCY_CODES; 