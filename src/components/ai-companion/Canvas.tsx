'use client';

// Add this debugging information
console.log('[DEBUG] Canvas module loading started');

import './Canvas.css';
import React, { useEffect, useRef, useState } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { Stage as KonvaStage } from 'konva/lib/Stage';
// Import components directly
  import { Stage, Layer, KonvaRect, KonvaCircle, KonvaLine, KonvaText, KonvaImage, KonvaTransformer, KonvaGroup, Path } from './KonvaComponents';
  import Konva from 'konva/lib/index';
import nextImage from 'next/image';

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
  ImageElement,
  ContainerElement,
  ShapeElement,
  StickyNoteElement,
  StickyNoteStyle,
  ElementType,
  DrawingElement,
  StickyNoteProps
} from '@/types/canvas';
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
import SiteAnalysisGenerator from './SiteAnalysisGenerator';
import SiteAnalysisDisplay from './SiteAnalysisDisplay';
import { Html } from 'react-konva-utils';
import FileUploadContainer from './FileUploadContainer';
import { generateSiteAnalysis } from '@/services/siteAnalysis';
import { processFile } from '@/utils/imageProcessing';
import { SiteAnalysisRequest as ServiceSiteAnalysisRequest } from '@/services/siteAnalysis';
import TextFormatMenu from './TextFormatMenu';
import DrawingMenu from './DrawingMenu';

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
  tool: 'pencil' | 'marker' | 'eraser';
  opacity: number;
}

