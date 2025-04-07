'use client';

import { useState } from 'react';

const faqs = [
  {
    question: "How do I get started with Studio Six?",
    answer: "Getting started is simple! Sign up for a free account, upload your first design (sketch or 3D model), choose your preferred rendering style, and get your first AI-powered render in minutes. Our intuitive interface guides you through each step, making it easy even for first-time users."
  },
  {
    question: "What's included in the free plan?",
    answer: "Our free plan includes 3 AI-powered renders per month, access to basic rendering styles, standard resolution outputs, and core editing tools. You'll also get access to our community forum and basic email support. It's perfect for trying out our platform and seeing the power of AI rendering firsthand."
  },
  {
    question: "Do I need any design experience to use Studio Six?",
    answer: "Not at all! While Studio Six is powerful enough for professional designers, it's designed to be accessible to everyone. Our AI technology can work with simple sketches, and our intuitive interface guides you through the entire process. We also provide helpful tutorials and templates to get you started."
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer: "Yes! Our team plans offer collaborative features, increased render quotas, priority support, and custom branding options. Enterprise plans include dedicated account management, API access, and customized solutions. Contact our sales team for a tailored package that meets your organization's needs."
  },
  {
    question: "Can I adjust the lighting and shadows in my render?",
    answer: "Absolutely! Studio Six provides comprehensive lighting controls, including time of day, shadow intensity, ambient lighting, and custom light placement. Our AI understands natural lighting principles, making it easy to achieve the perfect atmosphere for your design."
  },
  {
    question: "Does Studio Six integrate with other design software?",
    answer: "Yes, Studio Six seamlessly integrates with popular design tools like SketchUp, Revit, and Rhino. We support common file formats including .SKP, .RVT, .3DS, and more. Our plugins enable direct export from your favorite design software to Studio Six for instant rendering."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-[32px]">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-[#6B6B6B]/50 pb-[32px]">
          <button 
            className="w-full flex items-center justify-between group"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h3 className="font-inter text-[24px] leading-[32px] text-[#6B6B6B] text-left group-hover:text-[#1B1464]">
              {faq.question}
            </h3>
            <svg 
              className={`w-6 h-6 text-[#6B6B6B] transform transition-transform duration-200 group-hover:text-[#1B1464] ${openIndex === index ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
            >
              <path 
                fill="currentColor" 
                d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
              />
            </svg>
          </button>
          <div 
            className={`mt-4 font-inter text-[18px] leading-[28px] text-[#6B6B6B] pl-1 transition-all duration-200 ${openIndex === index ? 'block' : 'hidden'}`}
          >
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
} 