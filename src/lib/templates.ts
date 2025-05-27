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
  elements: [],
  canvasStack: []
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
      rotation: 0,
      elements: []
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 350,
      y: 280,
      width: 200,
      height: 150,
      name: 'Color Schemes',
      canvasId: 'root',
      rotation: 0,
      elements: []
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 600,
      y: 280,
      width: 200,
      height: 150,
      name: 'Typography',
      canvasId: 'root',
      rotation: 0,
      elements: []
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 100,
      y: 500,
      width: 200,
      height: 150,
      name: 'Material Studies',
      canvasId: 'root',
      rotation: 0,
      elements: []
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 350,
      y: 500,
      width: 200,
      height: 150,
      name: 'Form Development',
      canvasId: 'root',
      rotation: 0,
      elements: []
    },
    {
      id: uuidv4(),
      type: 'board',
      x: 600,
      y: 500,
      width: 200,
      height: 150,
      name: 'User Experience',
      canvasId: 'root',
      rotation: 0,
      elements: []
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
      rotation: 0,
      elements: []
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
      rotation: 0,
      elements: []
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
      rotation: 0,
      elements: []
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
    console.log('Applying template:', templateId, 'to project:', projectId);
    
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
        console.error('Invalid template ID:', templateId);
        return false;
    }

    console.log('Selected template:', template);

    // Generate new IDs for canvases and elements
    const canvasIdMap = new Map<string, string>();
    const elementIdMap = new Map<string, string>();

    // Generate new IDs for canvases
    template.canvasStack.forEach(canvas => {
      const newId = uuidv4();
      canvasIdMap.set(canvas.id, newId);
    });

    // Generate new IDs for elements and update their canvasId references
    const updatedElements = template.elements.map(element => {
      const newId = uuidv4();
      elementIdMap.set(element.id, newId);
      
      // Update the element's ID and ensure it's associated with the root canvas
      return {
        ...element,
        id: newId,
        canvasId: 'root' // Force all elements to be on the root canvas
      };
    });

    // Update canvas stack with new IDs and element references
    const updatedCanvasStack = template.canvasStack.map(canvas => ({
      ...canvas,
      id: canvasIdMap.get(canvas.id) || canvas.id,
      elements: updatedElements
        .filter(element => element.canvasId === 'root')
        .map(element => element.id)
    }));

    console.log('Processed template canvasStack:', updatedCanvasStack);
    console.log('Processed template elements:', updatedElements);

    // Prepare canvas data for API
    const canvasData = {
      elements: updatedElements,
      canvasStack: updatedCanvasStack,
      templateElements: updatedElements // Add template elements for reference
    };

    console.log('Prepared canvasData for API:', canvasData);

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
      const errorText = await response.text();
      console.error('Failed to apply template:', errorText);
      throw new Error('Failed to apply template: ' + errorText);
    }

    console.log('Template applied successfully');
    return true;
  } catch (error) {
    console.error('Error applying template:', error);
    return false;
  }
} 