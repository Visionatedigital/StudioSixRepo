'use client';

import React from 'react';

const TemplateMockup = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Concept Development Template Mockup</h1>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Container */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Project Input</h2>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Save Input
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Project Brief</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter your project brief or requirements..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Files</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="space-y-2">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload files</span>
                          <input type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, images, or other documents up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tools and Output */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tools Container */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Design Tools</h2>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Analysis Tools */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 text-sm">Analysis</h3>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">📋</span>
                    <span>Brief Summary</span>
                  </button>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">📐</span>
                    <span>Floor Plan Analysis</span>
                  </button>
                </div>

                {/* Visualization Tools */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 text-sm">Visualization</h3>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">🔵</span>
                    <span>Bubble Diagram</span>
                  </button>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">✏️</span>
                    <span>Generate Sketch</span>
                  </button>
                </div>

                {/* Research Tools */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700 text-sm">Research</h3>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">📚</span>
                    <span>Case Studies</span>
                  </button>
                  <button className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm">
                    <span className="text-blue-500">🔍</span>
                    <span>Precedents</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Output Container */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Generated Output</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[400px]">
                <p className="text-gray-500 text-center">Generated content will appear here</p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Brief Summary</h4>
                      <button className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      This is an example of generated content. Users can drag this out of the container to place it on the canvas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMockup; 