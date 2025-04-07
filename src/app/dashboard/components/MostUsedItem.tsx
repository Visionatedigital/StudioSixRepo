'use client';

import React from 'react';
import { Icon } from '@/components/Icons';

interface MostUsedItemProps {
  icon: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
}

const MostUsedItem: React.FC<MostUsedItemProps> = ({ icon, title, subtitle, isActive = false }) => (
  <div 
    className={`
      flex flex-row justify-between items-center p-3.5 gap-2.5 w-full h-[61px] rounded-[10px]
      ${isActive 
        ? 'bg-gradient-to-r from-[#844BDC] to-[#362B9E] text-white' 
        : 'bg-white hover:bg-gray-50 transition-colors border border-gray-100'
      }
    `}
  >
    <div className="flex flex-row items-center gap-2.5">
      <div className={`
        flex items-center justify-center w-10 h-10 rounded-lg
        ${isActive ? 'bg-white/20' : 'bg-[#844BDC]'}
      `}>
        <Icon 
          name={icon} 
          size={24} 
          className={isActive ? 'text-white' : 'text-white'}
        />
      </div>
      <div className="flex flex-col">
        <span className={`
          font-poppins font-medium text-base
          ${isActive ? 'text-white' : 'text-[#1B1464]'}
        `}>
          {title}
        </span>
        <span className={`
          font-poppins text-xs
          ${isActive ? 'text-white/90' : 'text-[#6D758F]'}
        `}>
          {subtitle}
        </span>
      </div>
    </div>
    <button className={`
      w-8 h-8 flex items-center justify-center rounded-full
      ${isActive 
        ? 'hover:bg-white/10' 
        : 'hover:bg-gray-100'
      } transition-colors
    `}>
      <Icon 
        name="more" 
        size={20} 
        className={isActive ? 'text-white' : 'text-[#6D758F]'}
      />
    </button>
  </div>
);

export default MostUsedItem; 