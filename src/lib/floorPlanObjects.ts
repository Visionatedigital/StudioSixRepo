export interface FloorPlanObject {
  id: string;
  name: string;
  category: 'furniture' | 'fixtures' | 'appliances' | 'doors' | 'windows' | 'structural' | 'decorative';
  subcategory: string;
  width: number; // in meters
  height: number; // in meters
  svgPath: string; // SVG path data for rendering
  thumbnail: string; // URL to thumbnail image
  tags: string[]; // For AI search and categorization
  placementRules: {
    minDistanceFromWall: number; // minimum distance from walls
    preferredOrientation: 'horizontal' | 'vertical' | 'any';
    requiresPower: boolean;
    requiresPlumbing: boolean;
    requiresVentilation: boolean;
    typicalRoomTypes: string[]; // rooms where this object is typically placed
    avoidRoomTypes: string[]; // rooms where this object should not be placed
    minRoomSize: { width: number; height: number }; // minimum room size required
    clearanceRequired: { front: number; sides: number; back: number }; // clearance needed around object
  };
  variants?: FloorPlanObject[]; // Different sizes/styles of the same object
}

export const FLOOR_PLAN_OBJECTS: FloorPlanObject[] = [
  // BEDROOM FURNITURE
  {
    id: 'bed-single',
    name: 'Single Bed',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 0.9,
    height: 2.0,
    svgPath: 'M0,0 L0.9,0 L0.9,2.0 L0,2.0 Z',
    thumbnail: '/objects/bed-single.jpg',
    tags: ['bed', 'sleeping', 'bedroom', 'single', 'twin'],
    placementRules: {
      minDistanceFromWall: 0.6,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'guest-room'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'living-room'],
      minRoomSize: { width: 2.5, height: 3.0 },
      clearanceRequired: { front: 0.8, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'bed-double',
    name: 'Double Bed',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 1.35,
    height: 2.0,
    svgPath: 'M0,0 L1.35,0 L1.35,2.0 L0,2.0 Z',
    thumbnail: '/objects/bed-double.jpg',
    tags: ['bed', 'sleeping', 'bedroom', 'double', 'full'],
    placementRules: {
      minDistanceFromWall: 0.6,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'master-bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'living-room'],
      minRoomSize: { width: 3.0, height: 3.0 },
      clearanceRequired: { front: 0.8, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'bed-queen',
    name: 'Queen Bed',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 1.5,
    height: 2.0,
    svgPath: 'M0,0 L1.5,0 L1.5,2.0 L0,2.0 Z',
    thumbnail: '/objects/bed-queen.jpg',
    tags: ['bed', 'sleeping', 'bedroom', 'queen'],
    placementRules: {
      minDistanceFromWall: 0.6,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'master-bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'living-room'],
      minRoomSize: { width: 3.2, height: 3.0 },
      clearanceRequired: { front: 0.8, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'bed-king',
    name: 'King Bed',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 1.6,
    height: 2.0,
    svgPath: 'M0,0 L1.6,0 L1.6,2.0 L0,2.0 Z',
    thumbnail: '/objects/bed-king.jpg',
    tags: ['bed', 'sleeping', 'bedroom', 'king'],
    placementRules: {
      minDistanceFromWall: 0.6,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['master-bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'living-room'],
      minRoomSize: { width: 3.5, height: 3.0 },
      clearanceRequired: { front: 0.8, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'wardrobe',
    name: 'Wardrobe',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 1.2,
    height: 0.6,
    svgPath: 'M0,0 L1.2,0 L1.2,0.6 L0,0.6 Z',
    thumbnail: '/objects/wardrobe.jpg',
    tags: ['storage', 'clothes', 'bedroom', 'wardrobe', 'closet'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'master-bedroom', 'dressing-room'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.5, height: 2.5 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'nightstand',
    name: 'Nightstand',
    category: 'furniture',
    subcategory: 'bedroom',
    width: 0.4,
    height: 0.4,
    svgPath: 'M0,0 L0.4,0 L0.4,0.4 L0,0.4 Z',
    thumbnail: '/objects/nightstand.jpg',
    tags: ['table', 'bedroom', 'nightstand', 'side-table'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'any',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'master-bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.3, sides: 0.0, back: 0.0 }
    }
  },

  // LIVING ROOM FURNITURE
  {
    id: 'sofa-2-seater',
    name: '2-Seater Sofa',
    category: 'furniture',
    subcategory: 'living-room',
    width: 1.6,
    height: 0.8,
    svgPath: 'M0,0 L1.6,0 L1.6,0.8 L0,0.8 Z',
    thumbnail: '/objects/sofa-2-seater.jpg',
    tags: ['sofa', 'couch', 'seating', 'living-room', '2-seater'],
    placementRules: {
      minDistanceFromWall: 0.3,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'family-room', 'den'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'bedroom'],
      minRoomSize: { width: 3.0, height: 2.5 },
      clearanceRequired: { front: 1.0, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'sofa-3-seater',
    name: '3-Seater Sofa',
    category: 'furniture',
    subcategory: 'living-room',
    width: 2.1,
    height: 0.8,
    svgPath: 'M0,0 L2.1,0 L2.1,0.8 L0,0.8 Z',
    thumbnail: '/objects/sofa-3-seater.jpg',
    tags: ['sofa', 'couch', 'seating', 'living-room', '3-seater'],
    placementRules: {
      minDistanceFromWall: 0.3,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'family-room', 'den'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'bedroom'],
      minRoomSize: { width: 3.5, height: 2.5 },
      clearanceRequired: { front: 1.0, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'armchair',
    name: 'Armchair',
    category: 'furniture',
    subcategory: 'living-room',
    width: 0.8,
    height: 0.8,
    svgPath: 'M0,0 L0.8,0 L0.8,0.8 L0,0.8 Z',
    thumbnail: '/objects/armchair.jpg',
    tags: ['chair', 'seating', 'living-room', 'armchair'],
    placementRules: {
      minDistanceFromWall: 0.3,
      preferredOrientation: 'any',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'family-room', 'den', 'bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.8, sides: 0.3, back: 0.1 }
    }
  },
  {
    id: 'coffee-table',
    name: 'Coffee Table',
    category: 'furniture',
    subcategory: 'living-room',
    width: 1.2,
    height: 0.6,
    svgPath: 'M0,0 L1.2,0 L1.2,0.6 L0,0.6 Z',
    thumbnail: '/objects/coffee-table.jpg',
    tags: ['table', 'coffee-table', 'living-room', 'center-table'],
    placementRules: {
      minDistanceFromWall: 0.5,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'family-room', 'den'],
      avoidRoomTypes: ['kitchen', 'bathroom', 'bedroom'],
      minRoomSize: { width: 3.0, height: 2.5 },
      clearanceRequired: { front: 0.4, sides: 0.4, back: 0.4 }
    }
  },
  {
    id: 'tv-stand',
    name: 'TV Stand',
    category: 'furniture',
    subcategory: 'living-room',
    width: 1.4,
    height: 0.4,
    svgPath: 'M0,0 L1.4,0 L1.4,0.4 L0,0.4 Z',
    thumbnail: '/objects/tv-stand.jpg',
    tags: ['tv', 'entertainment', 'living-room', 'media-stand'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: true,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'family-room', 'den', 'bedroom'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.5, height: 2.0 },
      clearanceRequired: { front: 0.8, sides: 0.0, back: 0.0 }
    }
  },

  // DINING FURNITURE
  {
    id: 'dining-table-4-seater',
    name: '4-Seater Dining Table',
    category: 'furniture',
    subcategory: 'dining',
    width: 1.2,
    height: 0.8,
    svgPath: 'M0,0 L1.2,0 L1.2,0.8 L0,0.8 Z',
    thumbnail: '/objects/dining-table-4.jpg',
    tags: ['table', 'dining', '4-seater', 'kitchen', 'dining-room'],
    placementRules: {
      minDistanceFromWall: 0.8,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['dining-room', 'kitchen', 'open-plan'],
      avoidRoomTypes: ['bathroom', 'bedroom'],
      minRoomSize: { width: 3.0, height: 2.5 },
      clearanceRequired: { front: 0.8, sides: 0.8, back: 0.8 }
    }
  },
  {
    id: 'dining-table-6-seater',
    name: '6-Seater Dining Table',
    category: 'furniture',
    subcategory: 'dining',
    width: 1.6,
    height: 0.9,
    svgPath: 'M0,0 L1.6,0 L1.6,0.9 L0,0.9 Z',
    thumbnail: '/objects/dining-table-6.jpg',
    tags: ['table', 'dining', '6-seater', 'kitchen', 'dining-room'],
    placementRules: {
      minDistanceFromWall: 0.8,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['dining-room', 'kitchen', 'open-plan'],
      avoidRoomTypes: ['bathroom', 'bedroom'],
      minRoomSize: { width: 3.5, height: 3.0 },
      clearanceRequired: { front: 0.8, sides: 0.8, back: 0.8 }
    }
  },
  {
    id: 'dining-chair',
    name: 'Dining Chair',
    category: 'furniture',
    subcategory: 'dining',
    width: 0.45,
    height: 0.45,
    svgPath: 'M0,0 L0.45,0 L0.45,0.45 L0,0.45 Z',
    thumbnail: '/objects/dining-chair.jpg',
    tags: ['chair', 'dining', 'seating', 'kitchen', 'dining-room'],
    placementRules: {
      minDistanceFromWall: 0.3,
      preferredOrientation: 'any',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['dining-room', 'kitchen', 'open-plan'],
      avoidRoomTypes: ['bathroom', 'bedroom'],
      minRoomSize: { width: 1.5, height: 1.5 },
      clearanceRequired: { front: 0.6, sides: 0.3, back: 0.1 }
    }
  },

  // KITCHEN APPLIANCES & FURNITURE
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'appliances',
    subcategory: 'kitchen',
    width: 0.7,
    height: 0.7,
    svgPath: 'M0,0 L0.7,0 L0.7,0.7 L0,0.7 Z',
    thumbnail: '/objects/refrigerator.jpg',
    tags: ['appliance', 'kitchen', 'refrigerator', 'fridge'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'vertical',
      requiresPower: true,
      requiresPlumbing: false,
      requiresVentilation: true,
      typicalRoomTypes: ['kitchen'],
      avoidRoomTypes: ['bedroom', 'bathroom', 'living-room'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.8, sides: 0.1, back: 0.0 }
    }
  },
  {
    id: 'dishwasher',
    name: 'Dishwasher',
    category: 'appliances',
    subcategory: 'kitchen',
    width: 0.6,
    height: 0.6,
    svgPath: 'M0,0 L0.6,0 L0.6,0.6 L0,0.6 Z',
    thumbnail: '/objects/dishwasher.jpg',
    tags: ['appliance', 'kitchen', 'dishwasher'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'vertical',
      requiresPower: true,
      requiresPlumbing: true,
      requiresVentilation: false,
      typicalRoomTypes: ['kitchen'],
      avoidRoomTypes: ['bedroom', 'bathroom', 'living-room'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'oven',
    name: 'Oven',
    category: 'appliances',
    subcategory: 'kitchen',
    width: 0.6,
    height: 0.6,
    svgPath: 'M0,0 L0.6,0 L0.6,0.6 L0,0.6 Z',
    thumbnail: '/objects/oven.jpg',
    tags: ['appliance', 'kitchen', 'oven', 'cooking'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'vertical',
      requiresPower: true,
      requiresPlumbing: false,
      requiresVentilation: true,
      typicalRoomTypes: ['kitchen'],
      avoidRoomTypes: ['bedroom', 'bathroom', 'living-room'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'kitchen-sink',
    name: 'Kitchen Sink',
    category: 'fixtures',
    subcategory: 'kitchen',
    width: 0.6,
    height: 0.5,
    svgPath: 'M0,0 L0.6,0 L0.6,0.5 L0,0.5 Z',
    thumbnail: '/objects/kitchen-sink.jpg',
    tags: ['sink', 'kitchen', 'fixture', 'plumbing'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: true,
      requiresVentilation: false,
      typicalRoomTypes: ['kitchen'],
      avoidRoomTypes: ['bedroom', 'bathroom', 'living-room'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },

  // BATHROOM FIXTURES
  {
    id: 'toilet',
    name: 'Toilet',
    category: 'fixtures',
    subcategory: 'bathroom',
    width: 0.4,
    height: 0.7,
    svgPath: 'M0,0 L0.4,0 L0.4,0.7 L0,0.7 Z',
    thumbnail: '/objects/toilet.jpg',
    tags: ['toilet', 'bathroom', 'fixture', 'plumbing'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'vertical',
      requiresPower: false,
      requiresPlumbing: true,
      requiresVentilation: false,
      typicalRoomTypes: ['bathroom', 'ensuite'],
      avoidRoomTypes: ['kitchen', 'living-room', 'bedroom'],
      minRoomSize: { width: 1.5, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.3, back: 0.0 }
    }
  },
  {
    id: 'bathtub',
    name: 'Bathtub',
    category: 'fixtures',
    subcategory: 'bathroom',
    width: 1.7,
    height: 0.7,
    svgPath: 'M0,0 L1.7,0 L1.7,0.7 L0,0.7 Z',
    thumbnail: '/objects/bathtub.jpg',
    tags: ['bathtub', 'bathroom', 'fixture', 'plumbing'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: true,
      requiresVentilation: false,
      typicalRoomTypes: ['bathroom', 'ensuite'],
      avoidRoomTypes: ['kitchen', 'living-room', 'bedroom'],
      minRoomSize: { width: 2.5, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'shower',
    name: 'Shower',
    category: 'fixtures',
    subcategory: 'bathroom',
    width: 0.9,
    height: 0.9,
    svgPath: 'M0,0 L0.9,0 L0.9,0.9 L0,0.9 Z',
    thumbnail: '/objects/shower.jpg',
    tags: ['shower', 'bathroom', 'fixture', 'plumbing'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'any',
      requiresPower: false,
      requiresPlumbing: true,
      requiresVentilation: true,
      typicalRoomTypes: ['bathroom', 'ensuite'],
      avoidRoomTypes: ['kitchen', 'living-room', 'bedroom'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'bathroom-sink',
    name: 'Bathroom Sink',
    category: 'fixtures',
    subcategory: 'bathroom',
    width: 0.5,
    height: 0.4,
    svgPath: 'M0,0 L0.5,0 L0.5,0.4 L0,0.4 Z',
    thumbnail: '/objects/bathroom-sink.jpg',
    tags: ['sink', 'bathroom', 'fixture', 'plumbing'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: true,
      requiresVentilation: false,
      typicalRoomTypes: ['bathroom', 'ensuite'],
      avoidRoomTypes: ['kitchen', 'living-room', 'bedroom'],
      minRoomSize: { width: 1.5, height: 1.5 },
      clearanceRequired: { front: 0.5, sides: 0.0, back: 0.0 }
    }
  },

  // DOORS & WINDOWS
  {
    id: 'door-single',
    name: 'Single Door',
    category: 'doors',
    subcategory: 'interior',
    width: 0.9,
    height: 0.1,
    svgPath: 'M0,0 L0.9,0 L0.9,0.1 L0,0.1 Z',
    thumbnail: '/objects/door-single.jpg',
    tags: ['door', 'interior', 'access', 'single'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['all'],
      avoidRoomTypes: [],
      minRoomSize: { width: 1.0, height: 1.0 },
      clearanceRequired: { front: 0.9, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'window-single',
    name: 'Single Window',
    category: 'windows',
    subcategory: 'exterior',
    width: 1.2,
    height: 0.1,
    svgPath: 'M0,0 L1.2,0 L1.2,0.1 L0,0.1 Z',
    thumbnail: '/objects/window-single.jpg',
    tags: ['window', 'exterior', 'light', 'ventilation'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'living-room', 'kitchen', 'bathroom'],
      avoidRoomTypes: [],
      minRoomSize: { width: 1.5, height: 1.5 },
      clearanceRequired: { front: 0.0, sides: 0.0, back: 0.0 }
    }
  },

  // STORAGE FURNITURE
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'furniture',
    subcategory: 'storage',
    width: 0.8,
    height: 0.3,
    svgPath: 'M0,0 L0.8,0 L0.8,0.3 L0,0.3 Z',
    thumbnail: '/objects/bookshelf.jpg',
    tags: ['storage', 'books', 'shelf', 'living-room', 'study'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['living-room', 'study', 'bedroom', 'den'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  },
  {
    id: 'chest-of-drawers',
    name: 'Chest of Drawers',
    category: 'furniture',
    subcategory: 'storage',
    width: 0.8,
    height: 0.4,
    svgPath: 'M0,0 L0.8,0 L0.8,0.4 L0,0.4 Z',
    thumbnail: '/objects/chest-of-drawers.jpg',
    tags: ['storage', 'drawers', 'bedroom', 'clothes'],
    placementRules: {
      minDistanceFromWall: 0.0,
      preferredOrientation: 'horizontal',
      requiresPower: false,
      requiresPlumbing: false,
      requiresVentilation: false,
      typicalRoomTypes: ['bedroom', 'dressing-room'],
      avoidRoomTypes: ['kitchen', 'bathroom'],
      minRoomSize: { width: 2.0, height: 2.0 },
      clearanceRequired: { front: 0.6, sides: 0.0, back: 0.0 }
    }
  }
];

// Helper functions for AI-assisted placement
export const getObjectsByCategory = (category: FloorPlanObject['category']) => {
  return FLOOR_PLAN_OBJECTS.filter(obj => obj.category === category);
};

export const getObjectsByRoomType = (roomType: string) => {
  return FLOOR_PLAN_OBJECTS.filter(obj => 
    obj.placementRules.typicalRoomTypes.includes(roomType)
  );
};

export const getObjectsByTags = (tags: string[]) => {
  return FLOOR_PLAN_OBJECTS.filter(obj => 
    tags.some(tag => obj.tags.includes(tag))
  );
};

export const findObjectById = (id: string) => {
  return FLOOR_PLAN_OBJECTS.find(obj => obj.id === id);
};

// AI placement helper functions
export const calculateOptimalPlacement = (
  object: FloorPlanObject,
  roomWidth: number,
  roomHeight: number,
  existingObjects: Array<{ x: number; y: number; width: number; height: number }>,
  roomType: string
) => {
  // This would contain AI logic for optimal placement
  // For now, return a simple placement suggestion
  const clearance = object.placementRules.clearanceRequired;
  const minWallDistance = object.placementRules.minDistanceFromWall;
  
  // Calculate available space
  const availableWidth = roomWidth - (minWallDistance * 2) - object.width;
  const availableHeight = roomHeight - (minWallDistance * 2) - object.height;
  
  // Simple placement logic - can be enhanced with AI
  let x = minWallDistance;
  let y = minWallDistance;
  
  // Avoid overlapping with existing objects
  for (const existing of existingObjects) {
    if (x < existing.x + existing.width + clearance.sides &&
        x + object.width + clearance.sides > existing.x &&
        y < existing.y + existing.height + clearance.front &&
        y + object.height + clearance.front > existing.y) {
      x = existing.x + existing.width + clearance.sides;
    }
  }
  
  return { x, y };
}; 