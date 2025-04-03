import { CanvasData } from './canvas';

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  canvasData: CanvasData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  userId: string;
} 