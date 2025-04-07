interface Env {
  PAYSTACK_SECRET_KEY: string;
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
}

export function verifyEnv(): Env {
  const requiredEnvVars = {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  // Log environment check
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    PAYSTACK_SECRET_KEY: requiredEnvVars.PAYSTACK_SECRET_KEY ? 'Present' : 'Missing',
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: requiredEnvVars.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 'Present' : 'Missing',
    NEXT_PUBLIC_APP_URL: requiredEnvVars.NEXT_PUBLIC_APP_URL ? 'Present' : 'Missing',
  });

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return requiredEnvVars as Env;
} 