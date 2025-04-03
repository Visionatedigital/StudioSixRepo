"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams?.get("error") || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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

        // Register the user
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${firstName} ${lastName}`,
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
        } else {
          // Always redirect new users to onboarding
          router.push('/onboarding');
          router.refresh();
        }
      } else {
        // Regular sign in
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else {
          // Check user's subscription status
          const session = await fetch('/api/auth/session');
          const sessionData = await session.json();
          
          if (sessionData?.user?.subscriptionStatus === 'ACTIVE') {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
          router.refresh();
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
    signIn("google", { callbackUrl });
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
        <div 
          className={`
            w-full max-w-[380px] 
            bg-white/95 backdrop-blur-md 
            rounded-[16px] 
            shadow-[0px_4px_24px_rgba(0,0,0,0.1)] 
            p-6 
            transition-all duration-700 ease-out
            ${isSignUp ? 'min-h-[720px]' : 'min-h-[600px]'}
          `}
        >
          <div className={`
            flex flex-col items-center
            transition-all duration-700 ease-out
            h-full
          `}>
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
            <p className="font-poppins text-sm text-[#1B1464] mb-6">
              {isSignUp ? 'Sign up to start creating' : 'Sign in to start rendering'}
            </p>

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

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="w-full flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {/* Name fields for sign up */}
                <div className={`
                  transition-all duration-700 ease-out
                  ${isSignUp ? 'h-auto opacity-100 mb-4' : 'h-0 opacity-0 overflow-hidden mb-0'}
                `}>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">First Name</label>
                      <input 
                        type="text"
                        name="firstName"
                        required={isSignUp}
                        disabled={isLoading}
                        className="w-full h-[42px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464] disabled:opacity-50"
                        placeholder="First name"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Last Name</label>
                      <input 
                        type="text"
                        name="lastName"
                        required={isSignUp}
                        disabled={isLoading}
                        className="w-full h-[42px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464] disabled:opacity-50"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Email</label>
                  <input 
                    type="email"
                    name="email"
                    required
                    disabled={isLoading}
                    className="w-full h-[42px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464] disabled:opacity-50"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Password</label>
                  <input 
                    type="password"
                    name="password"
                    required
                    disabled={isLoading}
                    className="w-full h-[42px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464] disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="font-poppins text-sm text-[#1B1464] block mb-1.5">Confirm Password</label>
                    <input 
                      type="password"
                      name="confirmPassword"
                      required={isSignUp}
                      disabled={isLoading}
                      className="w-full h-[42px] px-4 bg-[#F3F4F6] rounded-[8px] font-poppins text-sm text-[#1B1464] disabled:opacity-50"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[46px] bg-gradient-primary rounded-[12px] font-poppins text-sm text-white mt-6 hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            {/* Toggle Sign In/Up */}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 font-poppins text-sm text-[#1B1464] hover:text-[#844BDC] transition-colors duration-300"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
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