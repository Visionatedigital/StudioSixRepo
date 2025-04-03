import { CanvasElement } from '@/types/canvas';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class ChatService {
  static async sendMessage(messages: Message[], canvasElements: CanvasElement[] = [], shouldSearchCaseStudies: boolean = true) {
    try {
      // Process canvas elements to include image data
      const processedElements = await Promise.all(
        canvasElements.map(async (element) => {
          if (element.type === 'uploaded' && element.file) {
            // Convert File to base64
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(element.file!);
            });
            return {
              ...element,
              imageData: base64
            };
          }
          return element;
        })
      );

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          canvasElements: processedElements,
          shouldSearchCaseStudies
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.message;
    } catch (error: any) {
      console.error('Error in ChatService:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }
} 