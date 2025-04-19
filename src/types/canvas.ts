export type Tool = 'mouse' | 'todo' | 'text' | 'board' | 'column' | 'container' | 'note' | 'image' | 'upload' | 'draw' | 'trash' | 'prompt';

export type ElementType =
  | 'text'
  | 'image'
  | 'uploaded'
  | 'prompt'
  | 'board'
  | 'shape'
  | 'line'
  | 'generated-image'
  | 'comment'
  | 'container'
  | 'generated-content'
  | 'todo'
  | 'note';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  canvasId: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
  fill: string;
  backgroundColor?: string;
  isSticky?: boolean;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  image?: HTMLImageElement;
}

export interface UploadedElement extends BaseElement {
  type: 'uploaded';
  image: HTMLImageElement;
  file: File;
}

export interface PromptElement extends BaseElement {
  type: 'prompt';
  prompt: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  status: 'idle' | 'generating' | 'complete' | 'error';
  generatedImage?: string;
  controlNetFile?: File;
}

export interface BoardElement extends BaseElement {
  type: 'board';
  name: string;
  elements: string[];
  width: number;
  height: number;
  rotation?: number;
  draggable?: boolean;
  resizable?: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: string;
  fill: string;
}

export interface LineElement extends BaseElement {
  type: 'line';
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface GeneratedImageElement extends BaseElement {
  type: 'generated-image';
  src: string;
  image?: HTMLImageElement;
  width: number;
  height: number;
}

export interface Comment {
  id: string;
  text: string;
  x: number;
  y: number;
  targetId: string; // ID of the element being commented on
  createdAt: string;
}

export interface CommentElement extends BaseElement {
  type: 'comment';
  text: string;
  targetId: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  content?: {
    type: 'project-input' | 'design-tools' | 'generated-output' | 'template-group';
    fields?: Array<{ type: string; label: string; placeholder?: string; accept?: string }>;
    tools?: Array<{ id: string; name: string; icon: string }>;
    containers?: Array<{
      id: string;
      type: 'project-input' | 'design-tools' | 'generated-output';
      x: number;
      y: number;
      width: number;
      height: number;
      name: string;
      backgroundColor: string;
      borderColor: string;
      borderRadius: number;
      fields?: Array<{ type: string; label: string; placeholder?: string; accept?: string }>;
      tools?: Array<{ id: string; name: string; icon: string }>;
    }>;
  };
}

export interface ContainerElement extends BaseElement {
  type: 'container';
  name: string;
  backgroundColor?: string;
  borderColor?: string;
  content?: {
    type: 'project-input' | 'design-tools' | 'generated-output' | 'template-group';
    fields?: Array<{ type: string; label: string; placeholder?: string; accept?: string }>;
    tools?: Array<{ id: string; name: string; icon: string }>;
    containers?: Array<{
      id: string;
      type: 'project-input' | 'design-tools' | 'generated-output';
      x: number;
      y: number;
      width: number;
      height: number;
      name: string;
      backgroundColor: string;
      borderColor: string;
      borderRadius: number;
      fields?: Array<{ type: string; label: string; placeholder?: string; accept?: string }>;
      tools?: Array<{ id: string; name: string; icon: string }>;
    }>;
    generatedContent?: {
      siteStatement: string;
      swot: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      };
      keyCharacteristics: string[];
    };
  };
  text?: string;
  borderRadius?: number;
}

export interface GeneratedContentElement extends BaseElement {
  type: 'generated-content';
  content: {
    siteStatement: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    keyCharacteristics: string[];
  };
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | UploadedElement
  | PromptElement
  | BoardElement
  | ShapeElement
  | LineElement
  | GeneratedImageElement
  | CommentElement
  | ContainerElement
  | GeneratedContentElement;

export interface CanvasData {
  id: string;
  name: string;
  elements: string[];
  parentId?: string;
} 