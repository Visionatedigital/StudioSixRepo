import { Suspense } from 'react';
import { MessagesClient } from './MessagesClient';

export default function MessagesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesClient />
      </Suspense>
    </div>
  );
} 