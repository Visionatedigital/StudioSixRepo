"use client";

import React, { useState, useEffect } from 'react';
import { FLOOR_PLAN_OBJECTS, FloorPlanObject, getObjectsByRoomType } from '@/lib/floorPlanObjects';

interface BubbleZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  roomType: string;
  label?: string;
  confidence: number;
}

interface PlacedObject {
  id: string;
  objectId: string;
  x: number;
  y: number;
  rotation: number;
  roomId: string;
  metadata: {
    placementReason: string;
    confidence: number;
    alternatives?: string[];
  };
}

interface AIObjectPlacementProps {
  bubbles: Array<{ x: number; y: number; width: number; height: number; label?: string }>;
  onLayoutGenerated: (layout: {
    rooms: BubbleZone[];
    placedObjects: PlacedObject[];
    totalArea: number;
    efficiency: number;
    recommendations: string[];
  }) => void;
}

export default function AIObjectPlacement({ bubbles, onLayoutGenerated }: AIObjectPlacementProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // AI-powered room type classification
  const classifyRoomFromBubble = (
    bubble: { x: number; y: number; width: number; height: number; label?: string },
    totalArea: number
  ): { roomType: string; confidence: number } => {
    const area = bubble.width * bubble.height;
    const relativeSize = area / totalArea;
    
    let roomType = 'living-room';
    let confidence = 0.7;
    
    // Size-based classification
    if (relativeSize > 0.3) {
      roomType = 'living-room';
      confidence = 0.9;
    } else if (relativeSize > 0.15) {
      roomType = 'bedroom';
      confidence = 0.8;
    } else if (relativeSize > 0.1) {
      roomType = 'kitchen';
      confidence = 0.7;
    } else if (relativeSize < 0.05) {
      roomType = 'bathroom';
      confidence = 0.8;
    }
    
    // Label-based override
    if (bubble.label) {
      const label = bubble.label.toLowerCase();
      if (label.includes('bed') || label.includes('sleep')) {
        roomType = 'bedroom';
        confidence = 0.95;
      } else if (label.includes('kitchen') || label.includes('cook')) {
        roomType = 'kitchen';
        confidence = 0.95;
      } else if (label.includes('bath') || label.includes('toilet')) {
        roomType = 'bathroom';
        confidence = 0.95;
      } else if (label.includes('living') || label.includes('sitting')) {
        roomType = 'living-room';
        confidence = 0.95;
      } else if (label.includes('dining') || label.includes('eat')) {
        roomType = 'dining-room';
        confidence = 0.95;
      }
    }
    
    return { roomType, confidence };
  };

  // AI-powered object selection for each room
  const selectObjectsForRoom = (room: BubbleZone): FloorPlanObject[] => {
    const roomArea = room.width * room.height;
    const roomObjects = getObjectsByRoomType(room.roomType);
    
    // Filter objects that fit in the room
    const fittingObjects = roomObjects.filter(obj => {
      const objArea = obj.width * obj.height;
      const clearanceArea = (obj.placementRules.clearanceRequired.front + obj.placementRules.clearanceRequired.back) * 
                           (obj.width + obj.placementRules.clearanceRequired.sides * 2);
      return objArea + clearanceArea <= roomArea * 0.7; // Leave 30% for circulation
    });
    
    // Prioritize essential objects based on room type
    const essentialObjects: FloorPlanObject[] = [];
    
    switch (room.roomType) {
      case 'bedroom':
        const beds = fittingObjects.filter(obj => obj.tags.includes('bed'));
        const wardrobes = fittingObjects.filter(obj => obj.tags.includes('wardrobe'));
        if (beds.length > 0) essentialObjects.push(beds[0]);
        if (wardrobes.length > 0) essentialObjects.push(wardrobes[0]);
        break;
        
      case 'kitchen':
        const sinks = fittingObjects.filter(obj => obj.tags.includes('sink'));
        const refrigerators = fittingObjects.filter(obj => obj.tags.includes('refrigerator'));
        if (sinks.length > 0) essentialObjects.push(sinks[0]);
        if (refrigerators.length > 0) essentialObjects.push(refrigerators[0]);
        break;
        
      case 'bathroom':
        const toilets = fittingObjects.filter(obj => obj.tags.includes('toilet'));
        const bathroomSinks = fittingObjects.filter(obj => obj.tags.includes('sink') && obj.subcategory === 'bathroom');
        if (toilets.length > 0) essentialObjects.push(toilets[0]);
        if (bathroomSinks.length > 0) essentialObjects.push(bathroomSinks[0]);
        break;
        
      case 'living-room':
        const sofas = fittingObjects.filter(obj => obj.tags.includes('sofa'));
        const coffeeTables = fittingObjects.filter(obj => obj.tags.includes('coffee-table'));
        if (sofas.length > 0) essentialObjects.push(sofas[0]);
        if (coffeeTables.length > 0) essentialObjects.push(coffeeTables[0]);
        break;
        
      case 'dining-room':
        const diningTables = fittingObjects.filter(obj => obj.tags.includes('dining'));
        const diningChairs = fittingObjects.filter(obj => obj.tags.includes('dining') && obj.tags.includes('chair'));
        if (diningTables.length > 0) essentialObjects.push(diningTables[0]);
        if (diningChairs.length > 0) essentialObjects.push(diningChairs[0]);
        break;
    }
    
    // Add additional objects based on available space
    const remainingObjects = fittingObjects.filter(obj => 
      !essentialObjects.some(essential => essential.id === obj.id)
    );
    
    // Sort by priority
    const priorityOrder = ['bed', 'sofa', 'table', 'wardrobe', 'chair', 'storage'];
    remainingObjects.sort((a, b) => {
      const aPriority = priorityOrder.findIndex(tag => a.tags.includes(tag));
      const bPriority = priorityOrder.findIndex(tag => b.tags.includes(tag));
      return aPriority - bPriority;
    });
    
    return [...essentialObjects, ...remainingObjects.slice(0, 3)];
  };

  // Simple placement algorithm
  const placeObjectsInRoom = (room: BubbleZone, objects: FloorPlanObject[]): PlacedObject[] => {
    const placedObjects: PlacedObject[] = [];
    let currentX = room.x + 0.5; // Start with some margin
    let currentY = room.y + 0.5;
    
    for (const object of objects) {
      // Simple placement logic - can be enhanced
      if (currentX + object.width > room.x + room.width) {
        currentX = room.x + 0.5;
        currentY += object.height + 0.3;
      }
      
      if (currentY + object.height <= room.y + room.height) {
        placedObjects.push({
          id: `${room.id}-${object.id}-${Date.now()}`,
          objectId: object.id,
          x: currentX,
          y: currentY,
          rotation: 0,
          roomId: room.id,
          metadata: {
            placementReason: `Essential ${object.category} for ${room.roomType}`,
            confidence: 0.8,
            alternatives: []
          }
        });
        
        currentX += object.width + 0.2;
      }
    }
    
    return placedObjects;
  };

  // Generate recommendations
  const generateRecommendations = (rooms: BubbleZone[], efficiency: number): string[] => {
    const recommendations: string[] = [];
    
    if (efficiency < 0.4) {
      recommendations.push("Consider adding more furniture to better utilize the space");
    } else if (efficiency > 0.8) {
      recommendations.push("The layout is quite dense. Consider removing some items for better circulation");
    }
    
    const roomTypes = rooms.map(r => r.roomType);
    
    if (!roomTypes.includes('bathroom')) {
      recommendations.push("Consider adding a bathroom for better functionality");
    }
    
    if (!roomTypes.includes('kitchen')) {
      recommendations.push("A kitchen area would improve the layout's functionality");
    }
    
    if (rooms.length > 2) {
      recommendations.push("Ensure there's clear circulation between rooms");
    }
    
    return recommendations;
  };

  // Main generation function
  const generateLayout = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Step 1: Calculate total area
      setCurrentStep('Calculating total area...');
      setProgress(10);
      const totalArea = bubbles.reduce((sum, bubble) => sum + bubble.width * bubble.height, 0);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Classify rooms
      setCurrentStep('Classifying room types...');
      setProgress(30);
      const rooms: BubbleZone[] = bubbles.map((bubble, index) => {
        const classification = classifyRoomFromBubble(bubble, totalArea);
        return {
          id: `room-${index}`,
          x: bubble.x,
          y: bubble.y,
          width: bubble.width,
          height: bubble.height,
          roomType: classification.roomType,
          label: bubble.label,
          confidence: classification.confidence
        };
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Select objects for each room
      setCurrentStep('Selecting furniture and fixtures...');
      setProgress(50);
      const allPlacedObjects: PlacedObject[] = [];
      
      for (const room of rooms) {
        const objects = selectObjectsForRoom(room);
        const placedObjects = placeObjectsInRoom(room, objects);
        allPlacedObjects.push(...placedObjects);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 4: Calculate efficiency
      setCurrentStep('Calculating space efficiency...');
      setProgress(70);
      const usedArea = allPlacedObjects.reduce((sum, obj) => {
        const object = FLOOR_PLAN_OBJECTS.find(o => o.id === obj.objectId);
        return sum + (object ? object.width * object.height : 0);
      }, 0);
      const efficiency = usedArea / totalArea;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 5: Generate recommendations
      setCurrentStep('Generating recommendations...');
      setProgress(90);
      const recommendations = generateRecommendations(rooms, efficiency);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 6: Complete
      setCurrentStep('Layout generation complete!');
      setProgress(100);
      
      // Return the generated layout
      onLayoutGenerated({
        rooms,
        placedObjects: allPlacedObjects,
        totalArea,
        efficiency,
        recommendations
      });
      
    } catch (error) {
      console.error('Error generating layout:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Object Placement</h3>
      
      {isGenerating ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{currentStep}</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            AI is analyzing your bubble diagram and placing furniture optimally...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Click the button below to generate a detailed floor plan with furniture placement based on your bubble diagram.
          </p>
          
          <button
            onClick={generateLayout}
            disabled={bubbles.length === 0}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {bubbles.length === 0 ? 'No bubbles to process' : 'Generate AI Floor Plan'}
          </button>
          
          {bubbles.length > 0 && (
            <div className="text-xs text-gray-500">
              Found {bubbles.length} room(s) in your bubble diagram
            </div>
          )}
        </div>
      )}
    </div>
  );
} 