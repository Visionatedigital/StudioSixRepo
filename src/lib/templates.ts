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
    // 📝 Project Brief Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Project Brief',
      x: 50,
      y: 50,
      width: 400,
      height: 250,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Project Brief Title
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 70,
      width: 350,
      height: 40,
      text: '📝 Project Brief',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Project Brief Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 110,
      width: 350,
      height: 30,
      text: 'Define goals, users, timeline',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Project Brief Text Area
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 150,
      width: 350,
      height: 130,
      text: 'Enter project goals, client requirements, and timeline details here...',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#374151',
      canvasId: 'root',
      rotation: 0
    },
    
    // 🌞 Site Analysis Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Site Analysis',
      x: 50,
      y: 320,
      width: 400,
      height: 320,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Site Analysis Title
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 340,
      width: 350,
      height: 40,
      text: '🌞 Site Analysis',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Site Analysis Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 380,
      width: 350,
      height: 30,
      text: 'Explore environmental factors',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Sun Path Analysis
    {
      id: uuidv4(),
      type: 'container',
      name: 'Sun Path',
      x: 75,
      y: 420,
      width: 160,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Sun Path Label
    {
      id: uuidv4(),
      type: 'text',
      x: 85,
      y: 430,
      width: 140,
      height: 20,
      text: 'Sun Path',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'medium',
      fill: '#4B5563',
      canvasId: 'root',
      rotation: 0
    },
    // Wind Direction Analysis
    {
      id: uuidv4(),
      type: 'container',
      name: 'Wind Direction',
      x: 265,
      y: 420,
      width: 160,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Wind Direction Label
    {
      id: uuidv4(),
      type: 'text',
      x: 275,
      y: 430,
      width: 140,
      height: 20,
      text: 'Wind Direction',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'medium',
      fill: '#4B5563',
      canvasId: 'root',
      rotation: 0
    },
    // Site Constraints
    {
      id: uuidv4(),
      type: 'container',
      name: 'Site Constraints',
      x: 75,
      y: 540,
      width: 350,
      height: 80,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Site Constraints Label
    {
      id: uuidv4(),
      type: 'text',
      x: 85,
      y: 550,
      width: 200,
      height: 20,
      text: 'Site Constraints & Zoning',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'medium',
      fill: '#4B5563',
      canvasId: 'root',
      rotation: 0
    },
    
    // 🔁 Spatial Program Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Spatial Program',
      x: 50,
      y: 660,
      width: 400,
      height: 300,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Spatial Program Title
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 680,
      width: 350,
      height: 40,
      text: '🔁 Spatial Program',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Spatial Program Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 75,
      y: 720,
      width: 350,
      height: 30,
      text: 'Bubble diagrams, zoning, adjacencies',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Bubble Diagram Area
    {
      id: uuidv4(),
      type: 'container',
      name: 'Bubble Diagram',
      x: 75,
      y: 760,
      width: 350,
      height: 180,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Bubble Diagram Label
    {
      id: uuidv4(),
      type: 'text',
      x: 190,
      y: 840,
      width: 120,
      height: 20,
      text: 'Bubble Diagram',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'medium',
      fill: '#9CA3AF',
      canvasId: 'root',
      rotation: 0
    },

    // ✏️ Sketch Area Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Sketch Area',
      x: 480,
      y: 50,
      width: 570,
      height: 480,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Sketch Area Title
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 70,
      width: 350,
      height: 40,
      text: '✏️ Sketch Area',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Sketch Area Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 110,
      width: 350,
      height: 30,
      text: 'Rough drawings, overlays',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Grid Background for Sketch
    {
      id: uuidv4(),
      type: 'container',
      name: 'Grid Background',
      x: 505,
      y: 150,
      width: 520,
      height: 360,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Grid Layer Instructions
    {
      id: uuidv4(),
      type: 'text',
      x: 650,
      y: 310,
      width: 200,
      height: 40,
      text: 'Sketch your ideas here',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'italic',
      fill: '#9CA3AF',
      canvasId: 'root',
      rotation: 0
    },
    
    // 🎨 Moodboard Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Moodboard',
      x: 480,
      y: 550,
      width: 570,
      height: 220,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Moodboard Title
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 570,
      width: 350,
      height: 40,
      text: '🎨 Moodboard',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Moodboard Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 610,
      width: 350,
      height: 30,
      text: 'Curate style and material direction',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Image Placeholder 1
    {
      id: uuidv4(),
      type: 'container',
      name: 'Image Placeholder 1',
      x: 505,
      y: 650,
      width: 120,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Image Placeholder 2
    {
      id: uuidv4(),
      type: 'container',
      name: 'Image Placeholder 2',
      x: 645,
      y: 650,
      width: 120,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Image Placeholder 3
    {
      id: uuidv4(),
      type: 'container',
      name: 'Image Placeholder 3',
      x: 785,
      y: 650,
      width: 120,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    
    // 🧠 Concept Statement Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Concept Statement',
      x: 480,
      y: 790,
      width: 570,
      height: 170,
      backgroundColor: '#F9FAFB',
      borderColor: '#E5E7EB',
      canvasId: 'root',
      rotation: 0
    },
    // Concept Statement Title
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 810,
      width: 350,
      height: 40,
      text: '🧠 Concept Statement',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#111827',
      canvasId: 'root',
      rotation: 0
    },
    // Concept Statement Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 850,
      width: 350,
      height: 30,
      text: 'Capture design narrative',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#6B7280',
      canvasId: 'root',
      rotation: 0
    },
    // Concept Statement Text Area
    {
      id: uuidv4(),
      type: 'text',
      x: 505,
      y: 890,
      width: 520,
      height: 50,
      text: 'Describe your design concept and narrative here...',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#374151',
      canvasId: 'root',
      rotation: 0
    },
    
    // 🤖 AI Prompt Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'AI Assistant',
      x: 1080,
      y: 50,
      width: 350,
      height: 550,
      backgroundColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      canvasId: 'root',
      rotation: 0
    },
    // AI Assistant Title
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 70,
      width: 300,
      height: 40,
      text: '🤖 AI Prompt Zone',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#0C4A6E',
      canvasId: 'root',
      rotation: 0
    },
    // AI Assistant Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 110,
      width: 300,
      height: 30,
      text: 'Assist with ideas & precedents',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#0E7490',
      canvasId: 'root',
      rotation: 0
    },
    // AI Prompt Help Text
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 150,
      width: 300,
      height: 60,
      text: 'Drag AI icon to any element for targeted suggestions. Or use general prompt below:',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#0E7490',
      canvasId: 'root',
      rotation: 0
    },
    // AI Prompt Input Area
    {
      id: uuidv4(),
      type: 'container',
      name: 'AI Prompt Input',
      x: 1105,
      y: 220,
      width: 300,
      height: 100,
      backgroundColor: '#ffffff',
      borderColor: '#BAE6FD',
      canvasId: 'root',
      rotation: 0
    },
    // AI Prompt Input Text
    {
      id: uuidv4(),
      type: 'text',
      x: 1120,
      y: 240,
      width: 270,
      height: 60,
      text: 'Enter your design prompt here...',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#94A3B8',
      canvasId: 'root',
      rotation: 0
    },
    // AI Response Area Label
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 330,
      width: 300,
      height: 30,
      text: 'AI Suggestions:',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'medium',
      fill: '#0E7490',
      canvasId: 'root',
      rotation: 0
    },
    // AI Response Area
    {
      id: uuidv4(),
      type: 'container',
      name: 'AI Response Container',
      x: 1105,
      y: 370,
      width: 300,
      height: 210,
      backgroundColor: '#ffffff',
      borderColor: '#BAE6FD',
      canvasId: 'root',
      rotation: 0
    },
    // AI Response Placeholder Text
    {
      id: uuidv4(),
      type: 'text',
      x: 1120,
      y: 390,
      width: 270,
      height: 170,
      text: 'AI suggestions and design ideas will appear here...',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#94A3B8',
      canvasId: 'root',
      rotation: 0
    },
    
    // 💬 Comment Layer Zone
    {
      id: uuidv4(),
      type: 'container',
      name: 'Comment Layer',
      x: 1080,
      y: 620,
      width: 350,
      height: 340,
      backgroundColor: '#FEF3C7',
      borderColor: '#FDE68A',
      canvasId: 'root',
      rotation: 0
    },
    // Comment Layer Title
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 640,
      width: 300,
      height: 40,
      text: '💬 Comment Layer',
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'bold',
      fill: '#92400E',
      canvasId: 'root',
      rotation: 0
    },
    // Comment Layer Subtitle
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 680,
      width: 300,
      height: 30,
      text: 'Enable discussion and review',
      fontSize: 16,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'normal',
      fill: '#92400E',
      canvasId: 'root',
      rotation: 0
    },
    // Comment 1
    {
      id: uuidv4(),
      type: 'sticky-note',
      x: 1105,
      y: 720,
      width: 300,
      height: 80,
      canvasId: 'root',
      rotation: 0,
      content: 'Add comments or feedback here. Drag to position near relevant elements.',
      style: {
        backgroundColor: '#FEF3C7',
        textColor: '#92400E',
        fontSize: 14,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    },
    // Comment 2
    {
      id: uuidv4(),
      type: 'sticky-note',
      x: 1105,
      y: 810,
      width: 300,
      height: 80,
      canvasId: 'root',
      rotation: 0,
      content: 'Use this layer for team discussion and client feedback.',
      style: {
        backgroundColor: '#FFEDD5',
        textColor: '#9A3412',
        fontSize: 14,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    },
    // Draggable Comment Instructions
    {
      id: uuidv4(),
      type: 'text',
      x: 1105,
      y: 900,
      width: 300,
      height: 40,
      text: 'Drag comments to specific areas of your design',
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontStyle: 'italic',
      fill: '#92400E',
      canvasId: 'root',
      rotation: 0
    }
  ],
  canvasStack: [
    {
      id: 'root',
      name: 'Concept Development',
      elements: []
    }
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