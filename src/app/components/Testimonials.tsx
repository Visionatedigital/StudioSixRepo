'use client';

import { useState } from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: "Atuhaire Esther J.",
    role: "Interior Designer",
    quote: "StudioSix has revolutionized our design workflow. The AI-powered renders are incredibly realistic and save us countless hours.",
    image: "/testimonials/atuhaire-esther.jpg",
    rating: 5
  },
  {
    name: "Lukwago Mathew",
    role: "Engineer",
    quote: "The quality and speed of renders are unmatched. It's become an essential tool in our design process.",
    image: "/testimonials/lukwago-mathew.jpg",
    rating: 5
  },
  {
    name: "Mubiru James",
    role: "Architect",
    quote: "The attention to detail in the renders is amazing. It helps us communicate our vision clearly to clients.",
    image: "/testimonials/mubiru-james.jpg",
    rating: 4.5
  },
  {
    name: "David Muwanguzi L.",
    role: "Project Manager",
    quote: "The AI capabilities have transformed how we approach visualization. It's incredibly intuitive and powerful.",
    image: "/testimonials/david-muwanguzi.jpg",
    rating: 5
  },
  {
    name: "Karoline Nyara",
    role: "Architect",
    quote: "Studio Six has become indispensable for our team. The speed and quality are simply outstanding.",
    image: "/testimonials/karoline-nyara.jpg",
    rating: 4
  }
];

