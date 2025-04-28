'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check if there's a verification token in the URL
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    if (token) {
      setVerificationToken(token);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend verification email');
      }
      
      // Hide change email form after successful resend
      setShowChangeEmail(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationToken) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email');
      }

      // Set verification success state
      setIsVerified(true);
      
      // Sign out and redirect to sign in to refresh the session
      setTimeout(() => {
        signOut({ callbackUrl: '/sign-in' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white/30 to-[#5D4FF1]/30 overflow-hidden">
      {/* Background with scrolling images */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/60 z-[1]"></div>
        
        <div className="flex animate-scroll-left">
          {/* First set of images */}
          <div className="grid grid-cols-5 auto-rows-[250px] gap-3 p-3 flex-shrink-0">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={`w-[250px] ${i % 3 === 0 ? 'row-span-2' : ''} rounded-lg border-[3px] border-white/90 overflow-hidden`}
              >
                <Image 
                  src={`/gallery/image${(i % 10) + 1}.jpg`} 
                  alt="Gallery image" 
                  width={250} 
                  height={i % 3 === 0 ? 500 : 250} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless scrolling */}
          <div className="grid grid-cols-5 auto-rows-[250px] gap-3 p-3 flex-shrink-0">
            {[...Array(20)].map((_, i) => (
              <div 
                key={`dup-${i}`} 
                className={`w-[250px] ${i % 3 === 0 ? 'row-span-2' : ''} rounded-lg border-[3px] border-white/90 overflow-hidden`}
              >
                <Image 
                  src={`/gallery/image${(i % 10) + 1}.jpg`} 
                  alt="Gallery image" 
                  width={250} 
                  height={i % 3 === 0 ? 500 : 250} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-[480px] bg-white/95 backdrop-blur-md rounded-[16px] shadow-[0px_4px_24px_rgba(0,0,0,0.1)] p-6">
          <div className="flex flex-col items-center">
            {/* Logo */}
            <Link href="/" className="block mb-4">
              <Image
                src="/studio-six-logo.svg"
                alt="Studio Six Logo"
                width={144}
                height={48}
                className="w-[144px] object-contain"
                priority
              />
            </Link>
            
            <h1 className="text-2xl font-bold text-[#1B1464] mb-2">
              {isVerified ? 'Email Verified!' : verificationToken ? 'Verify Email' : 'Check Your Email'}
            </h1>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              {isVerified 
                ? 'Your email has been verified successfully. Redirecting to dashboard...'
                : verificationToken 
                  ? 'Click the button below to verify your email address.'
                  : showChangeEmail
                    ? 'Enter your email address to receive a new verification link.'
                    : `We've sent a verification link to ${email}. Please check your inbox and spam folder.`}
            </p>

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {isVerified && (
              <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="check-circle" className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-600">Email verified successfully!</p>
                </div>
              </div>
            )}

            {verificationToken && !isVerified ? (
              <button
                type="button"
                onClick={handleVerifyToken}
                disabled={isLoading || isVerified}
                className="w-full h-[46px] bg-[#844BDC] text-white rounded-[12px] font-medium hover:bg-[#844BDC]/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Icon name="spinner" className="animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            ) : showChangeEmail ? (
              <div className="w-full space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowChangeEmail(false)}
                    className="flex-1 h-[46px] bg-gray-100 text-gray-700 rounded-[12px] font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="flex-1 h-[46px] bg-[#844BDC] text-white rounded-[12px] font-medium hover:bg-[#844BDC]/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Icon name="spinner" className="animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      'Send Link'
                    )}
                  </button>
                </div>
              </div>
            ) : !isVerified && (
              <div className="w-full space-y-4">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full h-[46px] bg-[#844BDC] text-white rounded-[12px] font-medium hover:bg-[#844BDC]/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Icon name="spinner" className="animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeEmail(true)}
                  className="w-full h-[46px] bg-gray-100 text-gray-700 rounded-[12px] font-medium hover:bg-gray-200 transition-colors"
                >
                  Change Email Address
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="w-full h-[46px] bg-red-50 text-red-600 rounded-[12px] font-medium hover:bg-red-100 transition-colors mt-8"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 