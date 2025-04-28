import { CanvasElement, CanvasData } from '@/types/canvas';
import { Node } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';

export interface CanvasVersion {
  version: number;
  timestamp: string;
  data: {
    elements: CanvasElement[];
    canvasStack: CanvasData[];
  };
}

export interface CanvasState {
  elements: any[];
  version: number;
  lastSaved: string;
  [key: string]: any; // Add index signature
}

export function serializeCanvas(stage: Stage): CanvasState {
  const elements = stage.children.map((layer: Layer) => {
    return layer.children.map((node: Node) => {
      return node.toObject();
    });
  }).flat();

  return {
    elements,
    version: 1,
    lastSaved: new Date().toISOString()
  };
}

export function deserializeCanvas(data: CanvasState, stage: Stage) {
  if (!data || !data.elements) {
    throw new Error('Invalid canvas data');
  }

  // Clear existing layers
  stage.children.forEach((layer: Layer) => {
    layer.destroy();
  });

  // Create new layer
  const layer = new Layer();
  stage.add(layer);

  // Recreate elements
  data.elements.forEach((elementData: any) => {
    const node = Node.create(elementData);
    layer.add(node);
  });

  stage.batchDraw();
}

export function validateCanvasData(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.elements)) return false;
    
    // Basic validation of elements
    return data.elements.every((element: any) => {
      return element && 
             typeof element === 'object' &&
             typeof element.id === 'string' &&
             typeof element.type === 'string';
    });
  } catch (error) {
    console.error('Canvas validation error:', error);
    return false;
  }
}

export function createBackup(stage: Stage): string {
  return JSON.stringify(serializeCanvas(stage));
}

export function restoreFromBackup(backup: string, stage: Stage): boolean {
  try {
    const data = JSON.parse(backup);
    if (validateCanvasData(data)) {
      deserializeCanvas(data, stage);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Backup restoration error:', error);
    return false;
  }
}

export const serializeCanvasElement = (element: CanvasElement) => {
  const serializedElement = { ...element };
  
  // Handle image elements
  if ((element.type === 'uploaded' || element.type === 'generated-image') && element.image) {
    if (element.image instanceof HTMLImageElement) {
      (serializedElement as any).image = {
        src: element.image.src,
        width: element.image.width,
        height: element.image.height,
        naturalWidth: element.image.naturalWidth,
        naturalHeight: element.image.naturalHeight
      };
    } else if (typeof element.image === 'object') {
      (serializedElement as any).image = {
        src: (element.image as any).src || '',
        width: (element.image as any).width || element.width || 0,
        height: (element.image as any).height || element.height || 0,
        naturalWidth: (element.image as any).naturalWidth || (element as any).naturalWidth,
        naturalHeight: (element.image as any).naturalHeight || (element as any).naturalHeight
      };
    }
  }
  
  // Remove any circular references or complex objects
  delete (serializedElement as any).transformer;
  delete (serializedElement as any).node;
  
  return serializedElement;
};

export const deserializeCanvasElement = async (element: any): Promise<CanvasElement> => {
  if ((element.type === 'uploaded' || element.type === 'generated-image') && element.image) {
    const img = new window.Image();
    img.src = element.image.src;
    await new Promise(resolve => img.onload = resolve);
    
    return {
      ...element,
      image: img,
      width: element.width || img.width || 0,
      height: element.height || img.height || 0,
      naturalWidth: element.naturalWidth || img.naturalWidth,
      naturalHeight: element.naturalHeight || img.naturalHeight
    };
  }
  
  return element;
};

export async function saveAsTemplate(
  stage: Stage,
  name: string,
  description: string,
  type: string = 'concept',
  isDefault: boolean = false
) {
  try {
    const canvasData = serializeCanvas(stage);
    
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        canvasData,
        type,
        isDefault
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save template');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
}

export async function loadTemplate(templateId: string, stage: Stage) {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) {
      throw new Error('Failed to load template');
    }

    const template = await response.json();
    deserializeCanvas(template.canvasData, stage);
    return template;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
} 