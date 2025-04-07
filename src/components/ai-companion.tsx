import React, { useState } from 'react';
import { CanvasElement } from '@/types/canvas';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  caseStudies?: any[];
}

export function AICompanion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [lastAssistantMessageIndex, setLastAssistantMessageIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add user message to chat
      const userMsg: Message = { role: 'user', content: userMessage };
      setMessages(prev => [...prev, userMsg]);

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].filter(msg => msg.role === 'user'), // Only send user messages
          canvasElements,
          shouldSearchCaseStudies: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => {
        const newMessages: Message[] = [...prev, {
          role: 'assistant' as const,
          content: data.message,
          caseStudies: data.caseStudies
        }];
        setLastAssistantMessageIndex(newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCaseStudies = async () => {
    setIsLoading(true);

    try {
      const lastUserMessage = messages.find(msg => msg.role === 'user')?.content;
      if (!lastUserMessage) return;

      // Get AI response with case study search
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.filter(msg => msg.role === 'user'), // Only send user messages
          canvasElements,
          shouldSearchCaseStudies: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        caseStudies: data.caseStudies
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching case studies. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.caseStudies && message.caseStudies.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Found Case Studies:</h4>
                  {message.caseStudies.map((study, idx) => (
                    <div key={idx} className="bg-white p-2 rounded">
                      <p className="font-medium">{study.title}</p>
                      <p className="text-sm text-gray-600">{study.architect}</p>
                      <p className="text-sm text-gray-600">{study.location}, {study.year}</p>
                    </div>
                  ))}
                </div>
              )}
              {message.role === 'assistant' && index === lastAssistantMessageIndex && (
                <button
                  onClick={handleSearchCaseStudies}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Search Case Studies Database'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about architectural projects..."
            className="flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}