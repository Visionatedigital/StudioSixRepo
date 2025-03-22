import { createHash } from 'crypto';

export type PayFastConfig = {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address: string;
  m_payment_id: string;
  amount: string | number;
  item_name: string;
  item_description?: string;
  payment_method?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
};

export const PAYFAST_CONFIG = {
  merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '27493181',
  merchant_key: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || 'szjzkvyzhlzgr',
  passPhrase: process.env.PAYFAST_PASSPHRASE || 'Ombre1sulgiallo',
  testMode: false, // Force production mode
  baseUrl: 'https://www.payfast.co.za' // Always use production URL
};

export const generatePaymentId = () => {
  return `PF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatAmountForPayFast = (amount: number) => {
  // PayFast expects amount in ZAR with 2 decimal places
  return Number(amount.toFixed(2));
};

export const generateSignature = (data: Record<string, string>) => {
  // Create a new object with only the fields we want to sign
  const dataToSign = { ...data };
  
  // Remove fields that shouldn't be included in signature
  delete dataToSign.signature;
  delete dataToSign.url;
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(dataToSign).sort();
  
  // Build parameter string
  const paramString = sortedKeys
    .filter(key => dataToSign[key] !== undefined && dataToSign[key] !== '')
    .map(key => {
      const value = String(dataToSign[key])
        .trim()
        .replace(/ /g, '+');
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  // Add passphrase if it exists
  const finalString = PAYFAST_CONFIG.passPhrase
    ? `${paramString}&passphrase=${encodeURIComponent(PAYFAST_CONFIG.passPhrase)}`
    : paramString;

  console.log('Signature string:', finalString); // Debug log

  // Generate MD5 hash
  return createHash('md5')
    .update(finalString)
    .digest('hex')
    .toUpperCase(); // PayFast expects uppercase signature
};

export const createPayFastPayment = async (config: Omit<PayFastConfig, 'merchant_id' | 'merchant_key'>) => {
  // Prepare payment data with required fields
  const paymentData: Partial<PayFastConfig> = {
    merchant_id: PAYFAST_CONFIG.merchant_id,
    merchant_key: PAYFAST_CONFIG.merchant_key,
    return_url: config.return_url,
    cancel_url: config.cancel_url,
    notify_url: config.notify_url,
    amount: formatAmountForPayFast(Number(config.amount)).toString(),
    item_name: config.item_name,
    email_address: config.email_address,
    m_payment_id: config.m_payment_id,
  };

  // Add optional fields if they exist
  if (config.name_first) paymentData.name_first = config.name_first;
  if (config.name_last) paymentData.name_last = config.name_last;
  if (config.item_description) paymentData.item_description = config.item_description;
  if (config.custom_str1) paymentData.custom_str1 = config.custom_str1;

  // Convert all values to strings
  const stringData = Object.entries(paymentData).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = String(value).trim();
    }
    return acc;
  }, {} as Record<string, string>);

  // Generate signature
  const signature = generateSignature(stringData);

  // Return final payment data
  return {
    ...stringData,
    signature,
    url: PAYFAST_CONFIG.baseUrl + '/eng/process',
  };
}; 