import { useState } from 'react';
import { CaseStudySuggestions } from './CaseStudySuggestions';
import { CaseStudyService } from '@/lib/services/case-study-service';
import { ProjectContext, CaseStudyReference } from '@/lib/types/case-study';
import { DesignSuggestions, DesignSuggestion } from './DesignSuggestions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: {
    type: 'case-study' | 'design';
    data: any;
  };
}

export function AICompanion() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const caseStudyService = new CaseStudyService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();

      // Check if the response indicates we should show case studies
      if (data.shouldShowCaseStudies) {
        // Extract project context from the conversation
        const context: ProjectContext = {
          siteConstraints: data.context.siteConstraints,
          programmaticRequirements: data.context.programmaticRequirements,
          designChallenges: data.context.designChallenges,
          spatialOrganization: data.context.spatialOrganization,
          typology: data.context.typology,
          area: data.context.area,
          location: data.context.location,
          description: data.context.description
        };

        // Get case study recommendations
        const recommendations = await caseStudyService.findRelevantCaseStudies(context);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          suggestions: {
            type: 'case-study',
            data: recommendations
          }
        }]);
      } else if (data.shouldGenerateDesign) {
        // Handle design generation suggestions
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          suggestions: {
            type: 'design',
            data: data.designSuggestions
          }
        }]);
      } else {
        // Regular message without suggestions
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

  const handleSelectCaseStudy = (caseStudy: CaseStudyReference) => {
    // Handle case study selection
    // For example, open in a new tab or show in a modal
    window.open(caseStudy.sourceUrl, '_blank');
  };

  const handleSelectDesign = (suggestion: DesignSuggestion) => {
    // Handle design selection
    // For example, apply the design to the canvas or show in a modal
    console.log('Selected design:', suggestion);
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
              <div className="prose prose-sm">
                {message.content}
              </div>
              
              {message.suggestions && (
                <div className="mt-4">
                  {message.suggestions.type === 'case-study' && (
                    <CaseStudySuggestions
                      caseStudies={message.suggestions.data}
                      onSelectCaseStudy={handleSelectCaseStudy}
                    />
                  )}
                  {message.suggestions.type === 'design' && (
                    <DesignSuggestions
                      suggestions={message.suggestions.data}
                      onSelectDesign={handleSelectDesign}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your design..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 