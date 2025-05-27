type Environment = 'development' | 'production';

interface PaymentConfig {
  callbackUrl: string;
  baseUrl: string;
}

export const PAYMENT_CONFIG: Record<Environment, PaymentConfig> = {
  development: {
    callbackUrl: process.env.NEXT_PUBLIC_NGROK_URL ? `${process.env.NEXT_PUBLIC_NGROK_URL}/api/payments/mobilemoney/callback` : 'http://localhost:3000/api/payments/mobilemoney/callback',
    baseUrl: 'https://pay.eirmondserv.com/test-api',
  },
  production: {
    callbackUrl: 'https://studiosix.ai/api/payments/mobilemoney/callback',
    baseUrl: 'https://pay.eirmondserv.com/api',
  }
};

export const getPaymentConfig = () => {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  return PAYMENT_CONFIG[env];
}; 