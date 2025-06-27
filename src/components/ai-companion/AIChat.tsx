'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { XMarkIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { ChatService } from '@/lib/services/chat';
import { CanvasElement, ImageElement } from '@/types/canvas';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { ImageGenerationService } from '@/lib/services/imageGeneration';
import { X } from 'lucide-react';
import { Icon } from '@/components/Icons';
import { useRenderTasks } from '@/contexts/RenderTaskContext';

interface MarkdownProps {
  children: ReactNode;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isGeneratedImage?: boolean;
  prompt?: string;
  sources?: {
    name: string;
    path: string;
  }[];
}

interface Screenshot {
  id: string;
  dataUrl: string;
  area?: { x: number; y: number; width: number; height: number };
}

interface AIChatProps {
  onClose: () => void;
  canvasElements: CanvasElement[];
  onAddToCanvas?: (imageData: string, prompt: string) => void;
  projectId?: string;
  stageRef?: React.RefObject<any>; // Konva Stage ref for screenshot capture
  canvasPosition?: { x: number; y: number }; // Canvas pan position
  canvasScale?: number; // Canvas zoom scale
  onScreenshotModeChange?: (isActive: boolean) => void; // Notify parent about screenshot mode
  isOnboardingActive?: boolean; // Whether onboarding tutorial is active
}

