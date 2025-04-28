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

interface MarkdownProps {
  children: ReactNode;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  hasGenerateAction?: boolean;
  isGeneratedImage?: boolean;
  selectedElement?: any;
  prompt?: string;
  sources?: {
    name: string;
    path: string;
  }[];
}

interface AIChatProps {
  onClose: () => void;
  canvasElements: CanvasElement[];
  onAddToCanvas?: (imageData: string, prompt: string) => void;
  projectId?: string;
}

export default function AIChat({ onClose, canvasElements, onAddToCanvas, projectId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState<CanvasElement[]>([]);
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [contextSent, setContextSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showGenerateButton, setShowGenerateButton] = useState(false);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!projectId) return;

      try {
        const response = await fetch(`/api/projects/${projectId}/messages`);
        if (!response.ok) throw new Error('Failed to load chat history');
        
        const history = await response.json();
        setMessages(history.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          hasGenerateAction: msg.hasGenerateAction
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
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

  // Reset context sent state when selected context changes
  useEffect(() => {
    setContextSent(false);
  }, [selectedContext]);

  const toggleElementContext = (element: CanvasElement) => {
    setSelectedContext(prev => {
      const isSelected = prev.some(el => el.id === element.id);
      if (isSelected) {
        return prev.filter(el => el.id !== element.id);
      } else {
        return [...prev, element];
      }
    });
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

  const handleGenerate = async () => {
    if (!onAddToCanvas) return;
    
    setIsLoading(true);
    setGeneratingImage(true);
    setShowGenerateButton(false); // Hide button immediately to prevent double-clicks
    
    try {
      // Get the last message with design suggestions
      const lastAssistantMessage = [...messages].reverse().find(m => 
        m.role === 'assistant' && m.hasGenerateAction
      );
      
      if (!lastAssistantMessage) {
        throw new Error('No design suggestions found');
      }
      
      // Show a generating message
      const generatingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Generating an improved design based on the suggestions... This may take a moment.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, generatingMessage]);
      
      // Find the selected element with image
      const selectedElement = lastAssistantMessage.selectedElement;
      if (!selectedElement) {
        throw new Error('No element selected. Please select an image element first.');
      }
      
      // Get the image data from the correct property
      let imageUrl = null;
      
      // Handle different element types and image data structures
      if (selectedElement.type === 'image' || selectedElement.type === 'uploaded' || selectedElement.type === 'generated-image') {
        // Try different possible locations for the image data
        imageUrl = selectedElement.src || 
                  selectedElement.image?.src || 
                  selectedElement.image ||
                  (selectedElement as any).imageData;
                  
        // If the image is a base64 string without the data URL prefix, add it
        if (imageUrl && !imageUrl.startsWith('data:image') && !imageUrl.startsWith('http')) {
          imageUrl = `data:image/png;base64,${imageUrl}`;
        }
      }
      
      if (!imageUrl) {
        console.error('No image data found in selected element:', selectedElement);
        throw new Error('Selected element has no image data. Please select a different image element.');
      }
      
      // Call the image generation API
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Improve the design based on the suggestions',
          imageUrl,
          selectedElement,
          aiResponse: lastAssistantMessage.content
        })
      });
      
      if (!response.ok) {
        // Get detailed error information
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        } catch (jsonError) {
          throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Remove the generating message
      setMessages(prev => prev.filter(msg => msg.id !== generatingMessage.id));
      
      // Create a message with the generated image
      const generatedMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here's the generated design based on the suggestions:\n\n${data.imageData}`,
        timestamp: new Date(),
        isGeneratedImage: true,
        prompt: data.prompt
      };
      
      setMessages(prev => [...prev, generatedMessage]);
      
      // Save the message to the database if projectId is available
      if (projectId) {
        try {
          await fetch(`/api/projects/${projectId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: `Here's the generated design based on the suggestions:\n\n${data.imageData}`, 
              role: 'assistant',
              isGeneratedImage: true
            })
          });
        } catch (error) {
          console.error('Error saving generated image message:', error);
        }
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // Show a more descriptive error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error while generating the image: ${error.message || 'Unknown error'}. Please try again or select a different image element.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Show the generate button again so they can retry
      setTimeout(() => setShowGenerateButton(true), 3000);
    } finally {
      setIsLoading(false);
      setGeneratingImage(false);
    }
  };

  const checkForGenerateAction = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    // Check for various suggestion patterns
    const suggestivePatterns = [
      'would you like me to generate',
      'would you like to see',
      'shall i create',
      'i can show you',
      'i can generate',
      'would you like me to show',
      'i can create',
      'shall i show you',
      'would you like a visualization',
      'shall i create a new version',
      'would you like me to create'
    ];
    
    const designPatterns = [
      'design',
      'version',
      'changes',
      'improvement',
      'modification',
      'update',
      'style',
      'look',
      'visualization'
    ];

    // Check if the message ends with a call-to-action
    const lastParagraph = content.split('\n\n').pop()?.toLowerCase() || '';
    const hasCallToAction = suggestivePatterns.some(pattern => 
      lastParagraph.includes(pattern)
    );

    const hasDesignReference = designPatterns.some(pattern =>
      lowerContent.includes(pattern)
    );

    // Also check if the message contains suggestions for improvements
    const containsSuggestions = (
      lowerContent.includes('suggest') ||
      lowerContent.includes('could be') ||
      lowerContent.includes('recommend') ||
      lowerContent.includes('improve') ||
      lowerContent.includes('enhance')
    );

    // Show the button if the last paragraph contains a call-to-action
    // or if the message contains both suggestions and design references
    return hasCallToAction || (containsSuggestions && hasDesignReference);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Save user message to database
    if (projectId) {
      try {
        await fetch(`/api/projects/${projectId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: userMessage, role: 'user' })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }

    // Check if we have a selected element to analyze
    const elementsToAnalyze = selectedContext.length > 0 ? selectedContext : [];
    const selectedElement = elementsToAnalyze.length === 1 ? elementsToAnalyze[0] : null;

    try {
      // Create a simplified message array with just the essential data
      const simplifiedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      simplifiedMessages.push({
        role: 'user',
        content: userMessage
      });
      
      // Prepare the selected element data
      let elementToSend = null;
      if (selectedElement) {
        console.log('Selected element:', selectedElement);
        
        // Handle different element types
        if (selectedElement.type === 'image' || selectedElement.type === 'uploaded' || selectedElement.type === 'generated-image') {
          const imageElement = selectedElement as ImageElement;
          elementToSend = {
            ...imageElement,
            image: imageElement.src || (imageElement as any).image?.src || (imageElement as any).image
          };
          console.log('Prepared image element:', elementToSend);
        } else {
          elementToSend = selectedElement;
        }
      }

      console.log('Sending request with selected element:', elementToSend);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: simplifiedMessages,
          selectedElement: elementToSend
        })
      });

      if (!response.ok) {
        // Get detailed error information if available
        try {
          const errorData = await response.json();
          console.error('API error details:', errorData);
          throw new Error(errorData.error || 'Failed to get AI response');
        } catch (jsonError) {
          // If we can't parse the error as JSON, throw with the status text
          throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || "I'm not sure how to respond to that.",
        timestamp: new Date(),
        hasGenerateAction: !!data.hasGenerateAction,
        selectedElement: data.selectedElement // Store the selected element in the message
      };

      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      if (projectId) {
        try {
          await fetch(`/api/projects/${projectId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: data.content, 
              role: 'assistant',
              hasGenerateAction: data.hasGenerateAction 
            })
          });
        } catch (error) {
          console.error('Error saving assistant message:', error);
        }
      }

      // If the message has a generate action, show the generate button
      if (data.hasGenerateAction) {
        setShowGenerateButton(true);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. This could be due to temporary issues with the OpenAI API or server configuration. Please try again in a few moments.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const markdownComponents: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
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
    <div className="fixed right-0 w-[400px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out" style={{ top: '88px', bottom: 0 }}>
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
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 relative">
            <Image
              src="/icons/sparkles-icon.svg"
              alt="AI Assistant"
              fill
              className="text-purple-600"
            />
          </div>
          <h2 className="font-medium text-[#202126]">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-white border border-[#E0DAF3] hover:bg-gray-50 rounded-md transition-colors"
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
            <p className="text-sm mb-2">Hi! I'm your AI design assistant.</p>
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
                        <p>Here's the generated design variation based on the suggestions:</p>
                        <div className="my-4 relative group">
                          <div className="relative">
                            <img
                              src={`data:image/png;base64,${message.content.split('\n\n')[1]}`}
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
                  {message.hasGenerateAction && showGenerateButton && (
                    <div className="mt-3">
                      <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`w-full py-2 px-3 bg-white border border-[#814ADA] text-[#814ADA] hover:bg-[#814ADA]/5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-[#814ADA] border-t-transparent rounded-full animate-spin mr-2"></span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Icon name="sparkles" size={16} className="text-[#814ADA]" />
                            Generate Design
                          </>
                        )}
                      </button>
                    </div>
                  )}
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

      {/* Context Selector */}
      <div className="px-4 py-2 border-t border-gray-200">
        <button
          onClick={() => setShowContextSelector(!showContextSelector)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <Image
            src="/icons/paper-clip.svg"
            alt="Add context"
            width={16}
            height={16}
          />
          Add canvas elements to conversation
          {selectedContext.length > 0 && ` (${selectedContext.length} selected)`}
        </button>
        
        {showContextSelector && (
          <div className="mt-2 max-h-32 overflow-y-auto border rounded-lg p-2 space-y-2">
            {canvasElements.map((element) => (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                  selectedContext.some(el => el.id === element.id)
                    ? 'bg-gray-100'
                    : ''
                }`}
                onClick={() => toggleElementContext(element)}
              >
                <input
                  type="checkbox"
                  checked={selectedContext.some(el => el.id === element.id)}
                  onChange={() => toggleElementContext(element)}
                  className="rounded"
                />
                <span className="text-sm">
                  {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                  {(element as any).text ? `: ${(element as any).text}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            className="w-full pr-12 pl-4 py-3 bg-gray-50 rounded-lg resize-none outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            rows={1}
            style={{ maxHeight: '120px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
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