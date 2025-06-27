'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Users, Sparkles, Home, MessageCircle, Palette, Layers } from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string | null;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Draft Your Space",
    description: "Use spatial planning tools to create walls, doors, and windows for your design structure.",
    icon: <Layers className="w-5 h-5" />,
    targetSelector: "[data-tool='spatialPlanning']"
  },
  {
    id: 2,
    title: "Add Furniture & Elements",
    description: "Browse our library of furniture and design elements to furnish your space.",
    icon: <Home className="w-5 h-5" />,
    targetSelector: "[data-tool='libraries']"
  },
  {
    id: 3,
    title: "Get AI Design Assistance",
    description: "Chat with our AI for design suggestions and creative feedback.",
    icon: <MessageCircle className="w-5 h-5" />,
    targetSelector: ".ai-chat-toggle, .ai-chat-panel"
  },
  {
    id: 4,
    title: "Generate 3D Visualizations",
    description: "Create stunning 3D renders to iterate and explore design options quickly.",
    icon: <Sparkles className="w-5 h-5" />,
    targetSelector: "[data-tool='ai']"
  },
  {
    id: 5,
    title: "Collaborate with Your Team",
    description: "Invite collaborators to work together in real-time and make decisions.",
    icon: <Users className="w-5 h-5" />,
    targetSelector: ".invite-button"
  },
  {
    id: 6,
    title: "Ready to Get Started?",
    description: "You're all set! Start designing your dream space with these powerful tools.",
    icon: <Palette className="w-5 h-5" />,
    targetSelector: null
  }
];

