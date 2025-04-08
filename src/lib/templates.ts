import { CanvasElement, CanvasData } from '@/types/canvas';
import { v4 as uuidv4 } from 'uuid';

// Base template structure
interface TemplateData {
  name: string;
  elements: CanvasElement[];
  canvasStack: CanvasData[];
}

// Sample concept development template
export const conceptDevelopmentTemplate: TemplateData = {
  name: 'Concept Development',
  elements: [
    // Text element explaining concept development
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 100,
      text: 'Concept Development',
      fontSize: 28,
      fill: '#333333',
      width: 300,
      height: 50,
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 160,
      text: 'Use this space to explore design concepts, gather site data, and develop your initial ideas.',
      fontSize: 16,
      fill: '#666666',
      width: 400,
      height: 100,
      canvasId: 'root',
      rotation: 0
    },
    // Board elements for different concept areas
    {
      id: uuidv4(),
      type: 'board',
      x: 100,
      y: 280,
      width: 200,
      height: 150,
      name: 'Site Analysis',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 350,
      y: 280,
      width: 200,
      height: 150,
      name: 'Precedent Studies',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 600,
      y: 280,
      width: 200,
      height: 150,
      name: 'Initial Sketches',
      canvasId: 'root',
      rotation: 0
    }
  ],
  canvasStack: [
    {
      id: 'root',
      name: 'Concept Development',
      elements: [], // Will be populated with element IDs
      parentId: undefined
    },
    // Child canvas for each board would be generated dynamically
  ]
};

// Sample design exploration template
export const designExplorationTemplate: TemplateData = {
  name: 'Design Exploration',
  elements: [
    // Text element explaining design exploration
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 100,
      text: 'Design Exploration',
      fontSize: 28,
      fill: '#333333',
      width: 300,
      height: 50,
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 160,
      text: 'Explore different design options, test layouts, and refine your design language.',
      fontSize: 16,
      fill: '#666666',
      width: 400,
      height: 100,
      canvasId: 'root',
      rotation: 0
    },
    // Board elements for different design areas
    {
      id: uuidv4(),
      type: 'board',
      x: 100,
      y: 280,
      width: 200,
      height: 150,
      name: 'Layout Options',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 350,
      y: 280,
      width: 200,
      height: 150,
      name: 'Material Studies',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 600,
      y: 280,
      width: 200,
      height: 150,
      name: 'Form Development',
      canvasId: 'root',
      rotation: 0
    }
  ],
  canvasStack: [
    {
      id: 'root',
      name: 'Design Exploration',
      elements: [], // Will be populated with element IDs
      parentId: undefined
    }
  ]
};

// Sample visual presentation template
export const visualPresentationTemplate: TemplateData = {
  name: 'Visual Presentation',
  elements: [
    // Text element explaining visual presentation
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 100,
      text: 'Visual Presentation',
      fontSize: 28,
      fill: '#333333',
      width: 300,
      height: 50,
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'text',
      x: 100,
      y: 160,
      text: 'Compile moodboards, generate renders, and create compelling visuals for client presentations.',
      fontSize: 16,
      fill: '#666666',
      width: 400,
      height: 100,
      canvasId: 'root',
      rotation: 0
    },
    // Board elements for different presentation areas
    {
      id: uuidv4(),
      type: 'board',
      x: 100,
      y: 280,
      width: 200,
      height: 150,
      name: 'Moodboard',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 350,
      y: 280,
      width: 200,
      height: 150,
      name: 'Renders',
      canvasId: 'root',
      rotation: 0
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 600,
      y: 280,
      width: 200,
      height: 150,
      name: 'Presentation Boards',
      canvasId: 'root',
      rotation: 0
    }
  ],
  canvasStack: [
    {
      id: 'root',
      name: 'Visual Presentation',
      elements: [], // Will be populated with element IDs
      parentId: undefined
    }
  ]
};

// Function to apply a template to a project
export async function applyTemplate(projectId: string, templateId: string): Promise<boolean> {
  try {
    // Select the appropriate template
    let template: TemplateData;
    switch (templateId) {
      case 'concept-development':
        template = conceptDevelopmentTemplate;
        break;
      case 'design-exploration':
        template = designExplorationTemplate;
        break;
      case 'visual-presentation':
        template = visualPresentationTemplate;
        break;
      default:
        return false;
    }

    // Update element canvasIds with the proper element IDs
    const canvasIdMap = new Map<string, string>();
    template.canvasStack.forEach(canvas => {
      canvasIdMap.set(canvas.id, canvas.id);
    });

    // Populate canvas stack elements with element IDs
    template.canvasStack = template.canvasStack.map(canvas => ({
      ...canvas,
      elements: template.elements
        .filter(element => element.canvasId === canvas.id)
        .map(element => element.id)
    }));

    // Prepare canvas data for API
    const canvasData = {
      elements: template.elements,
      canvasStack: template.canvasStack
    };

    // Update the project with the template data
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: template.name,
        canvasData: canvasData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply template');
    }

    return true;
  } catch (error) {
    console.error('Error applying template:', error);
    return false;
  }
} 