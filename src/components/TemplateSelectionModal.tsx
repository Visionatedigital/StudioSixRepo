'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { applyTemplate } from '@/lib/templates';
import { toast } from 'sonner';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface TemplateOption {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function TemplateSelectionModal({ 
  isOpen, 
  onClose, 
  projectId 
}: TemplateSelectionModalProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const templates: TemplateOption[] = [
    {
      id: 'concept-development',
      title: 'Concept Development',
      description: 'Start turning your ideas and site constraints into a visual concept. Scribble early thoughts, analyze site data, explore precedent studies, and let AI assist with creative prompts.',
      image: '/images/templates/concept-development.jpg'
    },
    {
      id: 'design-exploration',
      title: 'Design Exploration',
      description: 'Already have a starting point? Use this space to test layouts, evolve your design language, and get suggestions to improve what you\'ve begun.',
      image: '/images/templates/design-exploration.jpg'
    },
    {
      id: 'visual-presentation',
      title: 'Visual Presentation',
      description: 'Need to communicate your idea clearly? Use this space to compile moodboards, generate renders, and create a visual story your client will love.',
      image: '/images/templates/visual-presentation.jpg'
    }
  ];
  
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };
  
  const handleConfirm = async () => {
    if (!selectedTemplate) return;
    
    setIsApplying(true);
    try {
      // Apply the selected template
      const success = await applyTemplate(projectId, selectedTemplate);
      
      if (success) {
        toast.success(`${selectedTemplate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} template applied successfully!`);
        // Refresh the page to show the applied template
        router.refresh();
      } else {
        toast.error('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('An error occurred while applying the template');
    } finally {
      setIsApplying(false);
      onClose();
    }
  };
  
  const handleSkip = () => {
    // Just close the modal without applying a template
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-semibold text-gray-900 mb-2">
                  Choose a Template to Get Started
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 mb-6">
                  Select a template that matches your project goals, or start with a blank canvas.
                </Dialog.Description>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-purple-500 ring-2 ring-purple-500 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="relative h-48 bg-gray-100">
                        {/* Display template preview image */}
                        <Image
                          src={template.image}
                          alt={template.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-medium text-lg text-gray-900 mb-2">{template.title}</h3>
                        <p className="text-gray-600 text-sm">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                    onClick={handleSkip}
                    disabled={isApplying}
                  >
                    Skip and start with a blank canvas
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      onClick={onClose}
                      disabled={isApplying}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                        selectedTemplate && !isApplying
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-purple-400 cursor-not-allowed'
                      }`}
                      onClick={handleConfirm}
                      disabled={!selectedTemplate || isApplying}
                    >
                      {isApplying ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Applying Template...
                        </div>
                      ) : (
                        'Get Started'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 