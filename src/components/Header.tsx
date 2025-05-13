'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  // Add mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-[1379px] h-[90px] mx-auto relative flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="block">
            <Image
              src="/studio-six-logo.svg"
              alt="Studio Six Logo"
              width={90}
              height={36}
              className="w-[85px] md:w-[100px] object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-[40px]">
          <Link href="/about" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">About Us</Link>
          <Link href="/pricing" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Pricing</Link>
          <Link href="/help" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Help</Link>
          <div className="flex items-center gap-2">
            <Link href="/education" className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80">Educational Licenses</Link>
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">New</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row items-center gap-[16px]">
          <Link 
            href="/sign-in" 
            className="hidden sm:flex justify-center items-center px-6 py-2.5 bg-[#F8F8F8] rounded-lg hover:bg-[#F0F0F0]"
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
        
        {/* Mobile Menu Button (hidden on desktop) */}
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden flex items-center"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="flex flex-col py-4 px-6 space-y-4">
            <Link href="/about" 
              className="font-poppins text-[17px] font-medium leading-[20px] text-black py-2 hover:opacity-80"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link href="/pricing" 
              className="font-poppins text-[17px] font-medium leading-[20px] text-black py-2 hover:opacity-80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link href="/help" 
              className="font-poppins text-[17px] font-medium leading-[20px] text-black py-2 hover:opacity-80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Help
            </Link>
            <div className="flex items-center gap-2 py-2">
              <Link href="/education" 
                className="font-poppins text-[17px] font-medium leading-[20px] text-black hover:opacity-80"
                onClick={() => setMobileMenuOpen(false)}
              >
                Educational Licenses
              </Link>
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">New</span>
            </div>
            {/* Mobile only login link */}
            <Link 
              href="/sign-in" 
              className="sm:hidden font-poppins text-[17px] font-medium leading-[20px] text-black py-2 hover:opacity-80"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 