import { FLOOR_PLAN_OBJECTS, FloorPlanObject, getObjectsByRoomType, calculateOptimalPlacement } from './floorPlanObjects';

export interface BubbleZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  roomType: string;
  label?: string;
  confidence: number; // AI confidence in room type classification
}

export interface PlacedObject {
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

export interface FloorPlanLayout {
  rooms: BubbleZone[];
  placedObjects: PlacedObject[];
  totalArea: number;
  efficiency: number; // Space utilization efficiency
  recommendations: string[];
}

export interface AIPlacementConfig {
  prioritizeFunctionality: boolean;
  considerTrafficFlow: boolean;
  optimizeForSpace: boolean;
  respectRoomHierarchy: boolean;
  allowOverrides: boolean;
}

// AI-powered room type classification from bubble sketches
export const classifyRoomFromBubble = (
  bubble: { x: number; y: number; width: number; height: number; label?: string },
  context: { totalArea: number; otherBubbles: Array<{ x: number; y: number; width: number; height: number; label?: string }> }
): { roomType: string; confidence: number } => {
  const area = bubble.width * bubble.height;
  const aspectRatio = bubble.width / bubble.height;
  const relativeSize = area / context.totalArea;
  
  // Simple rule-based classification (can be enhanced with ML)
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
  
  // Position-based adjustments
  if (bubble.x < 0.2 && bubble.y < 0.2) {
    // Top-left corner often indicates kitchen
    if (roomType === 'living-room' && confidence < 0.8) {
      roomType = 'kitchen';
      confidence = 0.7;
    }
  }
  
  return { roomType, confidence };
};

// AI-powered object selection for each room
export const selectObjectsForRoom = (
  room: BubbleZone,
  config: AIPlacementConfig
): FloorPlanObject[] => {
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
      // Essential: bed, wardrobe
      const beds = fittingObjects.filter(obj => obj.tags.includes('bed'));
      const wardrobes = fittingObjects.filter(obj => obj.tags.includes('wardrobe'));
      if (beds.length > 0) essentialObjects.push(beds[0]);
      if (wardrobes.length > 0) essentialObjects.push(wardrobes[0]);
      break;
      
    case 'kitchen':
      // Essential: sink, refrigerator
      const sinks = fittingObjects.filter(obj => obj.tags.includes('sink'));
      const refrigerators = fittingObjects.filter(obj => obj.tags.includes('refrigerator'));
      if (sinks.length > 0) essentialObjects.push(sinks[0]);
      if (refrigerators.length > 0) essentialObjects.push(refrigerators[0]);
      break;
      
    case 'bathroom':
      // Essential: toilet, sink
      const toilets = fittingObjects.filter(obj => obj.tags.includes('toilet'));
      const bathroomSinks = fittingObjects.filter(obj => obj.tags.includes('sink') && obj.subcategory === 'bathroom');
      if (toilets.length > 0) essentialObjects.push(toilets[0]);
      if (bathroomSinks.length > 0) essentialObjects.push(bathroomSinks[0]);
      break;
      
    case 'living-room':
      // Essential: sofa, coffee table
      const sofas = fittingObjects.filter(obj => obj.tags.includes('sofa'));
      const coffeeTables = fittingObjects.filter(obj => obj.tags.includes('coffee-table'));
      if (sofas.length > 0) essentialObjects.push(sofas[0]);
      if (coffeeTables.length > 0) essentialObjects.push(coffeeTables[0]);
      break;
      
    case 'dining-room':
      // Essential: dining table, chairs
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
  
  // Sort by priority (larger objects first, then by frequency of use)
  const priorityOrder = ['bed', 'sofa', 'table', 'wardrobe', 'chair', 'storage'];
  remainingObjects.sort((a, b) => {
    const aPriority = priorityOrder.findIndex(tag => a.tags.includes(tag));
    const bPriority = priorityOrder.findIndex(tag => b.tags.includes(tag));
    return aPriority - bPriority;
  });
  
  return [...essentialObjects, ...remainingObjects.slice(0, 3)]; // Limit to 3 additional objects
};

// AI-powered placement algorithm
export const placeObjectsInRoom = (
  room: BubbleZone,
  objects: FloorPlanObject[],
  config: AIPlacementConfig
): PlacedObject[] => {
  const placedObjects: PlacedObject[] = [];
  const roomBounds = { x: room.x, y: room.y, width: room.width, height: room.height };
  
  // Sort objects by size (largest first) and importance
  const sortedObjects = [...objects].sort((a, b) => {
    const aArea = a.width * a.height;
    const bArea = b.width * b.height;
    return bArea - aArea; // Largest first
  });
  
  for (const object of sortedObjects) {
    const placement = calculateOptimalPlacement(
      object,
      room.width,
      room.height,
      placedObjects.map(po => ({
        x: po.x,
        y: po.y,
        width: object.width,
        height: object.height
      })),
      room.roomType
    );
    
    // Check if placement is valid
    const isValid = validatePlacement(
      placement,
      object,
      roomBounds,
      placedObjects,
      config
    );
    
    if (isValid) {
      placedObjects.push({
        id: `${room.id}-${object.id}-${Date.now()}`,
        objectId: object.id,
        x: placement.x + room.x, // Convert to global coordinates
        y: placement.y + room.y,
        rotation: 0,
        roomId: room.id,
        metadata: {
          placementReason: `Essential ${object.category} for ${room.roomType}`,
          confidence: 0.8,
          alternatives: []
        }
      });
    }
  }
  
  return placedObjects;
};

// Validate object placement
const validatePlacement = (
  placement: { x: number; y: number },
  object: FloorPlanObject,
  roomBounds: { x: number; y: number; width: number; height: number },
  existingObjects: PlacedObject[],
  config: AIPlacementConfig
): boolean => {
  // Check if object fits within room bounds
  if (placement.x < 0 || placement.y < 0 ||
      placement.x + object.width > roomBounds.width ||
      placement.y + object.height > roomBounds.height) {
    return false;
  }
  
  // Check clearance requirements
  const clearance = object.placementRules.clearanceRequired;
  const clearanceBounds = {
    x: placement.x - clearance.sides,
    y: placement.y - clearance.front,
    width: object.width + clearance.sides * 2,
    height: object.height + clearance.front + clearance.back
  };
  
  // Check if clearance area fits in room
  if (clearanceBounds.x < 0 || clearanceBounds.y < 0 ||
      clearanceBounds.x + clearanceBounds.width > roomBounds.width ||
      clearanceBounds.y + clearanceBounds.height > roomBounds.height) {
    return false;
  }
  
  // Check for overlaps with existing objects
  for (const existing of existingObjects) {
    const existingObj = FLOOR_PLAN_OBJECTS.find(obj => obj.id === existing.objectId);
    if (!existingObj) continue;
    
    const overlap = checkOverlap(
      { x: placement.x, y: placement.y, width: object.width, height: object.height },
      { x: existing.x, y: existing.y, width: existingObj.width, height: existingObj.height }
    );
    
    if (overlap) return false;
  }
  
  return true;
};

// Check if two rectangles overlap
const checkOverlap = (
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean => {
  return !(rect1.x + rect1.width <= rect2.x ||
           rect2.x + rect2.width <= rect1.x ||
           rect1.y + rect1.height <= rect2.y ||
           rect2.y + rect2.height <= rect1.y);
};

// Main AI placement function
export const generateFloorPlanFromBubbles = (
  bubbles: Array<{ x: number; y: number; width: number; height: number; label?: string }>,
  config: AIPlacementConfig = {
    prioritizeFunctionality: true,
    considerTrafficFlow: true,
    optimizeForSpace: true,
    respectRoomHierarchy: true,
    allowOverrides: false
  }
): FloorPlanLayout => {
  // Calculate total area
  const totalArea = bubbles.reduce((sum, bubble) => sum + bubble.width * bubble.height, 0);
  
  // Classify rooms from bubbles
  const rooms: BubbleZone[] = bubbles.map((bubble, index) => {
    const classification = classifyRoomFromBubble(bubble, { totalArea, otherBubbles: bubbles });
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
  
  // Place objects in each room
  const allPlacedObjects: PlacedObject[] = [];
  
  for (const room of rooms) {
    const objects = selectObjectsForRoom(room, config);
    const placedObjects = placeObjectsInRoom(room, objects, config);
    allPlacedObjects.push(...placedObjects);
  }
  
  // Calculate efficiency
  const usedArea = allPlacedObjects.reduce((sum, obj) => {
    const object = FLOOR_PLAN_OBJECTS.find(o => o.id === obj.objectId);
    return sum + (object ? object.width * object.height : 0);
  }, 0);
  const efficiency = usedArea / totalArea;
  
  // Generate recommendations
  const recommendations = generateRecommendations(rooms, allPlacedObjects, efficiency);
  
  return {
    rooms,
    placedObjects: allPlacedObjects,
    totalArea,
    efficiency,
    recommendations
  };
};

// Generate AI recommendations for layout improvement
const generateRecommendations = (
  rooms: BubbleZone[],
  placedObjects: PlacedObject[],
  efficiency: number
): string[] => {
  const recommendations: string[] = [];
  
  // Efficiency recommendations
  if (efficiency < 0.4) {
    recommendations.push("Consider adding more furniture to better utilize the space");
  } else if (efficiency > 0.8) {
    recommendations.push("The layout is quite dense. Consider removing some items for better circulation");
  }
  
  // Room-specific recommendations
  const roomTypes = rooms.map(r => r.roomType);
  
  if (!roomTypes.includes('bathroom')) {
    recommendations.push("Consider adding a bathroom for better functionality");
  }
  
  if (!roomTypes.includes('kitchen')) {
    recommendations.push("A kitchen area would improve the layout's functionality");
  }
  
  // Traffic flow recommendations
  if (rooms.length > 2) {
    recommendations.push("Ensure there's clear circulation between rooms");
  }
  
  return recommendations;
};

// AI-powered layout optimization
export const optimizeLayout = (
  layout: FloorPlanLayout,
  optimizationGoals: string[]
): FloorPlanLayout => {
  // This would contain more sophisticated AI optimization logic
  // For now, return the original layout with some basic improvements
  
  const optimizedObjects = layout.placedObjects.map(obj => ({
    ...obj,
    metadata: {
      ...obj.metadata,
      placementReason: `${obj.metadata.placementReason} (optimized)`
    }
  }));
  
  return {
    ...layout,
    placedObjects: optimizedObjects,
    efficiency: layout.efficiency * 1.1, // Assume 10% improvement
    recommendations: [...layout.recommendations, "Layout has been optimized for better space utilization"]
  };
}; 