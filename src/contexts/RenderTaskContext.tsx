'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface RenderTask {
  id: string;
  prompt: string;
  progress: number;
  status: 'starting' | 'processing' | 'completed' | 'error';
  startTime: Date;
  completedAt?: Date; // When the task was completed
  estimatedDuration: number; // in milliseconds
  uploadedImageUrl?: string; // URL of the original uploaded image
  imageUrl?: string; // URL of the generated result image
  error?: string;
}

interface RenderTaskContextType {
  tasks: RenderTask[];
  addTask: (prompt: string, estimatedDuration?: number, uploadedImageUrl?: string) => string;
  updateTask: (id: string, updates: Partial<RenderTask>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
}

const RenderTaskContext = createContext<RenderTaskContextType | undefined>(undefined);

export function RenderTaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<RenderTask[]>([]);

  const addTask = useCallback((prompt: string, estimatedDuration: number = 210000, uploadedImageUrl?: string): string => {
    const id = crypto.randomUUID();
    const newTask: RenderTask = {
      id,
      prompt,
      progress: 0,
      status: 'starting',
      startTime: new Date(),
      estimatedDuration,
      uploadedImageUrl,
    };
    
    console.log('🚀 RenderTask: Adding new task', { id, prompt, uploadedImageUrl });
    
    setTasks(prev => [...prev, newTask]);
    return id;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<RenderTask>) => {
    console.log('📝 RenderTask: Updating', id, updates);
    
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const removeTask = useCallback((id: string) => {
    console.log('🗑️ RenderTask: Removing', id);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks(prev => prev.filter(task => task.status !== 'completed'));
  }, []);

  const value = {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearCompletedTasks,
  };

  return (
    <RenderTaskContext.Provider value={value}>
      {children}
    </RenderTaskContext.Provider>
  );
}

export function useRenderTasks() {
  const context = useContext(RenderTaskContext);
  if (context === undefined) {
    throw new Error('useRenderTasks must be used within a RenderTaskProvider');
  }
  return context;
} 