'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const teamFeatures = [
  {
    title: 'Collaborative Workspace',
    description: 'Work together seamlessly with real-time collaboration tools and shared workspaces.',
    icon: '/icons/collaboration.svg'
  },
  {
    title: 'Team Management',
    description: 'Easily manage team members, roles, and permissions with our intuitive dashboard.',
    icon: '/icons/team.svg'
  },
  {
    title: 'Asset Library',
    description: 'Centralize your design assets in one secure, searchable location.',
    icon: '/icons/assets.svg'
  },
  {
    title: 'Brand Consistency',
    description: 'Maintain brand consistency across all team projects with shared style guides.',
    icon: '/icons/brand.svg'
  },
  {
    title: 'Advanced Analytics',
    description: 'Track team performance and project metrics with detailed analytics.',
    icon: '/icons/analytics.svg'
  },
  {
    title: 'API Access',
    description: 'Integrate with your existing tools and workflows through our robust API.',
    icon: '/icons/api.svg'
  }
];

const testimonials = [
  {
    quote: "Studio Six has transformed how our design team collaborates. The team features are game-changing.",
    author: "Sarah Chen",
    role: "Design Director at TechCorp",
    image: "/images/testimonial-1.jpg"
  },
  {
    quote: "The asset library and brand consistency tools have saved us countless hours.",
    author: "Michael Rodriguez",
    role: "Creative Lead at DesignCo",
    image: "/images/testimonial-2.jpg"
  },
  {
    quote: "Managing our global design team has never been easier with Studio Six.",
    author: "Emma Thompson",
    role: "Head of Design at GlobalBrand",
    image: "/images/testimonial-3.jpg"
  }
];

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full bg-[#F6F8FA] py-20 pt-[160px]">
        <div className="flex flex-col items-center max-w-[1200px] mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold text-[#1B1464] mb-6">
              Design Together, Create Better
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Empower your design team with collaborative tools, shared workspaces, and seamless workflows.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-8 w-full mb-20">
            {teamFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-[#E0DAF3] hover:border-purple-400 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#F6F8FA] rounded-lg flex items-center justify-center mb-6">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={24}
                    height={24}
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1B1464] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Team Plans Section */}
          <div className="w-full mb-20">
            <h2 className="text-3xl font-bold text-[#1B1464] text-center mb-12">
              Team Plans
            </h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
                <h3 className="text-2xl font-bold text-[#1B1464] mb-4">Starter Team</h3>
                <div className="text-4xl font-bold text-[#1B1464] mb-6">
                  $49<span className="text-lg font-normal text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Up to 5 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>5GB storage</span>
                  </li>
                </ul>
                <Link
                  href="/sign-in"
                  className="block w-full py-3 px-6 rounded-lg text-center font-medium bg-[#814ADA] text-white hover:bg-[#6B3BC2] transition-colors"
                >
                  Get Started
                </Link>
              </div>

              <div className="bg-gradient-to-r from-[#814ADA] to-[#392CA0] rounded-2xl p-8 text-white relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-white text-[#814ADA] text-sm font-medium rounded-full whitespace-nowrap shadow-lg">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro Team</h3>
                <div className="text-4xl font-bold mb-6">
                  $99<span className="text-lg font-normal text-white/70">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Up to 15 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>50GB storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link
                  href="/sign-in"
                  className="block w-full py-3 px-6 rounded-lg text-center font-medium bg-white text-[#814ADA] hover:bg-white/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
                <h3 className="text-2xl font-bold text-[#1B1464] mb-4">Enterprise Team</h3>
                <div className="text-4xl font-bold text-[#1B1464] mb-6">
                  Custom<span className="text-lg font-normal text-gray-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#814ADA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dedicated support</span>
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="block w-full py-3 px-6 rounded-lg text-center font-medium bg-[#814ADA] text-white hover:bg-[#6B3BC2] transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="w-full mb-20">
            <h2 className="text-3xl font-bold text-[#1B1464] text-center mb-12">
              Loved by Design Teams Worldwide
            </h2>
            <div className="grid grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-[#E0DAF3]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B1464]">{testimonial.author}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full bg-gradient-to-r from-[#814ADA] to-[#392CA0] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Team's Design Process?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of design teams already using Studio Six to create amazing work together.
            </p>
            <Link
              href="/sign-in"
              className="inline-block px-8 py-3 bg-white text-[#1B1464] font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E0DAF3] py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <Image
                src="/studio-six-logo.svg"
                alt="Studio Six Logo"
                width={144}
                height={48}
                className="mb-6"
              />
              <p className="text-gray-600 text-sm">
                Empowering creativity with AI-powered design tools.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#1B1464] mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 hover:text-[#814ADA]">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-[#814ADA]">Pricing</Link></li>
                <li><Link href="/plugins" className="text-gray-600 hover:text-[#814ADA]">Plugins</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-[#814ADA]">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#1B1464] mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-gray-600 hover:text-[#814ADA]">Terms and Conditions</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-[#814ADA]">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-[#814ADA]">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-[#814ADA]">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#1B1464] mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-600 hover:text-[#814ADA]">Help Center</Link></li>
                <li><Link href="/tutorials" className="text-gray-600 hover:text-[#814ADA]">Tutorials</Link></li>
                <li><Link href="/api" className="text-gray-600 hover:text-[#814ADA]">API</Link></li>
                <li><Link href="/status" className="text-gray-600 hover:text-[#814ADA]">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#E0DAF3] flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 Studio Six. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-600 hover:text-[#814ADA] text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#814ADA] text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-gray-600 hover:text-[#814ADA] text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 