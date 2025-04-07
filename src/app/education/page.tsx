'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function EducationPage() {
  const [email, setEmail] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const eduDomains = ['.edu', '.ac.', '.edu.', 'student.', 'university.', 'college.'];
    return eduDomains.some(domain => email.toLowerCase().includes(domain));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!email || !instituteName) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use a valid educational email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setEmail('');
      setInstituteName('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="absolute w-full max-w-[1379px] h-[105px] left-1/2 -translate-x-1/2 top-[20px]">
        <div className="relative w-full h-full">
          {/* Logo */}
          <div className="absolute left-[35px] top-[60%] -translate-y-1/2 flex items-center">
            <Link href="/" className="block">
              <Image
                src="/studio-six-logo.svg"
                alt="Studio Six Logo"
                width={144}
                height={48}
                className="w-[144px] object-contain"
                style={{ height: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Menu */}
          <div className="flex flex-row items-center gap-[40px] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link href="/pricing" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">
              Pricing
            </Link>
            <Link href="/plugins" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Plugins</Link>
            <Link href="/help" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Help</Link>
            <Link href="/about" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">About Us</Link>
            <div className="flex items-center gap-2">
              <Link href="/teams" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">For Teams</Link>
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">New</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-row items-center gap-[16px] absolute right-[20px] top-1/2 -translate-y-1/2">
            <Link 
              href="/sign-in" 
              className="flex justify-center items-center px-6 py-2.5 bg-[#F8F8F8] rounded-lg hover:bg-[#F0F0F0]"
            >
              <span className="font-poppins text-[16px] font-medium whitespace-nowrap text-black">Log in</span>
            </Link>
            <Link 
              href="/sign-in" 
              className="flex justify-center items-center px-6 py-2.5 border border-[#7144D3] rounded-lg transition-all duration-300 hover:bg-[#7144D3] group"
            >
              <span className="font-poppins text-[16px] font-medium whitespace-nowrap text-[#7144D3] group-hover:text-white">Create</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-6 pt-[180px] pb-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-[64px] font-bold text-[#1B1464] mb-6">
            30% discount
          </h1>
          <h2 className="text-[48px] font-bold text-black mb-8">
            for students & educators
          </h2>
          <p className="text-[20px] text-gray-600 max-w-[800px] mx-auto mb-4">
            As a student or educator, you get a 30% discount on any pricing plan.
            Just enter your educational email address and start saving.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-[800px] mx-auto bg-[#F8F9FC] rounded-2xl p-12">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 text-green-500">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-500">Verification Email Sent!</h3>
              <p className="text-gray-600 mb-6">
                Please check your email for the verification link. Once verified, your discount will be automatically applied.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-[#7144D3] hover:underline font-medium"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter Your Student Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg border border-gray-200 font-poppins text-[16px] focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter Your Institute Name"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg border border-gray-200 font-poppins text-[16px] focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className={`w-full bg-[#7144D3] text-white font-poppins text-[18px] font-medium py-4 rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5A35A9]'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Get Discount'
                )}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">Note that you need to use your active educational email to apply.</p>
            <p className="text-gray-600 text-sm mt-2">
              Not sure your email is eligible?{' '}
              <Link href="/contact" className="text-[#7144D3] hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mt-24">
          <h2 className="text-[32px] font-bold text-center mb-16">How to get the discount</h2>
          <div className="grid grid-cols-3 gap-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Your Email</h3>
              <p className="text-gray-600">Type in your educational email address into the field above.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Check your email</h3>
              <p className="text-gray-600">Click the magic link in the email.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M16.59,7.58L10,14.17L7.41,11.59L6,13L10,17L18,9L16.59,7.58Z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">You got the discount</h3>
              <p className="text-gray-600">Buy some great apps using the link we sent you.</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-2 gap-8">
          <div className="bg-[#F8F9FC] rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 text-[#7144D3]">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23L19,8M6,12A6,6 0 0,1 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4A8,8 0 0,0 4,12H1L5,16L9,12H6Z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Redesign Alternatives</h3>
            </div>
            <p className="text-gray-600">Generate design alternatives for your sketchup models using our AI tools to create design variations in seconds.</p>
          </div>
          <div className="bg-[#F8F9FC] rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 text-[#7144D3]">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Render & Visualization</h3>
            </div>
            <p className="text-gray-600">1-click sketchup AI render using 6+ styles to create night shots, realistic, cgi, ink sketches, and more.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative w-full max-w-[1728px] mx-auto h-[138px] bg-white">
        <div className="absolute left-[73px] top-[35px] flex items-center gap-4">
          <div className="w-[25px] h-[25px] rounded-full border border-[#6B6B6B]" />
          <div className="flex flex-col">
            <span className="font-inter text-[20px] leading-[40px] text-[#6B6B6B]">StudioSix, 2025</span>
            <span className="font-inter text-[20px] leading-[40px] text-[#6B6B6B]">Visionate (PTY) Ltd. All Rights Reserved</span>
          </div>
        </div>

        {/* Center Menu */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-[51px]">
            <Link href="/pricing" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Pricing</Link>
            <Link href="/plugins" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Plugins</Link>
            <Link href="/help" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Help</Link>
            <Link href="/terms" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Terms and Conditions</Link>
            <Link href="/privacy" className="font-poppins text-[18px] font-medium leading-[27px] text-[#6B6B6B] hover:text-[#1B1464]">Privacy Policy</Link>
          </div>
        </div>

        {/* Social Icons */}
        <div className="absolute right-[160px] top-[46px] flex items-center gap-[18px]">
          <Link href="#" className="w-[37px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full text-black">
              <path fill="currentColor" d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
          </Link>
          <Link href="#" className="w-[36px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#9146FF" d="M11.64 5.93H13.07V10.21H11.64M15.57 5.93H17V10.21H15.57M7 2L3.43 5.57V18.43H7.71V22L11.29 18.43H14.14L20.57 12V2M19.14 11.29L16.29 14.14H13.43L10.93 16.64V14.14H7.71V3.43H19.14Z"/>
            </svg>
          </Link>
          <Link href="#" className="w-[37px] h-[37px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="currentColor" d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
            </svg>
          </Link>
          <Link href="#" className="w-[48px] h-[48px]">
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path fill="#5865F2" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.03-.07c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.04.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
          </Link>
        </div>
      </footer>
    </main>
  );
} 