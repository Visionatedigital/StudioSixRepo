"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const steps = [
  "Project Details",
  "Room Requirements",
  "Design Preferences",
  "Generate & Edit"
];

export default function FloorPlanAIPage() {
  const [step, setStep] = useState(0);

  return (
    <DashboardLayout currentPage="AI Tools">
      <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 flex flex-col items-center py-10">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">AI Floor Plan Generator</h1>
          <p className="text-gray-600 mb-6">
            Generate, edit, and optimize floor plans with AI. Enter your requirements to get started.
          </p>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {steps.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${idx === step ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'}`}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-8 h-1 bg-purple-200 mx-2 rounded" />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div>
            {step === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Project & Site Details</h2>
                {/* Add form fields for project name, plot size, orientation, site plan upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Family Home" />
                </div>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot Width (m)</label>
                    <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="e.g. 12" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot Length (m)</label>
                    <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="e.g. 15" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option>North</option>
                    <option>East</option>
                    <option>South</option>
                    <option>West</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Site Plan (optional)</label>
                  <input type="file" className="w-full" />
                </div>
                <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
                  onClick={() => setStep(1)}>
                  Next
                </button>
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Room & Space Requirements</h2>
                {/* Add dynamic room list builder */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 3 Bedrooms, 1 Kitchen, 2 Bathrooms" />
                </div>
                <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
                  onClick={() => setStep(2)}>
                  Next
                </button>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Design Preferences</h2>
                {/* Add style, optimization, accessibility, budget fields */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Style</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option>Open-plan</option>
                    <option>Traditional</option>
                    <option>Minimal</option>
                    <option>Modern Apartment</option>
                    <option>Office/Co-working</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Optimization Goals</label>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm cursor-pointer">Sunlight</span>
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm cursor-pointer">Privacy</span>
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm cursor-pointer">Noise</span>
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 text-sm cursor-pointer">Flow</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Preferences</label>
                  <textarea className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Wheelchair accessible, budget range, etc." />
                </div>
                <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
                  onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Generate & Edit</h2>
                {/* Show loading, then generated plan options, then allow editing */}
                <div className="mb-4 text-center text-gray-500">
                  <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mr-2"></span>
                  Generating floor plan options with AI...
                </div>
                {/* Placeholder for generated plans and editing tools */}
                <div className="mb-4 h-40 bg-purple-50 rounded-lg flex items-center justify-center text-purple-400">
                  [Generated floor plan options will appear here]
                </div>
                <button className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
                  onClick={() => setStep(0)}>
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 