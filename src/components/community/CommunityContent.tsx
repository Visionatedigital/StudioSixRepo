'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/Icons';
import { useSession } from 'next-auth/react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import CommunityMessage from '@/components/CommunityMessage';

interface Message {
  id: string;
  userId: string;
  content: string;
  channelId: string;
  likes: number;
  createdAt: string;
  isThread?: boolean;
  isPoll?: boolean;
  threadId?: string;
  pollId?: string;
  user?: {
    id: string;
    name: string;
    image: string;
    level: number;
    verified: boolean;
  };
  thread?: any;
  poll?: any;
  // Frontend display properties
  username?: string;
  userImage?: string;
  userLevel?: number;
  userVerified?: boolean;
  timestamp?: string;
  replies?: number;
  attachments?: {
    type: 'image' | 'video' | 'file';
    url: string;
    preview?: string;
    name?: string;
    size?: string;
  }[];
  pollData?: {
    id?: string;
    question: string;
    options: string[];
    duration: string;
    allowMultiple: boolean;
    votes: Record<string, number>;
    userVotes?: Record<string, string[]>;
  };
  // Error states
  sendFailed?: boolean;
  isTemporary?: boolean;
}

interface CommunityContentProps {
  categoryId: string;
  categoryName: string;
  channelId: string;
  channelName: string;
}

