'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a verification token in the URL
    const token = searchParams.get('token');
    if (token) {
      setVerificationToken(token);
      setShowVerification(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any default form submission behavior
    setError(null);
    setIsLoading(true);

    // Log the values being sent
    console.log('Submitting form with:', { email, password, name });

    // Validate required fields
    if (!email || !password || !name) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      // First, register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          name: name.trim(),
        }),
      });

      const data = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Show verification state
      setShowVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!verificationToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/verify-email/${verificationToken}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to verify email');
      }

      // Redirect to dashboard after successful verification
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            {showVerification ? 'Check Your Email' : 'Create Your Account'}
          </h1>
          <p className="mt-2 text-gray-600">
            {showVerification 
              ? verificationToken 
                ? 'Enter the verification code from your email.'
                : 'We\'ve sent a verification link to your email address.'
              : 'Join StudioSix and start creating amazing content.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {showVerification ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon name="mail" className="text-yellow-500 w-8 h-8" />
              </div>
              {verificationToken ? (
                <div className="w-full space-y-4">
                  <p className="text-gray-600 text-center">
                    Click the button below to verify your email address.
                  </p>
                  <button
                    type="button"
                    onClick={handleVerifyToken}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <p className="text-gray-600 text-center">
                    Please check your inbox and click the verification link to complete your registration.
                  </p>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Icon name="spinner" className="animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
} 