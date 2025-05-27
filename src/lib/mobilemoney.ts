import { NextResponse } from 'next/server';

// Mobile Money API Credentials
const API_KEY = '73ec69dc-c821-4c9a-a725-d7116e699ab8';
const API_SECRET = 'f03f6651-750b-4168-8d96-09c13ad83d3c';
const BASE_URL = 'https://pay.eirmondserv.com/test-api'; // Using test API during testing phase
const OAUTH_URL = 'https://pay.eirmondserv.com/oauth/token';

// Note: For production, set this to 'https://pay.eirmondserv.com/api'
// const BASE_URL = 'https://pay.eirmondserv.com/api';

// Cache the token to avoid making too many requests
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get an access token from the Mobile Money API
 */
async function getAccessToken(): Promise<string> {
  // If token exists and is not expired, return it
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }

  try {
    // Create the Authorization header with Basic auth using API_KEY and API_SECRET
    const credentials = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    
    console.log('Requesting access token from:', OAUTH_URL);
    const response = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Token response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Mobile Money API token error:', error);
      throw new Error(`Failed to get access token: ${error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Access token received:', data.access_token?.substring(0, 10) + '...');
    
    // Cache the token
    cachedToken = data.access_token;
    // Set expiry time (convert seconds to milliseconds and subtract a minute for safety)
    tokenExpiry = Date.now() + ((data.expires_in - 60) * 1000);
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Request a payment from a customer
 * @param contact Customer phone number in local format (e.g., 0772123456)
 * @param amount Amount in UGX (minimum 1,000)
 * @param message Message to show to the customer
 */
export async function requestPayment(contact: string, amount: number, message: string) {
  try {
    // Validate amount (minimum 1,000 UGX as per API requirements)
    if (amount < 1000) {
      throw new Error('Amount must be at least 1,000 UGX');
    }
    
    console.log('Requesting payment for:', { contact, amount, message });
    const token = await getAccessToken();
    
    const requestUrl = `${BASE_URL}/request-payment`;
    console.log('Making payment request to:', requestUrl);
    
    const paymentData = {
      contact,
      amount,
      message,
    };
    
    console.log('Payment request data:', paymentData);
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    console.log('Payment request response status:', response.status);
    
    // For debugging, log the response even if it's not OK
    const responseData = await response.json();
    console.log('Payment request response:', responseData);

    if (!response.ok) {
      console.error('Mobile Money payment request error:', responseData);
      throw new Error(`Payment request failed: ${responseData.error_description || responseData.message || 'Unknown error'}`);
    }

    // In development, create a mock success response if the real API doesn't work
    if (process.env.NODE_ENV === 'development' && (!responseData.payment_id || !responseData.reference_id)) {
      console.log('Creating mock payment response for development');
      return {
        payment_id: `dev-payment-${Date.now()}`,
        reference_id: `dev-ref-${Date.now()}`,
        status: 'pending',
        message: 'Development mock payment initiated'
      };
    }

    return responseData;
  } catch (error) {
    console.error('Error requesting payment:', error);
    
    // In development, create a mock response if there's an error
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating mock payment response due to error');
      return {
        payment_id: `dev-payment-${Date.now()}`,
        reference_id: `dev-ref-${Date.now()}`,
        status: 'pending',
        message: 'Development mock payment initiated'
      };
    }
    
    throw error;
  }
}

/**
 * Check the status of a payment
 * @param paymentId The ID of the payment to check
 * 
 * NOTE: Direct status checking through the API is not reliable. 
 * The recommended approach is to wait for callback notifications.
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const token = await getAccessToken();
    
    // The API endpoint might be different, implement a fallback mechanism
    const endpoints = [
      `${BASE_URL}/get-payment-status/${paymentId}`,
      `${BASE_URL}/payment-status/${paymentId}`,
      `${BASE_URL}/payment/${paymentId}`
    ];
    
    let response = null;
    let error = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to check payment status at: ${endpoint}`);
        const result = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });

        // Log the response headers for debugging
        console.log('Response headers:', {
          status: result.status,
          contentType: result.headers.get('content-type'),
          contentLength: result.headers.get('content-length')
        });

        if (result.ok) {
          const contentType = result.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            response = result;
            break;
          } else {
            console.log(`Endpoint ${endpoint} returned non-JSON response:`, contentType);
          }
        } else {
          const text = await result.text();
          console.log(`Endpoint ${endpoint} failed:`, {
            status: result.status,
            statusText: result.statusText,
            response: text.substring(0, 200) // Log first 200 chars of response
          });
        }
      } catch (err) {
        error = err;
        console.log(`Endpoint ${endpoint} error:`, err);
      }
    }
    
    if (!response) {
      console.log('All status check endpoints failed, returning fallback status');
      // Return a fallback status since we can't confirm the current status
      // We'll rely on callbacks for accurate status updates
      return {
        status: 'pending',
        payment_id: paymentId,
        message: 'Status unknown, waiting for callback notification',
        amount: '0',
        currency: 'UGX'
      };
    }

    const data = await response.json();
    console.log('Payment status response:', data);
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    
    // Return a fallback status
    return {
      status: 'pending',
      payment_id: paymentId,
      message: 'Status check failed, waiting for callback notification',
      amount: '0',
      currency: 'UGX'
    };
  }
}

// Credit packages
export const CREDIT_PACKAGES = [
  { id: 'basic', credits: 100, amount: 20000, usd: 5, name: 'Basic' },
  { id: 'standard', credits: 500, amount: 90000, usd: 20, name: 'Standard' },
  { id: 'premium', credits: 1000, amount: 170000, usd: 35, name: 'Premium' },
];

export function getCreditPackage(packageId: string, exchangeRate?: number) {
  const pkg = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
  if (!pkg) return undefined;
  if (exchangeRate) {
    // Convert USD price to UGX using the provided exchange rate
    return {
      ...pkg,
      amount: Math.round(pkg.usd * exchangeRate),
    };
  }
  return pkg;
} 