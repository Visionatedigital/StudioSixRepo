import Link from 'next/link';
import { Icon } from '@/components/Icons';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Icon name="check" size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#202126] mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
          <div className="space-y-3 w-full">
            <Link
              href="/wallet"
              className="block w-full px-6 py-3 bg-gradient-to-r from-[#814ADA] to-[#392CA0] text-white rounded-xl font-medium text-center hover:opacity-90 transition-opacity"
            >
              View My Credits
            </Link>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 border border-[#D3BBFB] rounded-xl font-medium text-[#814ADA] text-center hover:bg-purple-50 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 