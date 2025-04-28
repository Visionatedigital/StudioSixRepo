declare module '@paystack/inline-js' {
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
    callback?: (response: PaystackResponse) => void;
    onClose?: () => void;
  }

  export interface PaystackResponse {
    reference: string;
    trans: string;
    status: string;
    message: string;
    transaction: string;
    trxref: string;
  }

  export interface PaystackInstance {
    newTransaction(config: PaystackConfig): void;
  }

  export default class PaystackPop {
    constructor();
    setup(config: PaystackConfig): PaystackInstance;
  }
} 