interface DrawingGroup {
  id: string;
  elements: CanvasElement[];
  x: number;
  y: number;
  width: number;
  height: number;
  lines: Array<{
    points: number[];
    stroke: string;
    strokeWidth: number;
    color: string;
    opacity: number;
  }>;
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

interface GeneratedContentElement extends BaseElement {
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

// Add these interfaces at the top with other interfaces
interface SiteAnalysisRequest {
  projectBrief: string;
  uploadedFiles: File[];
  siteDescription: string;
  selectedTags: string[];
  abstractionLevel: number;
}

interface SiteAnalysisResponse {
  siteStatement: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  keyCharacteristics: string[];
}

interface SiteAnalysisData {
  siteStatement: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  keyCharacteristics: string[];
}

// Add Position type at the top with other type definitions
type Position = {
  x: number;
  y: number;
}

// Update TextFormatMenu component props to handle nullable position
interface TextFormatMenuProps {
  fontSize: number;
  isBold: boolean;
  textAlign: 'left' | 'center' | 'right';
  isLocked: boolean;
  position: Position | null;
  onFontSizeChange: (size: number) => void;
  onBoldToggle: () => void;
  onAlignChange: (align: 'left' | 'center' | 'right') => void;
  onLockToggle: () => void;
  onDelete: () => void;
}

export default function Canvas({ name, description, projectId }: Props) {
  console.log('[DEBUG] Canvas component rendering started with props:', { name, description, projectId });
  
  // Wrap the entire component in a try-catch for debugging
  try {
    const { data: session } = useSession();
    console.log('[DEBUG] useSession hook called, session:', session ? 'exists' : 'null');
    
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
    const stageRef = useRef<KonvaStage | null>(null);
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
    const [projectBrief, setProjectBrief] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
      id: string;
      name: string;
      file: File;
      status: 'uploading' | 'complete';
      progress: number;
    }>>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [siteDescription, setSiteDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [abstractionLevel, setAbstractionLevel] = useState(50);
    const [selectedTextElement, setSelectedTextElement] = useState<TextElement | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingTextValue, setEditingTextValue] = useState('');
    const [isExplicitlySelected, setIsExplicitlySelected] = useState(false);
    const [selectionBox, setSelectionBox] = useState<{
      isSelecting: boolean;
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    } | null>(null);
    const [selectedDrawing, setSelectedDrawing] = useState<{
      id: string;
      position: { x: number; y: number };
      color: string;
    } | null>(null);
    const [selectedStickyNote, setSelectedStickyNote] = useState<StickyNoteElement | null>(null);
    const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
    const [textMenuPosition, setTextMenuPosition] = useState<Position | null>(null);
    const [drawings, setDrawings] = useState<DrawingElement[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textMenuRef = useRef<HTMLDivElement>(null);
    const ctx = canvasRef.current?.getContext('2d');
    const [startPosition, setStartPosition] = useState<Position | null>(null);
    const [endPosition, setEndPosition] = useState<Position | null>(null);

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

      // Update selection box if active
      if (selectionBox?.isSelecting) {
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(point);
        setSelectionBox(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null);
        return;
      }

      if (socket && projectId) {
        socket.emit('cursor-move', {
          x: point.x,
          y: point.y,
          projectId
        });
      }

      if (tool === 'mouse' && isDraggingCanvas && e.evt.button !== 2) { // Only allow dragging if not right-click
        const newPosition = {
          x: e.evt.clientX - mouseStartPos.x,
          y: e.evt.clientY - mouseStartPos.y
        };
        setPosition(newPosition);
        return;
      }
      
      if (isDrawing && currentLine) {
        const newPoints = [...currentLine.points, point.x, point.y];
        const updatedLine = {
        ...currentLine,
          points: newPoints,
        };
        setCurrentLine(updatedLine);
        
        setLines(prev => {
          const newLines = [...prev];
          if (newLines.length > 0) {
          newLines[newLines.length - 1] = updatedLine;
          } else {
            newLines.push(updatedLine);
          }
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
            if ((element.type === 'uploaded' || element.type === 'generated-image') && 'image' in element) {
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
      // Clear selection box on right click
      if (e.evt.button === 2) {
        setSelectionBox(null);
        return;
      }

      // Handle drawing tools
      if (drawingMode) {
        if (e.target === e.target.getStage()) {
          setCurrentLine(null);
        }
        return;
      }

      // Handle sticky note creation
      if (selectedTool === 'sticky-note') {
        const stage = e.target.getStage();
        if (!stage) return;

        const point = stage.getPointerPosition();
        if (!point) return;

        const newStickyNote: StickyNoteElement = {
          id: uuidv4(),
          type: 'sticky-note',
          x: point.x,
          y: point.y,
          width: 200,
          height: 200,
          rotation: 0,
          content: '',
          style: {
            backgroundColor: '#FFE4B5',
            textColor: '#000000',
            fontSize: 14,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          },
          canvasId: currentCanvas.id
        };

        setElements(prev => [...prev, newStickyNote]);
        setSelectedStickyNote(newStickyNote);
          return;
      }

      // Clear text menu when clicking on stage
      if (e.target === e.target.getStage()) {
        setSelectedTextElement(null);
        setSelectedStickyNote(null);
        return;
      }

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

      // Handle right-click for selection box
      if (e.evt.button === 2 && isClickOnStage) { // 2 is right mouse button
        setSelectionBox({
          isSelecting: true,
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y
        });
        setIsDraggingCanvas(false); // Prevent canvas dragging
        return;
      }

      // Handle text tool
      if (tool === 'text' && isClickOnStage) {
        const newTextElement: TextElement = {
          id: uuidv4(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: 'Double click to edit',
          fontSize: 16,
          isBold: false,
          textAlign: 'left',
          fill: '#000000',
          width: 200,
          height: 30,
          isLocked: false,
          canvasId: currentCanvas.id
        };
        setElements(prev => [...prev, newTextElement]);
        return;
      }

      // Handle sticky note tool
      if (tool === 'note' && isClickOnStage) {
        const newStickyNote: StickyNoteElement = {
          id: uuidv4(),
          type: 'sticky-note',
            x: pos.x,
            y: pos.y,
            width: 200,
        height: 200,
        rotation: 0,
        content: '',
        style: {
          backgroundColor: '#FFE4B5',
          textColor: '#000000',
          fontSize: 14,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        canvasId: currentCanvas.id
      };
        setElements(prev => [...prev, newStickyNote]);
        return;
      }

      // Handle drawing tool
      if (tool === 'draw' && isClickOnStage) {
        setIsDrawing(true);
        setCurrentLine({
          points: [pos.x, pos.y],
          color: strokeColor,
          width: strokeWidth,
          tool: 'pencil',
          opacity: 1
        });
        return;
      }

      // If clicking on stage (not an element), clear text menu and selection
      if (isClickOnStage) {
        setTextMenuPosition(null);
        setSelectedTextElement(null);
        setSelectedGroupId(null);
        setSelectedDrawing(null);
        setIsExplicitlySelected(false);
        return;
      }

      // Handle drawing selection when using mouse tool
      if (tool === 'mouse') {
        // Check if clicking on a drawing group
        const clickedGroup = drawingGroups.find(group => {
          const groupX = group.x;
          const groupY = group.y;
          const groupWidth = group.width;
          const groupHeight = group.height;
          
          return pos.x >= groupX && 
                 pos.x <= groupX + groupWidth && 
                 pos.y >= groupY && 
                 pos.y <= groupY + groupHeight;
        });

        if (clickedGroup) {
          setSelectedGroupId(clickedGroup.id);
          setSelectedId(null);
          setIsExplicitlySelected(true);
          
          // Set the selected drawing and show the menu
          setSelectedDrawing({
            id: clickedGroup.id,
            position: { x: pointerPos.x, y: pointerPos.y },
            color: clickedGroup.lines[0]?.color || strokeColor
          });
          return;
        }
      }
    };

    const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      
      // Handle selection box completion
      if (selectionBox?.isSelecting) {
        const transform = stage?.getAbsoluteTransform().copy().invert();
        const point = stage?.getPointerPosition();
        if (transform && point) {
          const pos = transform.point(point);
          setSelectionBox(prev => {
            if (!prev) return null;
            
            // Calculate selection box bounds
            const x = Math.min(prev.startX, pos.x);
            const y = Math.min(prev.startY, pos.y);
            const width = Math.abs(pos.x - prev.startX);
            const height = Math.abs(pos.y - prev.startY);
            
            // Find elements within the selection box
            const selectedElements = elements.filter(element => {
              const elementX = element.x;
              const elementY = element.y;
              const elementWidth = element.width || 0;
              const elementHeight = element.height || 0;
              
              return elementX >= x &&
                     elementX + elementWidth <= x + width &&
                     elementY >= y &&
                     elementY + elementHeight <= y + height;
            });
            
            // Update selected elements
            if (selectedElements.length > 0) {
              setSelectedId(selectedElements[0].id);
              setIsExplicitlySelected(true);
            }
            
            return null;
          });
        }
        return;
      }
      
      if (tool === 'mouse') {
        setIsDraggingCanvas(false);
        if (stage) {
          stage.container().style.cursor = 'default';
        }
      }

      if (isDrawing && currentLine) {
        setLines(prev => [...prev, currentLine]);
        setCurrentLine(null);
        setIsDrawing(false);

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
      const element = elements.find(el => el.id === id);
      
      // Only set selectedId if the element is not a text element
      if (element?.type !== 'text') {
      setSelectedId(id);
        setIsExplicitlySelected(false);
      }
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

    const handleDeleteNote = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedId(null);
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
            <KonvaCircle
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
        elements: [],
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        lines: lines.map(line => ({
          points: line.points,
          stroke: line.color,
          strokeWidth: typeof line.width === 'string' ? parseFloat(line.width) : line.width,
          color: line.color,
          opacity: line.opacity || 1
        }))
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
                type: 'uploaded',
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
      
      if (element && (element.type === 'uploaded' || element.type === 'generated-image')) {
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
      
      if (element && (element.type === 'uploaded' || element.type === 'generated-image')) {
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
        case 'text':
          const textElement = element as TextElement;
          const isEditing = editingTextId === textElement.id;
          const isExplicitlySelected = selectedId === textElement.id && !isDraggingCanvas;

          return (
            <KonvaGroup key={textElement.id}>
              {!isEditing && (
                <KonvaText
                  id={textElement.id}
                  x={textElement.x}
                  y={textElement.y}
                  text={textElement.text}
                  fontSize={textElement.fontSize || 16}
                  fontStyle={textElement.isBold ? 'bold' : 'normal'}
                  align={textElement.textAlign || 'left'}
                  fill={textElement.fill || '#000000'}
                  width={textElement.width}
                  height={textElement.height}
                  draggable={selectedTool === 'mouse' && !textElement.isLocked}
                  onClick={(e) => handleTextElementSelect(textElement, e)}
                  onDblClick={(e) => handleTextDoubleClick(textElement, e)}
                />
              )}
              {isEditing && (
                <Html>
                  <div
                    style={{
                      position: 'absolute',
                      left: textElement.x,
                      top: textElement.y,
                      width: textElement.width,
                      height: textElement.height,
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: `${textElement.fontSize || 16}px`,
                      fontFamily: 'Inter',
                      fontWeight: textElement.isBold ? 'bold' : 'normal',
                      textAlign: textElement.textAlign || 'left',
                      color: textElement.fill || '#000000',
                      resize: 'none',
                      overflow: 'hidden',
                    }}
                  >
                    <textarea
                      value={editingTextValue}
                      onChange={(e) => setEditingTextValue(e.target.value)}
                      onBlur={() => handleTextEditComplete(textElement)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTextEditComplete(textElement);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        padding: '4px',
                      }}
                      autoFocus
                    />
                  </div>
                </Html>
              )}
            </KonvaGroup>
          );
        case 'image': {
          const imageElement = element as ImageElement;
          return (
              <KonvaImage
              key={imageElement.id}
              image={imageElement.image}
              alt={imageElement.alt}
              width={imageElement.width}
              height={imageElement.height}
              style={{
                transform: `rotate(${imageElement.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          );
        }
        case 'uploaded': {
          const uploadImage = element as UploadedElement;
          return (
            <KonvaImage
              key={uploadImage.id}
              image={uploadImage.image}
              alt={uploadImage.alt}
              width={uploadImage.width}
              height={uploadImage.height}
              style={{
                transform: `rotate(${uploadImage.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          );
        }
        case 'generated-image': {
          const genImage = element as GeneratedImageElement;
          return (
            <KonvaImage
              key={genImage.id}
              image={genImage.image}
              alt={genImage.alt}
              width={genImage.width}
              height={genImage.height}
              style={{
                transform: `rotate(${genImage.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          );
        }
        case 'container': {
          const containerElement = element as ContainerElement;
          const isTemplateGroup = containerElement.content?.type === 'template-group';
          
          if (isTemplateGroup && containerElement.content?.containers) {
            return (
              <KonvaGroup
                key={containerElement.id}
                x={containerElement.x}
                y={containerElement.y}
                rotation={containerElement.rotation}
                draggable={selectedTool === 'mouse'}
                onClick={handleCanvasClick}
                onTransformEnd={handleTransformEnd}
                onDragEnd={handleTransformEnd}
              >
                {containerElement.content.containers.map(container => (
                    <KonvaRect
                    key={container.id}
                      x={container.x}
                      y={container.y}
                      width={container.width}
                      height={container.height}
                    fill={container.backgroundColor}
                    stroke={container.borderColor}
                          strokeWidth={1}
                    cornerRadius={container.borderRadius}
                  />
                            ))}
                          </KonvaGroup>
          );
          }
          return null;
        }
        case 'sticky-note': {
          const stickyNote = element as StickyNoteElement;
          return (
            <StickyNote
              key={stickyNote.id}
              id={stickyNote.id}
              x={stickyNote.x}
              y={stickyNote.y}
              text={stickyNote.content}
              style={{
                backgroundColor: stickyNote.style.backgroundColor || '#FFE4B5',
                textColor: stickyNote.style.textColor || '#000000',
                fontSize: typeof stickyNote.style.fontSize === 'string' ? parseInt(stickyNote.style.fontSize) : (stickyNote.style.fontSize || 14),
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onMove={handleMoveNote}
              scale={scale}
              isSelected={selectedId === stickyNote.id}
              onSelect={(id) => setSelectedId(id)}
            />
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
        type: 'uploaded',
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
          type: 'generated-image',
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
    const isImageLike = (element: CanvasElement): element is ImageElement | UploadedElement | GeneratedImageElement => {
      return element.type === 'image' || element.type === 'uploaded' || element.type === 'generated-image';
    };

    const simulateFileUpload = (fileId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress, status: progress === 100 ? 'complete' : 'uploading' }
            : file
        ));

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);
    };

    const handleFileDelete = (fileId: string) => {
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleGenerateSiteStatement = async () => {
      try {
        const imageElements = elements.filter(isImageLike);
        if (imageElements.length === 0) {
          showNotification('error', 'No Images', 'Please upload at least one image to generate a site analysis.');
          return;
        }

        const imageUrls = imageElements.map(element => {
          if (element.type === 'uploaded' && element.file) {
            return URL.createObjectURL(element.file);
          }
          if (element.type === 'generated-image' && element.src) {
            return element.src;
          }
          return null;
        }).filter((url): url is string => url !== null);

        if (imageUrls.length === 0) {
          showNotification('error', 'Invalid Images', 'Could not process the uploaded images. Please try again.');
          return;
        }

        const analysisRequest: ServiceSiteAnalysisRequest = {
          projectBrief,
          uploadedFiles: [],
          siteDescription,
          selectedTags,
          abstractionLevel
        };

        const analysis = await generateSiteAnalysis(analysisRequest);
        
        if (!analysis) {
          showNotification('error', 'Generation Failed', 'Failed to generate site analysis. Please try again.');
          return;
        }

        const newElement: GeneratedContentElement = {
          id: uuidv4(),
          type: 'generated-content',
          x: 100,
          y: 100,
          width: 400,
          height: 600,
          content: {
            siteStatement: analysis.analysis.siteStatement,
            swot: analysis.analysis.swot,
            keyCharacteristics: analysis.analysis.keyCharacteristics
          },
          canvasId: currentCanvas.id,
          rotation: 0
        };

        setElements(prev => [...prev, newElement]);
        showNotification('success', 'Analysis Generated', 'Site analysis has been generated successfully.');
      } catch (error) {
        console.error('Error generating site analysis:', error);
        showNotification('error', 'Generation Error', 'An error occurred while generating the site analysis.');
      }
    };

    const handleTagClick = (tag: string) => {
      setSelectedTags((prev: string[]) => {
        const isSelected = prev.includes(tag);
        return isSelected ? prev.filter((t: string) => t !== tag) : [...prev, tag];
      });
    };

    // Add this new function to handle text element selection
    // Add text formatting handlers
    const handleFontSizeChange = (size: number) => {
      if (!selectedTextElement) return;
      
      setElements(prev => prev.map(el => 
        el.id === selectedTextElement.id 
          ? { ...el, fontSize: size } as TextElement
          : el
      ));
    };

    const handleBoldToggle = () => {
      if (!selectedTextElement) return;
      
      setElements(prev => prev.map(el => 
        el.id === selectedTextElement.id 
          ? { ...el, isBold: !selectedTextElement.isBold } as TextElement
          : el
      ));
    };

    const handleAlignChange = (align: 'left' | 'center' | 'right') => {
      if (!selectedTextElement) return;
      
      setElements(prev => prev.map(el => 
        el.id === selectedTextElement.id 
          ? { ...el, textAlign: align } as TextElement
          : el
      ));
    };

    const handleLockToggle = () => {
      if (!selectedTextElement) return;
      
      setElements(prev => prev.map(el => 
        el.id === selectedTextElement.id 
          ? { ...el, isLocked: !selectedTextElement.isLocked } as TextElement
          : el
      ));
    };

    // Add this right before the return statement
    useEffect(() => {
      if (!selectedId) {
        setTextMenuPosition(null);
        setSelectedTextElement(null);
      }
    }, [selectedId]);

    const handleElementDragEnd = (id: string, e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();
      
      setElements(prevElements => 
        prevElements.map(el => 
          el.id === id 
            ? { ...el, x: newX, y: newY }
            : el
        )
      );
    };

    const handleStickyNoteUpdate = (id: string, content: string, style: StickyNoteStyle) => {
      setElements(prev => prev.map(el => 
        el.id === id && el.type === 'sticky-note' 
          ? { 
              ...el, 
              content,
              style: {
                ...style,
                fontSize: typeof style.fontSize === 'string' ? parseInt(style.fontSize, 10) : (style.fontSize || 14)
              }
            } 
          : el
      ));
    };

    const handleDeleteElement = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedId(null);
      setTextMenuPosition(null);
      setSelectedTextElement(null);
    };

    const handleElementMove = (id: string, x: number, y: number) => {
      setElements(prev => prev.map(el => 
        el.id === id ? { ...el, x, y } : el
      ));
    };

    const handleAddStickyNote = (position: { x: number; y: number }) => {
      const newNote: StickyNoteElement = {
        id: uuidv4(),
        type: 'sticky-note',
        x: position.x,
        y: position.y,
        width: 200,
        height: 200,
        rotation: 0,
        content: '',
        style: {
          backgroundColor: '#FFE4B5',
          textColor: '#000000',
          fontSize: 14,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        canvasId: currentCanvas.id
      };
      setElements(prev => [...prev, newNote]);
    };

    const handleTextDoubleClick = (element: TextElement, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      setEditingTextId(element.id);
      setEditingTextValue(element.text);
    };

    const handleTextEditComplete = (element: TextElement) => {
      if (!editingTextValue.trim()) {
        handleDeleteTextElement(element.id);
      } else {
        const updatedElement = {
          ...element,
          text: editingTextValue
        };
        handleElementChange(element.id, updatedElement);
      }
      setEditingTextId(null);
      setEditingTextValue('');
    };

    const handleDeleteTextElement = (elementId: string) => {
      setElements(prev => prev.filter(el => el.id !== elementId));
      setSelectedId(null);
      setSelectedTextElement(null);
    };

    const handleDrawingSelect = (drawing: DrawingElement, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      setSelectedDrawing({
        id: drawing.id,
        position: { x: e.evt.clientX, y: e.evt.clientY },
        color: drawing.stroke,
      });
    };

    const handleDrawingColorChange = (color: string) => {
      if (selectedDrawing) {
        setDrawings(drawings.map(drawing => 
          drawing.id === selectedDrawing.id ? { ...drawing, stroke: color } : drawing
        ));
      }
    };

    const handleDrawingDelete = () => {
      if (selectedDrawing) {
        setDrawings(drawings.filter(drawing => drawing.id !== selectedDrawing.id));
        setSelectedDrawing(null);
      }
    };

    const handleStickyNoteContentChange = (id: string, content: string) => {
      setElements(prev => prev.map(el => 
        el.id === id && el.type === 'sticky-note' 
          ? { ...el, content } 
          : el
      ));
    };

    // Fix the sticky note style handling
    const handleStickyNoteStyleChange = (id: string, style: Partial<StickyNoteStyle>) => {
      setElements(prev => prev.map(el => {
        if (el.id === id && el.type === 'sticky-note') {
          const currentStyle = el.style;
          let newFontSize = currentStyle.fontSize;
          if (style.fontSize !== undefined) {
            const parsedSize = typeof style.fontSize === 'string' 
              ? parseInt(style.fontSize, 10) 
              : style.fontSize;
            newFontSize = isNaN(parsedSize) ? currentStyle.fontSize : Math.max(1, parsedSize);
          }

          return {
            ...el,
            style: {
              ...currentStyle,
              ...style,
              fontSize: newFontSize
            }
          } as CanvasElement; // Explicitly cast to CanvasElement
        }
        return el;
      }));
    };

    const handleStickyNoteDelete = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedStickyNote(null);
    };

    const handleTextElementSelect = (element: TextElement, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      setSelectedId(element.id);
      setSelectedTextElement(element);

      // Get the stage and its scale
      const stage = stageRef.current;
      if (!stage) return;

      // Calculate the center point of the text element
      const centerX = element.x + (element.width || 0) / 2;
      const menuY = element.y - 30; // Position menu closer to the text

      // Set the menu position
      setTextMenuPosition({
        x: centerX,
        y: menuY
      });
    };

    const handleSiteAnalysisData = (data: SiteAnalysisData) => {
      // Handle site analysis data
      const { siteStatement, swot, keyCharacteristics } = data;
      // ... rest of the function
    };

    // When creating a new sticky note
    const createStickyNote = (x: number, y: number): StickyNoteElement => ({
      id: crypto.randomUUID(),
      type: 'sticky-note',
      x,
      y,
      width: 200,
      height: 200,
      content: '',
      canvasId: 'main',
      style: {
        backgroundColor: '#FFE4B5',
        textColor: '#000000',
        fontSize: 14,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    });

    // Position handling with proper type safety
    const getMousePosition = (event: MouseEvent): { x: number; y: number } => {
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0)
      };
    };

    // Remove duplicate handleMouseMove declarations and keep only the one we defined earlier
    // ... existing code ...

    // Define DrawingGroup type
    interface DrawingGroup {
      id: string;
      elements: CanvasElement[];
      x: number;
      y: number;
      width: number;
      height: number;
      lines: Array<{
        points: number[];
        stroke: string;
        strokeWidth: number;
        color: string;
        opacity: number;
      }>;
    }

    // Update the drawing group section with proper types
    const handleDrawingGroupDragEnd = (group: DrawingGroup, e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      setDrawingGroups((prev: DrawingGroup[]) => 
        prev.map((g: DrawingGroup) => 
          g.id === group.id ? { ...g, x: e.target.x(), y: e.target.y() } : g
        )
      );
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
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            onMouseDown={handleCanvasClick}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            onMouseEnter={handleStageMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={stageRef}
            draggable={isDraggingCanvas}
            onClick={handleCanvasClick}
            onDragStart={handleDragStart}
            id="studio-canvas"
            style={{
              display: 'block',
              backgroundColor: 'white',
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
              backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`,
              backgroundPosition: `-${position.x}px -${position.y}px`
            }}
          >
            <Layer>
              {/* Remove the white background rect and let the grid span everything */}
              <KonvaGroup>
                {renderGrid()}
              </KonvaGroup>

              {/* Drawing Groups Layer */}
              {drawingGroups.map((group) => (
                <KonvaGroup
                  key={group.id}
                  id={group.id}
                  x={group.x}
                  y={group.y}
                  width={group.width}
                  height={group.height}
                  draggable={tool === 'mouse'}
                  onClick={(e) => {
                    if (tool === 'mouse') {
                      e.cancelBubble = true;
                      setSelectedGroupId(group.id);
                      setSelectedId(null);
                      setIsExplicitlySelected(true);
                      
                      // Set the selected drawing and show the menu
                      const stage = stageRef.current;
                      if (stage) {
                        const pointerPos = stage.getPointerPosition();
                        if (pointerPos) {
                          setSelectedDrawing({
                            id: group.id,
                            position: { x: pointerPos.x, y: pointerPos.y },
                            color: group.lines[0]?.color || strokeColor
                          });
                        }
                      }
                    }
                  }}
                  onDragEnd={(e) => {
                    const node = e.target;
                    setDrawingGroups(prev => prev.map(g => 
                      g.id === group.id 
                        ? { ...g, x: node.x(), y: node.y() }
                        : g
                    ));
                  }}
                >
                  {/* Selection indicator */}
                  {selectedGroupId === group.id && (
                    <KonvaRect
                      x={-5}
                      y={-5}
                      width={group.width + 10}
                      height={group.height + 10}
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dash={[5, 5]}
                    />
                  )}
                  
                  {/* Drawing lines */}
                  {group.lines.map((line, index) => (
                    <KonvaLine
                      key={index}
                      points={line.points}
                      stroke={line.stroke}
                      strokeWidth={line.strokeWidth}
                      lineCap="round"
                      lineJoin="round"
                      opacity={line.opacity}
                    />
                  ))}
                </KonvaGroup>
              ))}

              {/* Current Drawing Layer */}
              <KonvaGroup>
                {lines.map((line, index) => (
                  <KonvaLine
                    key={`line-${index}`}
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.width}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="source-over"
                  />
                ))}
                {currentLine && (
                  <KonvaLine
                    points={currentLine.points}
                    stroke={currentLine.color}
                    strokeWidth={currentLine.width}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    globalCompositeOperation="source-over"
                  />
                )}
              </KonvaGroup>

              {/* Elements Layer */}
              {visibleElements.map((el) => (
                <KonvaGroup
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
                </KonvaGroup>
              ))}

              {/* Transformer Layer */}
              {selectedTextElement && textMenuPosition && isExplicitlySelected && (
                    <KonvaTransformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        const minSize = 5;
                        if (newBox.width < minSize || newBox.height < minSize) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                  node={stageRef.current?.findOne(`#${selectedTextElement.id}`)}
                />
              )}

              {selectionBox && (
                <KonvaRect
                  x={Math.min(selectionBox.startX, selectionBox.endX)}
                  y={Math.min(selectionBox.startY, selectionBox.endY)}
                  width={Math.abs(selectionBox.endX - selectionBox.startX)}
                  height={Math.abs(selectionBox.endY - selectionBox.startY)}
                  fill="rgba(0, 0, 255, 0.1)"
                  stroke="blue"
                  strokeWidth={1}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Tools Panel */}
        <div className="fixed left-4 top-20 z-40">
          <ToolsPanel onToolSelect={handleToolSelect} selectedTool={selectedTool as any} />
        </div>

        {/* Move Sticky Notes Layer above everything else */}
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
              key={note.id}
              id={note.id}
              x={note.x}
              y={note.y}
              text={note.content}
              style={{
                backgroundColor: note.style.backgroundColor || '#FFE4B5',
                textColor: note.style.color || '#000000',
                fontSize: typeof note.style.fontSize === 'string' ? parseInt(note.style.fontSize) : (note.style.fontSize || 14),
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              }}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onMove={handleMoveNote}
              scale={scale}
              isSelected={selectedId === note.id}
              onSelect={(id) => setSelectedId(id)}
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

      {/* Add the TextFormatMenu */}
      {selectedTextElement && textMenuPosition && (
        <TextFormatMenu
          fontSize={selectedTextElement.fontSize}
          isBold={selectedTextElement.fontStyle === 'bold'}
          textAlign={selectedTextElement.align || 'left'} // Provide default value
          isLocked={selectedTextElement.isLocked || false} // Provide default value
          position={textMenuPosition}
          onFontSizeChange={handleFontSizeChange}
          onBoldToggle={handleBoldToggle}
          onAlignChange={handleAlignChange}
          onLockToggle={handleLockToggle}
          onDelete={() => handleDeleteTextElement(selectedTextElement.id)}
        />
      )}
      {selectedDrawing && (
        <DrawingMenu
          position={selectedDrawing.position}
          currentColor={selectedDrawing.color}
          onColorChange={(color) => {
            setDrawingGroups(prev => prev.map(group => 
              group.id === selectedDrawing.id
                ? {
                    ...group,
                    lines: group.lines.map(line => ({ ...line, stroke: color }))
                  }
                : group
            ));
          }}
          onDelete={() => {
            setDrawingGroups(prev => prev.filter(group => group.id !== selectedDrawing.id));
            setSelectedDrawing(null);
            setSelectedGroupId(null);
          }}
        />
      )}

      {/* Render sticky notes */}
      {elements.map(element => {
        if (element.type === 'sticky-note') {
          return (
            <KonvaGroup
              key={element.id}
              x={element.x}
              y={element.y}
              rotation={element.rotation}
              onClick={() => setSelectedStickyNote(element)}
              draggable
              onDragEnd={(e) => {
                const node = e.target;
                setElements(prev => prev.map(el => 
                  el.id === element.id 
                    ? { ...el, x: node.x(), y: node.y() } 
                    : el
                ));
              }}
            >
                  <KonvaRect
                width={element.width}
                height={element.height}
                fill={element.style.backgroundColor}
                shadowColor={element.style.shadowColor}
                shadowBlur={10}
                shadowOffset={{ x: 2, y: 2 }}
                cornerRadius={10}
              />
              <KonvaText
                text={element.content}
                width={element.width - 20}
                height={element.height - 20}
                x={10}
                y={10}
                fill={element.style.textColor}
                fontSize={element.style.fontSize}
                padding={10}
              />
                        </KonvaGroup>
          );
        }
        return null;
      })}

      {/* Render sticky note menu */}
      {selectedStickyNote && (
        <StickyNote
          id={selectedStickyNote.id}
          x={selectedStickyNote.x}
          y={selectedStickyNote.y}
          text={selectedStickyNote.content}
          style={selectedStickyNote.style}
          onUpdate={(id: string, text: string, style: Partial<StickyNoteStyle>) => {
            handleStickyNoteContentChange(id, text);
            handleStickyNoteStyleChange(id, style);
          }}
          onDelete={handleStickyNoteDelete}
          onMove={(id: string, x: number, y: number) => {
            setElements(prev => prev.map(el => 
              el.id === id ? { ...el, x, y } : el
            ));
          }}
          isSelected={true}
          onSelect={() => {}}
          scale={scale}
        />
      )}
      {textMenuPosition && selectedTextElement && isExplicitlySelected && (
        <TextFormatMenu
          fontSize={selectedTextElement.fontSize}
          isBold={selectedTextElement.fontStyle === 'bold'}
          textAlign={selectedTextElement.align || 'left'}
          isLocked={selectedTextElement.isLocked || false}
          position={textMenuPosition}
          onFontSizeChange={handleFontSizeChange}
          onBoldToggle={handleBoldToggle}
          onAlignChange={handleAlignChange}
          onLockToggle={handleLockToggle}
          onDelete={() => handleDeleteTextElement(selectedTextElement.id)}
        />
      )}
    </div>
  );
  } catch (error) {
    console.error('[DEBUG] Error in Canvas component:', error);
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We encountered an error while rendering the canvas.</p>
          <p className="text-sm text-gray-500 mb-4">Technical details: {String(error)}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
    </div>
  );
} 
}
