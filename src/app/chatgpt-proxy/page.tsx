'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatGPTProxyPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/chatgpt-proxy/connect', {
        method: 'POST',
      });
      if (response.ok) {
        setIsConnected(true);
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Connected to ChatGPT! You can now send messages.',
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      alert('Failed to connect to ChatGPT. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/chatgpt-proxy/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSendImagePrompt = async () => {
    if (!selectedImage || !inputMessage.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Prompt: ${inputMessage}\n[Image uploaded]`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', inputMessage);
      formData.append('image', selectedImage);
      const response = await fetch('/api/chatgpt-proxy/image', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.imageUrl ? `![Generated Image](${data.imageUrl})` : 'No image returned.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ChatGPT Proxy</h1>
            <p className="text-gray-600">Direct access to ChatGPT through your app</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {!isConnected && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Connect to ChatGPT</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        {!isConnected ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span role="img" aria-label="message" style={{ fontSize: 32 }}>💬</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connect to ChatGPT
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the connect button above to open ChatGPT in the background and start chatting directly from this interface.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex flex-col space-y-3">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter your prompt for image generation..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  disabled={isLoading}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded border mb-2" />
                )}
                <button
                  onClick={handleSendImagePrompt}
                  disabled={!selectedImage || !inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 