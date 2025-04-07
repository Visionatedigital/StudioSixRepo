'use client';

import { useState, useEffect } from 'react';

export function MessagesClient() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D4FF1]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No messages yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message: any) => (
        <div
          key={message.id}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{message.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">{message.content}</p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 