export default function AIChat({ onClose, canvasElements, onAddToCanvas, projectId, stageRef, canvasPosition = { x: 0, y: 0 }, canvasScale = 1, onScreenshotModeChange, isOnboardingActive = false }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // Debug logging for onboarding state changes
  const currentZIndex = isOnboardingActive ? 'z-0' : 'z-50';
  console.log('AIChat render:', {
    isOnboardingActive,
    zIndex: currentZIndex,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('AIChat onboarding state changed:', {
      isOnboardingActive,
      zIndex: isOnboardingActive ? 'z-0' : 'z-50',
      timestamp: new Date().toISOString()
    });
  }, [isOnboardingActive]);

  // Debug positioning and styling
  useEffect(() => {
    const chatPanel = document.querySelector('.ai-chat-panel');
    if (chatPanel) {
      const rect = chatPanel.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(chatPanel);
      
      console.log('AIChat positioning debug:', {
        isOnboardingActive,
        appliedZIndex: currentZIndex,
        computedZIndex: computedStyle.zIndex,
        position: {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        },
        styling: {
          position: computedStyle.position,
          transform: computedStyle.transform,
          visibility: computedStyle.visibility,
          display: computedStyle.display,
          zIndex: computedStyle.zIndex
        },
        cssClasses: chatPanel.className,
        hasOnboardingHighlight: chatPanel.classList.contains('onboarding-highlight'),
        allClasses: Array.from(chatPanel.classList),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Also debug when isOnboardingActive specifically changes
  useEffect(() => {
    console.log('AIChat: isOnboardingActive changed to:', isOnboardingActive);
    
    setTimeout(() => {
      const chatPanel = document.querySelector('.ai-chat-panel');
      if (chatPanel) {
        const rect = chatPanel.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(chatPanel);
        
        console.log('AIChat positioning after onboarding state change:', {
          isOnboardingActive,
          newZIndex: isOnboardingActive ? 'z-0' : 'z-50',
          computedZIndex: computedStyle.zIndex,
          position: {
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
          },
          cssClasses: chatPanel.className,
          hasHighlight: chatPanel.classList.contains('onboarding-highlight'),
          timestamp: new Date().toISOString()
        });
      }
    }, 100);
  }, [isOnboardingActive]);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  // Assistant name state
  const [assistantName, setAssistantName] = useState('AI Assistant');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const { addTask, updateTask } = useRenderTasks();

  // Focus on name input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Handle name editing
  const handleNameEdit = () => {
    setEditingNameValue(assistantName);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    const newName = editingNameValue.trim();
    if (!newName) {
      setIsEditingName(false);
      setEditingNameValue('');
      return;
    }

    setAssistantName(newName);
    setIsEditingName(false);
    setEditingNameValue('');

    // Save to database if projectId is available
    if (projectId) {
      try {
        const response = await fetch(`/api/projects/${projectId}/assistant-name`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assistantName: newName }),
        });

        if (!response.ok) {
          console.error('Failed to save assistant name');
          // Could show a notification here if needed
        }
      } catch (error) {
        console.error('Error saving assistant name:', error);
        // Could show a notification here if needed
      }
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditingNameValue('');
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleNameCancel();
    }
  };

  // Load chat history and assistant name when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return;

      try {
        // Load chat history
        const historyResponse = await fetch(`/api/projects/${projectId}/messages`);
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          setMessages(history.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt)
          })));
        }

        // Load assistant name
        const nameResponse = await fetch(`/api/projects/${projectId}/assistant-name`);
        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          setAssistantName(nameData.assistantName);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
      }
    };

    loadProjectData();
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Notify parent about screenshot mode changes
  useEffect(() => {
    if (onScreenshotModeChange) {
      onScreenshotModeChange(isSelectingArea);
    }
  }, [isSelectingArea, onScreenshotModeChange]);

  // Debug screenshot state changes
  useEffect(() => {
    console.log('[SCREENSHOT] Screenshots state changed:', {
      count: screenshots.length,
      screenshots: screenshots.map(s => ({
        id: s.id,
        hasDataUrl: !!s.dataUrl,
        dataUrlLength: s.dataUrl?.length,
        area: s.area
      }))
    });
  }, [screenshots]);

  // Screenshot capture functionality
  const captureFullCanvas = () => {
    if (!stageRef?.current) {
      console.error('Stage ref not available for screenshot');
      return;
    }

    // Limit to maximum 5 screenshots
    if (screenshots.length >= 5) {
      console.warn('Maximum of 5 screenshots allowed');
      return;
    }

    try {
      const stage = stageRef.current;
      
      // Force a render before capturing
      stage.batchDraw();
      
      // Wait a brief moment for the render to complete
      setTimeout(() => {
        try {
          console.log('Capturing full canvas, stage size:', {
            width: stage.width(),
            height: stage.height(),
            scaleX: stage.scaleX(),
            scaleY: stage.scaleY(),
            x: stage.x(),
            y: stage.y()
          });

          const dataUrl = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.85,
            pixelRatio: 1,
            // Include the background color
            backgroundColor: 'white'
          });

          console.log('Full canvas dataUrl length:', dataUrl.length);

          // Check if the screenshot is valid (not all black/transparent)
          if (dataUrl.length < 1000) {
            console.warn('Screenshot appears to be empty or too small');
            return;
          }

          // Check file size (rough estimate: base64 is ~33% larger than binary)
          const base64Data = dataUrl.split(',')[1];
          const sizeInBytes = (base64Data.length * 3) / 4;
          const sizeInMB = sizeInBytes / (1024 * 1024);

          if (sizeInMB > 10) { // 10MB limit per screenshot
            console.warn('Screenshot too large:', sizeInMB.toFixed(2), 'MB');
            return;
          }

          const screenshot: Screenshot = {
            id: Date.now().toString(),
            dataUrl
          };

          setScreenshots(prev => [...prev, screenshot]);
        } catch (error) {
          console.error('Error capturing screenshot:', error);
        }
      }, 100); // Small delay to ensure render completion
    } catch (error) {
      console.error('Error preparing screenshot:', error);
    }
  };

  const captureSelectedArea = async (area: { x: number; y: number; width: number; height: number }) => {
    console.log('[SCREENSHOT] Starting area screenshot capture...');
    
    if (!stageRef?.current) {
      console.error('[SCREENSHOT] Stage ref not available');
      return;
    }

    try {
      const stage = stageRef.current;
      
      // Force a render to ensure the stage is up to date
      stage.batchDraw();
      
      // Wait a short moment for the render to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[SCREENSHOT] Stage info:', {
        stageWidth: stage.width(),
        stageHeight: stage.height(),
        stageScale: stage.scaleX(),
        stagePosition: { x: stage.x(), y: stage.y() },
        stageChildren: stage.children.length
      });

      // Capture the full stage first
      const fullDataUrl = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 1
      });
      
      console.log('[SCREENSHOT] Full stage captured:', {
        fullDataUrlLength: fullDataUrl.length,
        fullDataUrlPrefix: fullDataUrl.substring(0, 50),
        isValidFullDataUrl: fullDataUrl.startsWith('data:image/')
      });

      // If the full stage capture is empty/black, try alternative approach
      if (fullDataUrl.length < 5000) {
        console.warn('[SCREENSHOT] Full stage capture appears empty, trying alternative...');
        
        // Try capturing with different settings
        const altDataUrl = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
          x: 0,
          y: 0,
          width: stage.width(),
          height: stage.height()
        });
        
        if (altDataUrl.length > fullDataUrl.length) {
          console.log('[SCREENSHOT] Alternative capture successful');
          // Use the alternative capture for cropping
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            canvas.width = area.width;
            canvas.height = area.height;
            
            // Apply white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, area.width, area.height);
            
            // Draw the cropped portion
            ctx.drawImage(
              img,
              area.x, area.y, area.width, area.height,
              0, 0, area.width, area.height
            );
            
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            
            if (croppedDataUrl.length > 1000) {
              const newScreenshot: Screenshot = {
                id: Date.now().toString(),
                dataUrl: croppedDataUrl,
                area: area
              };
              
              setScreenshots(prev => [...prev, newScreenshot]);
              console.log('[SCREENSHOT] Alternative screenshot added successfully');
            } else {
              console.error('[SCREENSHOT] Alternative cropped image still appears empty');
            }
          };
          img.src = altDataUrl;
          return;
        }
      }

      // Create an image from the full stage capture
      const img = new window.Image();
      img.onload = () => {
        // Create a canvas for cropping
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = area.width;
        canvas.height = area.height;
        
        // Apply white background first
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, area.width, area.height);
        
        // Draw the cropped portion
        ctx.drawImage(
          img,
          area.x, area.y, area.width, area.height, // Source area
          0, 0, area.width, area.height // Destination area
        );
        
        // Convert to JPEG
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        console.log('[SCREENSHOT] Cropped image created:', {
          croppedDataUrlLength: croppedDataUrl.length,
          croppedDataUrlPrefix: croppedDataUrl.substring(0, 50),
          isValidCroppedDataUrl: croppedDataUrl.startsWith('data:image/')
        });

        // Check if the screenshot is valid
        if (croppedDataUrl.length < 1000) {
          console.warn('[SCREENSHOT] Area screenshot appears to be empty or too small, length:', croppedDataUrl.length);
          return;
        }

        // Check file size
        const base64Data = croppedDataUrl.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        console.log('[SCREENSHOT] Cropped file size check:', {
          base64Length: base64Data.length,
          sizeInBytes,
          sizeInMB: sizeInMB.toFixed(2)
        });

        if (sizeInMB > 10) {
          console.warn('[SCREENSHOT] Area screenshot too large:', sizeInMB.toFixed(2), 'MB');
          return;
        }

        const screenshot: Screenshot = {
          id: Date.now().toString(),
          dataUrl: croppedDataUrl,
          area
        };

        console.log('[SCREENSHOT] Adding area screenshot to state:', {
          id: screenshot.id,
          hasDataUrl: !!screenshot.dataUrl,
          dataUrlLength: screenshot.dataUrl.length,
          area: screenshot.area
        });

        setScreenshots(prev => {
          console.log('[SCREENSHOT] Previous screenshots count:', prev.length);
          const newScreenshots = [...prev, screenshot];
          console.log('[SCREENSHOT] New screenshots count:', newScreenshots.length);
          return newScreenshots;
        });
      };

      img.onerror = (error) => {
        console.error('[SCREENSHOT] Failed to load full screenshot for cropping:', error);
      };

      console.log('[SCREENSHOT] Setting image source...');
      img.src = fullDataUrl;
    } catch (error: any) {
      console.error('[SCREENSHOT] Error in area capture process:', error);
    }
  };

  const removeScreenshot = (id: string) => {
    console.log('[SCREENSHOT] Removing screenshot with id:', id);
    setScreenshots(prev => {
      const filtered = prev.filter(s => s.id !== id);
      console.log('[SCREENSHOT] Screenshots after removal:', {
        previousCount: prev.length,
        newCount: filtered.length,
        removedId: id
      });
      return filtered;
    });
  };

  const startScreenshotCapture = () => {
    console.log('[SCREENSHOT] Starting screenshot capture process...');
    
    if (!stageRef?.current) {
      console.error('[SCREENSHOT] Stage ref not available for screenshot');
      return;
    }

    console.log('[SCREENSHOT] Setting selection mode to active');
    setIsSelectingArea(true);
    setSelectionStart(null);
    setSelectionEnd(null);
    
    // Add event listeners to the stage for drag selection
    const stage = stageRef.current;
    const container = stage.container();
    
    if (!container) {
      console.error('[SCREENSHOT] Stage container not available');
      return;
    }

    console.log('[SCREENSHOT] Container found, setting up event listeners');

    let startPos: { x: number; y: number } | null = null;
    let selectionRect: HTMLDivElement | null = null;

         const handleMouseDown = (e: MouseEvent) => {
       e.preventDefault();
       e.stopPropagation();
       
       // If user holds Shift key, capture full canvas immediately
       if (e.shiftKey) {
         // Clean up event listeners
         container.removeEventListener('mousedown', handleMouseDown);
         container.removeEventListener('mousemove', handleMouseMove);
         container.removeEventListener('mouseup', handleMouseUp);
         
         setIsSelectingArea(false);
         captureFullCanvas();
         return;
       }
       
       const rect = container.getBoundingClientRect();
       startPos = {
         x: e.clientX - rect.left,
         y: e.clientY - rect.top
       };
       
       setSelectionStart(startPos);
       
       // Create visual selection rectangle
       selectionRect = document.createElement('div');
       selectionRect.style.position = 'absolute';
       selectionRect.style.border = '2px dashed #E91E63';
       selectionRect.style.backgroundColor = 'rgba(233, 30, 99, 0.1)';
       selectionRect.style.pointerEvents = 'none';
       selectionRect.style.zIndex = '9999';
       selectionRect.style.left = startPos.x + 'px';
       selectionRect.style.top = startPos.y + 'px';
       selectionRect.style.width = '0px';
       selectionRect.style.height = '0px';
       
       // Debug: Log the styles being applied
       console.log('[SCREENSHOT] Selection rectangle created:', {
         border: selectionRect.style.border,
         backgroundColor: selectionRect.style.backgroundColor,
         position: selectionRect.style.position,
         zIndex: selectionRect.style.zIndex,
         left: selectionRect.style.left,
         top: selectionRect.style.top
       });
       
       container.appendChild(selectionRect);
     };

    const handleMouseMove = (e: MouseEvent) => {
      if (!startPos || !selectionRect) return;
      
      const rect = container.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      const left = Math.min(startPos.x, currentPos.x);
      const top = Math.min(startPos.y, currentPos.y);
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);
      
      selectionRect.style.left = left + 'px';
      selectionRect.style.top = top + 'px';
      selectionRect.style.width = width + 'px';
      selectionRect.style.height = height + 'px';
      
      setSelectionEnd(currentPos);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!startPos || !selectionRect) return;
      
      const rect = container.getBoundingClientRect();
      const endPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
             // Calculate selection area in screen coordinates
       const area = {
         x: Math.min(startPos.x, endPos.x),
         y: Math.min(startPos.y, endPos.y),
         width: Math.abs(endPos.x - startPos.x),
         height: Math.abs(endPos.y - startPos.y)
       };
       
       console.log('Selection area (screen coordinates):', area);
      
             // Clean up
       container.removeChild(selectionRect);
       container.removeEventListener('mousedown', handleMouseDown);
       container.removeEventListener('mousemove', handleMouseMove);
       container.removeEventListener('mouseup', handleMouseUp);
      
      setIsSelectingArea(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      
      // Capture the selected area if it's large enough
      if (area.width > 10 && area.height > 10) {
        captureSelectedArea(area);
      } else {
        // If selection is too small, capture full canvas
        captureFullCanvas();
      }
    };

    // Set up event listeners
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    // Note: Cursor is now handled by the parent Canvas component
  };

  // Convert screenshots to base64 for API submission
  const getScreenshotsForAPI = () => {
    return screenshots.map(screenshot => ({
      id: screenshot.id,
      data: screenshot.dataUrl.split(',')[1], // Remove data:image/jpeg;base64, prefix
      area: screenshot.area
    }));
  };

  const getRelevantFiles = async (query: string) => {
    // TODO: Implement file search and content retrieval
    // This is a placeholder that should be replaced with actual file search logic
    return [
      {
        name: 'Canvas.tsx',
        content: 'Canvas component content...',
      },
      {
        name: 'StickyNote.tsx',
        content: 'StickyNote component content...',
      },
    ];
  };





  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to project history if projectId is available
    if (projectId) {
      try {
        await fetch(`/api/projects/${projectId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: userMessage.role,
            content: userMessage.content
          }),
        });
      } catch (saveError) {
        console.error('Failed to save user message to project history:', saveError);
      }
    }

    // --- Text Chat Flow using OpenAI API ---
    try {
      // Prepare messages for OpenAI API
      const apiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message
      apiMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Prepare screenshots data if any
      const screenshotsData = screenshots.map(screenshot => ({
        id: screenshot.id,
        data: screenshot.dataUrl,
        area: screenshot.area
      }));

      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: apiMessages,
          screenshots: screenshotsData.length > 0 ? screenshotsData : undefined
        }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get response from AI assistant');
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
        content: data.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

      // Save message to project history if projectId is available
      if (projectId) {
        try {
          await fetch(`/api/projects/${projectId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: assistantMessage.role,
              content: assistantMessage.content
            }),
          });
        } catch (saveError) {
          console.error('Failed to save message to project history:', saveError);
        }
      }

      // Clear screenshots after successful message exchange
      if (screenshots.length > 0) {
        setScreenshots([]);
        console.log('[SCREENSHOT] Automatically cleared screenshots after message sent');
      }

      } catch (error) {
      console.error('Error fetching from /api/chat:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
    }
  };

  const markdownComponents: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
    img: ({ src, alt, ...props }) => {
      if (!src) return null;
      return (
        <div className="my-4">
          <img 
            src={src}
            alt={alt || ''} 
            className="max-w-full rounded-lg shadow-md"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
            {...props}
          />
        </div>
      );
    }
  };

  // Add new function to handle adding to canvas
  const handleAddToCanvas = (imageData: string, prompt: string) => {
    if (!onAddToCanvas) {
      console.error('onAddToCanvas callback not provided');
      return;
    }

    // Extract the base64 image data from the message content
    const base64Data = imageData.split('\n\n')[1];
    if (!base64Data) {
      console.error('No image data found in message');
      return;
    }

    console.log('Adding to canvas:', {
      hasImageData: !!base64Data,
      prompt,
      imageDataLength: base64Data.length
    });

    onAddToCanvas(base64Data, prompt);
  };

  return (
    <div className={`ai-chat-panel fixed right-0 w-[400px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOnboardingActive ? 'z-0' : 'z-50'}`} style={{ top: '88px', bottom: 0 }}>
      <style jsx global>{`
        .generated-image {
          margin: 1rem 0;
        }
        .generated-image img {
          max-width: 100%;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-5 h-5 relative flex-shrink-0">
            <Image
              src="/icons/sparkles-icon.svg"
              alt="AI Assistant"
              fill
              className="text-purple-600"
            />
          </div>
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editingNameValue}
              onChange={(e) => setEditingNameValue(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameSave}
              className="font-medium text-[#202126] bg-transparent border-none outline-none focus:outline-none flex-1 min-w-0"
              maxLength={30}
            />
          ) : (
            <h2 
              className="font-medium text-[#202126] cursor-pointer hover:text-[#814ADA] transition-colors truncate"
              onClick={handleNameEdit}
              title="Click to edit assistant name"
            >
              {assistantName}
            </h2>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-white border border-[#E0DAF3] hover:bg-gray-50 rounded-md transition-colors flex-shrink-0"
        >
          <X className="h-5 w-5 text-[#814ADA]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="w-12 h-12 relative mb-4">
              <Image
                src="/icons/sparkles-icon.svg"
                alt="AI Assistant"
                fill
                className="text-[#814ADA] opacity-50"
              />
            </div>
            <p className="text-sm mb-2">Hi! I'm {assistantName}.</p>
            <p className="text-xs">Ask me anything about your design project or canvas elements.</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start w-full'
            }`}
          >
            <div
              className={`${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-800 max-w-[80%]'
                  : 'text-gray-800 w-full pr-4'
              } rounded-lg p-3`}
            >
              {message.role === 'assistant' ? (
                <>
                  <div className="prose prose-sm max-w-none">
                    {message.isGeneratedImage ? (
                      <>
                        <p>Here's the generated design:</p>
                        <div className="my-4 relative group">
                          <div className="relative">
                            <img
                              src={message.content.includes('data:image') ? message.content.split('\n\n')[1] : `data:image/png;base64,${message.content.split('\n\n')[1]}`}
                              alt="Generated Design"
                              className="max-w-full rounded-lg shadow-md"
                              style={{ maxHeight: '400px', objectFit: 'contain' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg">
                              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    console.log('Add to Canvas clicked:', {
                                      messageContent: message.content,
                                      prompt: message.prompt
                                    });
                                    handleAddToCanvas(message.content, message.prompt || '');
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-[#814ADA] rounded-lg shadow-sm transition-colors text-sm font-medium"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                  </svg>
                                  Add to Canvas
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                    )}
                  </div>

                </>
              ) : (
                <p>{message.content}</p>
              )}
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
              {message.sources && (
                <div className="mt-2 pt-2 border-t border-gray-200/20">
                  <p className="text-xs opacity-70 mb-1">Sources:</p>
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs opacity-90"
                    >
                      <span>📄</span>
                      <span>{source.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Screenshot Section */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
        <button
            onClick={startScreenshotCapture}
            disabled={isSelectingArea || !stageRef?.current || screenshots.length >= 5}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={screenshots.length >= 5 ? 'Maximum 5 screenshots allowed' : 'Drag to select area or Shift+click for full canvas'}
        >
          <Image
              src="/icons/screenshot-svgrepo-com (1).svg"
              alt="Capture screenshot"
            width={16}
            height={16}
          />
            {isSelectingArea ? 'Drag to select area...' : 
             screenshots.length >= 5 ? 'Max screenshots reached' : 
             'Capture canvas screenshot'}
        </button>
          {screenshots.length > 0 && (
            <span className="text-xs text-gray-500">{screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        {isSelectingArea && (
          <div className="text-xs text-gray-500 mb-2">
            <span className="text-pink-600">●</span> Drag to select area • <span className="font-mono text-xs">Shift+click</span> for full canvas
          </div>
        )}
        
        {screenshots.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {screenshots.map((screenshot) => {
              console.log('[SCREENSHOT] Rendering thumbnail:', {
                id: screenshot.id,
                hasDataUrl: !!screenshot.dataUrl,
                dataUrlLength: screenshot.dataUrl?.length,
                dataUrlPrefix: screenshot.dataUrl?.substring(0, 50),
                area: screenshot.area
              });
              
              return (
                <div
                  key={screenshot.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <img
                    src={screenshot.dataUrl}
                    alt="Screenshot"
                    className="w-8 h-8 rounded object-cover"
                    style={{
                      backgroundColor: '#f0f0f0', // Add background to see if image is transparent
                      border: '1px solid #ccc' // Add border to see image boundaries
                    }}
                    onLoad={(e) => {
                      console.log('[SCREENSHOT] Thumbnail loaded successfully for:', screenshot.id);
                      const img = e.target as HTMLImageElement;
                      console.log('[SCREENSHOT] Thumbnail image details:', {
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        displayWidth: img.width,
                        displayHeight: img.height,
                        src: img.src.substring(0, 100) + '...'
                      });
                    }}
                    onError={(e) => {
                      console.error('[SCREENSHOT] Thumbnail failed to load for:', screenshot.id, e);
                      const img = e.target as HTMLImageElement;
                      console.error('[SCREENSHOT] Failed image src:', img.src.substring(0, 100) + '...');
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">
                      {screenshot.area 
                        ? `Area: ${Math.round(screenshot.area.width)}×${Math.round(screenshot.area.height)}` 
                        : 'Full canvas'
                      }
                    </p>
              </div>
                  <button
                    onClick={() => {
                      console.log('[SCREENSHOT] Removing screenshot:', screenshot.id);
                      removeScreenshot(screenshot.id);
                    }}
                    className="text-gray-400 hover:text-[#E91E63] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  // Shift+Enter: Allow new line (default behavior)
                  return;
                } else {
                  // Enter: Submit the form
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    handleSubmit(e as any);
                  }
                }
              }
            }}
            placeholder="Ask AI anything..."
            className="w-full p-2 pr-10 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#814ADA]"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-[#814ADA] disabled:text-gray-300"
            disabled={isLoading || !input.trim()}
          >
            <Image
              src="/icons/paper-plane-tilt.svg"
              alt="Send"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </button>
        </div>
      </form>
    </div>
  );
} 