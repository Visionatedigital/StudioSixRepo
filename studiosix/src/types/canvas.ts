export type Tool = 'mouse' | 'todo' | 'text' | 'board' | 'column' | 'comment' | 'note' | 'image' | 'upload' | 'draw' | 'trash' | 'prompt';

export type ElementType = 
  | 'text'
  | 'board'
  | 'note'
  | 'image'
  | 'upload'
  | 'prompt'
  | 'shape'
  | 'line'
  | 'comment'
  | 'generated';

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
  type: 'upload';
  file: File;
  image: HTMLImageElement;
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
  preview?: string;
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
  type: 'generated';
  src: string;
  image?: HTMLImageElement;
  prompt: string;
  showInfo: boolean;
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
  | CommentElement;

export interface CanvasData {
  id: string;
  name: string;
  elements: string[];
  parentId?: string;
} 