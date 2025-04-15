'use client';

import { useEffect, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import Konva from 'konva';
import Notification from '../ui/Notification';
import StickyNote from './StickyNote';
import AIChat from './AIChat';
import Image from 'next/image';
import ToolsPanel from './ToolsPanel';
import Link from 'next/link';
import HeaderActions from '../HeaderActions';
import { useSession, signOut } from 'next-auth/react';
import { 
  Tool,
  CanvasElement, 
  TextElement, 
  BoardElement, 
  CanvasData, 
  UploadedElement, 
  PromptElement, 
  BaseElement, 
  CommentElement, 
  GeneratedImageElement,
  ImageElement
} from '@/types/canvas';
import dynamic from 'next/dynamic';
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText, Image as KonvaImage, Transformer, Group, Path } from 'react-konva';
import Board from './Board';
import { v4 as uuidv4 } from 'uuid';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CommentBubble from './CommentBubble';
import { useSearchParams } from 'next/navigation';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import { UserPlus } from 'lucide-react';
import CanvasHeader from './CanvasHeader';
import { io, Socket } from 'socket.io-client';
import CollaboratorCursor from './CollaboratorCursor';
import React from 'react';

// Dynamically import Stage with no SSR
const DynamicStage = dynamic(() => import('react-konva').then((mod) => mod.Stage), {
  ssr: false,
  loading: () => null
});

type ShapeType = 'rect' | 'circle';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface StickyNoteData {
  id: string;
  x: number;
  y: number;
  content: string;
  style: {
    width: number;
    height: number;
    backgroundColor: string;
    color: string;
    fontSize: string;
  };
}

interface DrawingLine {
  points: number[];
  color: string;
  width: number;
}

interface DrawingGroup {
  id: string;
  lines: DrawingLine[];
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface DrawingToolbarProps {
  strokeWidth: number;
  strokeColor: string;
  onStrokeWidthChange: (width: number) => void;
  onStrokeColorChange: (color: string) => void;
  onSave: () => void;
  onDiscard: () => void;
}

interface Props {
  name: string;
  description: string;
  projectId: string;
}

interface Collaborator {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  role: 'VIEWER' | 'EDITOR';
}

type CanvasElementType = CanvasElement;

interface CollaboratorCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

// Add type definitions at the top of the file
interface ContainerLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
}

interface ConceptDevelopmentTemplate {
  width: number;
  height: number;
  name: string;
  backgroundColor: string;
  borderColor: string;
  layout: {
    projectInput: ContainerLayout;
    designTools: ContainerLayout;
    generatedOutput: ContainerLayout;
  };
}

interface TemplateContainer {
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
}

interface TemplateGroup extends CommentElement {
  content: {
    type: 'template-group';
    containers: TemplateContainer[];
  };
}

