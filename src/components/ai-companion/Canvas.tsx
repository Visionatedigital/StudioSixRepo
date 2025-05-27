'use client';

// Add this debugging information
console.log('[DEBUG] Canvas module loading started');

import './Canvas.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { Stage as KonvaStage } from 'konva/lib/Stage';
// Import components directly
import { Stage, Layer, Rect as KonvaRect, Circle as KonvaCircle, Line as KonvaLine, Text as KonvaText, Image as KonvaImage, Transformer as KonvaTransformer, Group as KonvaGroup, Path, Shape as KonvaShape } from 'react-konva';
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
  StickyNoteProps,
  TableElement
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
import DrawingToolsTray from './DrawingToolsTray';
import SimpleStickyNoteMenu from './SimpleStickyNoteMenu';
import { Context } from 'konva/lib/Context';
import ShapePropertiesMenu from './ShapePropertiesMenu';
import StickersMenu from './StickersMenu';
import { Transformer } from 'konva/lib/shapes/Transformer';
import UploadMenu from './UploadMenu';
import AIPopupMenu from './AIPopupMenu';
import TableFormatMenu from './TableFormatMenu';

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

interface ShapeProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
}

const DEFAULT_SHAPE_PROPERTIES: ShapeProperties = {
  fill: '#FFD700',
  stroke: '#000000',
  strokeWidth: 1,
  opacity: 1,
  rotation: 0
};

