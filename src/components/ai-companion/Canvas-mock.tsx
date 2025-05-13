'use client';

import React from 'react';
import { Stage, Layer, KonvaRect, KonvaText } from './KonvaComponents-debug';

interface Props {
  name: string;
  description: string;
  projectId: string;
}

export default function Canvas({ name, description, projectId }: Props) {
  console.log('[DEBUG] Canvas-mock rendered with props:', { name, description, projectId });

  return (
    <div className="p-4 bg-gray-100 h-full w-full">
      <h1 className="text-2xl font-bold mb-4">Canvas with Mock Konva Components</h1>
      
      {/* Using mock Konva components */}
      <Stage width={800} height={600} className="bg-white shadow-lg border border-gray-200 rounded-lg">
        <Layer>
          <KonvaRect 
            x={50} 
            y={50} 
            width={200} 
            height={100} 
            fill="#E3F2FD" 
            stroke="#1E88E5"
          />
          <KonvaText 
            x={60} 
            y={60} 
            text={`Name: ${name || 'No name'}`}
            fontSize={16}
          />
          <KonvaText 
            x={60} 
            y={80} 
            text={`Description: ${description || 'No description'}`}
            fontSize={16}
          />
          <KonvaText 
            x={60} 
            y={100} 
            text={`Project ID: ${projectId || 'No project ID'}`}
            fontSize={16}
          />
        </Layer>
      </Stage>
    </div>
  );
} 