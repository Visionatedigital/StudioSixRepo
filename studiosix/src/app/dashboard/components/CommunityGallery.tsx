'use client';

import React from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';

export default function CommunityGallery() {
  const images = [
    {
      id: 1,
      src: '/gallery/image1.jpg',
      title: 'Modern Architecture',
      author: 'John Doe',
      authorAvatar: '/profile-icons/profile-icon-01.png',
      likes: 234,
      isLiked: true,
      size: 'large' // 2x2
    },
    {
      id: 2,
      src: '/gallery/image2.jpg',
      title: 'Urban Design',
      author: 'Jane Smith',
      authorAvatar: '/profile-icons/profile-icon-02.png',
      likes: 189,
      isLiked: false,
      size: 'small' // 1x1
    },
    {
      id: 3,
      src: '/gallery/image3.jpg',
      title: 'Interior Space',
      author: 'Mike Johnson',
      authorAvatar: '/profile-icons/profile-icon-03.png',
      likes: 156,
      isLiked: true,
      size: 'vertical' // 1x2
    },
    {
      id: 4,
      src: '/gallery/image4.jpg',
      title: 'Architectural Detail',
      author: 'Sarah Wilson',
      authorAvatar: '/profile-icons/profile-icon-04.png',
      likes: 98,
      isLiked: false,
      size: 'horizontal' // 2x1
    },
    {
      id: 5,
      src: '/gallery/image5.jpg',
      title: 'Modern Living',
      author: 'Alex Turner',
      authorAvatar: '/profile-icons/profile-icon-05.png',
      likes: 145,
      isLiked: true,
      size: 'small' // 1x1
    },
    {
      id: 6,
      src: '/gallery/image6.jpg',
      title: 'Contemporary Design',
      author: 'Emma Davis',
      authorAvatar: '/profile-icons/profile-icon-06.png',
      likes: 167,
      isLiked: false,
      size: 'vertical' // 1x2
    },
    {
      id: 7,
      src: '/gallery/image7.jpg',
      title: 'Luxury Home',
      author: 'David Brown',
      authorAvatar: '/profile-icons/profile-icon-07.png',
      likes: 212,
      isLiked: true,
      size: 'horizontal' // 2x1
    },
    {
      id: 8,
      src: '/gallery/image8.jpg',
      title: 'Minimalist Space',
      author: 'Lisa Chen',
      authorAvatar: '/profile-icons/profile-icon-08.png',
      likes: 178,
      isLiked: false,
      size: 'small' // 1x1
    },
    {
      id: 9,
      src: '/gallery/image9.jpg',
      title: 'Modern Office',
      author: 'Tom Wilson',
      authorAvatar: '/profile-icons/profile-icon-09.png',
      likes: 145,
      isLiked: true,
      size: 'vertical' // 1x2
    },
    {
      id: 10,
      src: '/gallery/image10.jpg',
      title: 'Architectural Masterpiece',
      author: 'Sophie Anderson',
      authorAvatar: '/profile-icons/profile-icon-10.png',
      likes: 289,
      isLiked: false,
      size: 'large' // 2x2
    },
    {
      id: 11,
      src: '/gallery/image11.jpg',
      title: 'Urban Living',
      author: 'Chris Martin',
      authorAvatar: '/profile-icons/profile-icon-11.png',
      likes: 167,
      isLiked: true,
      size: 'small' // 1x1
    },
    {
      id: 12,
      src: '/gallery/image12.jpg',
      title: 'Modern Interior',
      author: 'Rachel Green',
      authorAvatar: '/profile-icons/profile-icon-12.png',
      likes: 198,
      isLiked: false,
      size: 'horizontal' // 2x1
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#1B1464]">Get inspired from Community</h2>
        <button className="text-[#844BDC] hover:text-[#6B3EB3] transition-colors font-medium">
          View All
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => {
          // Adjust grid spans based on index for better layout
          let gridSpan;
          if (index === 0) {
            gridSpan = 'col-span-2 row-span-2'; // First image large
          } else if (index === 1 || index === 2) {
            gridSpan = 'col-span-1 row-span-1'; // Next two small
          } else if (index === 3) {
            gridSpan = 'col-span-2 row-span-1'; // Fourth image horizontal
          } else {
            gridSpan = 'col-span-1 row-span-1'; // Rest small
          }

          return (
            <div 
              key={image.id} 
              className={`${gridSpan} group relative overflow-hidden rounded-xl aspect-square`}
            >
              <Image
                src={image.src}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium mb-2">
                    {image.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                        <Image
                          src={image.authorAvatar}
                          alt={image.author}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-white/90">by {image.author}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="group/like">
                        <Icon 
                          name="heart" 
                          size={18} 
                          className={`
                            ${image.isLiked ? 'text-red-500' : 'text-white'} 
                            group-hover/like:scale-110 transition-all
                          `}
                        />
                      </button>
                      <span className="text-sm text-white/90">{image.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}