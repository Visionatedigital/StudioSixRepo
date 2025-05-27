'use client';

import React, { useState } from 'react';
import SocialPost from '@/components/SocialPost';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface MessageAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  preview?: string;
  name?: string;
  size?: string;
}

interface PollData {
  id?: string;
  question: string;
  options: string[];
  duration: string;
  allowMultiple: boolean;
  votes: Record<string, number>;
  userVotes?: string[];
}

interface MessageProps {
  id: string;
  userId: string;
  content: string;
  username?: string;
  userImage?: string;
  userLevel?: number;
  userVerified?: boolean;
  timestamp?: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: number;
  isPoll?: boolean;
  pollData?: PollData;
  attachments?: MessageAttachment[];
  onLike: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onVote?: (messageId: string, pollId: string, optionIndex: number, option: string) => void;
  onShare?: (messageId: string) => void;
  onMenu?: (messageId: string) => void;
  sendFailed?: boolean;
  showMenu?: boolean;
  formatTimestamp: (timestamp: string) => string;
  getTotalVotes: (votes: Record<string, number>) => number;
  menuRef?: React.RefObject<HTMLDivElement>;
  onDelete?: (messageId: string) => void;
  sessionUserId?: string;
  isThread?: boolean;
  onViewThread?: (threadId: string) => void;
  threadId?: string;
}

