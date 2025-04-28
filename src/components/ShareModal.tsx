import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  LinkIcon,
  FacebookIcon,
  MessengerIcon,
  TikTokIcon,
  WeChatIcon,
  SnapchatIcon
} from '@/components/icons/SocialIcons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
}

export default function ShareModal({ isOpen, onClose, mediaUrl, mediaType = 'image' }: ShareModalProps) {
  const { data: session } = useSession();
  const [caption, setCaption] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const socialPlatforms = [
    { icon: FacebookIcon, name: 'Facebook' },
    { icon: MessengerIcon, name: 'Messenger' },
    { icon: TikTokIcon, name: 'TikTok' },
    { icon: WeChatIcon, name: 'WeChat' },
    { icon: SnapchatIcon, name: 'Snapchat' }
  ];

  const handleShareToCommunity = async () => {
    try {
      if (!session?.user?.id) {
        console.error('User not authenticated');
        return;
      }

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaUrl,
          mediaType,
          caption,
          userId: session.user.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to share post');
      }

      // Show success message or notification
      console.log('Post shared successfully');
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      // Show error message to user
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(mediaUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSocialShare = (platform: string) => {
    // Implement social media sharing logic here
    console.log(`Sharing to ${platform}`);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium">
                    Share {mediaType}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Share in community section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Share in community</h3>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Image
                          src={session?.user?.image || '/profile-icons/Profile-icon-01.svg'}
                          alt={session?.user?.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">{session?.user?.name}</p>
                        <textarea
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Write something about this..."
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                          rows={3}
                        />
                        <button
                          onClick={handleShareToCommunity}
                          className="mt-2 rounded-full bg-gradient-to-r from-[#8A53DD] to-[#372B9F] px-4 py-1.5 text-sm text-white hover:opacity-90 transition-opacity"
                        >
                          Share now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Copy Link Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Copy link</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mediaUrl}
                        readOnly
                        className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#8A53DD] to-[#372B9F] rounded-lg hover:opacity-90 transition-opacity"
                      >
                        {isCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Share to external platforms */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Share to</h3>
                    <div className="grid grid-cols-5 gap-4">
                      {socialPlatforms.map((platform) => (
                        <button
                          key={platform.name}
                          onClick={() => handleSocialShare(platform.name)}
                          className="flex flex-col items-center"
                        >
                          <platform.icon className="h-8 w-8" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 