'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from './Icons';
import HeaderActions from './HeaderActions';
import RenderProgressTracker from './RenderProgressTracker';
import { useSession, signOut } from 'next-auth/react';
import MessageInbox from './MessageInbox';
import { usePathname, useRouter } from 'next/navigation';
import { VerifiedBadge } from './VerifiedBadge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

interface Tool {
  id: string;
  title: string;
  path: string;
  icon?: string;
  iconPath?: string;
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAiToolsExpanded, setIsAiToolsExpanded] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [showMessageInbox, setShowMessageInbox] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when pathname changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // Mock messages data
  const messages = [
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        avatar: '/profile-icons/panda.png',
      },
      message: 'Your latest design looks amazing! Could y...',
      time: '5m ago',
    },
    {
      id: 2,
      user: {
        name: 'Alex Thompson',
        avatar: '/profile-icons/lion.png',
      },
      message: "I'd love to collaborate on the new project y...",
      time: '2h ago',
    },
    {
      id: 3,
      user: {
        name: 'Maria Garcia',
        avatar: '/profile-icons/bear.png',
      },
      message: 'Thanks for the feedback on my design!',
      time: '1d ago',
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user's credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/credits/balance');
        const data = await response.json();
        if (response.ok) {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    if (session?.user) {
      fetchCredits();
    }
  }, [session]);

  // Default avatar URL
  const defaultAvatar = '/profile-icons/profile-icon-01.png';

  // Debug log
  useEffect(() => {
    console.log('Session data:', {
      session,
      verified: session?.user?.verified,
      name: session?.user?.name,
      email: session?.user?.email
    });
  }, [session]);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 bottom-0 w-[302px] bg-gray-50 z-40 flex items-center justify-center">
          <div className="w-[270px] bg-gradient-to-br from-white/90 via-white/95 to-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            {/* Profile Section */}
            <div className="flex flex-col p-2.5 gap-2.5 w-[206px] bg-gradient-to-r from-[#814ADA] via-[#9B5DE5] to-[#B366F0] rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[13.93px] bg-white/20 backdrop-blur-sm overflow-hidden border border-white/30">
                    <Image
                      src={session?.user?.image || defaultAvatar}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-white font-inter font-semibold text-lg drop-shadow-sm">
                        {session?.user?.name?.split(' ')[0] || 'Designer'}
                      </span>
                      {session?.user?.verified && <VerifiedBadge className="ml-1" />}
                    </div>
                    <span className="text-white/90 font-inter text-xs">Level 1 Designer</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-0.5">
                  <Icon name="coins" size={20} className="text-white" />
                  <span className="text-white/90 font-inter text-xs">
                    {credits !== null ? `${credits} Credits` : 'Loading...'}
                  </span>
                </div>
                <button className="px-1.5 py-1 bg-gradient-to-r from-pink-500 to-pink-600 backdrop-blur-sm rounded-[30px] border border-pink-400/30 hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-pink-500/20 flex items-center justify-center">
                  <span className="text-xs font-roboto text-white font-medium">
                    Upgrades
                  </span>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/dashboard" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Dashboard' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="home" size={20} isActive={currentPage === 'Dashboard'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Dashboard' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Home
                </span>
              </Link>

              {/* AI Tools Expandable Menu */}
              <div className="flex flex-col">
                <button 
                  onClick={() => setIsAiToolsExpanded(!isAiToolsExpanded)}
                  className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${(pathname || '').startsWith('/generate') ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}
                >
                  <div className="w-6 h-6 relative">
                    <Image
                      src="/icons/Ai-tools-icon.svg"
                      alt=""
                      fill
                      className={(pathname || '').startsWith('/generate') ? 'text-[#844BDC]' : 'text-[#202126]'}
                    />
                  </div>
                  <span className={`font-roboto font-medium text-sm flex-grow text-left ${(pathname || '').startsWith('/generate') ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                    AI Tools
                  </span>
                  <Icon 
                    name={isAiToolsExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    className="text-[#202126]" 
                  />
                </button>

                {/* Expandable Menu Items */}
                <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isAiToolsExpanded ? 'max-h-[500px] mt-1' : 'max-h-0'}`}>
                  {[
                    { id: 'exterior', title: 'Exterior AI', path: '/generate?tool=exterior', icon: 'exterior' },
                    { id: 'interior', title: 'Interior AI', path: '/generate?tool=interior', icon: 'interior' },
                    { id: 'enhancer', title: 'Render Enhancer', path: '/generate?tool=enhancer', icon: 'enhancer' },
                    { id: 'video', title: 'Video Generator AI', path: '/generate/video', icon: 'video' },
                    { id: 'chatgpt-proxy', title: 'ChatGPT Proxy', path: '/chatgpt-proxy', icon: 'message-circle' }
                  ].map((item: Tool) => {
                    const safePathname = pathname || '';
                    const isActive = item.path.startsWith('/generate?') 
                      ? safePathname === '/generate' && new URLSearchParams(item.path.split('?')[1]).get('tool') === new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('tool')
                      : safePathname === item.path;

                    return (
                    <Link
                        key={item.id}
                        href={item.path}
                        className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5
                          ${isActive ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : ''}`}
                    >
                        <div className="w-6 h-6 relative">
                          {item.iconPath ? (
                          <Image
                              src={item.iconPath}
                            alt=""
                            fill
                              className={isActive ? 'text-[#844BDC]' : 'text-[#202126]'}
                            />
                          ) : (
                            <Icon
                              name={item.icon as any}
                              size={24}
                              className={isActive ? 'text-[#844BDC]' : 'text-[#202126]'}
                          />
                          )}
                        </div>
                        <span className={`font-roboto font-medium text-sm flex-grow text-left ${isActive ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                          {item.title}
                      </span>
                    </Link>
                    );
                  })}
                </div>
              </div>

              {/* Client Hub Tool */}
              <Link href="/client-hub" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Client Hub' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <div className="w-6 h-6 relative">
                  <Image
                    src="/icons/client-svgrepo-com.svg"
                    alt="Client Hub"
                    fill
                    className={currentPage === 'Client Hub' ? 'text-[#844BDC]' : 'text-[#202126]'}
                  />
                </div>
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Client Hub' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Client Hub
                </span>
              </Link>

              <Link href="/ai-design-assistant" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Design Studio' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="prompt" size={20} isActive={currentPage === 'Design Studio'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Design Studio' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Design Studio
                </span>
              </Link>
              <div className="w-full border-t border-dashed border-[#CDD0D5]/50 my-2.5" />
              <Link href="/library" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Library' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="library" size={20} isActive={currentPage === 'Library'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Library' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Community
                </span>
              </Link>
              <Link href="/wallet" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Wallet' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="wallet" size={20} isActive={currentPage === 'Wallet'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Wallet' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  My Wallet
                </span>
              </Link>
              <Link href="/subscription" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Subscription' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="subscription" size={20} isActive={currentPage === 'Subscription'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Subscription' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Subscription
                </span>
              </Link>
              <div className="w-full border-t border-dashed border-[#C7CCD8]/50 my-2.5" />
              <Link href="/pricing" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Pricing' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="premium" size={20} isActive={currentPage === 'Pricing'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Pricing' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Premium Plans
                </span>
              </Link>
              <Link href="/settings" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Settings' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="settings" size={20} isActive={currentPage === 'Settings'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Settings' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  Settings
                </span>
              </Link>
              <Link href="/help" className={`flex flex-row items-center px-3 py-2.5 gap-1 w-full h-10 rounded-xl transition-all duration-200 ${currentPage === 'Help' ? 'bg-gradient-to-r from-[#844BDC]/10 to-[#AB4FF0]/10 border border-[#844BDC]/20 shadow-lg shadow-[#844BDC]/10' : 'hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5'}`}>
                <Icon name="help" size={20} isActive={currentPage === 'Help'} />
                <span className={`font-roboto font-medium text-sm ${currentPage === 'Help' ? 'bg-gradient-to-b from-[#2A0856] to-[#3E0B80] bg-clip-text text-transparent' : 'text-[#202126]'}`}>
                  FAQ & Help
                </span>
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col gap-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[#202126]/70 font-inter font-medium text-sm hover:text-[#844BDC] transition-colors cursor-pointer">Terms</span>
                <span className="text-[#202126]/30 font-inter font-medium text-sm">|</span>
                <span className="text-[#202126]/70 font-inter font-medium text-sm hover:text-[#844BDC] transition-colors cursor-pointer">DMCA</span>
                <span className="text-[#202126]/30 font-inter font-medium text-sm">|</span>
                <span className="text-[#202126]/70 font-inter font-medium text-sm hover:text-[#844BDC] transition-colors cursor-pointer">Affiliates</span>
              </div>
              <div className="flex justify-between items-center">
                {['facebook', 'blogger', 'messenger', 'youtube', 'whatsapp'].map((icon) => (
                  <button key={icon} className="w-5 h-5 opacity-60 hover:opacity-100 hover:text-[#844BDC] transition-all duration-200">
                    <Icon name={icon} size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-[302px] flex flex-col h-screen overflow-hidden">
          {/* Fixed Header */}
          <div className="fixed top-0 right-0 left-[302px] bg-gray-50 z-40">
            <div className="flex items-center justify-between px-5 py-6">
              <div className="flex items-center gap-2.5">
                {/* Navigation Arrows */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      if (pathname === '/generate/site-analysis/report') {
                        router.push('/generate/site-analysis');
                      } else {
                        router.back();
                      }
                    }}
                    className="w-8 h-8 border border-[#CDD0D5] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="#202126" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 border border-[#CDD0D5] rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="#CDD0D5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <span className="font-roboto font-medium text-sm text-[#202126]">{currentPage}</span>
              </div>

              {/* Header Actions and Profile */}
              <div className="flex items-center gap-4">
                {/* Render Progress Tracker */}
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                  <RenderProgressTracker />
                </div>
                
                <HeaderActions />
                <div className="relative" ref={profileRef}>
                  <button 
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D3BBFB] hover:border-[#844BDC] transition-colors"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <Image
                      src={session?.user?.image || defaultAvatar}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {/* Profile Dropdown */}
                  <div className={`absolute right-0 mt-2 w-[240px] bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-in-out z-[50] ${
                    isProfileOpen 
                      ? 'opacity-100 translate-y-0 visible pointer-events-auto' 
                      : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                  }`}>
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={session?.user?.image || defaultAvatar}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-medium text-[#202126] leading-none">
                              {session?.user?.name?.split(' ')[0] || 'Designer'}
                            </h3>
                            {session?.user?.verified && <VerifiedBadge className="translate-y-[-2px]" />}
                          </div>
                          <p className="text-sm text-gray-500">
                            {session?.user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                        View Profile
                      </Link>
                      <Link href="/settings" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                        Account Settings
                      </Link>
                      <Link href="/pricing" className="block w-full px-4 py-2 text-left text-sm text-[#202126] hover:bg-gray-50">
                        Billing & Plans
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button 
                        onClick={() => signOut({ callbackUrl: 'https://studiosix.ai' })}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div ref={contentRef} className="flex-1 mt-[88px] overflow-y-auto bg-gray-50">
            <div className="h-full">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Message Inbox Modal */}
      {showMessageInbox && (
        <MessageInbox onClose={() => setShowMessageInbox(false)} />
      )}
    </>
  );
} 