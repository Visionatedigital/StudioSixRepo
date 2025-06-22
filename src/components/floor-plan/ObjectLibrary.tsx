"use client";

import React, { useState } from 'react';
import { FLOOR_PLAN_OBJECTS, FloorPlanObject, getObjectsByCategory, getObjectsByRoomType } from '@/lib/floorPlanObjects';

interface ObjectLibraryProps {
  onObjectSelect: (object: FloorPlanObject) => void;
  selectedRoomType?: string;
}

export default function ObjectLibrary({ onObjectSelect, selectedRoomType }: ObjectLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<FloorPlanObject['category']>('furniture');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'furniture', name: 'Furniture', icon: '🪑' },
    { id: 'fixtures', name: 'Fixtures', icon: '🚿' },
    { id: 'appliances', name: 'Appliances', icon: '🔌' },
    { id: 'doors', name: 'Doors', icon: '🚪' },
    { id: 'windows', name: 'Windows', icon: '🪟' },
    { id: 'structural', name: 'Structural', icon: '🏗️' },
    { id: 'decorative', name: 'Decorative', icon: '🎨' }
  ];

  // Filter objects based on category, room type, and search term
  const getFilteredObjects = () => {
    let objects = FLOOR_PLAN_OBJECTS;

    // Filter by category
    if (selectedCategory) {
      objects = getObjectsByCategory(selectedCategory);
    }

    // Filter by room type if specified
    if (selectedRoomType) {
      objects = objects.filter(obj => 
        obj.placementRules.typicalRoomTypes.includes(selectedRoomType)
      );
    }

    // Filter by search term
    if (searchTerm) {
      objects = objects.filter(obj =>
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return objects;
  };

  const filteredObjects = getFilteredObjects();

  const handleObjectClick = (object: FloorPlanObject) => {
    onObjectSelect(object);
  };

  const handleDragStart = (e: React.DragEvent, object: FloorPlanObject) => {
    e.dataTransfer.setData('application/json', JSON.stringify(object));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Object Library</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as FloorPlanObject['category'])}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Room Type Filter */}
      {selectedRoomType && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filtering for:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
              {selectedRoomType.replace('-', ' ')}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Objects Grid/List */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'} max-h-96 overflow-y-auto`}>
        {filteredObjects.map((object) => (
          <div
            key={object.id}
            draggable
            onDragStart={(e) => handleDragStart(e, object)}
            onClick={() => handleObjectClick(object)}
            className={`
              ${viewMode === 'grid' 
                ? 'p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors' 
                : 'p-2 border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors flex items-center space-x-3'
              }
            `}
          >
            {/* Object Preview */}
            <div className={`${viewMode === 'grid' ? 'w-full h-16' : 'w-12 h-12'} bg-gray-100 rounded flex items-center justify-center`}>
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Object Info */}
            <div className={`${viewMode === 'grid' ? 'mt-2' : 'flex-1'}`}>
              <h4 className="font-medium text-gray-900 text-sm">{object.name}</h4>
              <p className="text-xs text-gray-500">
                {object.width}m × {object.height}m
              </p>
              {viewMode === 'list' && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {object.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Drag Handle */}
            {viewMode === 'list' && (
              <div className="text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 11.001 4.001A2 2 0 017 2zm0 6a2 2 0 11.001 4.001A2 2 0 017 8zm0 6a2 2 0 11.001 4.001A2 2 0 017 14zm6-8a2 2 0 11-.001-4.001A2 2 0 0113 6zm0 2a2 2 0 11.001 4.001A2 2 0 0113 8zm0 6a2 2 0 11.001 4.001A2 2 0 0113 14z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredObjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">No objects found matching your criteria</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Object Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {filteredObjects.length} object{filteredObjects.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
} 