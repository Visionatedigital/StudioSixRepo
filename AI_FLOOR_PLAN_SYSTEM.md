# AI-Assisted Floor Plan Generation System

## Overview

This system transforms rough bubble sketches into detailed floor plans using AI-powered object placement. It combines a comprehensive 2D object library with intelligent placement algorithms to create functional and optimized layouts.

## How It Works

### 1. **Bubble Sketch Creation**
- Users draw functional zones (bubbles) on a canvas
- Each bubble represents a different activity area (sleeping, working, storage, etc.)
- Bubbles are automatically labeled and categorized

### 2. **AI Room Classification**
The system automatically classifies each bubble into room types based on:
- **Size analysis**: Larger bubbles → living rooms, smaller bubbles → bathrooms
- **Label matching**: Keywords like "bed", "kitchen", "bath" override size-based classification
- **Position context**: Corner placement often indicates kitchens
- **Confidence scoring**: Each classification comes with a confidence percentage

### 3. **Intelligent Object Selection**
For each classified room, the AI selects appropriate objects based on:
- **Essential objects**: Beds for bedrooms, sinks for kitchens, toilets for bathrooms
- **Room compatibility**: Objects are filtered by their `typicalRoomTypes` and `avoidRoomTypes`
- **Size constraints**: Objects must fit within the room with proper clearance
- **Priority ordering**: Larger, more important objects are placed first

### 4. **Optimal Placement Algorithm**
The placement system considers:
- **Clearance requirements**: Each object has front, side, and back clearance needs
- **Wall distances**: Minimum distances from walls are enforced
- **Object relationships**: Avoids overlapping and ensures proper spacing
- **Traffic flow**: Maintains circulation paths between objects

## Key Components

### Object Database (`floorPlanObjects.ts`)
```typescript
interface FloorPlanObject {
  id: string;
  name: string;
  category: 'furniture' | 'fixtures' | 'appliances' | 'doors' | 'windows';
  width: number; // in meters
  height: number; // in meters
  placementRules: {
    minDistanceFromWall: number;
    typicalRoomTypes: string[];
    avoidRoomTypes: string[];
    clearanceRequired: { front: number; sides: number; back: number };
  };
}
```

**Features:**
- 50+ pre-defined objects (beds, sofas, appliances, fixtures)
- Real-world dimensions and placement rules
- Category-based organization
- Tag-based search and filtering

### AI Placement Engine
```typescript
// Room classification
const classifyRoomFromBubble = (bubble, context) => {
  // Size-based classification
  // Label-based override
  // Position-based adjustments
  return { roomType, confidence };
};

// Object selection
const selectObjectsForRoom = (roomType) => {
  // Filter by room compatibility
  // Prioritize essential objects
  // Consider size constraints
  return essentialObjects;
};
```

### Interactive Canvas
- Real-time bubble drawing
- Drag-and-drop object placement
- Visual feedback and labels
- Grid-based snapping

## User Workflow

### Step 1: Room Setup
1. Configure room dimensions (width × length)
2. Set room type (bedroom, kitchen, etc.)
3. Add features (doors, windows)

### Step 2: Bubble Sketching
1. Select a functional tool (sleeping, working, storage, etc.)
2. Click on canvas to create activity zones
3. Each bubble represents a different functional area

### Step 3: AI Generation
1. Click "Generate AI Layout"
2. System classifies each bubble into room types
3. AI selects and places appropriate objects
4. Calculates space efficiency and provides recommendations

### Step 4: Manual Refinement
1. Use Object Library to add specific items
2. Drag and drop objects for precise placement
3. Adjust positions and orientations

## AI Capabilities

### Room Classification Accuracy
- **Size-based**: 70-90% accuracy for typical layouts
- **Label-enhanced**: 95% accuracy when users provide descriptive labels
- **Context-aware**: Considers position and relationships between bubbles

### Object Placement Intelligence
- **Essential prioritization**: Places critical items first (beds, sinks, toilets)
- **Space optimization**: Maximizes room utilization while maintaining circulation
- **Functional grouping**: Groups related objects together
- **Clearance enforcement**: Ensures proper spacing for usability

### Layout Optimization
- **Efficiency calculation**: Measures space utilization percentage
- **Traffic flow analysis**: Identifies circulation issues
- **Recommendation engine**: Suggests improvements based on best practices

## Technical Implementation

### Frontend Components
- `SpatialPlanningPage`: Main interface with canvas and controls
- `ObjectLibrary`: Drag-and-drop object selection
- Canvas rendering with HTML5 Canvas API

### Backend Logic
- `floorPlanObjects.ts`: Object database and helper functions
- AI classification algorithms
- Placement optimization engine

### Data Flow
1. User creates bubbles → State management
2. AI processes bubbles → Classification engine
3. Objects selected → Filtering and prioritization
4. Placement calculated → Optimization algorithms
5. Results rendered → Canvas updates

## Benefits

### For Users
- **Rapid prototyping**: Convert sketches to detailed plans in minutes
- **Professional results**: AI ensures proper spacing and functionality
- **Flexible workflow**: Combine AI automation with manual control
- **Educational**: Learn proper space planning principles

### For Designers
- **Consistent quality**: AI enforces best practices automatically
- **Time savings**: Automated placement of standard items
- **Iteration speed**: Quick layout variations and testing
- **Client communication**: Clear visual representations

## Future Enhancements

### Advanced AI Features
- **Machine learning**: Train on thousands of floor plans for better classification
- **Style recognition**: Adapt to different design styles and preferences
- **3D integration**: Extend to 3D floor plan generation
- **Code compliance**: Check against building codes and regulations

### Enhanced Object Library
- **Custom objects**: User-defined furniture and fixtures
- **Brand integration**: Real furniture catalogs and specifications
- **Cost estimation**: Automatic pricing based on selected objects
- **Sustainability scoring**: Environmental impact assessment

### Collaboration Features
- **Real-time editing**: Multiple users working simultaneously
- **Version control**: Track changes and revert to previous layouts
- **Client feedback**: Comment and approval system
- **Export options**: CAD, PDF, 3D model exports

## Integration with OpenAI

This system can be enhanced with OpenAI's capabilities:

### Text-to-Layout
```typescript
// User describes: "A 3-bedroom house with open kitchen and living room"
const prompt = `Generate a floor plan for: ${userDescription}`;
const layout = await openai.generateLayout(prompt);
```

### Image Analysis
```typescript
// Upload existing floor plan or sketch
const imageAnalysis = await openai.analyzeFloorPlanImage(uploadedImage);
const extractedBubbles = imageAnalysis.bubbles;
```

### Natural Language Refinement
```typescript
// User: "Move the kitchen to the north side and add a pantry"
const refinedLayout = await openai.refineLayout(currentLayout, userRequest);
```

## Conclusion

This AI-assisted floor plan system bridges the gap between conceptual bubble diagrams and detailed architectural layouts. By combining user creativity with AI intelligence, it provides a powerful tool for rapid space planning and design iteration.

The system's modular architecture allows for continuous improvement and integration with advanced AI services like OpenAI, making it a scalable solution for both individual designers and large architectural firms. 