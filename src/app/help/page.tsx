'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import Link from 'next/link';

// Define types for help topics
interface HelpTopic {
  title: string;
  content: string;
  link?: string;
}

interface HelpCategory {
  name: string;
  icon: string;
  topics: HelpTopic[];
}

// Help categories and topics
const helpCategories: HelpCategory[] = [
  {
    name: 'Getting Started',
    icon: 'rocket',
    topics: [
      { 
        title: 'Creating your first design', 
        content: 'Learn how to create your first AI-powered design in Studio Six.',
        link: '/help/getting-started/first-design'
      },
      { 
        title: 'Understanding credits', 
        content: 'Learn how credits work and how they are consumed by different features.',
        link: '/help/features/credits'
      },
      { 
        title: 'Account setup', 
        content: 'Set up your profile, preferences, and notification settings.',
        link: '/help/account/setup'
      }
    ]
  },
  {
    name: 'Features & Tools',
    icon: 'tools',
    topics: [
      { 
        title: 'AI Design Assistant', 
        content: 'Get the most out of our AI design assistant capabilities.',
        link: '/help/features/ai-design-assistant'
      },
      { 
        title: 'Rendering options', 
        content: 'Explore different rendering styles and settings.',
        link: '/help/features/rendering-options'
      },
      { 
        title: 'Video generation', 
        content: 'Create stunning architectural videos from your designs.',
        link: '/help/features/video-generation'
      }
    ]
  },
  {
    name: 'Billing & Subscriptions',
    icon: 'credit-card',
    topics: [
      { 
        title: 'Managing your subscription', 
        content: 'Learn how to upgrade, downgrade or cancel your subscription.',
        link: '/help/billing/managing-subscription'
      },
      { 
        title: 'Payment methods', 
        content: 'Understand the payment options available on Studio Six.',
        link: '/help/billing/payment-methods'
      },
      { 
        title: 'Educational discounts', 
        content: 'See if you qualify for our educational discount program.',
        link: '/help/billing/educational-discounts'
      }
    ]
  },
  {
    name: 'Troubleshooting',
    icon: 'help-circle',
    topics: [
      { 
        title: 'Common issues', 
        content: 'Solutions to the most common problems users encounter.',
        link: '/help/troubleshooting/common-issues'
      },
      { 
        title: 'Rendering failures', 
        content: 'What to do when your renders don\'t complete successfully.',
        link: '/help/troubleshooting/rendering-failures'
      },
      { 
        title: 'Performance optimization', 
        content: 'Tips to improve the performance of the platform.',
        link: '/help/troubleshooting/performance-optimization'
      }
    ]
  }
];

