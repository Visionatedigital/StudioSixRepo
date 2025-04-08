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
import { Stage, Layer, Rect, Circle, Line, Text as KonvaText, Image as KonvaImage, Transformer, Group } from 'react-konva';
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
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        const project = await response.json();
        
        console.log('Raw project data:', project);
        
        // Create initial canvas data
        const initialCanvasData: CanvasData = {
          id: 'root',
          name: project.name || 'Root Canvas',
          parentId: undefined,
          elements: []
        };

        // If project has canvas data, use it, otherwise start with empty canvas
        const savedCanvasData = project.canvasData || [];
        
        console.log('Saved canvas data:', savedCanvasData);
        
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

        // Extract all elements from all canvases
        const allElements = processedCanvasStack.flatMap((canvas: CanvasData) => 
          Array.isArray(canvas.elements) 
            ? canvas.elements.filter((el: any) => el && typeof el === 'object')
            : []
        );

        console.log('All elements to be loaded:', allElements);
        
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
          setElements(processedElements);
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
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    // If mouse tool and target is stage, set isDraggingCanvas to true and update cursor
    if (tool === 'mouse' && e.target === stage) {
      setIsDraggingCanvas(true);
      stage.container().style.cursor = 'grabbing';
      setMouseStartPos({ x: e.evt.clientX - position.x, y: e.evt.clientY - position.y });
    }

    // Convert point to canvas coordinates
    const x = (point.x - position.x) / scale;
    const y = (point.y - position.y) / scale;

    console.log('Canvas click:', { tool, target: e.target, point, x, y }); // Debug log

    if (tool === 'board' && e.target === stage) {
      console.log('Creating new board'); // Debug log
      const boardId = uuidv4();
      const canvasId = uuidv4();
      const newBoard: BoardElement = {
        id: boardId,
        type: 'board',
        x,
        y,
        width: 200,
        height: 150,
        name: `Board ${canvasStack.length}`,
        canvasId: currentCanvas.id
      };

      // Create new canvas for the board
      const newCanvasData: CanvasData = {
        id: canvasId,
        name: newBoard.name,
        elements: [],
        parentId: currentCanvas.id
      };

      // First add the board to elements
      setElements(prev => [...prev, newBoard]);
      
      // Then update the canvas stack with both the new canvas and the board reference
      setCanvasStack(prev => {
        // First add the board ID to the current canvas
        const updatedCanvases = prev.map(canvas => 
          canvas.id === currentCanvas.id 
            ? { ...canvas, elements: [...canvas.elements, boardId] }
            : canvas
        );
        
        // Then add the new canvas
        return [...updatedCanvases, newCanvasData];
      });

      setTool('mouse');
      setSelectedTool('mouse');
      return; // Add return to prevent further processing
    }

    if (tool === 'draw') {
      setIsDrawing(true);
      const newLine = {
        points: [point.x, point.y],
        color: strokeColor,
        width: strokeWidth,
      };
      setCurrentLine(newLine);
      setLines(prev => [...prev, newLine]); // Add the line immediately
      return; // Add return to prevent further processing
    }

    if (tool === 'todo' && e.target === stage) {
      // Create new sticky note element
      const newElement: TextElement = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
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
      setElements(prev => [...prev, newElement]);
      setCanvasStack(prev => prev.map(canvas => 
        canvas.id === currentCanvas.id 
          ? { ...canvas, elements: [...canvas.elements, newElement.id] }
          : canvas
      ));
      setTool('mouse');
      setSelectedTool('mouse');
    } else if (tool === 'text') {
      // Create new text element
      const newElement: TextElement = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: 'Double click to edit',
        fontSize: 16,
        fill: '#000000',
        width: 200,
        height: 30,
        canvasId: currentCanvas.id
      };
      setElements(prev => [...prev, newElement]);
      // Add element ID to current canvas
      setCanvasStack(prev => prev.map(canvas => 
        canvas.id === currentCanvas.id 
          ? { ...canvas, elements: [...canvas.elements, newElement.id] }
          : canvas
      ));
      setTool('mouse');
      setSelectedTool('mouse');
    } else if (tool === 'note' && e.target === stage) {
      console.log('Creating new sticky note at:', { x, y }); // Debug log
      const newNote: StickyNoteData = {
        id: `note-${Date.now()}`,
        x,
        y,
        content: '',
        style: {
          width: 200,
          height: 200,
          backgroundColor: '#fef3c7',
          color: '#2D3748',
          fontSize: '14px'
        }
      };
      console.log('New note data:', newNote); // Debug log
      setStickyNotes(prev => {
        console.log('Previous notes:', prev); // Debug log
        const updated = [...prev, newNote];
        console.log('Updated notes:', updated); // Debug log
        return updated;
      });
      setTool('mouse');
      setSelectedTool('mouse');
    } else if (tool === 'prompt' && e.target === stage) {
      const newPrompt: PromptElement = {
        id: `prompt-${Date.now()}`,
        type: 'prompt',
        x,
        y,
        width: 300,
        height: 100,
        prompt: '',
        position: { x, y },
        size: { width: 300, height: 100 },
        canvasId: currentCanvas.id,
        rotation: 0,
        status: 'idle'
      };

      setPromptElements(prev => [...prev, newPrompt]);
      setTool('mouse');
      setSelectedTool('mouse');
    } else if (selectedTool === 'comment') {
      const stage = e.target.getStage();
      if (!stage) return;

      const point = stage.getPointerPosition();
      if (!point) return;

      // Find clicked element
      const clickedElement = elements.find(el => {
        if (el.type !== 'board') return false;
        const shape = stage.findOne(`#${el.id}`);
        return shape && shape.isVisible();
      });

      if (clickedElement) {
        const newComment = {
          id: uuidv4(),
          type: 'comment' as const,
          x: point.x,
          y: point.y,
          width: 200,
          height: 100,
          text: '',
          targetId: clickedElement.id,
          isNew: true,
          canvasId: currentCanvas.id
        };

        setElements(prev => [...prev, newComment]);
        return;
      }
      return;
    } else {
      // Handle element selection for all other tools
      const elementId = e.target.parent?.attrs?.id || e.target.attrs?.id;
      const element = elements.find(el => el.id === elementId);

      if (element) {
        if (tool === 'trash') {
          setElements(prev => prev.filter(el => el.id !== elementId));
      setSelectedId(null);
        } else {
          setSelectedId(elementId);
        }
      } else if (e.target === stage) {
        setSelectedId(null);
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

  const handleToolSelect = (toolId: Tool) => {
    // If clicking the currently selected tool, switch back to mouse tool
    if (toolId === selectedTool) {
      setSelectedTool('mouse');
      setTool('mouse');
      setDrawingMode(false);
      return;
    }

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
    const lines = [];
    const width = dimensions.width - (isChatOpen ? 400 : 0);
    const height = dimensions.height;
    
    // Add buffer to ensure grid extends beyond viewport
    const bufferFactor = 2;
    
    // Calculate visible area based on position and scale with buffer
    const startX = Math.floor((-position.x - width * bufferFactor) / (gridSize * scale));
    const endX = Math.ceil((width * (1 + bufferFactor) - position.x) / (gridSize * scale));
    const startY = Math.floor((-position.y - height * bufferFactor) / (gridSize * scale));
    const endY = Math.ceil((height * (1 + bufferFactor) - position.y) / (gridSize * scale));

    // Calculate major grid interval based on zoom level
    let majorGridInterval;
    if (scale >= 4) {
      majorGridInterval = 1;
    } else if (scale >= 2) {
      majorGridInterval = 2;
    } else if (scale >= 1) {
      majorGridInterval = 5;
    } else if (scale >= 0.5) {
      majorGridInterval = 10;
    } else if (scale >= 0.2) {
      majorGridInterval = 20;
    } else {
      majorGridInterval = 40;
    }

    // Calculate subdivision interval based on zoom level
    const shouldShowSubdivisions = scale >= 0.2;
    const subdivisionSize = shouldShowSubdivisions ? gridSize / 2 : gridSize;

    // Calculate opacity based on zoom level
    const getOpacity = (isMajor: boolean) => {
      if (scale < 0.2) {
        return isMajor ? 0.4 : 0;
      } else if (scale < 0.5) {
        return isMajor ? 0.35 : 0.1;
      } else {
        return isMajor ? 0.3 : 0.15;
      }
    };

    // Calculate stroke width based on zoom level
    const getStrokeWidth = (isMajor: boolean) => {
      if (scale < 0.2) {
        return isMajor ? 0.75 : 0;
      } else if (scale < 0.5) {
        return isMajor ? 0.5 : 0.25;
      } else {
        return isMajor ? 0.5 : 0.25;
      }
    };

    // Render vertical lines with extended range
    for (let x = startX * 2; x <= endX * 2; x++) {
      const actualX = Math.round(x * subdivisionSize);
      const isMajor = x % (majorGridInterval * 2) === 0;
      const isMinor = x % 2 === 0;
      
      if (!shouldShowSubdivisions && !isMinor) continue;

      lines.push(
        <Line
          key={`v-${x}`}
          points={[
            actualX,
            Math.round(startY * gridSize),
            actualX,
            Math.round(endY * gridSize)
          ]}
          stroke="#E5E5E5"
          strokeWidth={getStrokeWidth(isMajor)}
          opacity={getOpacity(isMajor)}
          perfectDrawEnabled={true}
            listening={false}
          hitStrokeWidth={0}
          lineCap="square"
          />
        );
      }

    // Render horizontal lines with extended range
    for (let y = startY * 2; y <= endY * 2; y++) {
      const actualY = Math.round(y * subdivisionSize);
      const isMajor = y % (majorGridInterval * 2) === 0;
      const isMinor = y % 2 === 0;
      
      if (!shouldShowSubdivisions && !isMinor) continue;

      lines.push(
        <Line
          key={`h-${y}`}
          points={[
            Math.round(startX * gridSize),
            actualY,
            Math.round(endX * gridSize),
            actualY
          ]}
          stroke="#E5E5E5"
          strokeWidth={getStrokeWidth(isMajor)}
          opacity={getOpacity(isMajor)}
          perfectDrawEnabled={true}
          listening={false}
          hitStrokeWidth={0}
          lineCap="square"
        />
      );
    }

    return lines;
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

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
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
      case 'comment': {
        const commentElement = element as CommentElement;
        return (
          <Group>
            <CommentBubble
              key={commentElement.id}
              id={commentElement.id}
              x={commentElement.x}
              y={commentElement.y}
              text={commentElement.text}
              isNew={false}
              onSave={(text) => {
                setElements(prev =>
                  prev.map(el =>
                    el.id === commentElement.id && el.type === 'comment'
                      ? { ...el, text }
                      : el
                  )
                );
              }}
              onCancel={() => {
                setElements(prev => prev.filter(el => el.id !== commentElement.id));
              }}
            />
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
    </div>
  );
} 