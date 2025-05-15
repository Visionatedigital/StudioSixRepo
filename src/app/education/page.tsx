'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

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
      <Header />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-[120px] sm:pt-[150px] md:pt-[180px] pb-12 md:pb-20">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-[36px] sm:text-[48px] md:text-[64px] font-bold text-[#1B1464] mb-3 md:mb-6">
            30% discount
          </h1>
          <h2 className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-black mb-5 md:mb-8">
            for students & educators
          </h2>
          <p className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-600 max-w-[800px] mx-auto mb-4">
            As a student or educator, you get a 30% discount on any pricing plan.
            Just enter your educational email address and start saving.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-[800px] mx-auto bg-[#F8F9FC] rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-green-500">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-green-500">Verification Email Sent!</h3>
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
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
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter Your Student Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg border border-gray-200 font-poppins text-[14px] md:text-[16px] focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter Your Institute Name"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg border border-gray-200 font-poppins text-[14px] md:text-[16px] focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className={`w-full bg-[#7144D3] text-white font-poppins text-[16px] md:text-[18px] font-medium py-3 md:py-4 rounded-lg transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5A35A9]'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <p className="text-gray-600 text-xs md:text-sm">Note that you need to use your active educational email to apply.</p>
            <p className="text-gray-600 text-xs md:text-sm mt-2">
              Not sure your email is eligible?{' '}
              <Link href="/contact" className="text-[#7144D3] hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </div>

        {/* Steps Section */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-center mb-8 md:mb-16">How to get the discount</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Enter Your Email</h3>
              <p className="text-gray-600 text-sm md:text-base">Type in your educational email address into the field above.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2,4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Check your email</h3>
              <p className="text-gray-600 text-sm md:text-base">Click the magic link in the email.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#7144D3]">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M16.59,7.58L10,14.17L7.41,11.59L6,13L10,17L18,9L16.59,7.58Z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">You got the discount</h3>
              <p className="text-gray-600 text-sm md:text-base">Buy some great apps using the link we sent you.</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-[#F8F9FC] rounded-xl md:rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 text-[#7144D3] flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23L19,8M6,12A6,6 0 0,1 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4A8,8 0 0,0 4,12H1L5,16L9,12H6Z"/>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold">Redesign Alternatives</h3>
            </div>
            <p className="text-gray-600 text-sm md:text-base">Generate design alternatives for your sketchup models using our AI tools to create design variations in seconds.</p>
          </div>
          <div className="bg-[#F8F9FC] rounded-xl md:rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 text-[#7144D3] flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M20.71,4.63L19.37,3.29C19,2.9 18.35,2.9 17.96,3.29L9,12.25L11.75,15L20.71,6.04C21.1,5.65 21.1,5 20.71,4.63M7,14A3,3 0 0,0 4,17C4,18.31 2.84,19 2,19C2.92,20.22 4.5,21 6,21A4,4 0 0,0 10,17A3,3 0 0,0 7,14Z"/>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold">Render & Visualization</h3>
            </div>
            <p className="text-gray-600 text-sm md:text-base">1-click sketchup AI render using 6+ styles to create night shots, realistic, cgi, ink sketches, and more.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 