import React from 'react';
import Image from 'next/image';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  isActive?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', isActive = false }) => {
  const iconColor = isActive ? 'text-[#2A0856]' : 'text-[#202126]';
  
  // Handle special cases for file names with spaces
  const getIconPath = (iconName: string) => {
    switch (iconName) {
      case 'logout':
        return '/icons/logout icon.svg';
      case 'studiosix':
        return '/icons/StudioSix Icon .svg';
      case 'verified':
        return '/icons/verified vector.svg';
      case 'profile':
        return isActive ? '/icons/profile-icon-white.svg' : '/icons/profile-icon.svg';
      case 'trash':
        return '/icons/trash-icon.svg';
      case 'collection':
        return '/icons/collection-icon.svg';
      case 'collection-filled':
        return '/icons/collection-filled-icon.svg';
      case 'collections-grid':
        return '/icons/collections-grid-icon.svg';
      case 'expand':
        return '/icons/expand-icon.svg';
      default:
        return `/icons/${iconName}-icon.svg`;
    }
  };

  return (
    <div className={`${iconColor} ${className}`} style={{ width: size, height: size }}>
      <Image
        src={getIconPath(name)}
        alt={`${name} icon`}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
};

// Custom dropdown arrow component
export const DropdownArrow: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      width="10" 
      height="6" 
      viewBox="0 0 10 6" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M1 1L5 5L9 1" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface ShareIconProps {
  className?: string;
}

export function ShareIcon({ className = "h-6 w-6" }: ShareIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
} 