// FAQ questions and answers
const faqItems = [
  {
    question: 'How long does it take to render a design?',
    answer: 'Most designs are rendered within 1-2 minutes, depending on complexity. Video generations may take 3-5 minutes. The platform shows real-time progress so you can track the status of your renderings.'
  },
  {
    question: 'Can I use the designs commercially?',
    answer: 'Yes! All Pro and Studio plan subscribers have full commercial usage rights for their generated designs. Starter plan users can use designs for personal and non-commercial projects only.'
  },
  {
    question: 'What file formats can I upload?',
    answer: 'We support a wide range of formats including JPG, PNG, PDF for sketches and images, and OBJ, FBX, SKP, and 3DS for 3D models. Files should be under a total of 500MB for optimal performance.'
  },
  {
    question: 'How do I request a specific feature?',
    answer: 'We love hearing from our users! You can submit feature requests through your account dashboard under "Feedback" or email them directly to feedback@studiosix.com.'
  },
  {
    question: 'Can I collaborate with team members?',
    answer: 'Absolutely! Studio plan users can invite team members to collaborate on projects. Each team member will have their own login but share the same credit pool and assets.'
  }
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter help topics based on search query
  const filteredCategories = searchQuery 
    ? helpCategories.map(category => ({
        ...category,
        topics: category.topics.filter(topic => 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.topics.length > 0)
    : helpCategories;

  return (
    <main className="bg-white min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-[110px] pb-12 bg-gradient-to-b from-[#F6F8FA] to-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-[36px] md:text-[48px] font-bold text-[#1B1464]">
              How can we help you?
            </h1>
            <p className="mt-4 text-[18px] text-[#4D4D4D] max-w-[700px] mx-auto">
              Find answers to your questions and learn how to get the most out of Studio Six
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-[700px] mx-auto relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon name="search" className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-white border border-[#E0DAF3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#814ADA] focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>
      
      {/* Help Content */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E0DAF3]">
            {helpCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-3 text-[16px] font-medium rounded-t-lg transition-colors ${
                  activeCategory === category.name
                    ? 'bg-white text-[#814ADA] border-t border-l border-r border-[#E0DAF3]'
                    : 'text-[#4D4D4D] hover:bg-white/50 hover:text-[#814ADA]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Display filtered categories */}
          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h2 className="text-[22px] font-bold text-[#1B1464] mb-4">{category.name}</h2>
                  <div className="space-y-4">
                    {category.topics.map((topic, index) => (
                      <div key={index} className="bg-white p-5 rounded-lg border border-[#E0DAF3] hover:shadow-md transition-shadow">
                        <h3 className="text-[18px] font-semibold text-[#1B1464]">{topic.title}</h3>
                        <p className="mt-2 text-[#4D4D4D]">{topic.content}</p>
                        <Link 
                          href={topic.link || `#${topic.title.toLowerCase().replace(/\s+/g, '-')}`} 
                          className="mt-3 inline-flex items-center text-[#814ADA] font-medium hover:underline"
                        >
                          Learn more
                          <Icon name="chevron-right" className="ml-1 w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Display active category
            filteredCategories
              .filter(category => category.name === activeCategory)
              .map((category) => (
                <div key={category.name} className="bg-white rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {category.topics.map((topic, index) => (
                      <div key={index} className="bg-white p-5 rounded-lg border border-[#E0DAF3] hover:shadow-md transition-shadow">
                        <h3 className="text-[18px] font-semibold text-[#1B1464]">{topic.title}</h3>
                        <p className="mt-2 text-[#4D4D4D]">{topic.content}</p>
                        <Link 
                          href={topic.link || `#${topic.title.toLowerCase().replace(/\s+/g, '-')}`} 
                          className="mt-3 inline-flex items-center text-[#814ADA] font-medium hover:underline"
                        >
                          Learn more
                          <Icon name="chevron-right" className="ml-1 w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
      
      {/* Contact Support Banner */}
      <section className="py-12 bg-[#F6F8FA]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="rounded-2xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-[#814ADA] to-[#392CA0] py-12 px-8 text-center">
              <h2 className="text-[28px] font-bold text-white mb-4">Still need help?</h2>
              <p className="text-white/90 mb-8 max-w-[700px] mx-auto">
                Our support team is just a click away. Reach out if you need personalized assistance with 
                your account, subscription, or have technical questions.
              </p>
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                <a 
                  href="mailto:support@studiosix.com"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1B1464] px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  <Icon name="mail" className="w-5 h-5" />
                  Email Support
                </a>
                <Link 
                  href="/help/live-chat"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <Icon name="message-circle" className="w-5 h-5" />
                  Live Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="text-[28px] font-bold text-[#1B1464] text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-[#E0DAF3] overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                    <span className="font-medium text-[#1B1464]">{faq.question}</span>
                    <Icon
                      name="chevron-down"
                      className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Learning Resources Section */}
      <section className="py-12 bg-[#F6F8FA]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-[28px] font-bold text-[#1B1464] text-center mb-8">Learning Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-[180px] relative">
                <Image 
                  src="/images/tutorials-image.jpg" 
                  alt="Video tutorials"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-[20px] font-bold text-[#1B1464] mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch step-by-step tutorials to master every feature of Studio Six.</p>
                <Link 
                  href="/help/tutorials" 
                  className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
                >
                  View tutorials
                  <Icon name="chevron-right" className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-[180px] relative">
                <Image 
                  src="/images/documentation-image.jpg" 
                  alt="Documentation"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-[20px] font-bold text-[#1B1464] mb-2">Documentation</h3>
                <p className="text-gray-600 mb-4">Comprehensive guides and documentation for all Studio Six features.</p>
                <Link 
                  href="/help/docs" 
                  className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
                >
                  Browse docs
                  <Icon name="chevron-right" className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-[180px] relative">
                <Image 
                  src="/images/community-image.jpg" 
                  alt="Community forum"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-[20px] font-bold text-[#1B1464] mb-2">Community Forum</h3>
                <p className="text-gray-600 mb-4">Join discussions with other users and share your experiences.</p>
                <Link 
                  href="/help/community" 
                  className="inline-flex items-center text-[#814ADA] font-medium hover:underline"
                >
                  Join forum
                  <Icon name="chevron-right" className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
} 