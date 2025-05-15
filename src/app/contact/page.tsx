'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
        </svg>
      ),
      title: 'Email',
      description: 'Our friendly team is here to help.',
      contact: 'hello@studiosix.ai',
      action: 'Email us'
    },
    {
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
        </svg>
      ),
      title: 'Office',
      description: 'Come say hello at our office.',
      contact: '100 Smith Street, Melbourne',
      action: 'Get directions'
    },
    {
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24">
          <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
        </svg>
      ),
      title: 'Phone',
      description: 'Mon-Fri from 8am to 5pm.',
      contact: '+1 (555) 000-0000',
      action: 'Call us'
    }
  ];

  return (
    <main className="relative max-w-[1728px] min-h-screen bg-white mx-auto overflow-x-hidden">
      {/* Navigation Bar */}
      <Header />

      {/* Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-[120px] sm:pt-[150px] md:pt-[180px] pb-12 md:pb-20">
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] font-bold text-[#1B1464] mb-3 md:mb-6">
            Contact Us
          </h1>
          <p className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-600 max-w-[800px] mx-auto mb-4">
            Have questions about our products or services? Need help getting started?
            Our team is here to help you.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-[#F8F9FC] rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 text-[#7144D3] mb-4">
                {method.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{method.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{method.description}</p>
              <p className="font-medium mb-4">{method.contact}</p>
              <a href="#" className="text-[#7144D3] hover:underline font-medium">{method.action}</a>
            </div>
          ))}
        </div>

        {/* Contact Form Section */}
        <div className="bg-[#F8F9FC] rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12">
          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-green-500">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-green-500">Thank You!</h3>
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                Your message has been received. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-[#7144D3] hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-center mb-6 md:mb-8">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a topic</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7144D3]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  className={`w-full bg-[#7144D3] text-white font-medium text-[16px] md:text-[18px] py-3 md:py-4 rounded-lg transition-colors ${
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
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-center mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-[#F8F9FC] rounded-xl p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3">How do I get started with Studio Six?</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Getting started is easy. Simply sign up for an account, upload your SketchUp model, and start exploring our AI design tools.
              </p>
            </div>
            
            <div className="bg-[#F8F9FC] rounded-xl p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3">What file formats do you support?</h3>
              <p className="text-gray-600 text-sm md:text-base">
                We currently support .skp files from SketchUp, with plans to add more formats in the future.
              </p>
            </div>
            
            <div className="bg-[#F8F9FC] rounded-xl p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3">How much does Studio Six cost?</h3>
              <p className="text-gray-600 text-sm md:text-base">
                We offer various pricing plans to suit different needs. Visit our pricing page for detailed information.
              </p>
            </div>
            
            <div className="bg-[#F8F9FC] rounded-xl p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3">Do you offer educational discounts?</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Yes! We offer a 30% discount for students and educators. Visit our education page to learn more.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
} 