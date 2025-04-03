// Add type declaration for @paystack/inline-js
declare module '@paystack/inline-js';

import { PaystackProps } from '@paystack/inline-js';

export interface PaystackConfig {
  email: string;
  amount: string | number;
  currency: string;
  publicKey: string;
  reference?: string;
  metadata?: {
    type?: string;
    packageId?: string;
  };
  callback?: (response: any) => void;
  onClose?: () => void;
}

export type PaystackResponse = {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
};

// Paystack expects amount in kobo (for NGN) or cents (for other currencies)
export function formatAmountForPaystack(amount: number, currency: string = 'ZAR'): number {
  // Convert amount to smallest currency unit (cents)
  const amountInCents = Math.round(amount * 100);
  return amountInCents;
}

// Format display amount based on currency
export function formatDisplayAmount(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Convert USD to ZAR (using a fixed rate for now)
export function convertUSDToZAR(usdAmount: number): number {
  const exchangeRate = 18.5; // 1 USD = 18.5 ZAR (approximate)
  return Math.round(usdAmount * exchangeRate);
}

export const generateTransactionReference = () => {
  const uuid = crypto.randomUUID();
  return `TX-${uuid}`;
};

export const CURRENCY_CODES = {
  ZAR: 'ZAR',
  NGN: 'NGN',
  USD: 'USD',
  GHS: 'GHS',
  KES: 'KES',
} as const;

export type SupportedCurrency = keyof typeof CURRENCY_CODES;

export const DEFAULT_CURRENCY = 'ZAR' as const; 