export default function CommunityContent({ categoryId, categoryName, channelId, channelName }: CommunityContentProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [likedMessages, setLikedMessages] = useState<{ [key: string]: boolean }>({});
  const [threadTitle, setThreadTitle] = useState('');
  const [threadContent, setThreadContent] = useState('');
  const [isPrivateThread, setIsPrivateThread] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('24 hours');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [votedPolls, setVotedPolls] = useState<{ [key: string]: string[] }>({});
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastMessageFetchTime, setLastMessageFetchTime] = useState<Date>(new Date());
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Utility: Compare arrays of messages by id
  const areMessagesEqual = (a: Message[], b: Message[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id) return false;
    }
    return true;
  };

  // Optimized setMessages: only update if changed
  const updateMessages = (newMessages: Message[]): void => {
    setMessages((prev: Message[]) => {
      if (areMessagesEqual(prev, newMessages)) return prev;
      return newMessages;
    });
  };

  // When fetching, append only new messages
  const appendNewMessages = (fetchedMessages: Message[]): void => {
    setMessages((prev: Message[]) => {
      const existingIds = new Set(prev.map((m: Message) => m.id));
      const newOnes = fetchedMessages.filter((m: Message) => !existingIds.has(m.id));
      if (newOnes.length === 0) return prev;
      return [...prev, ...newOnes];
    });
  };

  // Utility: Filter out messages with blob URLs in attachments
  const filterOutBlobMessages = (messages: Message[]): Message[] =>
    messages.filter(
      m =>
        !m.attachments ||
        m.attachments.every(att => !att.url.startsWith('blob:') && !att.url.startsWith('/blob:'))
    );

  // Fetch messages based on category and channel with improved error handling
  const fetchMessages = useCallback(async (initialLoad = false) => {
    if (initialLoad) {
      setIsLoading(true);
    }
    
    // Track when we started loading
    const loadingStart = Date.now();
    
    try {
      // Fetch messages from the API
      const response = await fetch(`/api/community/messages?channelId=${channelId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      // For debugging
      console.log('API Response Data:', data);
      
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error('Invalid message data received from API');
      }
      
      // Transform API data to the format expected by the component
      const transformedMessages = data.messages.map((message: Message) => {
        // Validate and process the message attachments if they exist
        let processedAttachments: Message['attachments'] = message.attachments || [];
        
        // Ensure attachments are properly processed
        if (processedAttachments && Array.isArray(processedAttachments)) {
          processedAttachments = processedAttachments.map(attachment => {
            if (!attachment) return null;
            
            // Ensure the attachment has a valid URL
            let url = attachment.url || '';
            
            // Handle different URL types
            if (attachment.type === 'image') {
              if (url.startsWith('/blob:')) {
                // For blob URLs, just remove the leading slash
                url = url.slice(1);
              } else if (!url.startsWith('http') && !url.startsWith('blob:')) {
                // For regular relative URLs, add the origin
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                url = `${origin}${url}`;
              }
              console.log(`Fixed relative image URL: ${url}`);
            }
            
            return {
              ...attachment,
              url,
              // Ensure other required properties have defaults
              name: attachment.name || 'File',
              size: attachment.size || '0 KB'
            };
          }).filter(Boolean) as Message['attachments']; // Filter out nulls and assert type
        }
        
        return {
          ...message,
          username: message.user?.name || 'Unknown User',
          userImage: message.user?.image || '/profile-icons/default.png',
          userLevel: message.user?.level || 1,
          userVerified: message.user?.verified || false,
          timestamp: message.createdAt,
          replies: message.replies || 0,
          attachments: processedAttachments,
          pollData: message.poll ? {
            id: message.poll.id,
            question: message.poll.question,
            options: message.poll.options || [],
            duration: message.poll.duration || '1 day',
            allowMultiple: message.poll.allowMultiple || false,
            votes: message.poll.votes || {},
            expiresAt: message.poll.expiresAt
          } : undefined
        };
      });
      
      console.log('Transformed Messages:', transformedMessages);
      
      // Check which messages the current user has liked
      if (transformedMessages.length > 0) {
        await fetchUserLikedMessages(transformedMessages.map((m: Message) => m.id));
      }
      
      // Update last fetch time
      setLastMessageFetchTime(new Date());
      
      // Ensure minimum loading time to prevent abrupt UI changes
      const loadingTime = Date.now() - loadingStart;
      const minLoadingTime = initialLoad ? 200 : 0; // minimum loading time in ms
      
      if (loadingTime < minLoadingTime) {
        setTimeout(() => {
          updateMessages(filterOutBlobMessages(transformedMessages));
          if (initialLoad) setIsLoading(false);
        }, minLoadingTime - loadingTime);
      } else {
        updateMessages(filterOutBlobMessages(transformedMessages));
        if (initialLoad) setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      if (initialLoad) {
        // Only show fallback data on initial load if there's an error
        setTimeout(() => {
          // Keep this for backward compatibility, but we won't use it in production
          const mockMessages: Message[] = [];
          updateMessages(mockMessages);
          setIsLoading(false);
        }, Math.max(0, 300 - (Date.now() - loadingStart)));
      }
    }
  }, [channelId]);

  // Set up auto-refresh interval when channelId changes
  useEffect(() => {
    console.log('Setting up message refresh interval for channel:', channelId);

    // Clear previous interval if exists
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    // Initial fetch
    fetchMessages(true);

    // Set up auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      console.log('Auto-refreshing messages for channel:', channelId);
      fetchMessages(false);
    }, 30000);

    // Cleanup function
    return () => {
      console.log('Cleaning up message refresh interval');
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [fetchMessages, channelId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update handleSendMessage to send to the API with better error handling
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    
    // Upload attachments first and get permanent URLs
    let uploadedAttachments: {
      type: 'image' | 'video' | 'file';
      url: string;
      name: string;
      size: string;
    }[] = [];
    if (attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
          const uploadResult = await uploadResponse.json();
          return {
            type: file.type.startsWith('image/') 
              ? 'image' 
              : file.type.startsWith('video/') 
                ? 'video' 
                : 'file',
            url: uploadResult.url,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          };
        })
      );
    }
    // Now send the message with the permanent attachment URLs
    const response = await fetch('/api/community/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newMessage,
        channelId,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      }),
    });
    if (!response.ok) {
      // Optionally show error to user
      return;
    }
    const data = await response.json();
    appendNewMessages(filterOutBlobMessages([data.message]));
    setNewMessage('');
    setAttachments([]);
    setSelectedFiles([]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter should add a new line
        return;
      } else {
        // Regular Enter should send the message
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setShowUploadModal(true);
    }
  };

  // Update handleUploadWithCaption to upload files to the server
  const handleUploadWithCaption = async () => {
    if (!uploadCaption && selectedFiles.length === 0) return;
    // Upload all files to get permanent URLs
    const uploadedAttachments = await Promise.all(
      selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload file: ${file.name}`);
        }
        const uploadResult = await uploadResponse.json();
        return {
          type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
          url: uploadResult.url,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        };
      })
    );
    // Now create the message with permanent URLs
    const response = await fetch('/api/community/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: uploadCaption,
        channelId,
        attachments: uploadedAttachments,
      }),
    });
    if (!response.ok) {
      // Optionally show error to user
      return;
    }
    const data = await response.json();
    appendNewMessages(filterOutBlobMessages([data.message]));
    setSelectedFiles([]);
    setUploadCaption('');
    setShowUploadModal(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 
        ? 'Today' 
        : `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Handle click outside plus menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle click outside for emoji picker
  useEffect(() => {
    function handleClickOutsideEmoji(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideEmoji);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideEmoji);
    };
  }, []);

  // Add a function to insert emoji to the message
  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Function to fetch which messages the current user has liked
  const fetchUserLikedMessages = async (messageIds: string[]) => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/community/likes/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user likes');
      }
      
      const data = await response.json();
      const likedMessageIds = data.likedMessageIds || [];
      
      // Update liked messages state
      const newLikedMessages: Record<string, boolean> = {};
      likedMessageIds.forEach((messageId: string) => {
        newLikedMessages[messageId] = true;
      });
      
      setLikedMessages(newLikedMessages);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  // Add function to handle liking messages
  const handleLikeMessage = async (messageId: string) => {
    if (!session?.user) {
      // Redirect to login or show login prompt if user is not logged in
      return;
    }
    
    // Get current like status
    const isCurrentlyLiked = likedMessages[messageId] || false;
    
    // Update UI optimistically
    updateMessages(messages.map(message => {
      if (message.id === messageId) {
        const newLikeCount = isCurrentlyLiked ? Math.max(0, message.likes - 1) : message.likes + 1;
        
        return {
          ...message,
          likes: newLikeCount
        };
      }
      return message;
    }));
    
    // Set the new like state
    setLikedMessages(prev => ({
      ...prev,
      [messageId]: !isCurrentlyLiked
    }));
    
    try {
      // Send the like/unlike to the API
      const action = isCurrentlyLiked ? 'unlike' : 'like';
      
      const response = await fetch('/api/community/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          action,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} message`);
      }
      
      // No need to update UI again as we already did it optimistically
    } catch (error) {
      console.error('Error liking/unliking message:', error);
      
      // Revert optimistic update if action fails
      updateMessages(messages.map(message => {
        if (message.id === messageId) {
          // Revert like status
          const revertedLikeCount = isCurrentlyLiked ? message.likes + 1 : Math.max(0, message.likes - 1);
          
          return {
            ...message,
            likes: revertedLikeCount
          };
        }
        return message;
      }));
      
      // Revert the liked status
      setLikedMessages(prev => ({
        ...prev,
        [messageId]: isCurrentlyLiked
      }));
    }
  };

  // Add function to handle replying to messages
  const handleReplyToMessage = (messageId: string) => {
    // Open a modal or navigate to a thread view
    const messageToReply = messages.find(msg => msg.id === messageId);
    if (!messageToReply) return;
    
    setThreadTitle(`Reply to ${messageToReply.username}`);
    setThreadContent(`> ${messageToReply.content.substring(0, 100)}${messageToReply.content.length > 100 ? '...' : ''}\n\n`);
    setShowThreadModal(true);
  };

  // Function to handle thread creation
  const handleCreateThread = async () => {
    if (!threadTitle || !threadContent) return;
    
    // Generate a unique temporary ID for the thread
    const tempId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a thread message for immediate display
    const newThread: Message = {
      id: tempId,
      userId: session?.user?.id || 'current-user',
      username: session?.user?.name || 'You',
      userImage: session?.user?.image || '/profile-icons/default.png',
      userLevel: 1,
      userVerified: false,
      content: threadContent,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      channelId: channelId,
      likes: 0,
      replies: 0,
      isThread: true,
      threadId: tempId
    };
    
    // Add the thread to messages
    appendNewMessages([newThread]);
    
    // Clear the form and close the modal
    setThreadTitle('');
    setThreadContent('');
    setIsPrivateThread(false);
    setShowThreadModal(false);
    
    try {
      // Send the thread to the API
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: threadContent,
          channelId,
          isThread: true,
          threadData: {
            title: threadTitle,
            isPrivate: isPrivateThread
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create thread');
      }
      
      const data = await response.json();
      
      // Replace the temporary thread with the real one from the server
      appendNewMessages([data.message]);
      
      // Update messages to ensure we have the latest data
      setTimeout(() => {
        fetchMessages(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating thread:', error);
      // Mark the thread message as failed
      appendNewMessages([{
        ...newThread,
        sendFailed: true
      }]);
    }
  };

  // Function to add new poll option
  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  // Function to update a poll option
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Function to remove a poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length <= 2) return; // Minimum 2 options
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
  };

  // Function to handle poll creation
  const handleCreatePoll = async () => {
    if (!pollQuestion || pollOptions.filter(option => option.trim()).length < 2) return;
    
    // Generate a unique temporary ID for the poll message
    const tempId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a votes object with all options set to 0
    const votes: Record<string, number> = {};
    pollOptions.forEach(option => {
      if (option.trim()) {
        votes[option] = 0;
      }
    });
    
    // Create a poll message for immediate display
    const newPollMessage: Message = {
      id: tempId,
      userId: session?.user?.id || 'current-user',
      username: session?.user?.name || 'You',
      userImage: session?.user?.image || '/profile-icons/default.png',
      userLevel: 1,
      userVerified: false,
      content: pollQuestion,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      channelId: channelId,
      likes: 0,
      replies: 0,
      isPoll: true,
      pollData: {
        id: `poll-data-${Date.now()}`,
        question: pollQuestion,
        options: pollOptions.filter(option => option.trim()),
        duration: pollDuration,
        allowMultiple: allowMultipleAnswers,
        votes
      }
    };
    
    // Add the poll message to messages
    appendNewMessages([newPollMessage]);
    
    // Clear the form and close the modal
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollDuration('24 hours');
    setAllowMultipleAnswers(false);
    setShowPollModal(false);
    
    try {
      // Send the poll to the API
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: pollQuestion,
          channelId,
          isPoll: true,
          pollData: {
            question: pollQuestion,
            options: pollOptions.filter(option => option.trim()),
            duration: pollDuration,
            allowMultiple: allowMultipleAnswers
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create poll');
      }
      
      const data = await response.json();
      
      // Replace the temporary poll with the real one from the server
      appendNewMessages([data.message]);
      
      // Update messages to ensure we have the latest data
      setTimeout(() => {
        fetchMessages(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating poll:', error);
      // Mark the poll message as failed
      appendNewMessages([{
        ...newPollMessage,
        sendFailed: true
      }]);
    }
  };

  // Function to handle voting on polls
  const handleVoteOnPoll = async (messageId: string, pollId: string, optionIndex: number, option: string) => {
    // Store current user votes for this poll (for optimistic update rollback)
    const currentUserVotes = [...(votedPolls[messageId] || [])];
    
    try {
      // Create a copy of the messages
      const updatedMessages = [...messages];
      const messageIndex = updatedMessages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1 || !updatedMessages[messageIndex].pollData) {
        throw new Error('Poll message not found');
      }
      
      const message = updatedMessages[messageIndex];
      const pollData = message.pollData;
      
      if (!pollData) return;
      
      // Check if the user already voted for this option
      const userVotedForOption = (votedPolls[messageId] || []).includes(option);
      
      // If multiple answers are not allowed, remove previous votes
      if (!pollData.allowMultiple && !userVotedForOption) {
        // Update the poll votes (decrement previous votes if any)
        if (votedPolls[messageId]) {
          votedPolls[messageId].forEach(votedOption => {
            if (pollData.votes && pollData.votes[votedOption] !== undefined) {
              pollData.votes[votedOption] = Math.max(0, (pollData.votes[votedOption] || 0) - 1);
            }
          });
        }
        
        // Update user's votes to only this option
        setVotedPolls({
          ...votedPolls,
          [messageId]: [option]
        });
      } else {
        // For multiple answers or toggling a vote
        let newUserVotes: string[];
        
        if (userVotedForOption) {
          // User is unvoting this option
          newUserVotes = (votedPolls[messageId] || []).filter(opt => opt !== option);
          
          // Decrement the vote count
          if (pollData.votes && pollData.votes[option] !== undefined) {
            pollData.votes[option] = Math.max(0, (pollData.votes[option] || 0) - 1);
          }
        } else {
          // User is voting for this option
          newUserVotes = [...(votedPolls[messageId] || []), option];
          
          // Increment the vote count
          if (pollData.votes) {
            pollData.votes[option] = (pollData.votes[option] || 0) + 1;
          } else {
            pollData.votes = { [option]: 1 };
          }
        }
        
        // Update user's votes
        setVotedPolls({
          ...votedPolls,
          [messageId]: newUserVotes
        });
      }
      
      // Update the message with new poll data
      updatedMessages[messageIndex] = {
        ...message,
        pollData
      };
      
      // Update messages state (optimistic update)
      updateMessages(updatedMessages);
      
      // Make API call to update the vote
      const response = await fetch('/api/community/polls/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pollId,
          options: votedPolls[messageId] || [],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      
      // Revert the optimistic update
      setVotedPolls({
        ...votedPolls,
        [messageId]: currentUserVotes // revert to previous state
      });
    }
  };
  
  // Calculate total votes on a poll
  const getTotalVotes = (votes: Record<string, number>) => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Close the menu
      setShowMessageMenu(null);

      // Optimistically remove the message from UI
      const messageToDelete = messages.find(m => m.id === messageId);
      if (!messageToDelete) return;

      // First, optimistically update the UI by removing the message
      updateMessages(messages.filter(m => m.id !== messageId));

      // Call the API to delete the message
      const response = await fetch(`/api/community/messages?messageId=${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.status}`);
      }

      console.log('Message deleted successfully');
      
      // No need to update the UI again since we already did it optimistically
    } catch (error) {
      console.error('Error deleting message:', error);
      
      // If an error occurs, revert the optimistic update by fetching messages again
      fetchMessages(false);
      
      // Show error toast or notification
      // ...
    }
  };

  // Close the message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add retryMessage function definition
  const retryMessage = async (messageId: string) => {
    // Find the message to retry
    const messageToRetry = messages.find(m => m.id === messageId);
    if (!messageToRetry) return;
    
    // Remove the failed message
    updateMessages(messages.filter(m => m.id !== messageId));
    
    // Create a new message with the same content and attachments
    const retryMessageObj = {
      ...messageToRetry,
      id: `retry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sendFailed: false,
    };
    
    // Add the new message to the UI
    appendNewMessages([retryMessageObj]);
    
    // Try to send to the API
    try {
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageToRetry.content,
          channelId,
          attachments: messageToRetry.attachments,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retry sending message');
      }
      
      const data = await response.json();
      
      // Replace the retry message with the real one from the server
      appendNewMessages([data.message]);
      
      // Fetch latest messages to ensure everything is in sync
      setTimeout(() => {
        fetchMessages(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error retrying message send:', error);
      
      // Mark as failed again
      appendNewMessages([{
        ...retryMessageObj,
        sendFailed: true
      }]);
    }
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim().length === 0
    ? messages
    : messages.filter(
        m =>
          m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex flex-col h-full bg-[#F6F8FA]">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E0DAF3]">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-semibold text-lg">#</span>
          <h3 className="text-[#202126] font-medium">{channelName}</h3>
          <span className="text-sm text-gray-500">({categoryName})</span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-[#F6F8FA] text-gray-700 text-sm rounded-md px-3 py-1 w-48 focus:outline-none border border-[#E0DAF3]"
          />
          <Icon name="search" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-4xl w-full mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="pb-4">
              {/* Channel Introduction Card */}
              <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-[#E0DAF3]">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">#</span>
                  </div>
                  <div>
                    <h3 className="text-[#202126] text-lg font-medium mb-1">Welcome to #{channelName}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      This is the start of the #{channelName} channel, part of {categoryName}.
                    </p>
                    <p className="text-gray-500 text-xs">
                      Channel created on June 10, 2023
                    </p>
                  </div>
                </div>
              </div>
              {/* Messages */}
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No messages found.</div>
              ) : (
                filteredMessages.map((message) => (
                  <CommunityMessage
                    key={message.id}
                    id={message.id}
                    userId={message.userId}
                    content={message.content}
                    username={message.username}
                    userImage={message.userImage}
                    userLevel={message.userLevel}
                    userVerified={message.userVerified}
                    timestamp={message.timestamp}
                    createdAt={message.createdAt}
                    likes={message.likes}
                    isLiked={likedMessages[message.id]}
                    replies={message.replies}
                    isPoll={message.isPoll}
                    pollData={message.pollData && {
                      ...message.pollData,
                      userVotes: votedPolls[message.id] || []
                    }}
                    attachments={message.attachments}
                    onLike={handleLikeMessage}
                    onReply={handleReplyToMessage}
                    onVote={handleVoteOnPoll}
                    onShare={message.sendFailed ? retryMessage : undefined}
                    onMenu={setShowMessageMenu}
                    sendFailed={message.sendFailed}
                    showMenu={showMessageMenu === message.id}
                    formatTimestamp={formatTimestamp}
                    getTotalVotes={getTotalVotes}
                    menuRef={messageMenuRef}
                    onDelete={handleDeleteMessage}
                    sessionUserId={session?.user?.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* New Message Input */}
      <div className="p-4 md:p-6 bg-white border-t border-[#E0DAF3]">
        <div className="max-w-4xl w-full mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-[#F6F8FA] rounded-lg">
              {attachments.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <div className="relative w-20 h-20 rounded overflow-hidden border border-[#E0DAF3] bg-white">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Attachment"
                        fill
                        className="object-cover"
                      />
                      <button 
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                      >
                        <Icon name="x" size={12} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white p-2 rounded flex items-center gap-2 border border-[#E0DAF3]">
                      <Icon name="file" size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate max-w-[120px]">{file.name}</span>
                      <button 
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center bg-[#F6F8FA] rounded-lg border border-[#E0DAF3] focus-within:ring-1 focus-within:ring-purple-300 focus-within:border-purple-300">
            <div className="flex">
              <div className="relative">
                <button 
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="p-3 text-gray-500 hover:text-purple-600"
                  aria-label="Add content"
                >
                  <Image
                    src="/icons/plus.png"
                    alt="Add content"
                    width={20}
                    height={20}
                  />
                </button>
                
                {/* Plus Menu Dropdown */}
                {showPlusMenu && (
                  <div 
                    ref={plusMenuRef}
                    className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-[#E0DAF3] w-60 py-2 z-10"
                  >
                    <button 
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowPlusMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F6F8FA]"
                    >
                      <Image 
                        src="/icons/upload.png" 
                        alt="Upload file" 
                        width={20} 
                        height={20} 
                      />
                      <span className="text-gray-700">Upload a File</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowThreadModal(true);
                        setShowPlusMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F6F8FA]"
                    >
                      <Icon name="edit" size={20} className="text-purple-600" />
                      <span className="text-gray-700">Create Thread</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowPollModal(true);
                        setShowPlusMenu(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-[#F6F8FA]"
                    >
                      <Image 
                        src="/icons/poll.png" 
                        alt="Create poll" 
                        width={20} 
                        height={20} 
                      />
                      <span className="text-gray-700">Create Poll</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 text-gray-500 hover:text-purple-600"
                  aria-label="Add emoji"
                >
                  <Image
                    src="/icons/smiley.png"
                    alt="Add emoji"
                    width={20}
                    height={20}
                  />
                </button>
                
                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef} 
                    className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-[#E0DAF3] p-2 w-64 z-10"
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E0DAF3]">
                      <span className="text-sm font-medium text-gray-700">Emoji</span>
                      <button 
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <Image
                          src="/icons/x.png"
                          alt="Close"
                          width={12}
                          height={12}
                        />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
                        "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
                        "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
                        "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
                        "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
                        "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
                        "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", 
                        "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
                        "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "❤️", "👍", "👎"].map((emoji, index) => (
                        <button 
                          key={index} 
                          onClick={() => insertEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
            
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${channelName}`}
              className="bg-transparent resize-none text-gray-700 py-3 px-2 w-full h-10 min-h-[2.5rem] max-h-[10rem] focus:outline-none"
              style={{ overflow: 'auto' }}
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachments.length === 0}
              className={`p-3 mr-2 rounded-md ${
                !newMessage.trim() && attachments.length === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-purple-600 hover:bg-purple-50'
              }`}
              aria-label="Send message"
            >
              <Image
                src="/icons/paper-plane-tilt.png"
                alt="Send message"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>
      
      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E0DAF3]">
              <h3 className="text-lg font-medium text-[#202126]">Create a Poll</h3>
              <button 
                onClick={() => {
                  setShowPollModal(false);
                  setPollQuestion('');
                  setPollOptions(['', '']);
                  setPollDuration('24 hours');
                  setAllowMultipleAnswers(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image
                  src="/icons/x.png"
                  alt="Close"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">QUESTION</label>
                <input 
                  type="text" 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="What question do you want to ask?"
                  className="w-full p-3 bg-[#F6F8FA] border border-[#E0DAF3] rounded-lg text-gray-700"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">ANSWERS</label>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Image 
                          src="/icons/smile.png" 
                          alt="Option" 
                          width={16} 
                          height={16} 
                        />
                      </div>
                      <input 
                        type="text" 
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        placeholder="Type your answer"
                        className="w-full p-3 bg-[#F6F8FA] border border-[#E0DAF3] rounded-lg text-gray-700"
                      />
                      <button 
                        onClick={() => removePollOption(index)}
                        disabled={pollOptions.length <= 2}
                        className={`text-gray-400 ${pollOptions.length <= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-600'}`}
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
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={addPollOption}
                  className="flex items-center gap-2 mt-2 text-gray-500 hover:text-purple-600"
                >
                  <Icon name="plus" size={18} />
                  <span>Add another answer</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <select 
                  value={pollDuration}
                  onChange={(e) => setPollDuration(e.target.value)}
                  className="bg-[#F6F8FA] border border-[#E0DAF3] rounded-md p-2 text-gray-700"
                >
                  <option>1 hour</option>
                  <option>6 hours</option>
                  <option>12 hours</option>
                  <option>24 hours</option>
                  <option>3 days</option>
                  <option>1 week</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="checkbox" 
                  id="multipleAnswers" 
                  checked={allowMultipleAnswers}
                  onChange={() => setAllowMultipleAnswers(!allowMultipleAnswers)}
                  className="rounded text-purple-600" 
                />
                <label htmlFor="multipleAnswers" className="text-gray-700">Allow Multiple Answers</label>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2}
                  className={`px-8 py-2 font-medium ${
                    !pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white rounded-lg`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Thread Modal */}
      {showThreadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-lg h-[80vh] flex flex-col mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E0DAF3]">
              <div className="flex items-center gap-2">
                <Icon name="edit" size={20} className="text-gray-600" />
                <h3 className="text-lg font-medium text-[#202126]">New Thread</h3>
              </div>
              <button 
                onClick={() => {
                  setShowThreadModal(false);
                  setThreadTitle('');
                  setThreadContent('');
                  setIsPrivateThread(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image
                  src="/icons/x.png"
                  alt="Close"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="edit" size={24} className="text-purple-600" />
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">THREAD NAME</label>
                <input 
                  type="text" 
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="New Thread"
                  className="w-full p-3 bg-[#F6F8FA] border border-[#E0DAF3] rounded-lg text-gray-700"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <span className="font-medium">Private Thread</span>
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="privateThread"
                    checked={isPrivateThread}
                    onChange={() => setIsPrivateThread(!isPrivateThread)}
                    className="rounded text-purple-600" 
                  />
                  <label htmlFor="privateThread" className="text-gray-600 text-sm">
                    Only people you invite and moderators can see
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-[#E0DAF3] p-4">
              <textarea
                value={threadContent}
                onChange={(e) => setThreadContent(e.target.value)}
                placeholder="Enter a message to start the conversation!"
                className="w-full p-3 bg-[#F6F8FA] border border-[#E0DAF3] rounded-lg text-gray-700 min-h-[100px] resize-none"
              ></textarea>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleCreateThread}
                  disabled={!threadTitle.trim() || !threadContent.trim()}
                  className={`px-8 py-2 font-medium ${
                    !threadTitle.trim() || !threadContent.trim()
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white rounded-lg`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E0DAF3]">
              <h3 className="text-lg font-medium text-[#202126]">
                Upload {selectedFiles.length > 1 ? 'Files' : 'File'}
              </h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setUploadCaption('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Image
                  src="/icons/x.png"
                  alt="Close"
                  width={20}
                  height={20}
                />
              </button>
            </div>
            
            <div className="p-4">
              {/* File Preview */}
              <div className="mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 mb-2 p-2 bg-[#F6F8FA] rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="File preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : file.type.startsWith('video/') ? (
                        <Icon name="video" size={24} className="text-purple-600" />
                      ) : (
                        <Icon name="file" size={24} className="text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                      }}
                      className="text-gray-400 hover:text-gray-600"
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
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Caption Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a caption (optional)
                </label>
                <textarea
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Write a caption for your upload..."
                  className="w-full p-3 bg-[#F6F8FA] border border-[#E0DAF3] rounded-lg text-gray-700 min-h-[80px] resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                    setUploadCaption('');
                  }}
                  className="px-4 py-2 border border-[#E0DAF3] text-gray-700 rounded-lg hover:bg-[#F6F8FA]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadWithCaption}
                  className="px-8 py-2 font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={selectedFiles.length === 0}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 