export default function Canvas({ name, description, projectId }: Props) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectName = name || 'Untitled Project';
  const [elements, setElements] = useState<CanvasElementType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>('mouse');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool>('mouse');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const [drawingGroups, setDrawingGroups] = useState<DrawingGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [drawingMode, setDrawingMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [promptElements, setPromptElements] = useState<PromptElement[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isElementDragging, setIsElementDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);
  const [canvasStack, setCanvasStack] = useState<CanvasData[]>([{
    id: 'root',
    name: projectName,
    elements: [],
    parentId: undefined
  }]);
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<{
    elements: CanvasElementType[];
    canvasStack: CanvasData[];
  }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [collaboratorCursors, setCollaboratorCursors] = useState<{ [key: string]: CollaboratorCursor }>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Get current canvas data with safety check
  const currentCanvas = canvasStack[currentCanvasIndex] || canvasStack[0];
  
  // Filter elements to only show those in the current canvas
  const visibleElements = elements.filter(element => 
    element.canvasId === currentCanvas?.id
  );

  // Load project data when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return;

      try {
        console.log('Loading project data for ID:', projectId);
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch project data:', errorText);
          throw new Error('Failed to fetch project data: ' + errorText);
        }
        const project = await response.json();
        
        console.log('Raw project data:', project);
        console.log('Canvas data from project:', project.canvasData);
        
        // Create initial canvas data
        const initialCanvasData: CanvasData = {
          id: 'root',
          name: project.name || 'Root Canvas',
          parentId: undefined,
          elements: []
        };

        // If project has canvas data, use it, otherwise start with empty canvas
        const savedCanvasData = project.canvasData?.canvasStack || [];
        
        console.log('Saved canvas stack:', savedCanvasData);
        
        // Process the saved canvas data
        const processedCanvasStack = savedCanvasData
          .filter((canvas: CanvasData) => canvas && typeof canvas === 'object' && canvas.id)
          .map((canvas: CanvasData) => ({
            ...canvas,
            elements: Array.isArray(canvas.elements) 
              ? canvas.elements.filter((el: any) => el && typeof el === 'object')
              : []
          }));

        console.log('Processed canvas stack:', processedCanvasStack);
        
        // Set the canvas stack with the initial canvas and saved data
        setCanvasStack([initialCanvasData, ...processedCanvasStack]);

        // Extract all elements from project.canvasData.elements or templateElements
        const allElements = project.canvasData?.elements || project.canvasData?.templateElements || [];

        console.log('All elements from project:', allElements);
        
        if (allElements.length > 0) {
          // Convert any saved image data back to Image objects
          const processedElements = await Promise.all(allElements.map(async (element: any) => {
            if (element.type === 'upload' || element.type === 'generated') {
              if (element.image) {
                const img = new window.Image();
                img.src = element.image.src || element.image;
                await new Promise(resolve => img.onload = resolve);
                
                // Ensure all image properties are properly set
                return {
                  ...element,
                  image: img,
                  width: element.width || img.width || 0,
                  height: element.height || img.height || 0,
                  naturalWidth: element.naturalWidth || img.naturalWidth,
                  naturalHeight: element.naturalHeight || img.naturalHeight
                };
              }
            }
            return element;
          }));

          console.log('Processed elements:', processedElements);
          
          // Ensure all elements have a canvasId
          const elementsWithCanvasId = processedElements.map(element => ({
            ...element,
            canvasId: element.canvasId || 'root'
          }));
          
          setElements(elementsWithCanvasId);
        }

        // Log the final state
        console.log('Final state:', {
          project,
          canvasStack: [initialCanvasData, ...processedCanvasStack],
          elements: allElements
        });
      } catch (error) {
        console.error('Error loading project data:', error);
        showNotification('error', 'Error', 'Failed to load project data');
      }
    };

    loadProjectData();
  }, [projectId, projectName]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!projectId || !session?.user) return;

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000');
    setSocket(socket);

    socket.emit('join-project', {
      projectId,
      userId: session.user.id,
      userName: session.user.name || session.user.email
    });

    socket.on('user-joined', (user) => {
      showNotification(
        'success',
        'User joined',
        `${user.userName} joined the project`
      );
    });

    socket.on('user-left', (user) => {
      setCollaboratorCursors(prev => {
        const next = { ...prev };
        delete next[user.userId];
        return next;
      });
      showNotification(
        'success',
        'User left',
        `${user.userName} left the project`
      );
    });

    socket.on('cursor-update', (cursor: CollaboratorCursor) => {
      setCollaboratorCursors(prev => ({
        ...prev,
        [cursor.userId]: cursor
      }));
    });

    socket.on('canvas-updated', (data) => {
      // Handle canvas updates from other users
      if (data.type === 'elements') {
        setElements(data.data);
      } else if (data.type === 'canvasStack') {
        setCanvasStack(data.data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, session?.user]);

  // Track and broadcast cursor position
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    if (socket && projectId) {
      socket.emit('cursor-move', {
        x: point.x,
        y: point.y,
        projectId
      });
    }

    if (tool === 'mouse' && isDraggingCanvas) {
      const newPosition = {
        x: e.evt.clientX - mouseStartPos.x,
        y: e.evt.clientY - mouseStartPos.y
      };
      setPosition(newPosition);
      return;
    }
    
    if (isDrawing && currentLine) {
      // Update the current line with new points
      const newPoints = [...currentLine.points, point.x, point.y];
      const updatedLine = {
      ...currentLine,
        points: newPoints,
      };
      setCurrentLine(updatedLine);
      
      // Update the line in the lines array
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1] = updatedLine;
        return newLines;
      });
    }
  };

  // Broadcast canvas updates
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create a complete snapshot of the current canvas state
      const canvasState = {
        // Save the current elements with proper serialization
        elements: elements.map(element => {
          const serializedElement = { ...element };
          
          // Handle image elements
          if ((element.type === 'upload' || element.type === 'generated') && element.image) {
            if (element.image instanceof HTMLImageElement) {
              (serializedElement as any).image = {
                src: element.image.src,
                width: element.image.width,
                height: element.image.height,
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
          
          // Ensure all required properties are present
          return {
            ...serializedElement,
            id: serializedElement.id || Date.now().toString(),
            type: serializedElement.type,
            x: serializedElement.x || 0,
            y: serializedElement.y || 0,
            width: serializedElement.width || 0,
            height: serializedElement.height || 0,
            canvasId: serializedElement.canvasId || currentCanvas.id
          };
        }),
        
        // Save the current canvas structure with proper element references
        canvasStack: canvasStack.map(canvas => ({
          id: canvas.id,
          name: canvas.name,
          parentId: canvas.parentId,
          elements: canvas.elements.map(id => {
            const element = elements.find(el => el.id === id);
            return element ? element.id : id;
          })
        }))
      };

      console.log('Saving canvas state:', canvasState);

      // Save the complete state to the database
      const saveResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: searchParams.get('description') || '',
          canvasData: canvasState,
          timestamp: new Date().toISOString()
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save project');
      }

      const updatedProject = await saveResponse.json();
      console.log('Project saved successfully:', updatedProject);
      
      // Show success notification with timestamp
      const timestamp = new Date().toLocaleTimeString();
      showNotification(
        'success', 
        'Project Saved', 
        `All changes saved at ${timestamp}`
      );

      // Update history
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[historyIndex + 1] = {
          elements: [...elements],
          canvasStack: [...canvasStack]
        };
        return newHistory;
      });
      setHistoryIndex(historyIndex + 1);

      // Broadcast changes to other users
      if (socket) {
        socket.emit('canvas-update', {
          projectId,
          type: 'elements',
          data: elements
        });
        socket.emit('canvas-update', {
          projectId,
          type: 'canvasStack',
          data: canvasStack
        });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      showNotification(
        'error', 
        'Save Failed', 
        'Failed to save project. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Update the auto-save effect
  useEffect(() => {
    if (!projectId || isSaving) return;
    
    const timeoutId = setTimeout(handleSave, 3000);
    return () => clearTimeout(timeoutId);
  }, [canvasStack, elements, projectId, projectName]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 56, // Adjust to match the header height exactly
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    // Early return if no stage ref
    if (!stageRef.current) return;

    // Get stage and validate click target
    const clickedStage = stageRef.current;
    const isClickOnStage = e.target === clickedStage;
    
    // Get pointer position
    const pointerPos = clickedStage.getPointerPosition();
    if (!pointerPos) return;

    // Convert to stage coordinates
    const transform = clickedStage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointerPos);

    // Handle mouse tool dragging
    if (tool === 'mouse' && isClickOnStage) {
      setIsDraggingCanvas(true);
      clickedStage.container().style.cursor = 'grabbing';
      setMouseStartPos({ x: e.evt.clientX - position.x, y: e.evt.clientY - position.y });
      return;
    }

    // Handle container creation
    if (tool === 'container' && isClickOnStage) {
      const template = getContainerTemplate(selectedTemplateId || '');
      
      if (selectedTemplateId === 'concept-development' && 'layout' in template) {
        // Get the click position from the stage
        const pointerPos = stageRef.current?.getPointerPosition();
        if (!pointerPos) return;

        // Convert to stage coordinates
        const transform = stageRef.current?.getAbsoluteTransform().copy().invert();
        if (!transform) return;
        const pos = transform.point(pointerPos);

        // Create a single container group
        const mainContainerId = uuidv4();
        const mainContainer: CommentElement = {
          id: mainContainerId,
          type: 'container',
          x: pos.x - (template.width / 2),
          y: pos.y - (template.height / 2),
          width: template.width,
          height: template.height,
          text: template.name,
          targetId: '',
          canvasId: currentCanvas.id,
          rotation: 0,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          content: {
            type: 'template-group',
            containers: [
              {
                id: uuidv4(),
                type: 'project-input',
                x: template.layout.projectInput.x,
                y: template.layout.projectInput.y,
                width: template.layout.projectInput.width,
                height: template.layout.projectInput.height,
                name: template.layout.projectInput.name,
                backgroundColor: template.layout.projectInput.backgroundColor,
                borderColor: template.layout.projectInput.borderColor,
                borderRadius: template.layout.projectInput.borderRadius,
                fields: [
                  { type: 'text-area', label: 'Project Brief', placeholder: 'Enter your project brief or requirements...' },
                  { type: 'file-upload', label: 'Site Images & Documents', accept: 'image/*,.pdf' }
                ]
              },
              {
                id: uuidv4(),
                type: 'design-tools',
                x: template.layout.designTools.x,
                y: template.layout.designTools.y,
                width: template.layout.designTools.width,
                height: template.layout.designTools.height,
                name: template.layout.designTools.name,
                backgroundColor: template.layout.designTools.backgroundColor,
                borderColor: template.layout.designTools.borderColor,
                borderRadius: template.layout.designTools.borderRadius,
                tools: [
                  { id: 'floor-plan', name: '2D Floor Plan', icon: '📐' },
                  { id: '3d-sketch', name: '3D Sketch', icon: '🎨' },
                  { id: 'site-analysis', name: 'Site Analysis', icon: '📊' }
                ]
              },
              {
                id: uuidv4(),
                type: 'generated-output',
                x: template.layout.generatedOutput.x,
                y: template.layout.generatedOutput.y,
                width: template.layout.generatedOutput.width,
                height: template.layout.generatedOutput.height,
                name: '',
                backgroundColor: '#FFFFFF',
                borderColor: '#E5E7EB',
                borderRadius: 8
              }
            ]
          }
        };

        // Add the container group to elements and canvas stack
        setElements(prev => [...prev, mainContainer]);
        setCanvasStack(prev => prev.map(canvas => 
          canvas.id === currentCanvas.id 
            ? { ...canvas, elements: [...canvas.elements, mainContainer.id] }
            : canvas
        ));

        setTool('mouse');
        setSelectedTool('mouse');
        setSelectedTemplateId(null);
        return;
      } else {
        // Handle other templates as before
        const containerId = uuidv4();
        const newContainer: CommentElement = {
          id: containerId,
          type: 'container',
          x: pos.x,
          y: pos.y,
          width: template.width || 300,
          height: template.height || 200,
          text: template.name || 'Container',
          targetId: '',
          canvasId: currentCanvas.id,
          rotation: 0,
          backgroundColor: template.backgroundColor || '#FFFFFF',
          borderColor: template.borderColor || '#E5E7EB'
        };
        
        setElements(prev => [...prev, newContainer]);
        setCanvasStack(prev => prev.map(canvas => 
          canvas.id === currentCanvas.id 
            ? { ...canvas, elements: [...canvas.elements, newContainer.id] }
            : canvas
        ));
        
        setSelectedId(containerId);
      }
      
      setTool('mouse');
      setSelectedTool('mouse');
      setSelectedTemplateId(null);
      return;
    }

    // Handle board creation
    if (tool === 'board' && isClickOnStage) {
      console.log('Creating new board at position:', pos);
      const boardId = uuidv4();
      const newBoard: BoardElement = {
        id: boardId,
        type: 'board',
        x: pos.x,
        y: pos.y,
        width: 300,  // Increased default width
        height: 200, // Increased default height
        name: 'New Board',
        canvasId: currentCanvas.id,
        elements: [],
        rotation: 0,  // Add rotation property
        draggable: true,  // Make it draggable
        resizable: true   // Make it resizable
      };
      
      console.log('New board data:', newBoard);
      
      setElements(prev => {
        const updated = [...prev, newBoard];
        console.log('Updated elements:', updated);
        return updated;
      });
      
      setCanvasStack(prev => {
        const updated = prev.map(canvas => 
          canvas.id === currentCanvas.id 
            ? { ...canvas, elements: [...canvas.elements, newBoard.id] }
            : canvas
        );
        console.log('Updated canvas stack:', updated);
        return updated;
      });
      
      setSelectedId(boardId); // Select the board immediately after creation
      setTool('mouse'); // Switch back to mouse tool
      setSelectedTool('mouse');
      return;
    }

    // Handle other tools
    if (isClickOnStage) {
      switch (tool) {
        case 'draw':
          setIsDrawing(true);
          const newLine = {
            points: [pos.x, pos.y],
            color: strokeColor,
            width: strokeWidth,
          };
          setCurrentLine(newLine);
          setLines(prev => [...prev, newLine]);
          break;

        case 'todo':
          const newSticky: TextElement = {
            id: Date.now().toString(),
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: 'Double click to edit',
            fontSize: 16,
            fill: '#F59E0B',
            width: 150,
            height: 150,
            backgroundColor: '#FEF3C7',
            rotation: 0,
            isSticky: true,
            canvasId: currentCanvas.id
          };
          setElements(prev => [...prev, newSticky]);
          setCanvasStack(prev => prev.map(canvas => 
            canvas.id === currentCanvas.id 
              ? { ...canvas, elements: [...canvas.elements, newSticky.id] }
              : canvas
          ));
          break;

        case 'text':
          const textElement: TextElement = {
            id: Date.now().toString(),
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: 'Double click to edit',
            fontSize: 16,
            fill: '#000000',
            width: 200,
            height: 30,
            canvasId: currentCanvas.id
          };
          setElements(prev => [...prev, textElement]);
          setCanvasStack(prev => prev.map(canvas => 
            canvas.id === currentCanvas.id 
              ? { ...canvas, elements: [...canvas.elements, textElement.id] }
              : canvas
          ));
          break;

        default:
          setSelectedId(null);
          break;
      }
      return;
    }

    // Handle element selection
    const elementId = e.target.parent?.attrs?.id || e.target.attrs?.id;
    const element = elements.find(el => el.id === elementId);

    if (element) {
      if (tool === 'trash') {
        setElements(prev => prev.filter(el => el.id !== elementId));
        setSelectedId(null);
      } else {
        setSelectedId(elementId);
      }
    }
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    
    if (tool === 'mouse') {
      setIsDraggingCanvas(false);
      if (stage) {
        stage.container().style.cursor = 'default';
      }
    }

    if (isDrawing && currentLine) {
      // Reset drawing state
      setCurrentLine(null);
      setIsDrawing(false);

      // If not in drawing mode, switch back to mouse tool
      if (!drawingMode) {
        setTool('mouse');
        setSelectedTool('mouse');
      }
    }
  };

  const handleMouseLeave = () => {
    const stage = stageRef.current;
    
    if (isDrawing && currentLine) {
      // Save the current line when leaving the canvas
      setLines(prev => [...prev, currentLine]);
    setCurrentLine(null);
      setIsDrawing(false);
    }
    
    setIsDraggingCanvas(false);
    if (stage && tool === 'mouse') {
      stage.container().style.cursor = 'default';
    }
  };

  const handleStageMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Set the cursor based on the current tool and dragging state
    if (tool === 'mouse') {
      stage.container().style.cursor = isDraggingCanvas ? 'grabbing' : 'default';
    } else if (tool === 'draw') {
      stage.container().style.cursor = 'crosshair';
    } else {
      stage.container().style.cursor = 'default';
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition()?.x || 0,
      y: stage.getPointerPosition()?.y || 0,
    };

    let newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    newScale = Math.max(0.1, Math.min(10, newScale));

    setScale(newScale);
    setPosition({
      x: mousePointTo.x - (mousePointTo.x - stage.x()) * (newScale / oldScale),
      y: mousePointTo.y - (mousePointTo.y - stage.y()) * (newScale / oldScale),
    });
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    setSelectedId(id);
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setElements(
      elements.map((el) => {
        if (el.id === node.id()) {
          return {
            ...el,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
          };
        }
        return el;
      })
    );
  };

  const handleMoveNote = (id: string, x: number, y: number) => {
    setStickyNotes(prev => 
      prev.map(note => 
        note.id === id ? { ...note, x, y } : note
      )
    );
  };

  const handleUpdateNote = (id: string, content: string, style: any) => {
    setStickyNotes(prev => 
      prev.map(note => 
        note.id === id ? { ...note, content, style } : note
      )
    );
  };

  const handleCloseNote = (id: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleToolSelect = (toolId: Tool, templateId?: string) => {
    console.log('Tool selected:', toolId, 'Template:', templateId, 'Current tool:', selectedTool);
    
    if (toolId === 'container' && templateId) {
      setSelectedTemplateId(templateId);
      setSelectedTool(toolId);
      setTool(toolId);
      return;
    }
    
    // If clicking the currently selected tool, switch back to mouse tool
    if (toolId === selectedTool) {
      console.log('Switching back to mouse tool');
      setSelectedTool('mouse');
      setTool('mouse');
      setDrawingMode(false);
      return;
    }

    console.log('Setting new tool:', toolId);
    setSelectedTool(toolId);
    setTool(toolId);
    
    if (toolId === 'draw') {
      setDrawingMode(true);
    } else {
      setDrawingMode(false);
    }
    
    // Handle special cases
    if (toolId === 'trash') {
      setSelectedId(null);
    }
  };

  // Update the getContainerTemplate function return type
  const getContainerTemplate = (templateId: string): ConceptDevelopmentTemplate | {
    width: number;
    height: number;
    name: string;
    backgroundColor: string;
    borderColor: string;
  } => {
    switch (templateId) {
      case 'concept-development':
        return {
          width: 1200,
          height: 800,
          name: 'Concept Development',
          backgroundColor: '#FFFFFF',
          borderColor: '#E5E7EB',
          layout: {
            projectInput: {
              x: 0,
              y: 0,
              width: 400,
              height: 700,
              name: '',
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderRadius: 8
            },
            designTools: {
              x: 450,
              y: 0,
              width: 700,
              height: 400,
              name: '',
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderRadius: 8
            },
            generatedOutput: {
              x: 450,
              y: 450,
              width: 700,
              height: 250,
              name: '',
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderRadius: 8
            }
          }
        };
      case 'design-exploration':
        return {
          width: 600,
          height: 400,
          name: 'Design Exploration',
          backgroundColor: '#EEF2FF',
          borderColor: '#6366F1'
        };
      case 'visual-presentation':
        return {
          width: 600,
          height: 400,
          name: 'Visual Presentation',
          backgroundColor: '#F0FDF4',
          borderColor: '#22C55E'
        };
      case 'custom':
        return {
          width: 400,
          height: 300,
          name: 'Custom Template',
          backgroundColor: '#FDF2F8',
          borderColor: '#EC4899'
        };
      default:
        return {
          width: 300,
          height: 200,
          name: 'Container',
          backgroundColor: '#F9FAFB',
          borderColor: '#D1D5DB'
        };
    }
  };

  const handleBoardDoubleClick = (boardElement: BoardElement) => {
    console.log('Board double clicked:', boardElement);
    
    // Find the canvas data for this board
    const boardCanvas = canvasStack.find(canvas => 
      canvas.parentId === currentCanvas.id && 
      canvas.name === boardElement.name
    );
    
    if (!boardCanvas) {
      console.log('Creating new canvas for board');
      // If canvas doesn't exist yet, create it
      const newCanvas: CanvasData = {
        id: uuidv4(),
        name: boardElement.name,
        elements: [],
        parentId: currentCanvas.id
      };
      
      setCanvasStack(prev => {
        const newStack = [...prev, newCanvas];
        // Navigate to the new canvas by setting its index
        setCurrentCanvasIndex(newStack.length - 1);
        return newStack;
      });
    } else {
      // Navigate to existing canvas
      const index = canvasStack.findIndex(c => c.id === boardCanvas.id);
      console.log('Navigating to existing canvas:', index);
      setCurrentCanvasIndex(index);
    }

    setSelectedId(null);
  };

  // Update the getBreadcrumbPath function to handle undefined cases
  const getBreadcrumbPath = () => {
    const path: CanvasData[] = [];
    let current = currentCanvas;
    
    while (current) {
      path.unshift(current);
      if (!current.parentId) break;
      const next = canvasStack.find(c => c.id === current.parentId);
      if (!next) break;
      current = next;
    }
    
    return path;
  };

  const handleBoardNameChange = (boardId: string, newName: string) => {
    console.log('Canvas: Updating board name:', { boardId, newName });
    
    // Update the board element
    setElements(prev => prev.map(el => 
      el.id === boardId 
        ? { ...el, name: newName }
        : el
    ));
    
    // Find and update the associated canvas
    const boardElement = elements.find(el => el.id === boardId) as BoardElement;
    if (boardElement) {
      setCanvasStack(prev => prev.map(canvas => {
        // Update canvas if it's associated with this board
        if (canvas.parentId === currentCanvas.id && canvas.name === boardElement.name) {
          return { ...canvas, name: newName };
        }
        return canvas;
      }));
    }
  };

  // Update handleBackToParent to include safety check
  const handleBackToParent = () => {
    if (!currentCanvas?.parentId) return;
    
    // Find parent canvas index
    const parentIndex = canvasStack.findIndex(canvas => canvas.id === currentCanvas.parentId);
    if (parentIndex === -1) return;

    setCurrentCanvasIndex(parentIndex);
  };

  // Calculate the grid size based on scale
  const gridSize = 20; // Base size of grid spacing
  
  // Create grid pattern
  const renderGrid = () => {
    const dots = [];
    const width = dimensions.width - (isChatOpen ? 400 : 0);
    const height = dimensions.height;
    
    // Calculate visible area based on position and scale
    const viewportLeft = -position.x / scale;
    const viewportTop = -position.y / scale;
    const viewportRight = (width - position.x) / scale;
    const viewportBottom = (height - position.y) / scale;

    // Add small buffer to prevent popping at edges
    const buffer = 100;
    const startX = Math.floor((viewportLeft - buffer) / 16) * 16;
    const endX = Math.ceil((viewportRight + buffer) / 16) * 16;
    const startY = Math.floor((viewportTop - buffer) / 16) * 16;
    const endY = Math.ceil((viewportBottom + buffer) / 16) * 16;

    // Calculate dot size and spacing based on zoom level
    let dotSize;
    let dotSpacing;
    if (scale >= 4) {
      dotSize = 1.5;
      dotSpacing = 32;
    } else if (scale >= 2) {
      dotSize = 1.25;
      dotSpacing = 32;
    } else if (scale >= 1) {
      dotSize = 1;
      dotSpacing = 32;
    } else if (scale >= 0.5) {
      dotSize = 0.75;
      dotSpacing = 48;
    } else {
      dotSize = 0.5;
      dotSpacing = 64;
    }

    // Calculate opacity based on zoom level
    const opacity = scale < 0.2 ? 0.15 : scale < 0.5 ? 0.2 : 0.25;

    // Create dots only for visible area with spacing
    for (let x = startX; x <= endX; x += dotSpacing) {
      for (let y = startY; y <= endY; y += dotSpacing) {
        dots.push(
          <Circle
            key={`${x}-${y}`}
            x={x}
            y={y}
            radius={dotSize}
            fill="#000000"
            opacity={opacity}
            perfectDrawEnabled={false}
            listening={false}
            hitStrokeWidth={0}
          />
        );
      }
    }

    return dots;
  };

  const exportDrawing = async () => {
    if (!drawingGroups.length) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Create a temporary canvas for the drawing
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size to match drawing bounds
    canvas.width = drawingGroups[0].width;
    canvas.height = drawingGroups[0].height;

    // Draw white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all lines
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    drawingGroups.forEach((group) => {
      group.lines.forEach((line) => {
        context.beginPath();
        context.moveTo(line.points[0] - group.x, line.points[1] - group.y);
        for (let i = 2; i < line.points.length; i += 2) {
          context.lineTo(line.points[i] - group.x, line.points[i + 1] - group.y);
        }
        context.stroke();
      });
    });

    // Convert to blob and create file
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    const file = new File([blob], 'sketch.png', { type: 'image/png' });

    // Here you can handle the file (e.g., send to AI for analysis or to Automatic1111)
    console.log('Drawing exported as file:', file);
  };

  const handleGroupSelect = (e: KonvaEventObject<MouseEvent>) => {
    const groupId = e.target.parent?.id();
    if (groupId) {
      setSelectedGroupId(groupId);
      setSelectedId(null);
    }
  };

  const handleGroupTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const groupId = node.id();
    
    setDrawingGroups(drawingGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        };
      }
      return group;
    }));
  };

  const handleDrawingSave = () => {
    if (lines.length === 0) return;

    // Calculate the bounds of all lines
    const allPoints = lines.flatMap(line => line.points);
    const minX = Math.min(...allPoints.filter((_, i) => i % 2 === 0));
    const maxX = Math.max(...allPoints.filter((_, i) => i % 2 === 0));
    const minY = Math.min(...allPoints.filter((_, i) => i % 2 === 1));
    const maxY = Math.max(...allPoints.filter((_, i) => i % 2 === 1));

    // Create a new drawing group
    const newGroup: DrawingGroup = {
      id: `group-${Date.now()}`,
      lines: [...lines],
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };

    setDrawingGroups([...drawingGroups, newGroup]);
    setLines([]); // Clear the lines
    setDrawingMode(false);
    setTool('mouse');
    setSelectedTool('mouse');
  };

  const handleDrawingDiscard = () => {
    setLines([]);
    setDrawingMode(false);
    setTool('mouse');
    setSelectedTool('mouse');
  };

  const handlePromptGenerate = async (id: string, prompt: string) => {
    // Update status to generating
    setPromptElements(prev => 
      prev.map(el => 
        el.id === id 
          ? { ...el, status: 'generating' as const } 
          : el
      )
    );

    try {
      const promptElement = promptElements.find(el => el.id === id);
      if (!promptElement) throw new Error('Prompt element not found');

      // Prepare the request body
      const requestBody = {
        prompt,
        ...(promptElement.controlNetFile && {
          controlNetFile: promptElement.controlNetFile
        })
      };

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      
      // Update element with generated image
      setPromptElements(prev => 
        prev.map(el => 
          el.id === id 
            ? { ...el, status: 'complete' as const, generatedImage: data.imageUrl } 
            : el
        )
      );
    } catch (error) {
      console.error('Error generating image:', error);
      showNotification('error', 'Generation Failed', 'Failed to generate image from prompt');
      
      // Reset status
      setPromptElements(prev => 
        prev.map(el => 
          el.id === id 
            ? { ...el, status: 'idle' as const } 
            : el
        )
      );
    }
  };

  const handlePromptUpdate = (id: string, prompt: string) => {
    setPromptElements(prev => 
      prev.map(el => 
        el.id === id 
          ? { ...el, prompt } 
          : el
      )
    );
  };

  const handlePromptDrag = (e: React.MouseEvent<HTMLDivElement>, promptId: string) => {
    if (e.button !== 0) return; // Only handle left click

    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const prompt = promptElements.find(p => p.id === promptId);
    if (!prompt) return;

    const startPos = { ...prompt.position };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      setPromptElements(prev => prev.map(p => 
        p.id === promptId 
          ? { ...p, position: { x: startPos.x + dx, y: startPos.y + dy } }
          : p
      ));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
        const img = new window.Image();
          img.onload = () => {
            console.log('Image loaded successfully:', {
              width: img.width,
              height: img.height,
              src: img.src
            });

            // Calculate the position relative to the stage
            const stage = stageRef.current;
            if (!stage) {
              console.error('Stage not found');
              return;
            }

            const stagePoint = stage.getPointerPosition();
            if (!stagePoint) {
              console.error('Stage point not found');
              return;
            }

            // Convert screen coordinates to stage coordinates
            const x = (stagePoint.x - position.x) / scale;
            const y = (stagePoint.y - position.y) / scale;

            console.log('Drop coordinates:', {
              stagePoint,
              position,
              scale,
              calculatedX: x,
              calculatedY: y,
              imageWidth: img.width,
              imageHeight: img.height
            });

            // Create a new element with the loaded image
            const newElement: UploadedElement = {
          id: `uploaded-${Date.now()}`,
              type: 'upload',
              x: x - img.width / 2,
              y: y - img.height / 2,
              width: img.width,
              height: img.height,
          rotation: 0,
              image: img,
              file: file,
              canvasId: currentCanvas.id
            };

            console.log('New element created:', newElement);
            
            // Add the element to both the elements array and the canvas stack
            setElements(prev => {
              const newElements = [...prev, newElement];
              console.log('Updated elements array:', newElements);
              return newElements;
            });

            // Update the canvas stack to include the new element
            setCanvasStack(prev => prev.map(canvas => 
              canvas.id === currentCanvas.id 
                ? { ...canvas, elements: [...canvas.elements, newElement.id] }
                : canvas
            ));

            // Save the project data immediately
            handleSave();
          };

          img.onerror = (error) => {
            console.error('Error loading image:', error);
          };

          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleElementHover = (e: KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'prompt') return;
    
    const target = e.target;
    const element = elements.find(el => el.id === target.id() || el.id === target.parent?.id());
    
    if (element && (element.type === 'upload' || element.type === 'generated')) {
      console.log('Hovering over element:', element.id);
      setElements(prev => prev.map(el => {
        if (el.id === element.id) {
          return { ...el, isHovered: true };
        }
        return el;
      }));
    }
  };

  const handleElementLeave = (e: KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'prompt') return;
    
    const target = e.target;
    const element = elements.find(el => el.id === target.id() || el.id === target.parent?.id());
    
    if (element && (element.type === 'upload' || element.type === 'generated')) {
      console.log('Leaving element:', element.id);
      setElements(prev => prev.map(el => {
        if (el.id === element.id) {
          return { ...el, isHovered: false };
        }
        return el;
      }));
    }
  };

  const handleElementChange = (id: string, newAttrs: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        const width = el.width !== undefined ? el.width : (newAttrs.width || el.width);
        const height = el.height !== undefined ? el.height : (newAttrs.height || el.height);
        return { ...el, ...newAttrs, width, height } as CanvasElement;
      }
      return el;
    }));
  };

  const handleBoardDelete = (boardId: string) => {
    // Find the board element
    const boardElement = elements.find(el => el.id === boardId) as BoardElement;
    if (!boardElement) return;

    // Find and remove the associated canvas
    const boardCanvas = canvasStack.find(canvas => 
      canvas.parentId === currentCanvas.id && 
      canvas.name === boardElement.name
    );

    setElements(prev => prev.filter(el => el.id !== boardId));
    
    if (boardCanvas) {
      setCanvasStack(prev => prev.filter(canvas => canvas.id !== boardCanvas.id));
    }

    // Update current canvas elements
    setCanvasStack(prev => prev.map(canvas => 
      canvas.id === currentCanvas.id 
        ? { ...canvas, elements: canvas.elements.filter(id => id !== boardId) }
        : canvas
    ));

    setSelectedId(null);
    setBoardToDelete(null); // Reset the board to delete
  };

  // Update the renderElement function to handle the new container types
  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'board': {
        const boardElement = element as BoardElement;
        const isSelected = selectedId === boardElement.id;
        const shapeRef = useRef<Konva.Group>(null);
        const trRef = useRef<Konva.Transformer>(null);

        useEffect(() => {
          if (isSelected && shapeRef.current && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
          }
        }, [isSelected]);

        return (
          <>
            <Group
              key={boardElement.id}
              id={boardElement.id}
              x={boardElement.x}
              y={boardElement.y}
              width={boardElement.width}
              height={boardElement.height}
              draggable={tool === 'mouse'}
              ref={shapeRef}
              onClick={() => setSelectedId(boardElement.id)}
              onDragStart={handleDragStart}
              onDragEnd={(e) => {
                const node = e.target;
                setElements(prev => prev.map(el => 
                  el.id === node.id() 
                    ? { ...el, x: node.x(), y: node.y() }
                    : el
                ));
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                node.scaleX(1);
                node.scaleY(1);
                
                setElements(prev => prev.map(el => 
                  el.id === node.id() 
                    ? {
                        ...el,
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(node.width() * scaleX, 100),
                        height: Math.max(node.height() * scaleY, 100),
                        rotation: node.rotation()
                      }
                    : el
                ));
              }}
            >
              <Board
                id={boardElement.id}
                x={0}
                y={0}
                width={boardElement.width}
                height={boardElement.height}
                name={boardElement.name}
                isSelected={isSelected}
                onNameChange={(newName) => handleBoardNameChange(boardElement.id, newName)}
                onDelete={() => setBoardToDelete({ id: boardElement.id, name: boardElement.name })}
                activeTool={tool}
                onSelect={() => setSelectedId(boardElement.id)}
                onChange={(attrs) => handleElementChange(boardElement.id, attrs)}
                onDoubleClick={() => handleBoardDoubleClick(boardElement)}
              />
            </Group>
            {isSelected && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  const minWidth = 100;
                  const minHeight = 100;
                  if (newBox.width < minWidth || newBox.height < minHeight) {
                    return oldBox;
                  }
                  return newBox;
                }}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                rotateEnabled={true}
                keepRatio={false}
                padding={5}
                anchorSize={10}
                anchorCornerRadius={5}
                borderStroke="#814ADA"
                anchorStroke="#814ADA"
                anchorFill="#fff"
              />
            )}
          </>
        );
      }
      case 'text': {
        const textElement = element as TextElement;
        return (
          <KonvaText
            text={textElement.text}
            x={textElement.x}
            y={textElement.y}
            width={textElement.width}
            height={textElement.height}
            fontSize={textElement.fontSize}
            fill={textElement.fill}
            backgroundColor={textElement.backgroundColor}
            isSticky={textElement.isSticky}
          />
        );
      }
      case 'generated': {
        const genImage = element as GeneratedImageElement;
        const image = genImage.image || new window.Image();
        if (!genImage.image) {
          image.src = genImage.src;
        }
        return (
            <KonvaImage
            image={image}
            x={genImage.x}
            y={genImage.y}
            width={genImage.width}
            height={genImage.height}
          />
        );
      }
      case 'upload': {
        const uploadImage = element as UploadedElement;
        return (
          <KonvaImage
            image={uploadImage.image}
            x={uploadImage.x}
            y={uploadImage.y}
            width={uploadImage.width}
            height={uploadImage.height}
          />
        );
      }
      case 'container': {
        const containerElement = element as CommentElement;
        const isTemplateGroup = containerElement.content?.type === 'template-group';
        
        if (isTemplateGroup && containerElement.content?.containers) {
          return (
            <Group
              x={containerElement.x}
              y={containerElement.y}
              width={containerElement.width}
              height={containerElement.height}
              draggable={tool === 'mouse'}
              onClick={() => setSelectedId(containerElement.id)}
              onDragStart={handleDragStart}
              onDragEnd={(e) => {
                const node = e.target;
                setElements(prev => prev.map(el => 
                  el.id === containerElement.id 
                    ? { ...el, x: node.x(), y: node.y() }
                    : el
                ));
              }}
            >
              {containerElement.content.containers.map((container) => (
                <Group key={container.id}>
                  {/* Drop Shadow Effect */}
                  <Rect
                    x={container.x + 4}
                    y={container.y + 4}
                    width={container.width}
                    height={container.height}
                    fill="#000000"
                    opacity={0.04}
                    cornerRadius={16}
                    shadowBlur={10}
                    shadowColor="rgba(0, 0, 0, 0.1)"
                    shadowOffset={{ x: 0, y: 2 }}
                    shadowOpacity={0.5}
                  />
                  {/* Main Container */}
                  <Rect
                    x={container.x}
                    y={container.y}
                    width={container.width}
                    height={container.height}
                    fill="#FFFFFF"
                    stroke="#E0DAF3"
                    strokeWidth={2}
                    cornerRadius={16}
                    shadowBlur={8}
                    shadowColor="rgba(0, 0, 0, 0.06)"
                    shadowOffset={{ x: 0, y: 1 }}
                    shadowOpacity={0.3}
                  />
                  {container.name && (
                    <KonvaText
                      x={container.x + 16}
                      y={container.y + 16}
                      text={container.name}
                      fontSize={18}
                      fontFamily="Inter"
                      fill="#1E293B"
                      width={container.width - 32}
                      height={30}
                      wrap="word"
                      align="left"
                    />
                  )}
                  {container.type === 'project-input' && container.fields && (
                    <Group>
                      {/* Project Brief Section */}
                      <Group>
                        {/* Project Brief Header */}
                        <KonvaText
                          x={container.x + 24}
                          y={container.y + 24}
                          text="Project Brief"
                          fontSize={18}
                          fontFamily="Inter"
                          fill="#1E293B"
                          fontStyle="600"
                        />

                        <Rect
                          x={container.x + 24}
                          y={container.y + 72}
                          width={container.width - 48}
                          height={180}
                          fill="#FFFFFF"
                          stroke="#E0DAF3"
                          cornerRadius={16}
                        />
                        <KonvaText
                          x={container.x + 40}
                          y={container.y + 112}
                          text="Enter your project brief or requirements..."
                          fontSize={16}
                          fontFamily="Inter"
                          fill="#9CA3AF"
                        />
                      </Group>

                      {/* Upload Files Section */}
                      <Group>
                        <KonvaText
                          x={container.x + 24}
                          y={container.y + 288}
                          text="Upload Files"
                          fontSize={18}
                          fontFamily="Inter"
                          fill="#1E293B"
                          fontStyle="600"
                        />
                        <Rect
                          x={container.x + 24}
                          y={container.y + 336}
                          width={container.width - 48}
                          height={200}
                          fill="#FFFFFF"
                          stroke="#E0DAF3"
                          cornerRadius={16}
                          dash={[8, 8]}
                        />
                        
                        {/* Upload Icon */}
                        <Path
                          x={container.x + (container.width / 2) - 12}
                          y={container.y + 396}
                          data="M19 7v3h-2V7h-3V5h3V2h2v3h3v2h-3zm-3 11h8v-7h2v7c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-7h2v7z"
                          fill="#1E293B"
                          scaleX={1.2}
                          scaleY={1.2}
                        />

                        {/* Combined Upload Text */}
                        <KonvaText
                          x={container.x + 24}
                          y={container.y + 436}
                          width={container.width - 48}
                          text="Upload files or drag and drop"
                          fontSize={16}
                          fontFamily="Inter"
                          fill="#1E293B"
                          align="center"
                        />

                        {/* File Type Info */}
                        <KonvaText
                          x={container.x + 24}
                          y={container.y + 466}
                          width={container.width - 48}
                          text="PDF, images, or other documents up to 10MB"
                          fontSize={14}
                          fontFamily="Inter"
                          fill="#6B7280"
                          align="center"
                        />

                        {/* Save Input Button - Now at the bottom */}
                        <Group>
                          <Rect
                            x={container.x + container.width - 120}
                            y={container.y + 560}
                            width={96}
                            height={32}
                            fill="#814ADA"
                            cornerRadius={6}
                            shadowColor="rgba(0, 0, 0, 0.1)"
                            shadowBlur={4}
                            shadowOffset={{ x: 0, y: 2 }}
                            shadowOpacity={0.5}
                          />
                          <KonvaText
                            x={container.x + container.width - 120}
                            y={container.y + 560}
                            width={96}
                            height={32}
                            text="Save Input"
                            fontSize={14}
                            fontFamily="Inter"
                            fill="#FFFFFF"
                            align="center"
                            verticalAlign="middle"
                          />
                        </Group>
                      </Group>
                    </Group>
                  )}
                  {container.type === 'design-tools' && (
                    <Group>
                      {/* Tabs Container */}
                      <Group>
                        {['Site Analysis', 'Case Studies', 'Concept'].map((tab, index) => (
                          <Group key={tab}>
                            {/* Tab Background */}
                            <Rect
                              x={container.x + (index * (container.width / 3))}
                              y={container.y + 24}
                              width={container.width / 3}
                              height={40}
                              fill={index === 0 ? '#F5F3FF' : '#FFFFFF'}
                              cornerRadius={8}
                            />
                            {/* Tab Text */}
                            <KonvaText
                              x={container.x + (index * (container.width / 3))}
                              y={container.y + 34}
                              width={container.width / 3}
                              text={tab}
                              fontSize={14}
                              fontFamily="Inter"
                              fill={index === 0 ? '#814ADA' : '#6B7280'}
                              align="center"
                              verticalAlign="middle"
                            />
                          </Group>
                        ))}
                      </Group>

                      {/* Site Analysis Content */}
                      <Group y={80}>
                        {/* Description Input Box */}
                        <Rect
                          x={container.x + 24}
                          y={container.y}
                          width={container.width - 48}
                          height={60}
                          fill="#FFFFFF"
                          stroke="#E0DAF3"
                          cornerRadius={8}
                        />
                        <KonvaText
                          x={container.x + 40}
                          y={container.y + 16}
                          text="Describe your site..."
                          fontSize={14}
                          fontFamily="Inter"
                          fill="#9CA3AF"
                        />

                        {/* Color-coded Tags with dynamic row wrapping */}
                        <Group>
                          {(() => {
                            interface Tag {
                              tag: string;
                              color: string;
                              textColor: string;
                              x?: number;
                            }

                            const tags: Tag[] = [
                              { tag: 'Enclosed', color: '#ECFDF5', textColor: '#047857' },
                              { tag: 'Permeable', color: '#FEFCE8', textColor: '#854D0E' },
                              { tag: 'Layered', color: '#F0F9FF', textColor: '#075985' },
                              { tag: 'Intimate', color: '#FFF7ED', textColor: '#9A3412' },
                              { tag: 'Ethereal', color: '#ECFDF5', textColor: '#047857' },
                              { tag: 'Dynamic', color: '#FEFCE8', textColor: '#854D0E' },
                              { tag: 'Serene', color: '#F0F9FF', textColor: '#075985' },
                              { tag: 'Textured', color: '#FFF7ED', textColor: '#9A3412' }
                            ];

                            const rows: Tag[][] = [[]];
                            let currentRow = 0;
                            let currentX = 24;

                            tags.forEach((tag) => {
                              const tagWidth = tag.tag.length * 8 + 32;
                              
                              if (currentX + tagWidth > container.width - 48) {
                                currentRow++;
                                currentX = 24;
                                rows[currentRow] = [];
                              }
                              
                              if (!rows[currentRow]) {
                                rows[currentRow] = [];
                              }
                              
                              rows[currentRow].push({
                                ...tag,
                                x: currentX
                              });
                              
                              currentX += tagWidth + 12;
                            });

                            return rows.map((row, rowIndex) => 
                              row.map((item) => (
                                <Group key={`${rowIndex}-${item.tag}`}>
                                  <Rect
                                    x={container.x + (item.x || 0)}
                                    y={container.y + 80 + (rowIndex * 36)}
                                    width={item.tag.length * 8 + 32}
                                    height={28}
                                    fill={item.color}
                                    stroke={item.textColor}
                                    strokeWidth={1}
                                    cornerRadius={14}
                                  />
                                  <KonvaText
                                    x={container.x + (item.x || 0) + 16}
                                    y={container.y + 80 + (rowIndex * 36)}
                                    width={item.tag.length * 8}
                                    height={28}
                                    text={item.tag}
                                    fontSize={12}
                                    fontFamily="Inter"
                                    fill={item.textColor}
                                    align="left"
                                    verticalAlign="middle"
                                  />
                                </Group>
                              ))
                            );
                          })()}
                        </Group>

                        {/* Bottom Controls Group */}
                        <Group y={200}>
                          {/* Abstraction Level Slider - Left Side */}
                          <Group>
                            {/* Slider Heading */}
                            <KonvaText
                              x={container.x + 24}
                              y={container.y}
                              text="How abstract do you want your site statement?"
                              fontSize={14}
                              fontFamily="Inter"
                              fill="#4B5563"
                              fontStyle="500"
                            />

                            {/* Purple Track Background */}
                            <Rect
                              x={container.x + 24}
                              y={container.y + 36}
                              width={300}
                              height={4}
                              fill="#E5E7EB"
                              cornerRadius={2}
                            />
                            
                            {/* Purple Active Track */}
                            <Rect
                              x={container.x + 24}
                              y={container.y + 36}
                              width={150}
                              height={4}
                              fill="#814ADA"
                              cornerRadius={2}
                            />
                            
                            {/* Purple Handle */}
                            <Circle
                              x={container.x + 174}
                              y={container.y + 38}
                              radius={12}
                              fill="#814ADA"
                            />

                            {/* Icons and Labels */}
                            <Group x={container.x + 24} y={container.y + 52}>
                              <KonvaText
                                text="✏️"
                                fontSize={16}
                                y={2}
                              />
                              <KonvaText
                                x={24}
                                text="Literal"
                                fontSize={14}
                                fontFamily="Inter"
                                fill="#6B7280"
                              />
                              <KonvaText
                                x={132}
                                text="Balanced"
                                fontSize={14}
                                fontFamily="Inter"
                                fill="#6B7280"
                              />
                              <KonvaText
                                x={240}
                                text="✨"
                                fontSize={16}
                                y={2}
                              />
                              <KonvaText
                                x={264}
                                text="Poetic"
                                fontSize={14}
                                fontFamily="Inter"
                                fill="#6B7280"
                              />
                            </Group>
                          </Group>

                          {/* Generate Button - Right Side */}
                          <Group x={container.x + container.width - 224}>
                            <Rect
                              x={0}
                              y={container.y + 24}
                              width={200}
                              height={36}
                              fill="#814ADA"
                              cornerRadius={18}
                              shadowColor="rgba(0, 0, 0, 0.1)"
                              shadowBlur={4}
                              shadowOffset={{ x: 0, y: 2 }}
                              shadowOpacity={0.5}
                            />
                            <KonvaText
                              x={0}
                              y={container.y + 24}
                              width={200}
                              height={36}
                              text="Generate Site Statement"
                              fontSize={14}
                              fontFamily="Inter"
                              fill="#FFFFFF"
                              align="center"
                              verticalAlign="middle"
                            />
                          </Group>
                        </Group>
                      </Group>
                    </Group>
                  )}
                  {container.type === 'generated-output' && (
                    <Group>
                      {/* Dotted Frame */}
                      <Rect
                        x={container.x + 24}
                        y={container.y + 24}
                        width={container.width - 48}
                        height={container.height - 48}
                        stroke="#9CA3AF"
                        strokeWidth={2}
                        dash={[6, 6]}
                        cornerRadius={8}
                      />
                      
                      {/* Placeholder Text */}
                      <KonvaText
                        x={container.x + 24}
                        y={container.y + (container.height - 48) / 2}
                        width={container.width - 48}
                        text="Generated content will appear here"
                        fontSize={14}
                        fontFamily="Inter"
                        fill="#6B7280"
                        align="center"
                      />
                    </Group>
                  )}
                </Group>
              ))}
            </Group>
          );
        }
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={containerElement.width}
              height={containerElement.height}
              fill={containerElement.backgroundColor || '#FFFFFF'}
              stroke={containerElement.borderColor || '#E5E7EB'}
              strokeWidth={2}
              cornerRadius={containerElement.borderRadius || 8}
            />
            <KonvaText
              x={16}
              y={16}
              text={containerElement.text}
              fontSize={18}
              fontFamily="Inter"
              fill="#4A1D96" // Dark purple for headings
              width={containerElement.width - 32}
              height={30}
              wrap="word"
              align="left"
            />
            {containerElement.content?.type === 'project-input' && (
              <Group y={56}>
                {containerElement.content.fields?.map((field, index) => (
                  <Group key={field.label} y={index * 120}>
                    <KonvaText
                      x={16}
                      y={0}
                      text={field.label}
                      fontSize={14}
                      fontFamily="Inter"
                      fill="#4A1D96"
                      width={containerElement.width - 32}
                    />
                    <Rect
                      x={16}
                      y={24}
                      width={containerElement.width - 32}
                      height={field.type === 'text-area' ? 100 : 80}
                      fill="#F9FAFB"
                      stroke="#E5E7EB"
                      cornerRadius={6}
                    />
                    <KonvaText
                      x={24}
                      y={40}
                      text={field.placeholder || ''}
                      fontSize={14}
                      fontFamily="Inter"
                      fill="#9CA3AF"
                      width={containerElement.width - 48}
                    />
                  </Group>
                ))}
              </Group>
            )}
            {containerElement.content?.type === 'design-tools' && (
              <Group>
                {containerElement.content.tools?.map((tool, index) => (
                  <Group key={tool.id} x={16 + (index * (containerElement.width - 32) / 3)} y={0}>
                    <Rect
                      width={(containerElement.width - 64) / 3}
                      height={80}
                      fill="#FFFFFF"
                      stroke="#814ADA"
                      cornerRadius={6}
                    />
                    <KonvaText
                      y={20}
                      text={tool.icon}
                      fontSize={24}
                      width={(containerElement.width - 64) / 3}
                      align="center"
                    />
                    <KonvaText
                      y={50}
                      text={tool.name}
                      fontSize={14}
                      fontFamily="Inter"
                      fill="#814ADA"
                      width={(containerElement.width - 64) / 3}
                      align="center"
                    />
                  </Group>
                ))}
              </Group>
            )}
          </Group>
        );
      }
      default:
        return null;
    }
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageUpload = async (file: File) => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>(resolve => img.onload = () => resolve());

    const uploadedElement: UploadedElement = {
      id: uuidv4(),
      type: 'upload',
      x: 100,
      y: 100,
      width: img.width,
      height: img.height,
      image: img,
      file: file,
      canvasId: currentCanvas.id,
      rotation: 0
    };

    setElements(prev => [...prev, uploadedElement]);
    setCanvasStack(prev => prev.map(canvas => 
      canvas.id === currentCanvas.id 
        ? { ...canvas, elements: [...canvas.elements, uploadedElement.id] }
        : canvas
    ));
  };

  const handlePromptSubmit = async (prompt: string, position: { x: number, y: number }) => {
    const promptElement: PromptElement = {
      id: uuidv4(),
      type: 'prompt',
      x: position.x,
      y: position.y,
      width: 300,
      height: 100,
      prompt,
      position,
      size: { width: 300, height: 100 },
      canvasId: currentCanvas.id,
      rotation: 0,
      status: 'idle'
    };

    setElements(prev => [...prev, promptElement]);
    setCanvasStack(prev => prev.map(canvas => 
      canvas.id === currentCanvas.id 
        ? { ...canvas, elements: [...canvas.elements, promptElement.id] }
        : canvas
    ));
  };

  // Update canvas name when project name changes
  useEffect(() => {
    setCanvasStack(stack => [{
      ...stack[0],
      name: projectName
    }, ...stack.slice(1)]);
  }, [projectName]);

  // Add undo/redo functions
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      const previousState = history[historyIndex - 1];
      setElements(previousState.elements);
      setCanvasStack(previousState.canvasStack);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setCanvasStack(nextState.canvasStack);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Update history when elements or canvas stack changes
  useEffect(() => {
    const newState = {
      elements: [...elements],
      canvasStack: [...canvasStack]
    };

    // Remove any future states if we're not at the end of history
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }

    // Add new state to history
    setHistory(prev => [...prev, newState]);
    setHistoryIndex(prev => prev + 1);
  }, [elements, canvasStack]);

  // Add this after other useEffect hooks
  useEffect(() => {
    if (projectId) {
      loadCollaborators();
    }
  }, [projectId]);

  const loadCollaborators = async () => {
    if (!projectId) return;
    
    try {
      const response = await fetch(`/api/collaborators?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch collaborators');
      }
      const data = await response.json();
      setCollaborators(data.collaborators || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setCollaborators([]);
    }
  };

  const handleInviteCollaborator = async (userId: string, role: 'VIEWER' | 'EDITOR') => {
    try {
      // First fetch the user's email using their ID
      const userResponse = await fetch(`/api/users/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await userResponse.json();
      
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectId, 
          email: userData.user.email, 
          role 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite collaborator');
      }

      const data = await response.json();
      setCollaborators([...collaborators, data]);
      showNotification('success', 'Collaborator invited', 'The user has been invited to collaborate on this project.');
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      showNotification('error', 'Invitation failed', 'Failed to invite collaborator. Please try again.');
    }
  };

  // Add this to the JSX, right after the HeaderActions component
  const renderCollaboratorButton = () => {
    const collaboratorCount = collaborators.length;
    const maxAvatars = 3;
    const remainingCount = Math.max(0, collaboratorCount - maxAvatars);

    return (
      <div className="relative group">
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex -space-x-2">
            {collaborators.slice(0, maxAvatars).map((collaborator) => (
              <div
                key={collaborator.id}
                className="relative w-6 h-6 rounded-full border-2 border-white overflow-hidden"
              >
                {collaborator.user.image ? (
                  <Image
                    src={collaborator.user.image}
                    alt={collaborator.user.name || 'Collaborator'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-500">
                      {collaborator.user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {remainingCount > 0 && (
            <span className="text-xs text-gray-500">+{remainingCount}</span>
        )}
          <span className="text-xs text-gray-500">
            {collaboratorCount === 1 ? '1 collaborator' : `${collaboratorCount} collaborators`}
          </span>
        </button>
      </div>
    );
  };

  const handleElementDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const element = e.target;
    const elementId = element.id();

    // If double-clicking a board element, navigate to its canvas
    if (element.attrs.type === 'board') {
      const boardElement = elements.find(el => el.id === elementId) as BoardElement;
      if (boardElement) {
        handleBoardDoubleClick(boardElement);
      }
    }
  };

  const handleAddGeneratedImage = (imageUrl: string, prompt: string) => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const newElement: GeneratedImageElement = {
        id: uuidv4(),
        type: 'generated',
        x: Math.random() * (dimensions.width - 200),
        y: Math.random() * (dimensions.height - 200),
        width: img.width,
        height: img.height,
        src: imageUrl,
        image: img,
        prompt,
        canvasId: currentCanvas.id,
        showInfo: false
      };

      setElements(prev => [...prev, newElement]);
      setCanvasStack(prev => {
        const newStack = [...prev];
        const currentCanvasData = newStack[currentCanvasIndex];
        currentCanvasData.elements = [...currentCanvasData.elements, newElement.id];
        return newStack;
      });
    };
  };

  // Add type guard
  const isImageLike = (element: CanvasElement): element is (ImageElement | UploadedElement | GeneratedImageElement) => {
    return element.type === 'image' || element.type === 'upload' || element.type === 'generated';
  };

  return (
    <div className="h-screen w-full relative bg-[#fafafa]">
      <CanvasHeader
        projectName={name}
        onInviteClick={() => setShowInviteModal(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        onSave={handleSave}
        projectId={projectId}
      />
      
      {/* Add padding-top to account for the fixed header */}
      <div className="pt-16">
        {/* Collaborator cursors */}
        {Object.values(collaboratorCursors).map((cursor) => (
          <CollaboratorCursor
            key={cursor.userId}
            x={cursor.x}
            y={cursor.y}
            userName={cursor.userName}
            color={cursor.color}
          />
        ))}

        {/* Rest of your canvas content */}
        <DynamicStage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleStageMouseEnter}
          onDblClick={handleElementDoubleClick}
          onWheel={handleWheel}
          scale={{ x: scale, y: scale }}
          position={position}
          draggable={tool === 'mouse' && !selectedId}
          ref={stageRef}
          className="pointer-events-auto"
          style={{
            cursor: isDraggingCanvas ? 'grabbing' : 'default',
            zIndex: 1
          }}
        >
          <Layer>
            {/* Remove the white background rect and let the grid span everything */}
            <Group>
              {renderGrid()}
            </Group>

            {/* Drawing Groups Layer */}
            {drawingGroups.map((group) => (
              <Group
                key={group.id}
                id={group.id}
                x={group.x}
                y={group.y}
                width={group.width}
                height={group.height}
                rotation={group.rotation}
                scaleX={group.scaleX}
                scaleY={group.scaleY}
                draggable={true}
                onClick={handleGroupSelect}
                onTransformEnd={handleGroupTransformEnd}
              >
                {group.lines.map((line, i) => (
                  <Line
                    key={i}
                    points={line.points.map((point, index) => {
                      return index % 2 === 0 
                        ? point - group.x 
                        : point - group.y;
                    })}
                    stroke={line.color}
                    strokeWidth={line.width}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="source-over"
                  />
                ))}
                {selectedGroupId === group.id && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      const minSize = 5;
                      if (newBox.width < minSize || newBox.height < minSize) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Group>
            ))}

            {/* Current Drawing Layer */}
            <Group>
              {currentLine && (
                <Line
                  points={currentLine.points}
                  stroke={currentLine.color}
                  strokeWidth={currentLine.width}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              )}
            </Group>

            {/* Elements Layer */}
            {visibleElements.map((el) => (
              <Group
                key={el.id}
                id={el.id}
                draggable={tool === 'mouse'}
                onDragStart={handleDragStart}
                onTransformEnd={handleTransformEnd}
                onMouseEnter={handleElementHover}
                onMouseLeave={handleElementLeave}
                listening={true}
              >
                {renderElement(el)}
                {selectedId === el.id && (
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      const minSize = 5;
                      if (newBox.width < minSize || newBox.height < minSize) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                )}
              </Group>
            ))}
          </Layer>
        </DynamicStage>
      </div>

      {/* Tools Panel */}
      <div className="fixed left-4 top-20 z-40">
        <ToolsPanel onToolSelect={handleToolSelect} selectedTool={selectedTool as any} />
      </div>

      {/* Move Sticky Notes Layer above everything else */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: dimensions.width - (isChatOpen ? 400 : 0),
          height: dimensions.height,
          zIndex: 100 // Increase z-index to be above other elements
        }}
      >
        {stickyNotes.map((note) => (
          <div key={note.id} className="pointer-events-auto absolute" style={{ zIndex: 101 }}>
            <StickyNote
              id={note.id}
              x={note.x}
              y={note.y}
              onUpdate={handleUpdateNote}
              onClose={handleCloseNote}
              onMove={handleMoveNote}
              scale={scale}
            />
          </div>
        ))}
      </div>
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        className="z-[100]"
      />

      {/* AI Chat Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 p-3 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-full shadow-lg transition-colors pointer-events-auto"
        >
          <div className="w-6 h-6 relative">
            <Image
              src="/icons/sparkles-icon.svg"
              alt="AI Assistant"
              fill
              className="text-[#814ADA]"
            />
          </div>
        </button>
      )}

      {/* AI Chat Panel */}
      {isChatOpen && (
        <AIChat
          onClose={() => setIsChatOpen(false)}
          canvasElements={elements}
          onAddToCanvas={handleAddGeneratedImage}
          projectId={projectId}
        />
      )}

      {/* Drawing Toolbar */}
      {drawingMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          {/* Drawing toolbar UI */}
        </div>
      )}

      {/* Prompt Elements Layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: dimensions.width - (isChatOpen ? 400 : 0),
          height: dimensions.height,
        }}
      >
        {promptElements.map((prompt) => (
          <div
            key={prompt.id}
            className="absolute pointer-events-auto"
            style={{
              left: prompt.position.x,
              top: prompt.position.y,
              width: prompt.size.width,
              height: prompt.status === 'complete' ? prompt.size.height + 200 : prompt.size.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              cursor: 'move',
              zIndex: 1000
            }}
            onMouseDown={(e) => {
              if (e.target instanceof HTMLTextAreaElement || 
                  e.target instanceof HTMLButtonElement || 
                  (e.target as HTMLElement).closest('button')) {
                return; // Don't handle drag if clicking interactive elements
              }
              e.preventDefault();
              e.stopPropagation();
              handlePromptDrag(e, prompt.id);
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-lg p-4 h-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {prompt.status === 'complete' && prompt.generatedImage ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-square max-h-[300px] bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={prompt.generatedImage}
                      alt="Generated"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePromptGenerate(prompt.id, prompt.prompt);
                        }}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Prompt Used</span>
                    </div>
                    <p className="text-sm text-gray-600">{prompt.prompt}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={prompt.prompt}
                    onChange={(e) => handlePromptUpdate(prompt.id, e.target.value)}
                    placeholder="Enter your prompt..."
                    className="w-full p-2 border rounded-md resize-none text-sm"
                    rows={2}
                    style={{ zIndex: 1001 }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePromptGenerate(prompt.id, prompt.prompt);
                      }}
                      disabled={prompt.status === 'generating' || !prompt.prompt.trim()}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        prompt.status === 'generating' || !prompt.prompt.trim()
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      {prompt.status === 'generating' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        'Generate'
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPromptElements(prev => prev.filter(p => p.id !== prompt.id));
                      }}
                      className="text-gray-500 hover:text-red-500"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reset View Button */}
      <button
        onClick={resetView}
        className="fixed bottom-4 left-4 p-3 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-full shadow-lg transition-colors pointer-events-auto z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {boardToDelete && (
        <DeleteConfirmationModal
          boardName={boardToDelete.name}
          onConfirm={() => handleBoardDelete(boardToDelete.id)}
          onCancel={() => setBoardToDelete(null)}
        />
      )}
      {renderCollaboratorButton()}
      <InviteCollaboratorModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteCollaborator}
      />

      <div 
        className="absolute inset-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          pointerEvents: isDragging ? 'auto' : 'none',
          zIndex: 1000
        }}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-purple-50/50 border-2 border-dashed border-purple-500 rounded-lg flex items-center justify-center">
            <p className="text-purple-600 font-medium">Drop image here</p>
          </div>
        )}
      </div>
    </div>
  );
} 