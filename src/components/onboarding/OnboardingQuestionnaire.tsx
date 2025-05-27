"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  BuildingLibraryIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const roleOptions = [
  { label: 'Architect', icon: BuildingLibraryIcon },
  { label: 'Interior Designer', icon: BuildingOffice2Icon },
  { label: 'Student', icon: AcademicCapIcon },
  { label: 'Urban Planner', icon: UserGroupIcon },
  { label: 'Project Manager', icon: ClipboardDocumentCheckIcon },
  { label: 'Contractor / Builder', icon: WrenchScrewdriverIcon },
  { label: 'Other', icon: QuestionMarkCircleIcon },
];

const useCaseOptions = [
  'Client Presentations',
  'School Assignments',
  'Inspiration',
  'Portfolio',
  'Collaboration',
  'Other'
];

const styleOptions = [
  'Photorealistic',
  'Conceptual',
  'Artistic',
  'Minimal',
  'Other'
];

const experienceOptions = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional'
];

const tipsOptions = [
  'Yes',
  'No'
];

const steps = [
  {
    label: 'Your Role',
    description: 'What best describes you?',
    options: roleOptions,
    type: 'role',
  },
  {
    label: 'Main Use Case',
    description: 'What will you use StudioSix for?',
    options: useCaseOptions,
    type: 'useCase',
  },
  {
    label: 'Preferred Style',
    description: 'What style do you prefer?',
    options: styleOptions,
    type: 'style',
  },
  {
    label: 'Experience Level',
    description: 'What is your design experience?',
    options: experienceOptions,
    type: 'experience',
  },
  {
    label: 'Tips Preference',
    description: 'Would you like to receive tips and guidance?',
    options: tipsOptions,
    type: 'tips',
  },
];

export default function OnboardingQuestionnaire() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [steps[step].type]: option }));
  };

  const handleNext = async () => {
    if (step === steps.length - 1) {
      setIsSubmitting(true);
      toast.loading('Saving your preferences...', { id: 'onboarding' });
      try {
        const prefsRes = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...answers, userId: session?.user?.id }),
        });
        if (!prefsRes.ok) throw new Error('Failed to save preferences');
        const onboardRes = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user?.id }),
        });
        if (!onboardRes.ok) throw new Error('Failed to update onboarding status');
        toast.success('Onboarding complete!', { id: 'onboarding' });
        router.push('/dashboard');
      } catch (err) {
        toast.error('Something went wrong. Please try again.', { id: 'onboarding' });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-2">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Progress Bar & Stepper */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#844BDC] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-sm font-bold transition-colors
                  ${idx < step ? 'border-[#844BDC] bg-[#844BDC] text-white' : idx === step ? 'border-[#844BDC] bg-white text-[#844BDC]' : 'border-gray-300 bg-white text-gray-400'}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#1B1464] text-center mb-2">
          {steps[step].description}
        </h1>
        <p className="text-gray-500 text-center mb-8 text-base md:text-lg">
          {steps[step].label}
        </p>

        {/* Options */}
        <div className={`w-full ${step === 0 ? 'grid grid-cols-2 gap-4' : 'flex flex-col gap-4'} mb-8`}>
          {steps[step].options.map((option: any, idx: number) => {
            const selected = answers[steps[step].type] === (option.label || option);
            if (step === 0) {
              // Icon buttons for role
              const Icon = option.icon;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleSelect(option.label)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#844BDC] focus:border-[#844BDC] bg-white
                    ${selected ? 'border-[#844BDC] bg-[#F6F0FF] shadow-md' : 'border-gray-200 hover:border-[#AC4FF1] hover:bg-[#F6F8FA]'}
                  `}
                  disabled={isSubmitting}
                >
                  <Icon className={`w-8 h-8 mb-2 ${selected ? 'text-[#844BDC]' : 'text-gray-400'}`} />
                  <span className="font-medium text-[#202126] text-base mb-1">{option.label}</span>
                </button>
              );
            } else {
              // Full-width selectable cards
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left p-5 rounded-xl border transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#844BDC] focus:border-[#844BDC] bg-white
                    ${selected ? 'border-[#844BDC] bg-[#F6F0FF] shadow-md' : 'border-gray-200 hover:border-[#AC4FF1] hover:bg-[#F6F8FA]'}
                  `}
                  disabled={isSubmitting}
                >
                  <span className="font-medium text-[#202126] text-base mb-1">{option}</span>
                </button>
              );
            }
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full flex justify-between items-center mt-2">
          <button
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
          >
            Back
          </button>
          <button
            className="px-8 py-2 rounded-lg bg-[#844BDC] text-white font-semibold hover:bg-[#6B2FCF] transition-colors disabled:opacity-50"
            onClick={handleNext}
            disabled={!answers[steps[step].type] || isSubmitting}
          >
            {step === steps.length - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
} 