'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import Link from 'next/link';
import { PencilIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Placeholder data - starting from zero for new users
  const userStats = {
    followers: 0,
    likes: 0,
    posts: 0
  };

  // Load saved images when session is available
  useEffect(() => {
    if (session?.user) {
      // Set avatar from session user data
      if (session.user.image) {
        setAvatarImage(session.user.image);
      }
      // Set banner image from session user data
      if (session.user.bannerImage) {
        setBannerImage(session.user.bannerImage);
      }
    }
  }, [session]);

  const uploadImage = async (file: File, type: 'avatar' | 'banner') => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (type === 'avatar') {
        setAvatarImage(data.imageUrl);
        // Update session with new avatar URL
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: data.imageUrl,
          },
        });
      } else {
        setBannerImage(data.imageUrl);
        // Update session with new banner URL
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            bannerImage: data.imageUrl,
          },
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    // Reset any previous errors
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size
    const maxSize = type === 'banner' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for banner, 5MB for avatar
    if (file.size > maxSize) {
      setUploadError(`${type === 'banner' ? 'Banner' : 'Profile'} image must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    await uploadImage(file, type);
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file, 'banner');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleImageUpload(file, 'avatar');
    }
  };

  // Display error message if upload fails
  useEffect(() => {
    if (uploadError) {
      alert(uploadError);
    }
  }, [uploadError]);

  return (
    <DashboardLayout currentPage="Profile">
      <div className="w-full min-h-[calc(100vh-6rem)] bg-[#F6F8FA] rounded-2xl overflow-hidden">
        {/* Banner Section */}
        <div className="relative w-full h-[240px]">
          <div className={`w-full h-full ${!bannerImage ? 'bg-gradient-to-r from-[#814ADA] to-[#392CA0]' : ''}`}>
            {bannerImage && (
              <Image
                src={bannerImage}
                alt="Profile banner"
                fill
                className="object-cover"
              />
            )}
          </div>
          <button
            onClick={() => {
              const input = document.getElementById('banner-upload');
              if (input) input.click();
            }}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 hover:bg-white transition-colors"
          >
            <PencilIcon className="h-5 w-5 text-gray-600" />
            <span>Edit Banner</span>
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
            id="banner-upload"
          />
        </div>

        {/* Profile Info Section */}
        <div className="max-w-[1200px] mx-auto px-8 -mt-[72px] relative z-10">
          {/* Profile Picture and Actions */}
          <div className="flex justify-between items-end mb-6">
            <div className="flex items-end gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-[144px] h-[144px] rounded-full border-4 border-white bg-white overflow-hidden">
                  <Image
                    src={avatarImage || '/profile-icons/profile-icon-01.png'}
                    alt="Profile picture"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    const input = document.getElementById('avatar-upload');
                    if (input) input.click();
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="h-5 w-5 text-gray-600" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
              </div>

              {/* User Info */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-[#202126]">{session?.user?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Level 1 Designer</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#202126]">{userStats.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#202126]">{userStats.likes}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#202126]">{userStats.posts}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-xl border border-[#E0DAF3] overflow-hidden">
            {/* Tabs */}
            <div className="px-6 border-b border-[#E0DAF3]">
              <div className="flex gap-8">
                <button className="px-4 py-4 text-purple-600 border-b-2 border-purple-600 font-medium">
                  Posts
                </button>
                <button className="px-4 py-4 text-gray-500 hover:text-gray-700">
                  Liked Posts
                </button>
                <button className="px-4 py-4 text-gray-500 hover:text-gray-700">
                  Collections
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="p-6">
              {userStats.posts === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-12 h-12 mb-3 text-[#814ADA]">
                    <Icon name="image" size={48} />
                  </div>
                  <h3 className="text-lg font-medium text-[#202126] mb-1.5">No posts yet</h3>
                  <p className="text-sm text-gray-500 text-center mb-4">Start sharing your amazing creations with the community</p>
                  <Link 
                    href="/generate" 
                    className="px-4 py-2 bg-gradient-to-r from-[#814ADA] to-[#4130A7] text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Image
                      src="/icons/plus-white-icon.svg"
                      alt="Plus icon"
                      width={16}
                      height={16}
                    />
                    <span>Create Your First Post</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((post) => (
                    <div
                      key={post}
                      className="aspect-video bg-[#F6F8FA] rounded-xl border border-[#E0DAF3] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="w-full h-full bg-gray-100"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 