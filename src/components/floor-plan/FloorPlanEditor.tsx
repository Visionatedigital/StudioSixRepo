"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FloorPlanObject } from '@/lib/floorPlanObjects';
import ObjectLibrary from './ObjectLibrary';

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

interface FloorPlanEditorProps {
  initialBubbles?: Array<{ x: number; y: number; width: number; height: number; label?: string }>;
}

export default function FloorPlanEditor({ initialBubbles = [] }: FloorPlanEditorProps) {
  const [bubbles, setBubbles] = useState(initialBubbles);
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<'bubble' | 'object' | 'select'>('bubble');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('bedroom');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentBubble, setCurrentBubble] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showObjectLibrary, setShowObjectLibrary] = useState(false);
  const [selectedObject, setSelectedObject] = useState<FloorPlanObject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [layout, setLayout] = useState<{
    rooms: BubbleZone[];
    placedObjects: PlacedObject[];
    totalArea: number;
    efficiency: number;
    recommendations: string[];
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const roomTypes = [
    { id: 'bedroom', name: 'Bedroom', color: '#3B82F6' },
    { id: 'living-room', name: 'Living Room', color: '#10B981' },
    { id: 'kitchen', name: 'Kitchen', color: '#F59E0B' },
    { id: 'bathroom', name: 'Bathroom', color: '#8B5CF6' },
    { id: 'dining-room', name: 'Dining Room', color: '#EF4444' },
    { id: 'study', name: 'Study', color: '#6B7280' },
    { id: 'garage', name: 'Garage', color: '#374151' }
  ];

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw bubbles
    bubbles.forEach((bubble, index) => {
      const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
      drawBubble(ctx, bubble, roomType?.color || '#3B82F6', bubble.label || `Room ${index + 1}`);
    });

    // Draw current bubble being drawn
    if (currentBubble) {
      const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
      ctx.strokeStyle = roomType?.color || '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBubble.x, currentBubble.y, currentBubble.width, currentBubble.height);
      ctx.setLineDash([]);
    }

    // Draw placed objects
    placedObjects.forEach(obj => {
      drawPlacedObject(ctx, obj);
    });

  }, [bubbles, currentBubble, placedObjects, selectedRoomType]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawBubble = (ctx: CanvasRenderingContext2D, bubble: any, color: string, label: string) => {
    // Draw bubble
    ctx.fillStyle = color + '20'; // Add transparency
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, 8);
    ctx.fill();
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#374151';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, bubble.x + bubble.width / 2, bubble.y + bubble.height / 2 + 5);
  };

  const drawPlacedObject = (ctx: CanvasRenderingContext2D, obj: PlacedObject) => {
    // This would draw the actual object based on its SVG path
    // For now, draw a simple rectangle
    ctx.fillStyle = '#6B7280';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.fillRect(obj.x, obj.y, 30, 30); // Placeholder size
    ctx.strokeRect(obj.x, obj.y, 30, 30);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool !== 'bubble') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentBubble({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || selectedTool !== 'bubble') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentBubble({
      x: Math.min(drawStart.x, x),
      y: Math.min(drawStart.y, y),
      width: Math.abs(x - drawStart.x),
      height: Math.abs(y - drawStart.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBubble) return;

    // Only add bubble if it has minimum size
    if (currentBubble.width > 20 && currentBubble.height > 20) {
      const newBubble = {
        ...currentBubble,
        label: `${roomTypes.find(rt => rt.id === selectedRoomType)?.name} ${bubbles.length + 1}`
      };
      setBubbles([...bubbles, newBubble]);
    }

    setIsDrawing(false);
    setCurrentBubble(null);
  };

  const handleObjectSelect = (object: FloorPlanObject) => {
    setSelectedObject(object);
    setShowObjectLibrary(false);
  };

  const handleObjectPlace = (e: React.MouseEvent) => {
    if (!selectedObject) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPlacedObject: PlacedObject = {
      id: `obj-${Date.now()}`,
      objectId: selectedObject.id,
      x,
      y,
      rotation: 0,
      roomId: 'temp', // Would be determined by which room it's placed in
      metadata: {
        placementReason: 'Manually placed',
        confidence: 1.0,
        alternatives: []
      }
    };

    setPlacedObjects([...placedObjects, newPlacedObject]);
    setSelectedObject(null);
  };

  const generateAILayout = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated layout
    const mockLayout = {
      rooms: bubbles.map((bubble, index) => ({
        id: `room-${index}`,
        x: bubble.x,
        y: bubble.y,
        width: bubble.width,
        height: bubble.height,
        roomType: selectedRoomType,
        label: bubble.label,
        confidence: 0.8
      })),
      placedObjects: [],
      totalArea: bubbles.reduce((sum, bubble) => sum + bubble.width * bubble.height, 0),
      efficiency: 0.7,
      recommendations: [
        "Consider adding more furniture to better utilize the space",
        "Ensure there's clear circulation between rooms"
      ]
    };
    
    setLayout(mockLayout);
    setIsGenerating(false);
  };

  const clearCanvas = () => {
    setBubbles([]);
    setPlacedObjects([]);
    setLayout(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Floor Plan Editor</h2>
        
        {/* Tools */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tools</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedTool('bubble')}
              className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                selectedTool === 'bubble' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              🟢 Draw Bubbles
            </button>
            <button
              onClick={() => setSelectedTool('object')}
              className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                selectedTool === 'object' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              📦 Place Objects
            </button>
            <button
              onClick={() => setSelectedTool('select')}
              className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                selectedTool === 'select' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              👆 Select
            </button>
          </div>
        </div>

        {/* Room Type Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Room Type</h3>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {roomTypes.map(roomType => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name}
              </option>
            ))}
          </select>
        </div>

        {/* Object Library Toggle */}
        <div>
          <button
            onClick={() => setShowObjectLibrary(!showObjectLibrary)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📚 Object Library
          </button>
        </div>

        {/* AI Generation */}
        <div>
          <button
            onClick={generateAILayout}
            disabled={bubbles.length === 0 || isGenerating}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? '🤖 Generating...' : '🤖 Generate AI Layout'}
          </button>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={clearCanvas}
            className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️ Clear All
          </button>
        </div>

        {/* Statistics */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Statistics</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Bubbles: {bubbles.length}</div>
            <div>Objects: {placedObjects.length}</div>
            {layout && (
              <>
                <div>Efficiency: {(layout.efficiency * 100).toFixed(1)}%</div>
                <div>Total Area: {layout.totalArea.toFixed(1)} m²</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas */}
        <div 
          ref={containerRef}
          className="flex-1 relative bg-white"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={selectedTool === 'object' ? handleObjectPlace : undefined}
          />
          
          {/* Instructions Overlay */}
          {bubbles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-4">🏠</div>
                <p className="text-lg font-medium">Start by drawing room bubbles</p>
                <p className="text-sm">Select a room type and drag to create bubbles</p>
              </div>
            </div>
          )}
        </div>

        {/* Object Library Panel */}
        {showObjectLibrary && (
          <div className="h-96 border-t border-gray-200">
            <ObjectLibrary
              onObjectSelect={handleObjectSelect}
              selectedRoomType={selectedRoomType}
            />
          </div>
        )}

        {/* AI Recommendations */}
        {layout && layout.recommendations.length > 0 && (
          <div className="h-32 border-t border-gray-200 bg-blue-50 p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">🤖 AI Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {layout.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 