// 1. Add types for mind map nodes and connections
interface MindMapNode {
  id: string;
  type: 'mindmap-node';
  x: number;
  y: number;
  text: string;
  color: string;
  parentId?: string;
  childIds: string[];
}
interface MindMapConnection {
  id: string;
  type: 'mindmap-connection';
  from: string; // node id
  to: string;   // node id
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
    // Add state for the new simpleDraw tool
    const [simpleDrawLines, setSimpleDrawLines] = useState<any[]>([]);
    const [simpleDrawCurrentLine, setSimpleDrawCurrentLine] = useState<any | null>(null);
    const [simpleDrawActive, setSimpleDrawActive] = useState(false);
    const [simpleDrawColor, setSimpleDrawColor] = useState('#000000');
    const [simpleDrawWidth, setSimpleDrawWidth] = useState(2);
    const [simpleDrawTool, setSimpleDrawTool] = useState<'pencil' | 'marker' | 'eraser'>('pencil');
    // Selection/hover state for simpleDraw lines
    const [selectedSimpleDrawLine, setSelectedSimpleDrawLine] = useState<number | null>(null);
    const [hoveredSimpleDrawLine, setHoveredSimpleDrawLine] = useState<number | null>(null);
    const [simpleDrawLineMenuPos, setSimpleDrawLineMenuPos] = useState<{ x: number; y: number } | null>(null);
    const simpleDrawLineRefs = useRef<(any | null)[]>([]);
    // Add state for simplestickynote tool
    const [simpleStickyNotes, setSimpleStickyNotes] = useState<any[]>([]);
    const [selectedSimpleStickyNote, setSelectedSimpleStickyNote] = useState<number | null>(null);
    const [simpleStickyNoteMenuPos, setSimpleStickyNoteMenuPos] = useState<{ x: number; y: number } | null>(null);
    // State for shape placement
    const [pendingShape, setPendingShape] = useState<string | null>(null);
    const [showShapesMenu, setShowShapesMenu] = useState(false);
    const [selectedShape, setSelectedShape] = useState('square');
    const [selectedShapeElementId, setSelectedShapeElementId] = useState<string | null>(null);
    const [shapeMenuPosition, setShapeMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [pendingStickerUrl, setPendingStickerUrl] = useState<string | null>(null);
    const stickerTransformerRef = useRef<any>(null);
    const [showStickersMenu, setShowStickersMenu] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [uploadMenuFiles, setUploadMenuFiles] = useState<{
      id: string;
      name: string;
      type: string;
      url: string;
    }[]>([]);
    // Add state for table resizing
    const [tableResize, setTableResize] = useState<{
      tableId: string | null;
      type: 'col' | 'row' | null;
      index: number | null;
      startPos: number | null;
      startSize: number | null;
    }>(
      { tableId: null, type: null, index: null, startPos: null, startSize: null }
    );
    const [tableCursor, setTableCursor] = useState<string>('default');
    // Add state for table hover and cell hover
    const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; tableId: string } | null>(null);
    const [rowMenuOpen, setRowMenuOpen] = useState<number | null>(null);
    const [colMenuOpen, setColMenuOpen] = useState<number | null>(null);
    // Add local hover state for dummy row/col
    const [dummyRowHovered, setDummyRowHovered] = useState<string | null>(null);
    const [dummyColHovered, setDummyColHovered] = useState<string | null>(null);
    // Add state for drag-and-reorder
    const [draggingRow, setDraggingRow] = useState<{ tableId: string; rowIdx: number } | null>(null);
    const [dragOverRow, setDragOverRow] = useState<number | null>(null);
    const [draggingCol, setDraggingCol] = useState<{ tableId: string; colIdx: number } | null>(null);
    const [dragOverCol, setDragOverCol] = useState<number | null>(null);
    const [rowMenuHovered, setRowMenuHovered] = useState<{ tableId: string; rowIdx: number } | null>(null);
    const [colMenuHovered, setColMenuHovered] = useState<{ tableId: string; colIdx: number } | null>(null);
    // Add state for selected cell
    const [selectedCell, setSelectedCell] = useState<{ tableId: string; row: number; col: number } | null>(null);
    // Add state for editingCell and editingCellValue
    const [editingCell, setEditingCell] = useState<{ tableId: string; row: number; col: number } | null>(null);
    const [editingCellValue, setEditingCellValue] = useState('');
    // 2. Add state for mind map nodes and connections
    const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
    const [mindMapConnections, setMindMapConnections] = useState<MindMapConnection[]>([]);
    const [editingMindMapNodeId, setEditingMindMapNodeId] = useState<string | null>(null);
    const [editingMindMapNodeValue, setEditingMindMapNodeValue] = useState('');

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
      console.log('[DEBUG] handleMouseMove triggered', e);
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
        console.log('[DRAW] Update line points:', newPoints);
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

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
      console.log('[DEBUG] handleMouseDown triggered', e);
      // ... rest of handleCanvasClick logic ...
    }

    const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
      console.log('[DEBUG] handleCanvasClick TOP', { pendingShape, selectedTool });
      // Clear selection box on right click
      if (e.evt.button === 2) {
        console.log('[DEBUG] handleCanvasClick: right click, returning early');
        setSelectionBox(null);
        return;
      }

      // Get stage reference
      const stage = e.target.getStage();
      if (!stage) {
        console.log('[DEBUG] handleCanvasClick: no stage, returning early');
        return;
      }
      
      // Get pointer position
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) {
        console.log('[DEBUG] handleCanvasClick: no pointerPos, returning early');
        return;
      }
      
      // Convert to stage coordinates
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointerPos);
      
      // Check if clicking on the stage (not on an element)
      const isClickOnStage = e.target === stage;

      console.log('[DEBUG] handleCanvasClick', { pendingShape, selectedTool, isClickOnStage });

      // Handle text tool first - this should take priority when that tool is active
      if (selectedTool === 'text' && isClickOnStage) {
        console.log('Creating new text element at:', pos.x, pos.y);
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
          canvasId: currentCanvas.id,
          rotation: 0
        };
        setElements(prev => [...prev, newTextElement]);
        setSelectedId(newTextElement.id);
        
        // Automatically switch back to mouse tool after creating text
        setTool('mouse');
        setSelectedTool('mouse');
        console.log('Switched back to mouse tool after text creation');
        
        return;
      }

      // Handle drawing tools
      if (drawingMode) {
        if (isClickOnStage) {
          setCurrentLine(null);
        }
        return;
      }

      // Handle sticky note creation
      if (selectedTool === 'sticky-note' && isClickOnStage) {
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
        setSelectedStickyNote(newStickyNote);
          return;
      }

      // Handle table tool
      if (selectedTool === 'table' && isClickOnStage) {
        const defaultRows = 3;
        const defaultCols = 3;
        const defaultCellWidth = 100;
        const defaultCellHeight = 40;
        const newTable = {
          id: uuidv4(),
          type: 'table' as const,
          x: pos.x,
          y: pos.y,
          width: defaultCols * defaultCellWidth,
          height: defaultRows * defaultCellHeight,
          rows: defaultRows,
          columns: defaultCols,
          cellWidths: Array(defaultCols).fill(defaultCellWidth),
          cellHeights: Array(defaultRows).fill(defaultCellHeight),
          data: Array.from({ length: defaultRows }, () => Array(defaultCols).fill('')),
          canvasId: currentCanvas.id,
          rotation: 0
        };
        setElements(prev => [...prev, newTable]);
        setTool('mouse');
        setSelectedTool('mouse');
        return;
      }

      // Clear text menu when clicking on stage
      if (isClickOnStage) {
        console.log('[DEBUG] handleCanvasClick: isClickOnStage, returning early (default clear)');
        setTextMenuPosition(null);
        setSelectedTextElement(null);
        setSelectedGroupId(null);
        setSelectedDrawing(null);
        setIsExplicitlySelected(false);
        setSelectedCell(null); // Deselect cell/table
        setSelectedId(null); // Deselect table
        return;
      }

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

      // Handle note tool
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
        console.log('[DRAW] Start new line at:', pos.x, pos.y, 'color:', strokeColor, 'width:', strokeWidth);
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
        console.log('[DEBUG] handleCanvasClick: isClickOnStage, returning early (default clear)');
        setTextMenuPosition(null);
        setSelectedTextElement(null);
        setSelectedGroupId(null);
        setSelectedDrawing(null);
        setIsExplicitlySelected(false);
        setSelectedCell(null); // Deselect cell/table
        setSelectedId(null); // Deselect table
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

      // Handle placing a circle shape (single placement, switch to select tool)
      if (pendingShape === 'circle' && isClickOnStage) {
        console.log('[DEBUG] Placing circle at', pos.x, pos.y);
        const newId = uuidv4();
        const newCircle: ShapeElement = {
          id: newId,
          type: 'shape',
          shapeType: 'circle',
          x: pos.x,
          y: pos.y,
          width: 80,
          height: 80,
          fill: DEFAULT_SHAPE_PROPERTIES.fill,
          stroke: DEFAULT_SHAPE_PROPERTIES.stroke,
          strokeWidth: DEFAULT_SHAPE_PROPERTIES.strokeWidth,
          opacity: DEFAULT_SHAPE_PROPERTIES.opacity,
          rotation: DEFAULT_SHAPE_PROPERTIES.rotation,
          canvasId: currentCanvas.id
        };
        setElements(prev => [...prev, newCircle]);
        setSelectedShapeElementId(newId);
        setPendingShape(null);
        setSelectedTool('mouse');
        setTool('mouse');
        return;
      }
      
      // If clicking on stage (not an element), clear text menu and selection
      if (isClickOnStage) {
        console.log('[DEBUG] handleCanvasClick: isClickOnStage, returning early (default clear)');
        setTextMenuPosition(null);
        setSelectedTextElement(null);
        setSelectedGroupId(null);
        setSelectedDrawing(null);
        setIsExplicitlySelected(false);
        setSelectedCell(null); // Deselect cell/table
        setSelectedId(null); // Deselect table
        return;
      }

      // Place sticker if pendingStickerUrl is set
      if (pendingStickerUrl) {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointerPos);
        const img = new window.Image();
        img.src = pendingStickerUrl;
        img.onload = () => {
          const newSticker: UploadedElement = {
            id: uuidv4(),
            type: 'uploaded' as const,
            x: pos.x - 40,
            y: pos.y - 40,
            width: 80,
            height: 80,
            image: img,
            file: undefined as any,
            canvasId: currentCanvas.id,
            rotation: 0
          };
          setElements(prev => [...prev, newSticker]);
        };
        setPendingStickerUrl(null);
        setSelectedTool('mouse');
        setTool('mouse');
        return;
      }
    };

    const handleToolSelect = (toolId: Tool, templateId?: string, drawingTool?: 'pencil' | 'marker' | 'eraser', color?: string, width?: number) => {
      console.log('Tool selected:', toolId, 'Template:', templateId, 'DrawingTool:', drawingTool, 'Color:', color, 'Width:', width, 'Current tool:', selectedTool);
      
      if (toolId === 'container' && templateId) {
        setSelectedTemplateId(templateId);
        setSelectedTool(toolId);
        setTool(toolId);
        return;
      }
      
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
        if (drawingTool) {
          // Optionally store the drawing tool type if you want to use it
          // setDrawingTool(drawingTool); // Uncomment if you have this state
        }
        if (color) setStrokeColor(color);
        if (width) setStrokeWidth(width);
      } else {
        setDrawingMode(false);
      }
      
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
    const gridSize = 32; // or your preferred spacing
    
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
      const startX = Math.floor((viewportLeft - buffer) / gridSize) * gridSize;
      const endX = Math.ceil((viewportRight + buffer) / gridSize) * gridSize;
      const startY = Math.floor((viewportTop - buffer) / gridSize) * gridSize;
      const endY = Math.ceil((viewportBottom + buffer) / gridSize) * gridSize;

      // Dot size and opacity
      let dotSize = 1;
      if (scale >= 4) dotSize = 1.5;
      else if (scale >= 2) dotSize = 1.25;
      else if (scale >= 1) dotSize = 1;
      else if (scale >= 0.5) dotSize = 0.75;
      else dotSize = 0.5;
      const opacity = scale < 0.2 ? 0.15 : scale < 0.5 ? 0.2 : 0.25;

      // Draw dots at grid intersections
      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
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
      const url = e.dataTransfer.getData('text/plain');
      if (url && url.startsWith('http')) {
        // Use Konva Stage pointer position for accurate placement
        if (stageRef.current) {
          const stage = stageRef.current;
          const pointer = stage.getPointerPosition();
          if (pointer) {
          const img = new window.Image();
            img.src = url;
            img.onload = () => {
              const newSticker: UploadedElement = {
                id: uuidv4(),
                type: 'uploaded' as const,
                x: pointer.x - 40,
                y: pointer.y - 40,
                width: 80,
                height: 80,
                image: img,
                file: undefined as any,
                canvasId: currentCanvas.id,
                rotation: 0
              };
              setElements(prev => [...prev, newSticker]);
            };
          }
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
          if (!(uploadImage.image instanceof window.Image)) return null;
          return (
            <KonvaImage
              key={uploadImage.id}
              id={uploadImage.id}
              image={uploadImage.image}
              alt={uploadImage.alt}
              x={uploadImage.x}
              y={uploadImage.y}
              width={uploadImage.width}
              height={uploadImage.height}
              draggable
              onClick={() => setSelectedId(uploadImage.id)}
              onDragEnd={e => {
                const node = e.target;
                handleElementChange(uploadImage.id, { x: node.x(), y: node.y() });
              }}
              onTransformEnd={e => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                handleElementChange(uploadImage.id, {
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(10, node.width() * scaleX),
                  height: Math.max(10, node.height() * scaleY),
                });
                node.scaleX(1);
                node.scaleY(1);
              }}
              style={{
                transform: `rotate(${uploadImage.rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          );
        }
        case 'generated-image': {
          const genImage = element as GeneratedImageElement;
          if (!(genImage.image instanceof window.Image)) return null;
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
                onClick={handleMouseDown}
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
        case 'table': {
          const table = element as TableElement;
          const { x, y, cellWidths, cellHeights, id, data } = table;
          const isSelected = selectedId === id;
          const isTableHovered = hoveredTableId === id;
          // Menu is visible if table or menu is hovered
          const isRowMenuVisible = isSelected && (isTableHovered || (rowMenuHovered?.tableId === id));
          const isColMenuVisible = isSelected && (isTableHovered || (colMenuHovered?.tableId === id));

          // Calculate total width/height
          const totalWidth = cellWidths.reduce((a, b) => a + b, 0);
          const totalHeight = cellHeights.reduce((a, b) => a + b, 0);

          // Dummy row/column UI
          const showDummyRow = isSelected && (hoveredTableId === id || dummyRowHovered === id);
          const showDummyCol = isSelected && (hoveredTableId === id || dummyColHovered === id);

          // Handlers for add row/column
          const handleAddRow = (rowIdx: number) => {
                      const newCellHeights = [...cellHeights];
            newCellHeights.splice(rowIdx, 0, 40);
            const newData = [...data];
            newData.splice(rowIdx, 0, Array(cellWidths.length).fill(''));
            handleElementChange(id, {
              cellHeights: newCellHeights,
              data: newData,
              rows: table.rows + 1
            });
          };
          const handleAddCol = (colIdx: number) => {
            const newCellWidths = [...cellWidths];
            newCellWidths.splice(colIdx, 0, 100);
            const newData = data.map(row => {
              const newRow = [...row];
              newRow.splice(colIdx, 0, '');
              return newRow;
            });
            handleElementChange(id, {
              cellWidths: newCellWidths,
              data: newData,
              columns: table.columns + 1
            });
          };

          // Render three-dot menu for row
          const renderRowMenu = (rowIdx: number) => (
            rowMenuOpen === rowIdx && (
              <Html key={`row-menu-${rowIdx}`}> 
                <div style={{
                  position: 'absolute',
                  left: totalWidth + 8,
                  top: cellHeights.slice(0, rowIdx).reduce((a, b) => a + b, 0) + 4,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: 6,
                  zIndex: 1000,
                  minWidth: 120
                }}>
                  <div style={{ cursor: 'pointer', padding: 4 }} onClick={() => handleAddRow(rowIdx)}>Add row above</div>
                  <div style={{ cursor: 'pointer', padding: 4 }} onClick={() => handleAddRow(rowIdx + 1)}>Add row below</div>
                  <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
                  <div style={{ cursor: 'grab', padding: 4, color: '#888' }}>Drag to reorder (coming soon)</div>
                </div>
              </Html>
            )
          );
          // Render three-dot menu for column
          const renderColMenu = (colIdx: number) => (
            colMenuOpen === colIdx && (
              <Html key={`col-menu-${colIdx}`}> 
                <div style={{
                  position: 'absolute',
                  left: cellWidths.slice(0, colIdx).reduce((a, b) => a + b, 0) + 4,
                  top: totalHeight + 8,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  padding: 6,
                  zIndex: 1000,
                  minWidth: 120
                }}>
                  <div style={{ cursor: 'pointer', padding: 4 }} onClick={() => handleAddCol(colIdx)}>Add column left</div>
                  <div style={{ cursor: 'pointer', padding: 4 }} onClick={() => handleAddCol(colIdx + 1)}>Add column right</div>
                  <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }} />
                  <div style={{ cursor: 'grab', padding: 4, color: '#888' }}>Drag to reorder (coming soon)</div>
                </div>
              </Html>
            )
          );

          // Helper: get mouse position relative to table
          const getRelativePos = (evt: any) => {
            const stage = evt.target.getStage();
            const pointer = stage.getPointerPosition();
            return {
              x: pointer.x - x,
              y: pointer.y - y
            };
          };

          // Mouse move handler for border detection
          const handleTableMouseMove = (evt: any) => {
            if (!isSelected) return;
            if (tableResize.tableId === id && tableResize.type) {
              // If resizing, update size
              const rel = getRelativePos(evt);
              if (tableResize.type === 'col' && tableResize.index !== null && tableResize.startPos !== null && tableResize.startSize !== null) {
                const delta = rel.x - tableResize.startPos;
                const newWidths = [...cellWidths];
                newWidths[tableResize.index] = Math.max(20, tableResize.startSize + delta);
                handleElementChange(id, { cellWidths: newWidths });
              } else if (tableResize.type === 'row' && tableResize.index !== null && tableResize.startPos !== null && tableResize.startSize !== null) {
                const delta = rel.y - tableResize.startPos;
                const newHeights = [...cellHeights];
                newHeights[tableResize.index] = Math.max(20, tableResize.startSize + delta);
                handleElementChange(id, { cellHeights: newHeights });
              }
              return;
            }
            // If not resizing, check proximity to borders
            const rel = getRelativePos(evt);
            let found = false;
            // Check columns (vertical borders)
            let accX = 0;
            for (let i = 0; i < cellWidths.length - 1; i++) {
              accX += cellWidths[i];
              if (Math.abs(rel.x - accX) < 6 && rel.y > 0 && rel.y < totalHeight) {
                setTableCursor('col-resize');
                found = true;
                break;
              }
            }
            // Check rows (horizontal borders)
            if (!found) {
              let accY = 0;
              for (let i = 0; i < cellHeights.length - 1; i++) {
                accY += cellHeights[i];
                if (Math.abs(rel.y - accY) < 6 && rel.x > 0 && rel.x < totalWidth) {
                  setTableCursor('row-resize');
                  found = true;
                  break;
                }
              }
            }
            if (!found) setTableCursor('default');
          };

          // Mouse down handler to start resizing
          const handleTableMouseDown = (evt: any) => {
            if (!isSelected) return;
            const rel = getRelativePos(evt);
            // Check columns
            let accX = 0;
            for (let i = 0; i < cellWidths.length - 1; i++) {
              accX += cellWidths[i];
              if (Math.abs(rel.x - accX) < 6 && rel.y > 0 && rel.y < totalHeight) {
                setTableResize({ tableId: id, type: 'col', index: i, startPos: accX, startSize: cellWidths[i] });
                return;
              }
            }
            // Check rows
            let accY = 0;
            for (let i = 0; i < cellHeights.length - 1; i++) {
              accY += cellHeights[i];
              if (Math.abs(rel.y - accY) < 6 && rel.x > 0 && rel.x < totalWidth) {
                setTableResize({ tableId: id, type: 'row', index: i, startPos: accY, startSize: cellHeights[i] });
                return;
              }
            }
          };

          // Mouse up handler to finish resizing
          const handleTableMouseUp = (evt: any) => {
            if (tableResize.tableId === id) {
              setTableResize({ tableId: null, type: null, index: null, startPos: null, startSize: null });
              setTableCursor('default');
            }
          };

          // Mouse leave handler to reset cursor
          const handleTableMouseLeave = () => {
            setTableCursor('default');
            if (tableResize.tableId === id) {
              setTableResize({ tableId: null, type: null, index: null, startPos: null, startSize: null });
            }
          };

          const cellStyle = (table.cellStyles && selectedCell && table.cellStyles[selectedCell.row]?.[selectedCell.col]) || {};

          return (
            <KonvaGroup
              key={id}
              x={x}
              y={y}
              draggable={tool === 'mouse'}
              onDragEnd={e => {
                const node = e.target;
                handleElementChange(id, { x: node.x(), y: node.y() });
              }}
              onClick={() => setSelectedId(id)}
              onMouseEnter={() => setHoveredTableId(id)}
              onMouseLeave={() => setHoveredTableId(null)}
              onMouseMove={handleTableMouseMove}
              onMouseDown={handleTableMouseDown}
              onMouseUp={handleTableMouseUp}
              listening={true}
              style={{ cursor: isSelected ? tableCursor : 'default' }}
            >
              {/* Render cells */}
              {cellHeights.map((rowHeight, rowIdx) => {
                let cellX = 0;
                const cells = cellWidths.map((colWidth, colIdx) => {
                  const isCellSelected = selectedCell && selectedCell.tableId === id && selectedCell.row === rowIdx && selectedCell.col === colIdx;
                  const cellY = cellHeights.slice(0, rowIdx).reduce((a, b) => a + b, 0);
                  const style = (table.cellStyles && table.cellStyles[rowIdx]?.[colIdx]) || {};
                  const isEditingCell = editingCell && editingCell.tableId === id && editingCell.row === rowIdx && editingCell.col === colIdx;
                  const cellData = data[rowIdx][colIdx];

                  let cell = null;
                  if (isEditingCell) {
                    // Only render the textarea overlay for the editing cell
                    cell = (
                      <Html key={`cell-edit-${rowIdx}-${colIdx}`}>
                        <div
                          style={{
                            position: 'absolute',
                            left: cellX,
                            top: cellY,
                            width: colWidth,
                            height: rowHeight,
                            background: 'white',
                            border: '1px solid #814ADA',
                            borderRadius: 4,
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <textarea
                            value={editingCellValue}
                            onChange={e => setEditingCellValue(e.target.value)}
                            onBlur={() => {
                              // Save text to table.data
                              const newData = data.map(row => [...row]);
                              newData[rowIdx][colIdx] = editingCellValue;
                              handleElementChange(id, { data: newData });
                              setEditingCell(null);
                              setEditingCellValue('');
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                const newData = data.map(row => [...row]);
                                newData[rowIdx][colIdx] = editingCellValue;
                                handleElementChange(id, { data: newData });
                                setEditingCell(null);
                                setEditingCellValue('');
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              outline: 'none',
                              fontSize: style.fontSize || table.fontSize || 14,
                              fontFamily: style.fontFamily || table.fontFamily || 'Inter',
                              padding: 4,
                              resize: 'none',
                              background: 'transparent',
                            }}
                            autoFocus
                          />
                        </div>
                      </Html>
                    );
                  } else {
                    // For all other cells, render as before
                    cell = (
                      <React.Fragment key={`cell-${rowIdx}-${colIdx}`}>
                        <KonvaRect
                          x={cellX}
                          y={cellY}
                          width={colWidth}
                          height={rowHeight}
                          stroke={isCellSelected ? '#814ADA' : (style.borderColor || table.borderColor || '#333')}
                          strokeWidth={isCellSelected ? 2 : 1}
                          fill={style.fill || table.cellFill || '#fff'}
                          onClick={e => {
                            e.cancelBubble = true;
                            if (!isSelected) {
                              setSelectedId(id);
                              return;
                            }
                            if (!isCellSelected) {
                              setSelectedCell({ tableId: id, row: rowIdx, col: colIdx });
                              return;
                            }
                            // If already selected, enter edit mode
                            setEditingCell({ tableId: id, row: rowIdx, col: colIdx });
                            setEditingCellValue(cellData);
                          }}
                        />
                        <KonvaText
                          x={cellX + 4}
                          y={cellY + 4}
                          width={colWidth - 8}
                          height={rowHeight - 8}
                          text={cellData}
                          fontSize={style.fontSize || table.fontSize || 14}
                          fontFamily={style.fontFamily || table.fontFamily || 'Inter'}
                          fill="#000"
                          padding={4}
                          listening={false}
                        />
                      </React.Fragment>
                    );
                  }
                  cellX += colWidth; // <-- increment cellX for the next column
                  return cell;
                });
                return cells;
              })}
              {/* Dummy row (add row) */}
              {showDummyRow && (
                <Html>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: totalHeight,
                      width: totalWidth,
                      height: 32,
                      background: 'rgba(180,180,180,0.08)',
                      border: '1px dashed #bbb',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onMouseEnter={() => setDummyRowHovered(id)}
                    onMouseLeave={() => setDummyRowHovered(null)}
                    onClick={() => handleAddRow(cellHeights.length)}
                  >
                    <span style={{ fontSize: 20, color: '#888' }}>+</span>
                  </div>
                </Html>
              )}
              {/* Dummy column (add column) */}
              {showDummyCol && (
                <Html>
                  <div
                    style={{
                      position: 'absolute',
                      left: totalWidth,
                      top: 0,
                      width: 32,
                      height: totalHeight,
                      background: 'rgba(180,180,180,0.08)',
                      border: '1px dashed #bbb',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onMouseEnter={() => setDummyColHovered(id)}
                    onMouseLeave={() => setDummyColHovered(null)}
                    onClick={() => handleAddCol(cellWidths.length)}
                  >
                    <span style={{ fontSize: 20, color: '#888' }}>+</span>
                  </div>
                </Html>
              )}
            </KonvaGroup>
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

    // Overload to handle both text and table editing
    const handleTextEditComplete = (arg1: any, arg2?: number, arg3?: number) => {
      if (typeof arg1 === 'object' && arg1.type === 'text') {
        // Text element editing
        const textElement = arg1;
        handleElementChange(textElement.id, { text: editingTextValue });
      setEditingTextId(null);
      setEditingTextValue('');
      } else if (typeof arg1 === 'string' && typeof arg2 === 'number' && typeof arg3 === 'number') {
        // Table cell editing
        const id = arg1;
        const rowIdx = arg2;
        const colIdx = arg3;
        const table = elements.find(el => el.id === id) as TableElement;
        if (table) {
          const newData = [...table.data];
          newData[rowIdx][colIdx] = editingTextValue;
          handleElementChange(id, { data: newData });
          setEditingTextId(null);
          setEditingTextValue('');
        }
      }
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

      // Calculate the position directly above the text element
      const centerX = element.x + (element.width || 0) / 2;
      const menuY = element.y - 10; // Position menu just above the text (was -30)

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

    // Add missing handler stubs if not already defined
    const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
      console.log('[DEBUG] handleMouseUp triggered', e);
      if (isDrawing && currentLine) {
        console.log('[DRAW] Finish line:', currentLine);
        setLines(prev => [...prev, currentLine]);
        setCurrentLine(null);
        setIsDrawing(false);
      }
    };
    const handleTransformEnd = () => {};
    const handleDragStart = () => {};
    const handleWheel = () => {};
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
    const handleMouseLeave = () => {};
    const handleUpdateNote = () => {};
    const handleDeleteNote = () => {};
    const handleMoveNote = () => {};

    // Minimal handlers for simpleDraw
    const handleSimpleDrawMouseDown = (e: any) => {
      if (selectedTool !== 'simpleDraw') return;
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      setSimpleDrawActive(true);
      setSimpleDrawCurrentLine({
        tool: simpleDrawTool,
        color: simpleDrawColor,
        width: simpleDrawWidth,
        points: [pointerPos.x, pointerPos.y],
      });
    };
    const handleSimpleDrawMouseMove = (e: any) => {
      if (!simpleDrawActive || !simpleDrawCurrentLine) return;
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      setSimpleDrawCurrentLine((prev: any) => prev ? {
        ...prev,
        points: [...prev.points, pointerPos.x, pointerPos.y],
      } : prev);
    };
    const handleSimpleDrawMouseUp = (e: any) => {
      if (!simpleDrawActive || !simpleDrawCurrentLine) return;
      setSimpleDrawLines((prev) => [...prev, simpleDrawCurrentLine]);
      setSimpleDrawCurrentLine(null);
      setSimpleDrawActive(false);
    };

    // Add lock state to lines
    const handleToggleLockSimpleDrawLine = (idx: number) => {
      setSimpleDrawLines(prev => prev.map((line, i) => i === idx ? { ...line, locked: !line.locked } : line));
    };
    const handleDeleteSimpleDrawLine = (idx: number) => {
      setSimpleDrawLines(prev => prev.filter((_, i) => i !== idx));
      setSelectedSimpleDrawLine(null);
      setSimpleDrawLineMenuPos(null);
    };
    // ... existing code ...
    // Unselect on canvas click
    const handleStageClick = (e: any) => {
      // Only unselect if clicking on empty space
      if (e.target === e.target.getStage()) {
        setSelectedSimpleDrawLine(null);
        setSimpleDrawLineMenuPos(null);
      }
    };

    // Handle canvas click for simplestickynote
    const handleSimpleStickyNoteCanvasClick = (e: any) => {
      if (selectedTool !== 'simplestickynote') return;
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      const newNote = {
        x: pointerPos.x,
        y: pointerPos.y,
        width: 200,
        height: 200,
        color: '#FFE066',
        font: 'Inter',
        align: 'center',
        text: '',
        rotation: 0, // always straight
      };
      setSimpleStickyNotes(prev => [...prev, newNote]);
      setSelectedTool('mouse');
      setTool('mouse');
    };

    // Handler for shape selection from the menu
    const handleShapeSelect = (shapeId: string) => {
      setSelectedShape(shapeId);
      setPendingShape(shapeId);
      setShowShapesMenu?.(false);
    };

    const handleShapePlacement = (e: KonvaEventObject<MouseEvent>) => {
      if (!pendingShape) return;

      const stage = stageRef.current;
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const newId = uuidv4();
      const newShape: ShapeElement = {
        id: newId,
        type: 'shape',
        shapeType: pendingShape as 'square' | 'circle' | 'triangle' | 'diamond' | 'star',
        x: pointerPos.x,
        y: pointerPos.y,
        width: 80,
        height: 80,
        fill: DEFAULT_SHAPE_PROPERTIES.fill,
        stroke: DEFAULT_SHAPE_PROPERTIES.stroke,
        strokeWidth: DEFAULT_SHAPE_PROPERTIES.strokeWidth,
        opacity: DEFAULT_SHAPE_PROPERTIES.opacity,
        rotation: DEFAULT_SHAPE_PROPERTIES.rotation,
        canvasId: currentCanvas.id
      };

      setElements(prev => [...prev, newShape]);
      setSelectedShapeElementId(newId);
      setPendingShape(null);
      setSelectedTool('mouse');
      setTool('mouse');
    };

    const handleShapeClick = (e: KonvaEventObject<MouseEvent>, shape: ShapeElement) => {
      if (tool === 'mouse') {
        e.cancelBubble = true;
        setSelectedId(shape.id);
        setSelectedShapeElementId(shape.id);

        // Show shape properties menu
        const stage = stageRef.current;
        if (stage) {
          const pointerPos = stage.getPointerPosition();
          if (pointerPos) {
            setShapeMenuPosition({
              x: pointerPos.x,
              y: pointerPos.y
            });
          }
        }
      }
    };

    const handleShapePropertiesChange = (id: string, changes: Partial<ShapeElement>) => {
      setElements(prev => prev.map(el => {
        if (el.id === id && el.type === 'shape') {
          return { ...el, ...changes } as ShapeElement;
        }
        return el;
      }));
    };

    const handleShapeDelete = (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      setSelectedShapeElementId(null);
      setShapeMenuPosition(null);
    };

    // Update renderShapeElement to use handleShapeClick
    const renderShapeElement = (element: ShapeElement) => {
      const isSelected = selectedId === element.id;
      // Convert 'none' to 'transparent' for Konva, always use string
      const fill: string = element.fill === 'none' ? 'transparent' : (element.fill || 'transparent');
      const stroke: string = element.stroke === 'none' ? 'transparent' : (element.stroke || 'transparent');
      const commonProps = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        fill,
        stroke,
        strokeWidth: element.strokeWidth,
        opacity: element.opacity,
        rotation: element.rotation,
        draggable: tool === 'mouse',
        onClick: (e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, element),
        onTransformEnd: (e: KonvaEventObject<Event>) => {
                const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

                setElements(prev => prev.map(el =>
            el.id === element.id
              ? {
                  ...el,
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(5, node.height() * scaleY),
                  rotation: node.rotation()
                }
              : el
                ));

          node.scaleX(1);
          node.scaleY(1);
        }
      };

      switch (element.shapeType) {
        case 'square':
          return <KonvaRect {...commonProps} />;
        case 'circle':
          return <KonvaCircle {...commonProps} radius={element.width / 2} />;
        case 'triangle':
          return (
            <KonvaShape
              {...commonProps}
              sceneFunc={(context, shape) => {
                context.beginPath();
                context.moveTo(0, element.height);
                context.lineTo(element.width / 2, 0);
                context.lineTo(element.width, element.height);
                context.closePath();
                context.fillStrokeShape(shape);
              }}
            />
          );
        case 'diamond':
          return (
            <KonvaShape
              {...commonProps}
              sceneFunc={(context, shape) => {
                context.beginPath();
                context.moveTo(element.width / 2, 0);
                context.lineTo(element.width, element.height / 2);
                context.lineTo(element.width / 2, element.height);
                context.lineTo(0, element.height / 2);
                context.closePath();
                context.fillStrokeShape(shape);
              }}
            />
          );
        case 'star':
          return (
            <KonvaShape
              {...commonProps}
              sceneFunc={(context, shape) => {
                const spikes = 5;
                const outerRadius = element.width / 2;
                const innerRadius = outerRadius / 2;
                const centerX = element.width / 2;
                const centerY = element.height / 2;

                context.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                  const radius = i % 2 === 0 ? outerRadius : innerRadius;
                  const angle = (i * Math.PI) / spikes;
                  const x = centerX + radius * Math.sin(angle);
                  const y = centerY - radius * Math.cos(angle);
                  if (i === 0) {
                    context.moveTo(x, y);
                  } else {
                    context.lineTo(x, y);
                  }
                }
                context.closePath();
                context.fillStrokeShape(shape);
              }}
            />
        );
        default:
      return null;
      }
    };

    // Add drag-and-drop for stickers
    const handleCanvasDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };
    const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const url = e.dataTransfer.getData('text/plain');
      if (url && url.startsWith('http') && stageRef.current) {
        const stage = stageRef.current;
        const containerRect = stage.container().getBoundingClientRect();
        // Calculate position relative to the stage, then adjust for scale and pan
        const x = (e.clientX - containerRect.left - position.x) / scale;
        const y = (e.clientY - containerRect.top - position.y) / scale;
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          const newSticker: UploadedElement = {
            id: uuidv4(),
            type: 'uploaded' as const,
            x: x - 40,
            y: y - 40,
            width: 80,
            height: 80,
            image: img,
            file: undefined as any,
            canvasId: currentCanvas.id,
            rotation: 0
          };
          setElements(prev => [...prev, newSticker]);
        };
        // Close the sticker menu and switch back to mouse tool
        setShowStickersMenu(false);
        setSelectedTool('mouse');
        setTool('mouse');
      }
    };

    useEffect(() => {
      if (!selectedId || !stickerTransformerRef.current) return;
      const selectedElement = elements.find(el => el.id === selectedId && el.type === 'uploaded');
      if (selectedElement && stageRef.current) {
        const stage = stageRef.current;
        if (!stage) return;
        const node = stage.findOne(`#${selectedId}`);
        if (node && typeof stickerTransformerRef.current.nodes === 'function') {
          stickerTransformerRef.current.nodes([node]);
          const layer = stickerTransformerRef.current.getLayer();
          if (layer) layer.batchDraw();
        }
      }
    }, [selectedId, elements]);

    // Keydown handler for deleting selected sticker
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
          const selectedElement = elements.find(el => el.id === selectedId && el.type === 'uploaded');
          if (selectedElement) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, elements]);

    // Attach transformer to selected sticker
    useEffect(() => {
      if (!selectedId || !stageRef.current || !stickerTransformerRef.current) return;
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        stickerTransformerRef.current.nodes([node]);
        stickerTransformerRef.current.getLayer()?.batchDraw();
      }
    }, [selectedId, elements]);

    // When the stickers tool is selected, open the menu
    useEffect(() => {
      if (selectedTool === 'stickers') {
        setShowStickersMenu(true);
      } else {
        setShowStickersMenu(false);
      }
    }, [selectedTool]);

    // When the upload tool is selected, open the menu
    useEffect(() => {
      if (selectedTool === 'upload') {
        setShowUploadMenu(true);
      } else {
        setShowUploadMenu(false);
      }
    }, [selectedTool]);

    // Handler for uploading files
    const handleUploadFiles = (files: FileList) => {
      const newFiles = Array.from(files).map(file => {
        const url = URL.createObjectURL(file);
        return {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          url,
        };
      });
      setUploadMenuFiles(prev => [...prev, ...newFiles]);
    };

    // Handler for removing files
    const handleRemoveFile = (id: string) => {
      setUploadMenuFiles(prev => prev.filter(file => file.id !== id));
    };

    const selectedTable = selectedId ? elements.find(el => el.id === selectedId && el.type === 'table') as TableElement : null;
    let tableMenuPos = null;
    if (selectedTable) {
      // Calculate menu position: above the table, centered
      const tableX = selectedTable.x;
      const tableY = selectedTable.y;
      const tableWidth = selectedTable.cellWidths.reduce((a, b) => a + b, 0);
      const menuWidth = 280; // Set fixed menu width for centering
      tableMenuPos = {
        x: tableX + tableWidth / 2 - menuWidth / 2,
        y: Math.max(0, tableY - 56), // 56px above table
      };
    }

    // On mouse up, if draggingRow and dragOverRow are set, perform reorder
    useEffect(() => {
      if (draggingRow && dragOverRow !== null && draggingRow.rowIdx !== dragOverRow) {
        const table = elements.find(el => el.id === draggingRow.tableId) as TableElement;
        if (table) {
          const newData = [...table.data];
          const [movedRow] = newData.splice(draggingRow.rowIdx, 1);
          newData.splice(dragOverRow, 0, movedRow);
          const newHeights = [...table.cellHeights];
          const [movedHeight] = newHeights.splice(draggingRow.rowIdx, 1);
          newHeights.splice(dragOverRow, 0, movedHeight);
          handleElementChange(table.id, { data: newData, cellHeights: newHeights });
        }
        setDraggingRow(null);
        setDragOverRow(null);
      }
    }, [draggingRow, dragOverRow]);

    // Repeat similar logic for columns (draggingCol, dragOverCol)
    useEffect(() => {
      if (draggingCol && dragOverCol !== null && draggingCol.colIdx !== dragOverCol) {
        const table = elements.find(el => el.id === draggingCol.tableId) as TableElement;
        if (table) {
          const newData = [...table.data];
          const [movedCol] = newData.map(row => row[draggingCol.colIdx]);
          newData.forEach(row => row.splice(draggingCol.colIdx, 1));
          newData.forEach(row => row.splice(dragOverCol, 0, movedCol));
          const newWidths = [...table.cellWidths];
          const [movedWidth] = newWidths.splice(draggingCol.colIdx, 1);
          newWidths.splice(dragOverCol, 0, movedWidth);
          handleElementChange(table.id, { data: newData, cellWidths: newWidths });
        }
        setDraggingCol(null);
        setDragOverCol(null);
      }
    }, [draggingCol, dragOverCol]);

    // 3. Handle canvas click for mindmap tool
    const handleMindMapCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
      if (selectedTool !== 'mindmap') return;
      const stage = e.target.getStage();
      if (!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;
      // Create a new node at the clicked position
      const newNode: MindMapNode = {
        id: uuidv4(),
        type: 'mindmap-node',
        x: pointerPos.x,
        y: pointerPos.y,
        text: '',
        color: '#4CAF50', // Default green
        childIds: []
      };
      setMindMapNodes(prev => [...prev, newNode]);
      setEditingMindMapNodeId(newNode.id);
      setEditingMindMapNodeValue('');
    };

    // 4. Add handler for '+' button click to create a new node in a direction
    const handleAddMindMapNode = (fromNode: MindMapNode, direction: 'top' | 'right' | 'bottom' | 'left') => {
      // Offset for new node
      const offset = 120;
      let dx = 0, dy = 0;
      if (direction === 'top') dy = -offset;
      if (direction === 'bottom') dy = offset;
      if (direction === 'left') dx = -offset;
      if (direction === 'right') dx = offset;
      const newNode: MindMapNode = {
        id: uuidv4(),
        type: 'mindmap-node',
        x: fromNode.x + dx,
        y: fromNode.y + dy,
        text: '',
        color: '#F48FB1', // Pink for children
        parentId: fromNode.id,
        childIds: []
      };
      setMindMapNodes(prev => prev.map(n => n.id === fromNode.id ? { ...n, childIds: [...n.childIds, newNode.id] } : n).concat(newNode));
      setMindMapConnections(prev => [...prev, { id: uuidv4(), type: 'mindmap-connection', from: fromNode.id, to: newNode.id }]);
      setEditingMindMapNodeId(newNode.id);
      setEditingMindMapNodeValue('');
    };

    // 5. Render mind map nodes and connections
    const renderMindMap = () => (
      <>
        {/* Render connections */}
        {mindMapConnections.map(conn => {
          const fromNode = mindMapNodes.find(n => n.id === conn.from);
          const toNode = mindMapNodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;
          return (
            <KonvaLine
              key={conn.id}
              points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
              stroke="#F8BBD0"
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          );
        })}
        {/* Render nodes */}
        {mindMapNodes.map(node => {
          const isEditing = editingMindMapNodeId === node.id;
          const width = 140, height = 60;
          return (
            <KonvaGroup
              key={node.id}
              x={node.x - width / 2}
              y={node.y - height / 2}
              draggable
              onDragEnd={e => {
                const newX = e.target.x() + width / 2;
                const newY = e.target.y() + height / 2;
                setMindMapNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: newX, y: newY } : n));
              }}
              onClick={e => {
                e.cancelBubble = true;
                setEditingMindMapNodeId(node.id);
                setEditingMindMapNodeValue(node.text);
              }}
            >
              <KonvaRect
                width={width}
                height={height}
                fill={node.color}
                cornerRadius={30}
                shadowBlur={isEditing ? 10 : 4}
                shadowColor="#888"
                stroke={isEditing ? '#1976D2' : 'transparent'}
                strokeWidth={isEditing ? 2 : 0}
              />
              <KonvaText
                text={node.text || (isEditing ? '' : 'Main Topic')}
                x={16}
                y={height / 2 - 14}
                width={width - 32}
                height={28}
                fontSize={28}
                fontFamily="Inter"
                fill="#333"
                align="center"
                verticalAlign="middle"
                listening={false}
                opacity={node.text ? 1 : 0.4}
              />
              {/* Render + buttons on all four sides */}
              {(['top', 'right', 'bottom', 'left'] as const).map(dir => {
                const btnSize = 28;
                let btnX = width / 2 - btnSize / 2, btnY = -btnSize / 2;
                if (dir === 'right') { btnX = width - btnSize / 2; btnY = height / 2 - btnSize / 2; }
                if (dir === 'bottom') { btnX = width / 2 - btnSize / 2; btnY = height - btnSize / 2; }
                if (dir === 'left') { btnX = -btnSize / 2; btnY = height / 2 - btnSize / 2; }
                return (
                  <KonvaGroup
                    key={dir}
                    x={btnX}
                    y={btnY}
                    onClick={e => {
                      e.cancelBubble = true;
                      handleAddMindMapNode(node, dir);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <KonvaCircle
                      radius={btnSize / 2}
                      fill="#fff"
                      stroke="#888"
                      strokeWidth={1}
                      shadowBlur={2}
                    />
                    <KonvaText
                      text="+"
                      x={-btnSize / 2}
                      y={-btnSize / 2 + 2}
                      width={btnSize}
                      height={btnSize}
                      fontSize={22}
                      fontFamily="Inter"
                      fill="#888"
                      align="center"
                      verticalAlign="middle"
                    />
                  </KonvaGroup>
                );
              })}
              {/* Render editable text overlay if editing */}
              {isEditing && (
                <Html>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: height / 2 - 18,
                      width: width,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    <input
                      value={editingMindMapNodeValue}
                      onChange={e => setEditingMindMapNodeValue(e.target.value)}
                      onBlur={() => {
                        setMindMapNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: editingMindMapNodeValue } : n));
                        setEditingMindMapNodeId(null);
                        setEditingMindMapNodeValue('');
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setMindMapNodes(prev => prev.map(n => n.id === node.id ? { ...n, text: editingMindMapNodeValue } : n));
                          setEditingMindMapNodeId(null);
                          setEditingMindMapNodeValue('');
                        }
                      }}
                      style={{
                        width: '90%',
                        height: 32,
                        fontSize: 24,
                        border: 'none',
                        outline: 'none',
                        borderRadius: 8,
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.8)'
                      }}
                      autoFocus
                    />
                  </div>
                </Html>
              )}
            </KonvaGroup>
          );
        })}
      </>
    );

    return (
      <div
        className="h-screen w-full relative bg-[#fafafa]"
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
      >
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
            onMouseDown={e => { handleCanvasClick(e); handleSimpleDrawMouseDown(e); handleStageClick(e); handleSimpleStickyNoteCanvasClick(e); handleShapePlacement(e); handleMindMapCanvasClick(e); }}
            onMouseUp={e => { handleMouseUp(e); handleSimpleDrawMouseUp(e); }}
            onMouseMove={e => { handleMouseMove(e); handleSimpleDrawMouseMove(e); }}
            onWheel={handleWheel}
            onMouseEnter={handleStageMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={stageRef}
            draggable={isDraggingCanvas}
            onDragStart={handleDragStart}
            id="studio-canvas"
            style={{
              display: 'block',
              backgroundColor: 'white'
            }}
          >
            <Layer>
              {/* Restore the polka dot grid */}
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
                {lines.map((line, index) => {
                  console.log('[DRAW] Render line', index, line);
                  return (
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
                  );
                })}
                {currentLine && (
                  console.log('[DRAW] Render currentLine', currentLine),
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
            {/* SimpleDraw Layer - moved inside Stage */}
            <Layer>
              {simpleDrawLines.map((line, idx) => (
                <KonvaLine
                  key={idx}
                  ref={el => simpleDrawLineRefs.current[idx] = el}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.width}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                  draggable={selectedSimpleDrawLine === idx && !line.locked}
                  onMouseEnter={() => setHoveredSimpleDrawLine(idx)}
                  onMouseLeave={() => setHoveredSimpleDrawLine(null)}
                  onClick={e => {
                    setSelectedSimpleDrawLine(idx);
                    // Calculate bounding box for menu
                    const node = simpleDrawLineRefs.current[idx];
                    if (node) {
                      const box = node.getClientRect();
                      setSimpleDrawLineMenuPos({ x: box.x + box.width / 2, y: box.y });
                    }
                    // Optionally bring to front
                    if (simpleDrawLineRefs.current[idx]) {
                      simpleDrawLineRefs.current[idx].moveToTop();
                    }
                  }}
                  onDragEnd={e => {
                    // Move all points by the drag offset
                    const node = e.target;
                    const dx = node.x() - (node._lastPos?.x || 0);
                    const dy = node.y() - (node._lastPos?.y || 0);
                    setSimpleDrawLines(prev => prev.map((l, i) => {
                      if (i !== idx) return l;
                      const newPoints = [];
                      for (let j = 0; j < l.points.length; j += 2) {
                        newPoints.push(l.points[j] + dx, l.points[j + 1] + dy);
                      }
                      return { ...l, points: newPoints };
                    }));
                    node.position({ x: 0, y: 0 });
                  }}
                />
              ))}
              {simpleDrawCurrentLine && (
                <KonvaLine
                  points={simpleDrawCurrentLine.points}
                  stroke={simpleDrawCurrentLine.color}
                  strokeWidth={simpleDrawCurrentLine.width}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation="source-over"
                />
              )}
              {/* Transformer for hovered or selected line */}
              {(hoveredSimpleDrawLine !== null || selectedSimpleDrawLine !== null) && (
                <KonvaTransformer
                  ref={transformerRef}
                  nodes={[
                    simpleDrawLineRefs.current[
                      selectedSimpleDrawLine !== null ? selectedSimpleDrawLine : hoveredSimpleDrawLine!
                    ]
                  ].filter(Boolean)}
                  enabledAnchors={[]}
                  borderEnabled={true}
                  rotateEnabled={false}
                  anchorSize={6}
                  anchorStroke="#814ADA"
                  anchorFill="#fff"
                  borderStroke="#814ADA"
                  borderDash={[4, 4]}
                />
              )}
            </Layer>
            {/* SimpleStickyNote Layer */}
            <Layer>
              {simpleStickyNotes.map((note, idx) => (
                <KonvaGroup
                  key={idx}
              x={note.x}
              y={note.y}
                  rotation={note.rotation}
                  draggable
                  onClick={e => {
                    setSelectedSimpleStickyNote(idx);
                    setSimpleStickyNoteMenuPos({ x: note.x + note.width / 2, y: note.y });
                  }}
                  onDragEnd={e => {
                    const node = e.target;
                    setSimpleStickyNotes(prev => prev.map((n, i) => i === idx ? { ...n, x: node.x(), y: node.y() } : n));
                  }}
                >
                  {/* Main note rectangle with sharp corners and simple shadow */}
                  <KonvaRect
                    width={note.width}
                    height={note.height}
                    fill={note.color}
                    shadowColor="#000"
                    shadowBlur={4}
                    shadowOpacity={0.08}
                    shadowOffset={{ x: 0, y: 8 }}
                    cornerRadius={0}
                  />
                  {/* Folded corner triangle */}
                  <KonvaShape
                    sceneFunc={(context: Context, shape: any) => {
                      const size = 32;
                      context.beginPath();
                      context.moveTo(note.width, note.height);
                      context.lineTo(note.width, note.height - size);
                      context.lineTo(note.width - size, note.height);
                      context.closePath();
                      context.fillStrokeShape(shape);
                    }}
                    fill={darkenColor(note.color, 0.15)}
                  />
                  <KonvaText
                    text={note.text || 'Write...'}
                    width={note.width - 32}
                    height={note.height - 32}
                    x={16}
                    y={16}
                    fontSize={20}
                    fontFamily={note.font}
                    align={note.align}
                    fill="#333"
                    verticalAlign="middle"
                    draggable={false}
                    onDblClick={() => {
                      // Optionally implement editing
                    }}
                  />
                </KonvaGroup>
              ))}
              {/* Floating menu for selected note */}
              {selectedSimpleStickyNote !== null && simpleStickyNoteMenuPos && (
                <Html>
                  <SimpleStickyNoteMenu
                    position={simpleStickyNoteMenuPos}
                    note={simpleStickyNotes[selectedSimpleStickyNote]}
                    onChange={(changes: any) => setSimpleStickyNotes(prev => prev.map((n, i) => i === selectedSimpleStickyNote ? { ...n, ...changes } : n))}
                    onDelete={() => {
                      setSimpleStickyNotes(prev => prev.filter((_, i) => i !== selectedSimpleStickyNote));
                      setSelectedSimpleStickyNote(null);
                      setSimpleStickyNoteMenuPos(null);
                    }}
                    onUnselect={() => {
                      setSelectedSimpleStickyNote(null);
                      setSimpleStickyNoteMenuPos(null);
                    }}
            />
                </Html>
              )}
            </Layer>
            {/* Render shape elements (only circle for now) */}
            <Layer>
            {elements.filter(el => el.type === 'shape').map(el => renderShapeElement(el as ShapeElement))}
            </Layer>
            {/* In the Layer that renders uploaded elements (stickers): */}
            <Layer>
              {elements.filter(el => el.type === 'uploaded').map(uploadImage => {
                const element = uploadImage as UploadedElement;
                if (!(element.image instanceof window.Image)) return null;
                return (
                  <KonvaImage
                    key={element.id}
                    id={element.id}
                    image={element.image}
                    alt={element.alt}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    draggable
                    onClick={() => setSelectedId(element.id)}
                    onDragEnd={e => {
                      const node = e.target;
                      handleElementChange(element.id, { x: node.x(), y: node.y() });
                    }}
                    onTransformEnd={e => {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      handleElementChange(element.id, {
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(10, node.width() * scaleX),
                        height: Math.max(10, node.height() * scaleY),
                      });
                      node.scaleX(1);
                      node.scaleY(1);
                    }}
                    style={{
                      transform: `rotate(${element.rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                  />
                );
              })}
              {/* Single transformer for stickers */}
              {(() => {
                const selectedElement = elements.find(el => el.id === selectedId && el.type === 'uploaded');
                return selectedElement ? (
                  <KonvaTransformer
                    ref={stickerTransformerRef}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    borderEnabled={true}
                    rotateEnabled={true}
                    anchorSize={6}
                    anchorStroke="#814ADA"
                    anchorFill="#fff"
                    borderStroke="#814ADA"
                    borderDash={[4, 4]}
                  />
                ) : null;
              })()}
            </Layer>
            {/* Render mind map nodes and connections */}
            <Layer>
              {renderMindMap()}
            </Layer>
          </Stage>
      </div>

        {/* Tools Panel */}
        <div className="fixed left-4 top-20 z-40">
          <ToolsPanel
            onToolSelect={handleToolSelect}
            selectedTool={selectedTool as any}
            showShapesMenu={showShapesMenu}
            setShowShapesMenu={setShowShapesMenu}
            selectedShape={selectedShape}
            onShapeSelect={handleShapeSelect}
          />
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
              onUpdate={handleStickyNoteUpdate}
              onDelete={handleStickyNoteDelete}
              onMove={handleElementMove}
              scale={scale}
              isSelected={selectedId === stickyNote.id}
              onSelect={(id) => {
                setSelectedId(id);
                setSelectedStickyNote(stickyNote);
              }}
              />
          );
        }
        return null;
      })}

      {/* Remove the duplicate sticky note rendering */}
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
      {/* Use DrawingToolsTray for simpleDraw tool */}
      {selectedTool === 'simpleDraw' && (
        <DrawingToolsTray
          selectedTool={simpleDrawTool}
          selectedColor={simpleDrawColor}
          strokeWidth={simpleDrawWidth}
          onToolSelect={(tool) => setSimpleDrawTool(tool)}
          onColorSelect={(color) => setSimpleDrawColor(color)}
          onStrokeWidthChange={(width) => setSimpleDrawWidth(width)}
        />
      )}
      {/* Floating menu for selected simpleDraw line */}
      {selectedSimpleDrawLine !== null && simpleDrawLineMenuPos && (
        <div
          className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2"
          style={{
            left: simpleDrawLineMenuPos.x * scale + position.x,
            top: simpleDrawLineMenuPos.y * scale + position.y - 40,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'auto'
          }}
        >
          <button
            onClick={() => handleToggleLockSimpleDrawLine(selectedSimpleDrawLine)}
            className={`p-1 rounded ${simpleDrawLines[selectedSimpleDrawLine].locked ? 'bg-gray-200' : ''}`}
            title={simpleDrawLines[selectedSimpleDrawLine].locked ? 'Unlock' : 'Lock'}
          >
            {/* Lock/Unlock icon */}
            {simpleDrawLines[selectedSimpleDrawLine].locked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6a2 2 0 00-2 2v2a2 2 0 002 2h0a2 2 0 002-2v-2a2 2 0 00-2-2zm0 0V9a4 4 0 118 0v2" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6a2 2 0 00-2 2v2a2 2 0 002 2h0a2 2 0 002-2v-2a2 2 0 00-2-2zm0 0V9a4 4 0 118 0v2" /></svg>
            )}
          </button>
          <button
            onClick={() => handleDeleteSimpleDrawLine(selectedSimpleDrawLine)}
            className="p-1 rounded hover:bg-red-100 text-red-500"
            title="Delete"
          >
            {/* Delete icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Shape Properties Menu */}
      {shapeMenuPosition && selectedShapeElementId && (
        <ShapePropertiesMenu
          position={shapeMenuPosition}
          shape={elements.find(el => el.id === selectedShapeElementId) as ShapeElement}
          onChange={(changes) => handleShapePropertiesChange(selectedShapeElementId, changes)}
          onDelete={() => handleShapeDelete(selectedShapeElementId)}
          onClose={() => setShapeMenuPosition(null)}
        />
      )}
      {selectedTool === 'stickers' && (
        <StickersMenu onSelectSticker={(url) => setPendingStickerUrl(url)} />
      )}
      {/* Render StickersMenu only if showStickersMenu is true */}
      {showStickersMenu && (
        <StickersMenu onSelectSticker={(url) => setPendingStickerUrl(url)} />
      )}
      {/* Render UploadMenu only if showUploadMenu is true */}
      {showUploadMenu && (
        <UploadMenu files={uploadMenuFiles} onUpload={handleUploadFiles} onRemove={handleRemoveFile} />
      )}
      {/* Render AIPopupMenu only if the AI tool is active */}
      {selectedTool === 'ai' && (
        <AIPopupMenu
          onAddToCanvas={(imageUrl, prompt) => {
            // Center the image in the visible canvas area
            const img = new window.Image();
            img.src = imageUrl;
            img.onload = () => {
              const width = img.width;
              const height = img.height;
              // Center using current dimensions and scale
              const centerX = (dimensions.width - width) / 2 / scale - position.x / scale;
              const centerY = (dimensions.height - height) / 2 / scale - position.y / scale;
              const newElement: GeneratedImageElement = {
                id: uuidv4(),
                type: 'generated-image',
                x: centerX,
                y: centerY,
                width,
                height,
                src: imageUrl,
                image: img,
                prompt,
                canvasId: currentCanvas.id,
                showInfo: false
              };
              setElements(prev => [...prev, newElement]);
            };
          }}
        />
      )}
      {tableMenuPos && selectedTable && (
        <TableFormatMenu
          position={tableMenuPos}
          table={selectedTable}
          selectedCell={selectedCell}
          cellStyle={(selectedTable.cellStyles && selectedCell && selectedTable.cellStyles[selectedCell.row]?.[selectedCell.col]) || {}}
          onChange={changes => {
            if (selectedCell && selectedCell.tableId === selectedTable.id) {
              // Update only the selected cell's style
              const newCellStyles = selectedTable.cellStyles ? selectedTable.cellStyles.map((row: any[]) => [...row]) : Array.from({ length: selectedTable.rows }, () => Array(selectedTable.columns).fill({}));
              newCellStyles[selectedCell.row][selectedCell.col] = {
                ...newCellStyles[selectedCell.row][selectedCell.col],
                ...changes
              };
              handleElementChange(selectedTable.id, { cellStyles: newCellStyles });
            } else {
              // Update table style as before
              handleElementChange(selectedTable.id, changes);
            }
          }}
          onLock={() => handleElementChange(selectedTable.id, { isLocked: !selectedTable.isLocked })}
          onDelete={() => handleDeleteElement(selectedTable.id)}
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

// Add this helper function at the top or bottom of the file:
function darkenColor(hex: string, amount: number) {
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));
  // Remove # if present
  hex = hex.replace('#', '');
  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  // Darken each channel
  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));
  // Return new hex
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

