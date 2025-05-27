"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams?.get("error") || null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Check for verified parameter
  const verified = searchParams?.get("verified") === "true";

  // Set success message if the user was redirected after verification
  useEffect(() => {
    if (verified) {
      setSuccessMessage("Email verified successfully! Please sign in to continue.");
    }
  }, [verified]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isSignUp) {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        // Combine first and last name
        const name = `${firstName} ${lastName}`.trim();

        // Register the user
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to create account');
          setIsLoading(false);
          return;
        }

        // If registration successful, sign in the user
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Failed to sign in after registration");
          console.error("Sign in error after registration:", signInResult.error);
        } else {
          // New users should always go to onboarding
          router.push('/onboarding');
          router.refresh();
        }
      } else {
        // Regular sign in
        console.log("Attempting sign in with:", { email });
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        console.log("Sign in result:", result);

        if (result?.error) {
          setError("Invalid email or password");
          console.error("Sign in error:", result.error);
        } else {
          try {
            // Check if user has completed onboarding
            const userResponse = await fetch('/api/user/me');
            if (!userResponse.ok) {
              throw new Error('Failed to fetch user data');
            }
            const userData = await userResponse.json();
            console.log('User data:', userData);
            
            if (!userData.hasCompletedOnboarding) {
              console.log('User has not completed onboarding, redirecting to onboarding');
              router.push('/onboarding');
            } else {
              console.log('User has completed onboarding, redirecting to dashboard');
              router.push('/dashboard');
            }
            router.refresh();
          } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to fetch user data. Please try again.');
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error("Sign in/up error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: '/api/auth/check-onboarding' });
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
        {/* Sign In/Up Form */}
        <div className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-[16px] shadow-[0px_4px_24px_rgba(0,0,0,0.1)] p-6">
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
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            
            <p className="text-sm text-gray-600 mb-6">
              {isSignUp ? 'Sign up to start creating' : 'Sign in to continue'}
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Google Sign In */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-[46px] bg-white border border-[#E5E7EB] shadow-sm rounded-[12px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/google-icon.svg"
                alt="Google"
                width={18}
                height={18}
              />
              <span className="font-poppins text-[14px] text-[#1B1464]">
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="w-full flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="font-poppins text-xs text-[#6B7280]">or</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-[#E0DAF3] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#844BDC] focus:border-[#844BDC]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#844BDC] to-[#AC4FF1] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#844BDC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
} 