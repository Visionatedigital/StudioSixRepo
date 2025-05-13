import React, { useState, useEffect } from 'react';

interface TypingPromptProps {
  text: string;
  onComplete?: () => void;
}

export default function TypingPrompt({ text, onComplete }: TypingPromptProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [text, onComplete]);

  return (
    <div className="relative">
      <textarea
        value={displayedText}
        readOnly
        className="w-full h-[106px] p-[13px_19px] bg-white border border-[#E0DAF3] rounded-lg font-roboto text-base resize-none"
        placeholder="Describe the architectural style and any specific features you want to emphasize..."
      />
      {isTyping && (
        <div className="absolute right-[19px] bottom-[13px] flex items-center">
          <div className="w-2 h-4 bg-gradient-to-r from-[#844BDC] to-[#342A9C] animate-pulse rounded-sm" />
        </div>
      )}
    </div>
  );
} 