export default function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [maskPath, setMaskPath] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // Update highlighted element when step changes
  useEffect(() => {
    const step = tutorialSteps[currentStep];
    
    // Special handling for AI chat step - ensure chat is open
    if (step.targetSelector?.includes('ai-chat') && currentStep === 1) {
      // Try to find and click the AI chat toggle button to open the chat
      const chatToggle = document.querySelector('.ai-chat-toggle');
      if (chatToggle) {
        console.log('Onboarding: Opening AI chat for tutorial step');
        (chatToggle as HTMLElement).click();
        // Wait a bit for the chat to open, then find the panel
        setTimeout(() => {
          const chatPanel = document.querySelector('.ai-chat-panel');
          if (chatPanel) {
            console.log('Onboarding: Setting up chat panel highlight', {
              currentStep,
              elementFound: true,
              elementRect: chatPanel.getBoundingClientRect(),
              beforeClasses: Array.from(chatPanel.classList),
              timestamp: new Date().toISOString()
            });
            
            setHighlightedElement(chatPanel);
            
            // Create spotlight effect for the chat panel
            const rect = chatPanel.getBoundingClientRect();
            console.log('Onboarding: Chat panel rect details', {
              rect: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
              },
              windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
              }
            });
            
            // Use fixed positioning for AI chat panel to avoid z-index positioning issues
            const fixedCenterX = window.innerWidth - 200; // 200px from right edge
            const fixedCenterY = window.innerHeight / 2; // Middle of screen height
            const fixedRadius = 220; // Slightly larger than half the chat panel width
            
            setMaskPath(`${fixedCenterX},${fixedCenterY},${fixedRadius}`);
            // DON'T add onboarding-highlight to AI chat panel - it would override z-index
            console.log('Onboarding: Chat panel positioning set (no highlight class added to preserve z-index)', {
              chatPanelClasses: Array.from(chatPanel.classList),
              fixedMaskPath: `${fixedCenterX},${fixedCenterY},${fixedRadius}`,
              originalRect: rect,
              note: 'Skipping onboarding-highlight class to preserve z-index: 0',
              timestamp: new Date().toISOString()
            });
          }
        }, 200);
        return () => {
          document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
          });
        };
      }
    }
    
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      console.log('Onboarding: Setting up element highlight', {
        currentStep,
        targetSelector: step.targetSelector,
        elementFound: !!element,
        elementType: element?.tagName,
        elementClasses: element ? Array.from(element.classList) : null,
        timestamp: new Date().toISOString()
      });
      
      setHighlightedElement(element);
      
      // Create spotlight effect for the element
      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8; // Extra space around the element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = Math.max(rect.width, rect.height) / 2 + padding;
        
        console.log('Onboarding: Adding highlight class', {
          element: element.tagName,
          beforeClasses: Array.from(element.classList),
          maskPath: `${centerX},${centerY},${radius}`,
          position: { centerX, centerY, radius },
          rectDetails: {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          },
          windowDimensions: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          timestamp: new Date().toISOString()
        });
        
        // Special handling for AI chat panel - ensure correct positioning
        if (element.classList.contains('ai-chat-panel')) {
          console.log('Onboarding: AI chat panel detected, using fixed positioning');
          // AI chat panel should be on the right side, let's use a more predictable position
          const fixedCenterX = window.innerWidth - 200; // 200px from right edge (middle of 400px chat panel)
          const fixedCenterY = window.innerHeight / 2; // Middle of screen height
          const fixedRadius = 220; // Slightly larger than half the chat panel width
          
          setMaskPath(`${fixedCenterX},${fixedCenterY},${fixedRadius}`);
          console.log('Onboarding: Using fixed AI chat positioning (no highlight class)', {
            fixedPosition: { centerX: fixedCenterX, centerY: fixedCenterY, radius: fixedRadius },
            originalPosition: { centerX, centerY, radius },
            note: 'Skipping highlight class to preserve AI chat z-index'
          });
          // DON'T add onboarding-highlight class to AI chat panel
        } else {
          // Store the spotlight coordinates: centerX,centerY,radius
          setMaskPath(`${centerX},${centerY},${radius}`);
          // Add highlight class for non-AI-chat elements
          element.classList.add('onboarding-highlight');
        }
        
        if (!element.classList.contains('ai-chat-panel')) {
          console.log('Onboarding: Highlight class added', {
            afterClasses: Array.from(element.classList),
            timestamp: new Date().toISOString()
          });
        }
      }
    } else {
      setHighlightedElement(null);
      setMaskPath('');
    }

    // Cleanup previous highlights
    return () => {
      document.querySelectorAll('.onboarding-highlight').forEach(el => {
        el.classList.remove('onboarding-highlight');
      });
    };
  }, [currentStep]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    console.log('Onboarding: Next step', { 
      from: currentStep, 
      to: nextStep,
      currentStepTitle: tutorialSteps[currentStep]?.title,
      nextStepTitle: tutorialSteps[nextStep]?.title,
      targetSelector: tutorialSteps[nextStep]?.targetSelector 
    });
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(nextStep);
      
      // Debug element targeting after step change
      setTimeout(() => {
        const targetElement = tutorialSteps[nextStep]?.targetSelector ? 
          document.querySelector(tutorialSteps[nextStep].targetSelector) : null;
        console.log('Onboarding: Target element after step change', {
          step: nextStep,
          stepTitle: tutorialSteps[nextStep]?.title,
          targetSelector: tutorialSteps[nextStep]?.targetSelector,
          elementFound: !!targetElement,
          elementRect: targetElement ? targetElement.getBoundingClientRect() : null,
          timestamp: new Date().toISOString()
        });
      }, 250);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    console.log('Onboarding: Previous step', { 
      from: currentStep, 
      to: prevStep,
      currentStepTitle: tutorialSteps[currentStep]?.title,
      prevStepTitle: tutorialSteps[prevStep]?.title,
      targetSelector: tutorialSteps[prevStep]?.targetSelector 
    });
    
    if (currentStep > 0) {
      setCurrentStep(prevStep);
      
      // Debug element targeting after step change
      setTimeout(() => {
        const targetElement = tutorialSteps[prevStep]?.targetSelector ? 
          document.querySelector(tutorialSteps[prevStep].targetSelector) : null;
        console.log('Onboarding: Target element after step change', {
          step: prevStep,
          stepTitle: tutorialSteps[prevStep]?.title,
          targetSelector: tutorialSteps[prevStep]?.targetSelector,
          elementFound: !!targetElement,
          elementRect: targetElement ? targetElement.getBoundingClientRect() : null,
          timestamp: new Date().toISOString()
        });
      }, 250);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isOpen || !isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate position for the tutorial card relative to target element
  const getCardPosition = () => {
    if (highlightedElement) {
      const rect = highlightedElement.getBoundingClientRect();
      const cardWidth = 280; // Reduced from 320
      const cardHeight = 200; // Estimated height
      const margin = 20;
      
      // Calculate optimal position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Special positioning for AI chat (step 3)
      if (tutorialSteps[currentStep].targetSelector?.includes('ai-chat')) {
        // Check if it's the chat panel (wide) or toggle button (small)
        const isChatPanel = rect.width > 100; // Chat panel is 400px wide, button is much smaller
        
        if (isChatPanel) {
          // Position closer to the left edge of the chat panel
          const chatPanelLeft = viewportWidth - 400; // Chat panel starts 400px from right edge
          const left = chatPanelLeft - cardWidth - 30; // 30px gap from chat panel
          const top = viewportHeight * 0.35; // Slightly lower to be more centered with chat content
          
          const finalTop = Math.max(margin, Math.min(top, viewportHeight - cardHeight - margin));
          const finalLeft = Math.max(margin, Math.min(left, viewportWidth - cardWidth - margin));
          
          console.log('Tutorial card positioning for AI chat panel:', {
            chatPanelLeft,
            calculatedLeft: left,
            finalLeft,
            finalTop,
            cardWidth,
            viewportWidth
          });
          
          return {
            left: `${finalLeft}px`,
            top: `${finalTop}px`,
          };
        } else {
          // Position to the left of the toggle button
          const left = rect.left - cardWidth - margin;
          const top = rect.top + (rect.height - cardHeight) / 2;
          
          const finalTop = Math.max(margin, Math.min(top, viewportHeight - cardHeight - margin));
          const finalLeft = Math.max(margin, left);
          
          return {
            left: `${finalLeft}px`,
            top: `${finalTop}px`,
          };
        }
      }
      
      let left = rect.right + margin;
      let top = rect.top + (rect.height - cardHeight) / 2;
      
      // If card would go off right edge, position to the left
      if (left + cardWidth > viewportWidth - margin) {
        left = rect.left - cardWidth - margin;
      }
      
      // If card would go off left edge, center horizontally
      if (left < margin) {
        left = (viewportWidth - cardWidth) / 2;
        top = rect.bottom + margin;
      }
      
      // Ensure card doesn't go off top or bottom
      if (top < margin) {
        top = margin;
      } else if (top + cardHeight > viewportHeight - margin) {
        top = viewportHeight - cardHeight - margin;
      }
      
      return {
        left: `${left}px`,
        top: `${top}px`,
      };
    }
    
    // Default center position for final step
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    };
  };

  return (
    <>
      {/* Highlight CSS - Just z-index boost for spotlight */}
      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 60 !important;
        }
      `}</style>
      
      {/* Backdrop with Spotlight */}
      <div className="fixed inset-0 z-50 transition-all duration-300">
                {highlightedElement && maskPath ? (
          <div 
            className="absolute inset-0 bg-black/15 backdrop-blur-sm"
            style={{
              mask: `radial-gradient(circle at ${maskPath.split(',')[0]}px ${maskPath.split(',')[1]}px, transparent ${parseInt(maskPath.split(',')[2])}px, black ${parseInt(maskPath.split(',')[2]) + 12}px)`,
              WebkitMask: `radial-gradient(circle at ${maskPath.split(',')[0]}px ${maskPath.split(',')[1]}px, transparent ${parseInt(maskPath.split(',')[2])}px, black ${parseInt(maskPath.split(',')[2]) + 12}px)`
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
        )}
        
        {/* Tutorial Card */}
        <div 
          className="absolute bg-white rounded-xl shadow-2xl p-4 border border-gray-100 z-50"
          style={{ 
            ...getCardPosition(), 
            width: '280px',
            maxWidth: '280px'
          }}
        >
          {/* Arrow pointer */}
          {highlightedElement && (
            <div className="absolute w-3 h-3 bg-white border-l border-t border-gray-100 transform rotate-45 -z-10"
              style={{
                left: (() => {
                  if (tutorialSteps[currentStep].targetSelector?.includes('ai-chat')) {
                    const rect = highlightedElement.getBoundingClientRect();
                    const isChatPanel = rect.width > 100;
                    // Arrow should point to the right towards the chat panel
                    return 'calc(100% - 6px)'; // Point right towards chat panel
                  }
                  return getCardPosition().left && getCardPosition().left.includes('px') && 
                    highlightedElement.getBoundingClientRect().right + 20 < parseInt(getCardPosition().left.replace('px', ''))
                    ? 'calc(100% - 6px)' 
                    : '-6px';
                })(),
                top: '50%',
                marginTop: '-6px'
              }}
            />
          )}
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 mt-0.5">
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">{step.title}</h3>
                <div className="text-xs text-gray-500 mt-0.5">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </div>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isFirstStep 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-xs font-medium rounded-md transition-all duration-200"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Step indicators dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1.5">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 scale-125' 
                  : index < currentStep 
                    ? 'bg-blue-300' 
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
} 