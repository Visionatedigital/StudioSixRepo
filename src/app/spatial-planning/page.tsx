'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FLOOR_PLAN_OBJECTS, FloorPlanObject, getObjectsByRoomType } from '@/lib/floorPlanObjects';

export default function SpatialPlanningPage() {
  const [roomType, setRoomType] = useState('Bedroom');
  const [roomWidth, setRoomWidth] = useState(4.5);
  const [roomLength, setRoomLength] = useState(3.8);
  const [hasWindows, setHasWindows] = useState(true);
  const [hasDoor, setHasDoor] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1.2); // meters
  const [doorWidth, setDoorWidth] = useState(0.8); // meters
  const [selectedTool, setSelectedTool] = useState('sleeping'); // current drawing tool
  const [windowWall, setWindowWall] = useState('top'); // top, bottom, left, right
  const [doorWall, setDoorWall] = useState('bottom'); // top, bottom, left, right

  // New state for AI-assisted placement
  const [bubbles, setBubbles] = useState<Array<{ x: number; y: number; width: number; height: number; label?: string }>>([]);
  const [placedObjects, setPlacedObjects] = useState<Array<{ id: string; objectId: string; x: number; y: number; roomId: string }>>([]);
  const [showObjectLibrary, setShowObjectLibrary] = useState(false);
  const [selectedObject, setSelectedObject] = useState<FloorPlanObject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiLayout, setAiLayout] = useState<{
    rooms: Array<{ id: string; roomType: string; confidence: number }>;
    placedObjects: Array<{ id: string; objectId: string; x: number; y: number; roomId: string }>;
    efficiency: number;
    recommendations: string[];
  } | null>(null);

  // Calculate room dimensions for canvas (scale to fit canvas while maintaining aspect ratio)
  const canvasWidth = 800;
  const canvasHeight = 500;
  const padding = 40; // Padding from canvas edges
  
  const maxRoomWidth = canvasWidth - (padding * 2);
  const maxRoomHeight = canvasHeight - (padding * 2);
  
  // Scale room to fit canvas while maintaining aspect ratio
  const scaleX = maxRoomWidth / Math.max(roomWidth, roomLength);
  const scaleY = maxRoomHeight / Math.max(roomWidth, roomLength);
  const scale = Math.min(scaleX, scaleY);
  
  const displayWidth = roomWidth * scale;
  const displayHeight = roomLength * scale;
  
  // Center the room in canvas
  const roomX = (canvasWidth - displayWidth) / 2;
  const roomY = (canvasHeight - displayHeight) / 2;

  // AI-powered room classification from bubble sketches
  const classifyRoomFromBubble = (bubble: { x: number; y: number; width: number; height: number; label?: string }) => {
    const area = bubble.width * bubble.height;
    const totalArea = bubbles.reduce((sum, b) => sum + b.width * b.height, 0);
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
      }
    }
    
    return { roomType, confidence };
  };

  // AI-powered object selection for each room
  const selectObjectsForRoom = (roomType: string) => {
    const roomObjects = getObjectsByRoomType(roomType);
    
    // Prioritize essential objects based on room type
    const essentialObjects: FloorPlanObject[] = [];
    
    switch (roomType) {
      case 'bedroom':
        const beds = roomObjects.filter(obj => obj.tags.includes('bed'));
        const wardrobes = roomObjects.filter(obj => obj.tags.includes('wardrobe'));
        if (beds.length > 0) essentialObjects.push(beds[0]);
        if (wardrobes.length > 0) essentialObjects.push(wardrobes[0]);
        break;
        
      case 'kitchen':
        const sinks = roomObjects.filter(obj => obj.tags.includes('sink'));
        const refrigerators = roomObjects.filter(obj => obj.tags.includes('refrigerator'));
        if (sinks.length > 0) essentialObjects.push(sinks[0]);
        if (refrigerators.length > 0) essentialObjects.push(refrigerators[0]);
        break;
        
      case 'bathroom':
        const toilets = roomObjects.filter(obj => obj.tags.includes('toilet'));
        const bathroomSinks = roomObjects.filter(obj => obj.tags.includes('sink') && obj.subcategory === 'bathroom');
        if (toilets.length > 0) essentialObjects.push(toilets[0]);
        if (bathroomSinks.length > 0) essentialObjects.push(bathroomSinks[0]);
        break;
        
      case 'living-room':
        const sofas = roomObjects.filter(obj => obj.tags.includes('sofa'));
        const coffeeTables = roomObjects.filter(obj => obj.tags.includes('coffee-table'));
        if (sofas.length > 0) essentialObjects.push(sofas[0]);
        if (coffeeTables.length > 0) essentialObjects.push(coffeeTables[0]);
        break;
    }
    
    return essentialObjects;
  };

  // Generate AI layout from bubbles
  const generateAILayout = async () => {
    if (bubbles.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Classify rooms and select objects
    const rooms = bubbles.map((bubble, index) => {
      const classification = classifyRoomFromBubble(bubble);
      return {
        id: `room-${index}`,
        roomType: classification.roomType,
        confidence: classification.confidence
      };
    });
    
    // Place objects for each room
    const allPlacedObjects: Array<{ id: string; objectId: string; x: number; y: number; roomId: string }> = [];
    
    rooms.forEach((room, roomIndex) => {
      const objects = selectObjectsForRoom(room.roomType);
      objects.forEach((object, objIndex) => {
        allPlacedObjects.push({
          id: `obj-${roomIndex}-${objIndex}`,
          objectId: object.id,
          x: bubbles[roomIndex].x + 50 + (objIndex * 60), // Simple placement
          y: bubbles[roomIndex].y + 50,
          roomId: room.id
        });
      });
    });
    
    // Calculate efficiency
    const totalArea = bubbles.reduce((sum, bubble) => sum + bubble.width * bubble.height, 0);
    const usedArea = allPlacedObjects.reduce((sum, obj) => {
      const object = FLOOR_PLAN_OBJECTS.find(o => o.id === obj.objectId);
      return sum + (object ? object.width * object.height : 0);
    }, 0);
    const efficiency = usedArea / totalArea;
    
    // Generate recommendations
    const recommendations = [];
    if (efficiency < 0.4) {
      recommendations.push("Consider adding more furniture to better utilize the space");
    }
    if (!rooms.some(r => r.roomType === 'bathroom')) {
      recommendations.push("Consider adding a bathroom for better functionality");
    }
    if (!rooms.some(r => r.roomType === 'kitchen')) {
      recommendations.push("A kitchen area would improve the layout's functionality");
    }
    
    setAiLayout({
      rooms,
      placedObjects: allPlacedObjects,
      efficiency,
      recommendations
    });
    
    setIsGenerating(false);
  };

  // Draw room boundary on canvas
  useEffect(() => {
    const canvas = document.getElementById('sketch-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear and redraw room boundary
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw room outline (skip walls where doors are placed)
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Top wall (skip if door is on top wall)
        if (!hasDoor || doorWall !== 'top') {
          ctx.beginPath();
          ctx.moveTo(roomX, roomY);
          ctx.lineTo(roomX + displayWidth, roomY);
          ctx.stroke();
        }
        
        // Left wall (skip if door is on left wall)
        if (!hasDoor || doorWall !== 'left') {
          ctx.beginPath();
          ctx.moveTo(roomX, roomY);
          ctx.lineTo(roomX, roomY + displayHeight);
          ctx.stroke();
        }
        
        // Right wall (skip if door is on right wall)
        if (!hasDoor || doorWall !== 'right') {
          ctx.beginPath();
          ctx.moveTo(roomX + displayWidth, roomY);
          ctx.lineTo(roomX + displayWidth, roomY + displayHeight);
          ctx.stroke();
        }
        
        // Bottom wall (skip if door is on bottom wall)
        if (!hasDoor || doorWall !== 'bottom') {
          ctx.beginPath();
          ctx.moveTo(roomX, roomY + displayHeight);
          ctx.lineTo(roomX + displayWidth, roomY + displayHeight);
          ctx.stroke();
        }
        
        // Draw room dimensions labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.setLineDash([]);
        
        // Width label (top)
        const widthText = `${roomWidth}m`;
        const widthTextWidth = ctx.measureText(widthText).width;
        ctx.fillText(widthText, roomX + (displayWidth - widthTextWidth) / 2, roomY - 8);
        
        // Height label (left)
        const heightText = `${roomLength}m`;
        ctx.save();
        ctx.translate(roomX - 20, roomY + displayHeight / 2);
        ctx.rotate(-Math.PI / 2);
        const heightTextWidth = ctx.measureText(heightText).width;
        ctx.fillText(heightText, -heightTextWidth / 2, 0);
        ctx.restore();
        
        // Room type label (center)
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Inter, sans-serif';
        const typeText = roomType;
        const typeTextWidth = ctx.measureText(typeText).width;
        ctx.fillText(typeText, roomX + (displayWidth - typeTextWidth) / 2, roomY + displayHeight / 2);
        
        // Draw door if enabled
        if (hasDoor) {
          const doorDisplayWidth = (doorWidth * scale);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          
          if (doorWall === 'bottom') {
            const doorX = roomX + (displayWidth - doorDisplayWidth) / 2;
            // Left wall segment
            ctx.beginPath();
            ctx.moveTo(roomX, roomY + displayHeight);
            ctx.lineTo(doorX, roomY + displayHeight);
            ctx.stroke();
            // Right wall segment  
            ctx.beginPath();
            ctx.moveTo(doorX + doorDisplayWidth, roomY + displayHeight);
            ctx.lineTo(roomX + displayWidth, roomY + displayHeight);
            ctx.stroke();
            
            // Door symbol
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            // Door opening line
            ctx.beginPath();
            ctx.moveTo(doorX, roomY + displayHeight);
            ctx.lineTo(doorX + doorDisplayWidth, roomY + displayHeight);
            ctx.stroke();
            // Door swing arc (90 degrees into the room)
            ctx.beginPath();
            ctx.arc(doorX + doorDisplayWidth, roomY + displayHeight, doorDisplayWidth, Math.PI, Math.PI/2, true);
            ctx.stroke();
          }
        }
        
        // Draw windows if enabled
        if (hasWindows) {
          const windowDisplayWidth = (windowWidth * scale);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 4;
          ctx.setLineDash([]);
          
          if (windowWall === 'top') {
            const windowX = roomX + displayWidth * 0.7;
            ctx.beginPath();
            ctx.moveTo(windowX, roomY);
            ctx.lineTo(windowX + windowDisplayWidth, roomY);
            ctx.stroke();
            // Window sill lines
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(windowX, roomY - 3);
            ctx.lineTo(windowX + windowDisplayWidth, roomY - 3);
            ctx.moveTo(windowX, roomY + 3);
            ctx.lineTo(windowX + windowDisplayWidth, roomY + 3);
            ctx.stroke();
          }
        }

        // Draw bubbles
        bubbles.forEach((bubble, index) => {
          ctx.fillStyle = '#3b82f6' + '20';
            ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
            ctx.beginPath();
          ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, 8);
          ctx.fill();
            ctx.stroke();
          
          // Draw bubble label
          ctx.fillStyle = '#374151';
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(bubble.label || `Bubble ${index + 1}`, bubble.x + bubble.width / 2, bubble.y + bubble.height / 2 + 4);
        });

        // Draw placed objects
        placedObjects.forEach(obj => {
          const object = FLOOR_PLAN_OBJECTS.find(o => o.id === obj.objectId);
          if (object) {
            ctx.fillStyle = '#10b981';
            ctx.strokeStyle = '#059669';
            ctx.lineWidth = 1;
            ctx.fillRect(obj.x, obj.y, object.width * scale, object.height * scale);
            ctx.strokeRect(obj.x, obj.y, object.width * scale, object.height * scale);
            
            // Draw object label
            ctx.fillStyle = '#374151';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(object.name, obj.x + (object.width * scale) / 2, obj.y + (object.height * scale) / 2 + 3);
          }
        });
      }
    }
  }, [roomType, roomWidth, roomLength, displayWidth, displayHeight, roomX, roomY, hasWindows, hasDoor, windowWidth, doorWidth, windowWall, doorWall, scale, bubbles, placedObjects]);

  // Get color for selected tool
  const getToolColor = (tool: string) => {
    const colors = {
      sleeping: '#3b82f6',    // blue
      working: '#10b981',     // green
      storage: '#f97316',     // orange
      lounging: '#8b5cf6',    // purple
      dining: '#ef4444',      // red
      circulation: '#eab308', // yellow
      freedraw: '#6366f1'     // purple-blue
    };
    return colors[tool as keyof typeof colors] || '#6366f1';
  };

  // Handle canvas click for bubble drawing
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within room bounds
    if (x >= roomX && x <= roomX + displayWidth && y >= roomY && y <= roomY + displayHeight) {
      // Create a bubble at click location
      const newBubble = {
        x: x - 25,
        y: y - 25,
        width: 50,
        height: 50,
        label: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Zone`
      };
      setBubbles([...bubbles, newBubble]);
    }
  };

  // Handle object placement
  const handleObjectPlace = (object: FloorPlanObject) => {
    setSelectedObject(object);
    setShowObjectLibrary(false);
  };

  // Place selected object on canvas
  const handleCanvasObjectClick = (e: React.MouseEvent) => {
    if (!selectedObject) return;
    
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPlacedObject = {
      id: `obj-${Date.now()}`,
      objectId: selectedObject.id,
      x,
      y,
      roomId: 'main-room'
    };
    
    setPlacedObjects([...placedObjects, newPlacedObject]);
    setSelectedObject(null);
  };

  return (
    <DashboardLayout currentPage="Spatial Planning">
      <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-2">Spatial Planning & AI Object Placement</h1>
            <p className="text-gray-600">
              Create bubble diagrams and let AI automatically place furniture and fixtures for optimal layouts.
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Configuration Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                  <select 
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option>Bedroom</option>
                    <option>Living Room</option>
                    <option>Kitchen</option>
                    <option>Bathroom</option>
                    <option>Dining Room</option>
                    <option>Study</option>
                    <option>Garage</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (m)</label>
                    <input 
                      type="number" 
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                      placeholder="4.5" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input 
                      type="number" 
                      value={roomLength}
                      onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                      placeholder="3.8" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    />
                  </div>
                                  </div>
                  
                  {/* Room Features */}
                    <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={hasWindows}
                          onChange={(e) => setHasWindows(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Windows</span>
                        {hasWindows && (
                          <div className="ml-3 flex items-center space-x-1">
                            <span className="text-xs text-gray-600">Width:</span>
                            <input
                              type="number"
                              value={windowWidth}
                              onChange={(e) => setWindowWidth(parseFloat(e.target.value) || 0)}
                              step="0.1"
                            min="0.6"
                            max="2.0"
                              className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-500">m</span>
                          </div>
                        )}
                    </label>
                        </div>
                  
                  <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={hasDoor}
                          onChange={(e) => setHasDoor(e.target.checked)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" 
                        />
                        <span className="ml-2 text-sm text-gray-700">Door</span>
                        {hasDoor && (
                          <div className="ml-3 flex items-center space-x-1">
                            <span className="text-xs text-gray-600">Width:</span>
                            <input
                              type="number"
                              value={doorWidth}
                              onChange={(e) => setDoorWidth(parseFloat(e.target.value) || 0)}
                              step="0.1"
                              min="0.6"
                              max="1.5"
                              className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="text-xs text-gray-500">m</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
            </div>

            {/* Bubble Drawing Tools */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bubble Drawing Tools</h3>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">
                  Click on the canvas to create functional zones. Each bubble represents a different activity area.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {['sleeping', 'working', 'storage', 'lounging', 'dining', 'circulation'].map((tool) => (
                <button 
                      key={tool}
                      onClick={() => setSelectedTool(tool)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedTool === tool
                          ? `border-${getToolColor(tool).replace('#', '')} bg-${getToolColor(tool).replace('#', '')}10`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: selectedTool === tool ? getToolColor(tool) : undefined,
                        backgroundColor: selectedTool === tool ? getToolColor(tool) + '10' : undefined
                      }}
                >
                      <div className="text-center">
                        <div className="text-lg mb-1">
                          {tool === 'sleeping' && '🛏️'}
                          {tool === 'working' && '💼'}
                          {tool === 'storage' && '📦'}
                          {tool === 'lounging' && '🛋️'}
                          {tool === 'dining' && '🍽️'}
                          {tool === 'circulation' && '🚶'}
                        </div>
                        <div className="text-xs font-medium capitalize">{tool}</div>
                      </div>
                </button>
                  ))}
                </div>

                {/* AI Generation */}
                <div className="pt-4 border-t border-gray-200">
                <button 
                    onClick={generateAILayout}
                    disabled={bubbles.length === 0 || isGenerating}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? '🤖 Generating AI Layout...' : '🤖 Generate AI Layout'}
                </button>
              </div>

                {/* Object Library */}
                <div>
                <button
                    onClick={() => setShowObjectLibrary(!showObjectLibrary)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📚 Object Library
            </button>
          </div>

                {/* Clear All */}
                <div>
          <button
                    onClick={() => {
                      setBubbles([]);
                      setPlacedObjects([]);
                      setAiLayout(null);
                    }}
                    className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑️ Clear All
          </button>
                </div>
                </div>
              </div>
              
            {/* Canvas */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Floor Plan Canvas</h3>
                
                <div className="relative">
                <canvas
                  id="sketch-canvas"
                    width={canvasWidth}
                    height={canvasHeight}
                    className="border border-gray-300 rounded-lg cursor-crosshair"
                    onClick={selectedObject ? handleCanvasObjectClick : handleCanvasClick}
                />
                
                {/* Helper text overlay when canvas is empty */}
                  {bubbles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-2">✏️</div>
                    <p className="text-sm">Click and drag to sketch</p>
                  </div>
                </div>
                  )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 How to use:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>1. Set your room dimensions above</li>
                    <li>2. Select a bubble tool and click on the canvas to create zones</li>
                  <li>3. Each bubble represents a functional area</li>
                    <li>4. Click "Generate AI Layout" to automatically place furniture</li>
                    <li>5. Use the Object Library to manually place specific items</li>
                </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Object Library Panel */}
          {showObjectLibrary && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Object Library</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                {FLOOR_PLAN_OBJECTS.slice(0, 24).map((object) => (
                  <button
                    key={object.id}
                    onClick={() => handleObjectPlace(object)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-2xl">
                        {object.category === 'furniture' && '🪑'}
                        {object.category === 'fixtures' && '🚿'}
                        {object.category === 'appliances' && '🔌'}
                        {object.category === 'doors' && '🚪'}
                        {object.category === 'windows' && '🪟'}
                      </span>
        </div>
                    <h4 className="font-medium text-gray-900 text-sm">{object.name}</h4>
                    <p className="text-xs text-gray-500">
                      {object.width}m × {object.height}m
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Layout Results */}
          {aiLayout && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI-Generated Layout</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Layout Statistics</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Rooms: {aiLayout.rooms.length}</div>
                    <div>Objects Placed: {aiLayout.placedObjects.length}</div>
                    <div>Space Efficiency: {(aiLayout.efficiency * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Room Classification</h4>
                  <div className="space-y-1">
                    {aiLayout.rooms.map((room, index) => (
                      <div key={room.id} className="text-sm text-gray-600">
                        Room {index + 1}: {room.roomType} ({(room.confidence * 100).toFixed(0)}% confidence)
                      </div>
                    ))}
          </div>
        </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                  <ul className="space-y-1">
                    {aiLayout.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600">• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 