export default function CommunityMessage({
  id,
  userId,
  content,
  username,
  userImage,
  userLevel,
  userVerified,
  timestamp,
  createdAt,
  likes,
  isLiked,
  replies = 0,
  isPoll,
  pollData,
  attachments = [],
  onLike,
  onReply,
  onVote,
  onShare,
  onMenu,
  sendFailed,
  showMenu,
  formatTimestamp,
  getTotalVotes,
  menuRef,
  onDelete,
  sessionUserId,
  isThread,
  onViewThread,
  threadId
}: MessageProps) {
  // Inline image rendering for minimal chat style
  const imageAttachments = attachments?.filter(att => att.type === 'image') || [];
  const nonImageAttachments = attachments?.filter(att => att.type !== 'image') || [];
  const [avatarError, setAvatarError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // If it's a poll or doesn't have image attachments, display traditional message layout
  return (
    <div className="flex gap-3 py-3 px-2 group items-start">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 mt-1">
        <Image
          src={avatarError ? '/profile-icons/default.png' : (userImage || '/profile-icons/default.png')}
          alt={username || 'User'}
          width={36}
          height={36}
          className="object-cover"
          onError={() => setAvatarError(true)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#202126]">{username || 'User'}</span>
          {userVerified && <VerifiedBadge size={16} className="-translate-y-0.5" />}
          <span className="text-xs text-gray-400">{formatTimestamp(timestamp || createdAt || '')}</span>
          {sendFailed && (
            <span className="ml-2 text-red-500 flex items-center gap-1">
              <Icon name="alert-circle" size={16} />
              <span className="text-xs">Failed to send</span>
              <button 
                className="text-xs text-blue-500 hover:underline"
                onClick={() => onShare && onShare(id)}
              >
                Retry
              </button>
            </span>
          )}
        </div>
        <div className="text-gray-900 break-words whitespace-pre-wrap leading-relaxed mb-1">
          {content}
        </div>
        {/* Inline images */}
        {imageAttachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {imageAttachments.map((img, idx) => {
              const [loaded, setLoaded] = useState(false);
              const [imgError, setImgError] = useState(false);
              return (
                <img
                  key={idx}
                  src={imgError ? '/images/placeholder-render.jpg' : img.url}
                  alt={img.name || 'Image'}
                  className="rounded-lg max-w-xs w-full object-contain"
                  style={{ maxHeight: 240, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
                  onLoad={() => setLoaded(true)}
                  onError={() => setImgError(true)}
                />
              );
            })}
          </div>
        )}
        {/* Poll Component */}
        {isPoll && pollData && (
          <div className="bg-[#F6F8FA] p-2 mb-2">
            <h4 className="font-medium text-gray-800 mb-2">{pollData.question}</h4>
            <div className="space-y-2 mb-3">
              {pollData.options.map((option, index) => {
                // Calculate percentage for this option
                const voteCount = (pollData.votes && pollData.votes[option]) || 0;
                const totalVotes = pollData.votes ? getTotalVotes(pollData.votes) : 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                // Check if current user voted for this option
                const isVoted = pollData.userVotes?.includes(option);
                return (
                  <div key={index} className="relative">
                    <button
                      className={`w-full p-2 rounded-md text-left transition-all relative overflow-hidden ${isVoted ? 'bg-purple-100' : 'bg-white'}`}
                      onClick={() => onVote && pollData.id && onVote(id, pollData.id, index, option)}
                      disabled={!onVote}
                    >
                      {/* Progress bar background */}
                      <div 
                        className={`absolute inset-0 h-full ${isVoted ? 'bg-purple-100' : 'bg-gray-100'}`} 
                        style={{ width: `${percentage}%`, opacity: 0.5 }}
                      />
                      {/* Option content */}
                      <div className="relative flex justify-between">
                        <span>{option}</span>
                        <span className="text-xs bg-white bg-opacity-70 px-1.5 py-0.5 rounded">
                          {percentage}%
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span>{pollData.votes ? getTotalVotes(pollData.votes) : 0} votes</span>
              <span className="mx-2">•</span>
              <span>{pollData.duration} remaining</span>
              {pollData.allowMultiple && (
                <>
                  <span className="mx-2">•</span>
                  <span>Multiple choices allowed</span>
                </>
              )}
            </div>
          </div>
        )}
        {/* Non-image Attachments */}
        {nonImageAttachments.length > 0 && (
          <div className="space-y-3 mb-2">
            {nonImageAttachments.map((attachment, index) => (
              <div key={index} className="max-w-full">
                <div className="flex items-center gap-2 bg-[#F6F8FA] rounded p-2 max-w-full overflow-hidden border border-[#E0DAF3]">
                  <Icon 
                    name={attachment.type === 'video' ? 'video' : 'file'} 
                    size={18} 
                    className="text-blue-500 flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-blue-500 truncate">{attachment.name}</div>
                    <div className="text-xs text-gray-500">{attachment.size}</div>
                  </div>
                  <a 
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="p-1 hover:bg-white rounded flex-shrink-0"
                  >
                    <Icon name="download" size={14} className="text-gray-500" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Thread summary and View threads button */}
        {(isThread || replies > 0) && (
          <button
            className="text-blue-600 font-medium hover:underline flex items-center gap-1 text-xs mt-1"
            onClick={() => onViewThread && onViewThread(threadId || id)}
          >
            <Icon name="message" size={14} />
            {replies > 0 ? `${replies} Message${replies > 1 ? 's' : ''}` : 'View thread'}
          </button>
        )}
        {/* Message actions */}
        <div className="flex items-center gap-4 mt-1 text-gray-400 text-xs">
          <button 
            className={`flex items-center gap-1 hover:text-purple-600 ${isLiked ? 'text-purple-600' : ''}`}
            onClick={() => onLike(id)}
          >
            <Icon name={isLiked ? 'heart-filled' : 'heart'} size={14} />
            <span>{likes || 0}</span>
          </button>
          <button 
            className="flex items-center gap-1 hover:text-purple-600"
            onClick={() => onReply(id)}
          >
            <Icon name="reply" size={14} />
            <span>{replies || 0}</span>
          </button>
          <button 
            className="flex items-center gap-1 hover:text-purple-600"
            onClick={() => setShowShareMenu((v) => !v)}
            aria-label="Share"
          >
            <Icon name="share" size={14} />
          </button>
          {showShareMenu && (
            <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded shadow-lg p-2 flex flex-col gap-2 right-0 min-w-[160px]">
              <button
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`, '_blank');
                  setShowShareMenu(false);
                }}
              >
                <Icon name="twitter" size={16} /> Twitter
              </button>
              <button
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                  setShowShareMenu(false);
                }}
              >
                <Icon name="facebook" size={16} /> Facebook
              </button>
              <button
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
                onClick={() => {
                  window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(content)}`, '_blank');
                  setShowShareMenu(false);
                }}
              >
                <Icon name="linkedin" size={16} /> LinkedIn
              </button>
              <button
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareMenu(false);
                }}
              >
                <Icon name="link" size={16} /> Copy Link
              </button>
            </div>
          )}
          <div className="ml-auto relative">
            <button 
              className="hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
              onClick={() => onMenu && onMenu(id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
            {/* Message action menu (only shown when activated) */}
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1"
                style={{ top: '100%', minWidth: '150px' }}
              >
                {userId === sessionUserId && (
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => onDelete && onDelete(id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-current"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                    <span>Delete message</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 