type CardPosition = 'prev' | 'current' | 'next';
type StylePosition = {
  left: string;
  transform: string;
  opacity: string;
  zIndex: string;
};

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg key={`full-${i}`} viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 inline-block">
        <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
      </svg>
    );
  }

  // Add half star if necessary
  if (hasHalfStar) {
    stars.push(
      <svg key="half" viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 inline-block">
        <path fill="currentColor" d="M12,15.4V6.1L13.71,10.13L18.09,10.5L14.77,13.39L15.76,17.67M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" />
      </svg>
    );
  }

  // Add empty stars to make 5 total
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg key={`empty-${i}`} viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-gray-300 inline-block">
        <path fill="currentColor" d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z" />
      </svg>
    );
  }

  return <div className="flex items-center justify-center space-x-1">{stars}</div>;
};

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right, 0 for initial
  const [isAnimating, setIsAnimating] = useState(false);

  const getPrevIndex = (index: number) => (index - 1 + testimonials.length) % testimonials.length;
  const getNextIndex = (index: number) => (index + 1) % testimonials.length;

  const handlePrevClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setTimeout(() => {
      setCurrentIndex(getPrevIndex(currentIndex));
      setDirection(0);
      setIsAnimating(false);
    }, 400);
  };

  const handleNextClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setTimeout(() => {
      setCurrentIndex(getNextIndex(currentIndex));
      setDirection(0);
      setIsAnimating(false);
    }, 400);
  };

  const getCardStyles = (position: CardPosition): { className: string; style: StylePosition } => {
    const baseStyles = "absolute transition-all duration-400 ease-in-out";
    
    const positions: Record<CardPosition, StylePosition> = {
      prev: {
        left: '30%',
        transform: 'translateX(-50%) scale(0.85)',
        opacity: '0',
        zIndex: '0'
      },
      current: {
        left: '50%',
        transform: 'translateX(-50%) scale(1)',
        opacity: '1',
        zIndex: '10'
      },
      next: {
        left: '70%',
        transform: 'translateX(-50%) scale(0.85)',
        opacity: '0',
        zIndex: '0'
      }
    };

    // Mobile-specific adjustments
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (position === 'current') {
        positions[position].transform = 'translateX(-50%) scale(0.9)';
      }
    } else {
      // Apply animation effects only on desktop
      if (position === 'prev') {
        positions[position].opacity = direction === 1 ? '0' : '1';
        positions[position].left = direction === -1 ? '20%' : '30%';
      } else if (position === 'next') {
        positions[position].opacity = direction === -1 ? '0' : '1';
        positions[position].left = direction === 1 ? '80%' : '70%';
      }
    }

    const widthStyles = {
      prev: "w-[250px] md:w-[400px]",
      current: "w-[280px] md:w-[500px]",
      next: "w-[250px] md:w-[400px]"
    };

    const bgStyles = {
      prev: "bg-white",
      current: "bg-gradient-to-r from-[#844BDC] to-[#AC4FF1]",
      next: "bg-white"
    };

    const pos = positions[position];
    const styles = [
      baseStyles,
      widthStyles[position],
      bgStyles[position],
    ].join(' ');

    return {
      className: styles,
      style: pos
    };
  };

  return (
    <section className="relative pt-[40px] md:pt-[60px] pb-0 overflow-hidden px-4 md:px-0">
      <h2 className="font-lato font-bold text-[28px] md:text-[36px] leading-[34px] md:leading-[43px] text-center text-black mb-[30px] md:mb-[50px]">
        What Our Designers Say About It
      </h2>

      <div className="flex justify-center items-center h-[380px] md:h-[500px] max-w-[1656px] mx-auto relative">
        {/* Left Arrow */}
        <button 
          onClick={handlePrevClick}
          disabled={isAnimating}
          className="absolute left-[4px] md:left-[100px] top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-6 md:h-6 text-[#1B1464]">
            <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </button>

        <div className="relative w-full h-full">
          {/* Previous Testimonial */}
          <div {...getCardStyles('prev')}>
            <div className="flex flex-col items-center p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-lg h-full">
              {testimonials[getPrevIndex(currentIndex)].image ? (
                <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full border-2 border-[#1B1464] overflow-hidden mb-2 md:mb-4">
                  <Image 
                    src={testimonials[getPrevIndex(currentIndex)].image!}
                    alt={`${testimonials[getPrevIndex(currentIndex)].name} profile`}
                    width={90}
                    height={90}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
              <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full border-2 border-[#1B1464] bg-[#F6F8FA] mb-2 md:mb-4" />
              )}
              <h3 className="font-poppins font-bold text-[14px] md:text-[18px] leading-[20px] md:leading-[27px] text-[#1B1464] mb-1 md:mb-2">
                {testimonials[getPrevIndex(currentIndex)].name}
              </h3>
              <p className="font-lato text-[12px] md:text-[15px] leading-[14px] md:leading-[18px] text-[#6B6B6B] mb-1">
                {testimonials[getPrevIndex(currentIndex)].role}
              </p>
              <div>
                <StarRating rating={testimonials[getPrevIndex(currentIndex)].rating} />
              </div>
              <div className="w-[20px] h-[20px] md:w-[31.54px] md:h-[31.54px] mb-1">
                {/* Quote icon placeholder */}
              </div>
              <p className="font-poppins text-[12px] md:text-[15px] leading-[18px] md:leading-[22px] text-[#1B1464] text-center">
                "{testimonials[getPrevIndex(currentIndex)].quote}"
              </p>
            </div>
          </div>

          {/* Current Testimonial */}
          <div {...getCardStyles('current')}>
            <div className="flex flex-col items-center p-4 md:p-8 rounded-[20px] md:rounded-[32px] shadow-xl h-full">
              {testimonials[currentIndex].image ? (
                <div className="w-[70px] h-[70px] md:w-[120px] md:h-[120px] rounded-full border-2 border-white overflow-hidden mb-2 md:mb-4">
                  <Image 
                    src={testimonials[currentIndex].image!}
                    alt={`${testimonials[currentIndex].name} profile`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
              <div className="w-[70px] h-[70px] md:w-[120px] md:h-[120px] rounded-full border-2 border-white bg-[#F6F8FA] mb-2 md:mb-4" />
              )}
              <h3 className="font-poppins font-bold text-[16px] md:text-[24px] leading-[22px] md:leading-[36px] text-white mb-1 md:mb-2">
                {testimonials[currentIndex].name}
              </h3>
              <p className="font-lato text-[14px] md:text-[18px] leading-[16px] md:leading-[22px] text-white mb-1">
                {testimonials[currentIndex].role}
              </p>
              <div>
                <StarRating rating={testimonials[currentIndex].rating} />
              </div>
              <div className="w-[32px] h-[32px] md:w-[51.6px] md:h-[51.6px] mb-1">
                {/* Quote icon placeholder */}
              </div>
              <p className="font-poppins text-[14px] md:text-[18px] leading-[20px] md:leading-[27px] text-white text-center">
                "{testimonials[currentIndex].quote}"
              </p>
            </div>
          </div>

          {/* Next Testimonial */}
          <div {...getCardStyles('next')}>
            <div className="flex flex-col items-center p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-lg h-full">
              {testimonials[getNextIndex(currentIndex)].image ? (
                <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full border-2 border-[#1B1464] overflow-hidden mb-2 md:mb-4">
                  <Image 
                    src={testimonials[getNextIndex(currentIndex)].image!}
                    alt={`${testimonials[getNextIndex(currentIndex)].name} profile`}
                    width={90}
                    height={90}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
              <div className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] rounded-full border-2 border-[#1B1464] bg-[#F6F8FA] mb-2 md:mb-4" />
              )}
              <h3 className="font-poppins font-bold text-[14px] md:text-[18px] leading-[20px] md:leading-[27px] text-[#1B1464] mb-1 md:mb-2">
                {testimonials[getNextIndex(currentIndex)].name}
              </h3>
              <p className="font-lato text-[12px] md:text-[15px] leading-[14px] md:leading-[18px] text-[#6B6B6B] mb-1">
                {testimonials[getNextIndex(currentIndex)].role}
              </p>
              <div>
                <StarRating rating={testimonials[getNextIndex(currentIndex)].rating} />
              </div>
              <div className="w-[20px] h-[20px] md:w-[31.54px] md:h-[31.54px] mb-1">
                {/* Quote icon placeholder */}
              </div>
              <p className="font-poppins text-[12px] md:text-[15px] leading-[18px] md:leading-[22px] text-[#1B1464] text-center">
                "{testimonials[getNextIndex(currentIndex)].quote}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <button 
          onClick={handleNextClick}
          disabled={isAnimating}
          className="absolute right-[4px] md:right-[100px] top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-6 md:h-6 text-[#1B1464]">
            <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </button>
      </div>
    </section>
  );
} 