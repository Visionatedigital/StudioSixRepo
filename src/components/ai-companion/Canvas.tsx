'use client';

// Add this debugging information
console.log('[DEBUG] Canvas module loading started');

import './Canvas.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { Stage as KonvaStage } from 'konva/lib/Stage';
// Import components directly
import { Stage, Layer, Rect as KonvaRect, Circle as KonvaCircle, Line as KonvaLine, Text as KonvaText, Image as KonvaImage, Transformer as KonvaTransformer, Group as KonvaGroup, Path, Shape as KonvaShape, Arc as KonvaArc } from 'react-konva';
  import Konva from 'konva/lib/index';
import Notification from '../ui/Notification';
import StickyNote from './StickyNote';
import AIChat from './AIChat';
import NextImage from 'next/image';
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
  TableElement,
  LibraryAssetElement
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
import OnboardingTutorial from './OnboardingTutorial';
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
import SpatialPlanningMenu from './SpatialPlanningMenu';
import ImageMenu from './ImageMenu';
import { LibraryAsset } from '@/lib/library-assets';

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

// 1. Add LibraryAssetElement to the union type
type Element = TextElement | StickyNoteElement | GeneratedImageElement | ShapeElement | UploadedElement | TableElement | LibraryAssetElement;
  
export default function Canvas({ name, description, projectId }: Props) {
  // Scale reference: 1 pixel = 20mm (1:50 scale)
  const SCALE_MM_PER_PIXEL = 20;
  const GRID_SIZE_METERS = 1; // 1 meter grid spacing
  const GRID_SIZE_PIXELS = (GRID_SIZE_METERS * 1000) / SCALE_MM_PER_PIXEL; // 50 pixels
  
  // Helper function to convert real-world measurements to pixels
  const mmToPixels = (millimeters: number) => millimeters / SCALE_MM_PER_PIXEL;
  const metersToPixels = (meters: number) => mmToPixels(meters * 1000);
  const [isScreenshotModeActive, setIsScreenshotModeActive] = useState(false);
  try {
    const { data: session } = useSession();
    
    const searchParams = useSearchParams();
    const projectName = name || 'Untitled Project';
    const [elements, setElements] = useState<CanvasElementType[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [selectedLibraryAsset, setSelectedLibraryAsset] = useState<LibraryAssetElement | null>(null);
  const libraryAssetTransformerRef = useRef<any>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<Tool>('mouse');
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [notification, setNotification] = useState<NotificationState>({
      show: false,
      type: 'success',
      title: '',
      message: '',
    });
    const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
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
      spatialPlanning?: {
        walls: any[];
        doors: any[];
        windows: any[];
        dimensions: any[];
        annotations: any[];
      };
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
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
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
    const generatedImageTransformerRef = useRef<any>(null);
    const [showStickersMenu, setShowStickersMenu] = useState(false);
    const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
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
    
    // 3. Add state for spatial planning tool
      const [showSpatialPlanningMenu, setShowSpatialPlanningMenu] = useState(false);
  const [spatialPlanningTool, setSpatialPlanningTool] = useState<string>('wall');

  // Image menu state (for both uploaded and generated images)
  const [selectedImageElement, setSelectedImageElement] = useState<UploadedElement | GeneratedImageElement | null>(null);
  const [imageMenuPosition, setImageMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Close image menu when selectedId changes and it's not an image
  useEffect(() => {
    if (selectedId) {
      const element = elements.find(el => el.id === selectedId);
      if (!element || (element.type !== 'uploaded' && element.type !== 'generated-image')) {
        setSelectedImageElement(null);
        setImageMenuPosition(null);
      }
    } else {
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    }
  }, [selectedId, elements]);
    
    // Wall drawing state
    const [isDrawingWall, setIsDrawingWall] = useState(false);
    const [wallPoints, setWallPoints] = useState<{ x: number; y: number }[]>([]);
    const [currentMousePosition, setCurrentMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [wallSegments, setWallSegments] = useState<Array<{
      id: string;
      points: { x: number; y: number }[];
      thickness: number;
      color: string;
      isClosed?: boolean;
    }>>([]);
    const [showWallDoneButton, setShowWallDoneButton] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    // Door placement state
    interface DoorElement {
      id: string;
      wallId: string;
      x: number;
      y: number;
      width: number;
      angle: number; // Wall angle in radians
      type: 'regular' | 'double' | 'sliding';
      swingOption: 1 | 2 | 3 | 4; // Quadrant-based swing option
      position: number; // Position along the wall (0-1)
    }
    
    const [doors, setDoors] = useState<DoorElement[]>([]);
    const [isDoorPlacement, setIsDoorPlacement] = useState(false);
    const [hoveredWall, setHoveredWall] = useState<{ wallId: string; position: { x: number; y: number }; segmentIndex: number; wallAngle: number } | null>(null);
    const [doorPlacementStep, setDoorPlacementStep] = useState<'position' | 'swing'>('position');
    const [lockedDoorPosition, setLockedDoorPosition] = useState<{
      wallId: string;
      position: { x: number; y: number };
      wallAngle: number;
      segmentIndex: number;
      positionOnSegment: number;
    } | null>(null);
    const [selectedSwingOption, setSelectedSwingOption] = useState<1 | 2 | 3 | 4 | null>(null);

    // Window placement state
    interface WindowElement {
      id: string;
      wallId: string;
      x: number;
      y: number;
      width: number;
      height: number;
      angle: number; // Wall angle in radians
      type: 'regular' | 'french' | 'bay' | 'sliding';
      position: number; // Position along the wall (0-1)
      orientation: 'inside' | 'outside'; // Which side of wall faces outside
    }
    
    const [windows, setWindows] = useState<WindowElement[]>([]);
    const [isWindowPlacement, setIsWindowPlacement] = useState(false);
    const [windowPlacementStep, setWindowPlacementStep] = useState<'position' | 'orientation'>('position');
    const [lockedWindowPosition, setLockedWindowPosition] = useState<{
      wallId: string;
      position: { x: number; y: number };
      wallAngle: number;
      segmentIndex: number;
      positionOnSegment: number;
    } | null>(null);
    const [selectedWindowType, setSelectedWindowType] = useState<'regular' | 'french' | 'bay' | 'sliding'>('regular');
    const [selectedWindowWidth, setSelectedWindowWidth] = useState<number>(0.8); // in meters
    const [windowWidthInput, setWindowWidthInput] = useState<string>('0.8');
    const [nearbyMeasurements, setNearbyMeasurements] = useState<Array<{
      id: string;
      distance: number;
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
      type: 'wall-end' | 'door' | 'window';
      label: string;
    }>>([]);

    // Dimensioning tool states
    const [isDimensioning, setIsDimensioning] = useState(false);
    const [dimensionStep, setDimensionStep] = useState<'first-point' | 'second-point' | 'placement'>('first-point');
    const [dimensionFirstPoint, setDimensionFirstPoint] = useState<{ x: number; y: number } | null>(null);
    const [dimensionSecondPoint, setDimensionSecondPoint] = useState<{ x: number; y: number } | null>(null);
    const [dimensionPlacementPoint, setDimensionPlacementPoint] = useState<{ x: number; y: number } | null>(null);
    const [dimensionSnapPoint, setDimensionSnapPoint] = useState<{ x: number; y: number; type: 'wall-end' | 'door-center' | 'window-center'; id: string } | null>(null);
    const [placedDimensions, setPlacedDimensions] = useState<Array<{
      id: string;
      startPoint: { x: number; y: number };
      endPoint: { x: number; y: number };
      placementPoint: { x: number; y: number };
      distance: number;
      label: string;
    }>>([]);
    const [hoveredWindowSide, setHoveredWindowSide] = useState<'inside' | 'outside' | null>(null);

    // Annotation tool states
    interface AnnotationElement {
      id: string;
      targetPoint: { x: number; y: number };
      bendPoint: { x: number; y: number };
      textBox: {
        x: number;
        y: number;
        width: number;
        height: number;
        text: string;
      };
      isEditing: boolean;
    }
    
    const [annotations, setAnnotations] = useState<AnnotationElement[]>([]);
    const [isAnnotating, setIsAnnotating] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
    const [isDraggingBend, setIsDraggingBend] = useState<string | null>(null);
    const [isDraggingTextBox, setIsDraggingTextBox] = useState<string | null>(null);

    // Fill tool states
    interface FillElement {
      id: string;
      points: { x: number; y: number }[];
      materialType: 'wood' | 'tile';
      patternId: string;
      opacity: number;
      scale: number;
      rotation: number;
    }
    
    const [fillElements, setFillElements] = useState<FillElement[]>([]);
    const [isFillMode, setIsFillMode] = useState(false);
    const [fillPoints, setFillPoints] = useState<{ x: number; y: number }[]>([]);
    const [showFillDoneButton, setShowFillDoneButton] = useState(false);
    const [showMaterialPicker, setShowMaterialPicker] = useState(false);
    const [pendingFill, setPendingFill] = useState<{ points: { x: number; y: number }[] } | null>(null);
    const [fillSnapPoint, setFillSnapPoint] = useState<{ x: number; y: number; isCorner?: boolean } | null>(null);

    // Onboarding tutorial state
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    // Debug logging for showOnboarding state changes
    useEffect(() => {
      console.log('Canvas showOnboarding state changed:', {
        showOnboarding,
        hasSeenOnboarding,
        timestamp: new Date().toISOString()
      });
    }, [showOnboarding, hasSeenOnboarding]);

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
              if (element.type === 'upload' || element.type === 'generated' || element.type === 'generated-image') {
                if (element.src || element.image) {
                  const img = new window.Image();
                  // For generated images, use src, for others use image.src or image
                  const imageSource = element.src || (element.image?.src || element.image);
                  img.src = imageSource;
                  
                  await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => {
                      console.warn('Failed to load image:', imageSource);
                      resolve(null); // Continue even if image fails to load
                    };
                  });
                  
                  // Ensure all image properties are properly set
                  return {
                    ...element,
                    image: img,
                    src: imageSource, // Ensure src is set for generated images
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
          // Load spatial planning data if it exists
          const spatialPlanningData = project.canvasData?.spatialPlanning;
          if (spatialPlanningData) {
            console.log('Loading spatial planning data:', spatialPlanningData);
            
            if (spatialPlanningData.walls) {
              setWallSegments(spatialPlanningData.walls);
            }
            if (spatialPlanningData.doors) {
              setDoors(spatialPlanningData.doors);
            }
            if (spatialPlanningData.windows) {
              setWindows(spatialPlanningData.windows);
            }
            if (spatialPlanningData.dimensions) {
              setPlacedDimensions(spatialPlanningData.dimensions);
            }
            if (spatialPlanningData.annotations) {
              setAnnotations(spatialPlanningData.annotations);
            }
            if ((spatialPlanningData as any).fills) {
              setFillElements((spatialPlanningData as any).fills);
            }
          }

          console.log('Final state:', {
            project,
            canvasStack: [initialCanvasData, ...processedCanvasStack],
            elements: allElements,
            spatialPlanning: spatialPlanningData
          });
        } catch (error) {
          console.error('Error loading project data:', error);
          showNotification('error', 'Error', 'Failed to load project data');
        }
      };

      loadProjectData();
    }, [projectId, projectName]);

    // Check localStorage for onboarding status and trigger after canvas loads
    useEffect(() => {
      const hasSeenOnboardingKey = `hasSeenOnboarding_${projectId}`;
      const hasSeenBefore = localStorage.getItem(hasSeenOnboardingKey) === 'true';
      setHasSeenOnboarding(hasSeenBefore);

      // Show onboarding for new users after a short delay
      if (!hasSeenBefore && projectId) {
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 2000); // Show after 2 seconds

        return () => clearTimeout(timer);
      }
    }, [projectId]);

    // Handle onboarding completion
    const handleOnboardingComplete = () => {
      const hasSeenOnboardingKey = `hasSeenOnboarding_${projectId}`;
      localStorage.setItem(hasSeenOnboardingKey, 'true');
      setHasSeenOnboarding(true);
      setShowOnboarding(false);
    };

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
        } else if (data.type === 'spatialPlanning') {
          const spatialData = data.data;
          if (spatialData.walls) setWallSegments(spatialData.walls);
          if (spatialData.doors) setDoors(spatialData.doors);
          if (spatialData.windows) setWindows(spatialData.windows);
          if (spatialData.dimensions) setPlacedDimensions(spatialData.dimensions);
          if (spatialData.annotations) setAnnotations(spatialData.annotations);
          if ((spatialData as any).fills) setFillElements((spatialData as any).fills);
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

      // Update selection box if active (but not during screenshot mode)
      if (selectionBox?.isSelecting && !isScreenshotModeActive) {
        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(point);
        setSelectionBox(prev => prev ? { ...prev, endX: pos.x, endY: pos.y } : null);
        
        // Ensure cursor stays as crosshair during selection
        stage.container().style.cursor = 'crosshair';
        return;
      }

      if (socket && projectId) {
        socket.emit('cursor-move', {
          x: point.x,
          y: point.y,
          projectId
        });
      }

      if (tool === 'mouse' && isDraggingCanvas) {
        const newPosition = {
          x: position.x + e.evt.movementX,
          y: position.y + e.evt.movementY
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
                // For generated images, also store the src directly for easier restoration
                if (element.type === 'generated-image') {
                  (serializedElement as any).src = element.image.src;
                }
              } else if (typeof element.image === 'object') {
                (serializedElement as any).image = {
                  src: (element.image as any).src || '',
                  width: (element.image as any).width || element.width || 0,
                  height: (element.image as any).height || element.height || 0,
                  naturalWidth: (element.image as any).naturalWidth || (element as any).naturalWidth,
                  naturalHeight: (element.image as any).naturalHeight || (element as any).naturalHeight
                };
                // For generated images, also store the src directly for easier restoration
                if (element.type === 'generated-image') {
                  (serializedElement as any).src = (element.image as any).src || (element as any).src || '';
                }
              }
            }
            
            // Ensure generated images have their src field preserved
            if (element.type === 'generated-image' && 'src' in element && element.src) {
              (serializedElement as any).src = element.src;
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
          
          // Save spatial planning data
          spatialPlanning: {
            walls: wallSegments,
            doors: doors,
            windows: windows,
            dimensions: placedDimensions,
            annotations: annotations,
            fills: fillElements
          },
          
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
            description: searchParams?.get('description') || '',
            canvasData: canvasState,
            timestamp: new Date().toISOString()
          }),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save project');
        }

        const updatedProject = await saveResponse.json();
        console.log('Project saved successfully:', updatedProject);
        
        // Show success notification only every 5 minutes (300,000 ms)
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (now - lastNotificationTime >= fiveMinutes) {
          const timestamp = new Date().toLocaleTimeString();
          showNotification(
            'success', 
            'Project Saved', 
            `All changes saved at ${timestamp}`
          );
          setLastNotificationTime(now);
        }

        // Update history
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[historyIndex + 1] = {
            elements: [...elements],
            canvasStack: [...canvasStack],
            spatialPlanning: {
              walls: [...wallSegments],
              doors: [...doors],
              windows: [...windows],
              dimensions: [...placedDimensions],
              annotations: [...annotations],
              ...(fillElements.length > 0 && { fills: [...fillElements] })
            }
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
          socket.emit('canvas-update', {
            projectId,
            type: 'spatialPlanning',
            data: {
              walls: wallSegments,
              doors: doors,
              windows: windows,
              dimensions: placedDimensions,
              annotations: annotations,
              ...(fillElements.length > 0 && { fills: fillElements })
            }
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
      
      const timeoutId = setTimeout(handleSave, 60000); // Set to 60 seconds for less frequent notifications
      return () => clearTimeout(timeoutId);
    }, [canvasStack, elements, projectId, projectName, wallSegments, doors, windows, placedDimensions, annotations, fillElements]);

    useEffect(() => {
      const updateDimensions = () => {
        setCanvasDimensions({
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
      
      // Handle middle mouse button for panning
      if (e.evt.button === 1) { // Middle mouse button
        e.evt.preventDefault(); // Prevent context menu or other default behaviors
        const stage = e.target.getStage();
        if (stage && e.target === stage) {
          setIsDraggingCanvas(true);
          const container = stage.container();
          container.style.cursor = 'grabbing';
          return;
        }
      }
      
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

      // Handle left-click drag-to-select when using mouse tool (must be before clearing logic!)
      // But skip if screenshot mode is active
      if (e.evt.button === 0 && tool === 'mouse' && isClickOnStage && !isScreenshotModeActive) { // 0 is left mouse button
        // Only start selection if we're not clicking on any element
        const clickedElement = elements.find(element => {
          const elementLeft = element.x;
          const elementTop = element.y;
          const elementRight = element.x + (element.width || 0);
          const elementBottom = element.y + (element.height || 0);
          
          return pos.x >= elementLeft && pos.x <= elementRight && 
                 pos.y >= elementTop && pos.y <= elementBottom;
        });
        
        if (!clickedElement) {
          setSelectionBox({
            isSelecting: true,
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y
          });
          return;
        }
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
        setSelectedElementIds([]); // Clear multi-selection
        // Close image menu when clicking on canvas
        setSelectedImageElement(null);
        setImageMenuPosition(null);
        return;
      }

      // Handle right-click for selection box (alternative method)
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
        setSelectedElementIds([]); // Clear multi-selection
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
        setSelectedElementIds([]); // Clear multi-selection
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
      
      // Handle spatial planning tool
      if (toolId === 'spatialPlanning') {
        if (selectedTool === 'spatialPlanning') {
          // If already selected, toggle the menu
          setShowSpatialPlanningMenu(!showSpatialPlanningMenu);
        } else {
          // First time selecting, show menu
          setSelectedTool(toolId);
          setTool(toolId);
          setShowSpatialPlanningMenu(true);
          setSpatialPlanningTool('wall'); // Default to wall tool
        }
        return;
      }
      
      // If clicking the currently selected tool, switch back to mouse tool
      if (toolId === selectedTool) {
        setSelectedTool('mouse');
        setTool('mouse');
        setDrawingMode(false);
        setShowSpatialPlanningMenu(false);
        return;
      }

      setSelectedTool(toolId);
      setTool(toolId);
      
      // Close spatial planning menu when switching tools
      setShowSpatialPlanningMenu(false);
      
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
    const gridSize = GRID_SIZE_PIXELS; // 1 meter spacing
    
    // Create grid pattern
    const renderGrid = () => {
      const dots = [];
      const width = canvasDimensions.width - (isChatOpen ? 400 : 0);
              const height = canvasDimensions.height;
      
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
      console.log('[DEBUG] handleDragOver called');
      console.log('[DEBUG] DataTransfer types:', e.dataTransfer.types);
      console.log('[DEBUG] DataTransfer items:', e.dataTransfer.items);
      
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      console.log('[DEBUG] handleDragLeave called');
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      console.log('[DEBUG] handleDrop called');
      console.log('[DEBUG] DataTransfer types:', e.dataTransfer.types);
      console.log('[DEBUG] DataTransfer items:', e.dataTransfer.items);
      
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsDragOverCanvas(false); // Clear drag state

      // Check for files first (images)
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      console.log('[DEBUG] Dropped files:', files.length, 'Image files:', imageFiles.length);
      
      if (imageFiles.length > 0 && stageRef.current) {
        console.log('[DEBUG] Processing image files');
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        
        if (pointer) {
          const transform = stage.getAbsoluteTransform().copy().invert();
          const pos = transform.point(pointer);
          console.log('[DEBUG] Drop position:', pos);
          
          imageFiles.forEach((file, index) => {
            console.log(`[DEBUG] Processing image ${index + 1}:`, file.name, file.type);
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const img = new window.Image();
                img.onload = () => {
                  console.log(`[DEBUG] Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
                  // Calculate natural aspect ratio
                  const aspectRatio = img.naturalWidth / img.naturalHeight;
                  const maxSize = 200; // Maximum size for dropped images
                  let width = maxSize;
                  let height = maxSize;
                  
                  // Maintain aspect ratio
                  if (aspectRatio > 1) {
                    height = width / aspectRatio;
                  } else {
                    width = height * aspectRatio;
                  }
                  
                  const imageX = pos.x - width/2 + (index * 20);
                  const imageY = pos.y - height/2 + (index * 20);
                  
                  console.log(`[DEBUG] Placing image at: x=${imageX}, y=${imageY}, w=${width}, h=${height}`);
                  
                  const newImage: UploadedElement = {
                    id: uuidv4(),
                    type: 'uploaded' as const,
                    x: imageX,
                    y: imageY,
                    width,
                    height,
                    image: img,
                    file: file,
                    canvasId: currentCanvas?.id || 'default',
                    rotation: 0
                  };
                  
                  console.log('[DEBUG] Created new image element:', newImage);
                  setElements(prev => {
                    console.log('[DEBUG] Adding to elements array. Current count:', prev.length);
                    return [...prev, newImage];
                  });
                  
                  // Show success notification
                  showNotification('success', 'Image Added', `${file.name} was added to the canvas`);
                };
                img.onerror = (error) => {
                  console.error('[DEBUG] Failed to load image:', error);
                  showNotification('error', 'Image Error', `Failed to load ${file.name}`);
                };
                img.src = event.target.result as string;
              }
            };
            reader.onerror = (error) => {
              console.error('[DEBUG] Failed to read file:', error);
              showNotification('error', 'File Error', `Failed to read ${file.name}`);
            };
            reader.readAsDataURL(file);
          });
        }
        return;
      }

      // Log all available data
      for (let i = 0; i < e.dataTransfer.types.length; i++) {
        const type = e.dataTransfer.types[i];
        console.log(`[DEBUG] Data type ${type}:`, e.dataTransfer.getData(type));
      }

      let droppedItem;
      try {
        const jsonData = e.dataTransfer.getData('text/plain');
        console.log('[DEBUG] JSON data received:', jsonData);
        droppedItem = JSON.parse(jsonData);
        console.log('[DEBUG] Parsed dropped item:', droppedItem);
      } catch (error) {
        console.log('[DEBUG] Failed to parse JSON:', error);
        // Not a JSON object, might be a URL for a sticker
        const url = e.dataTransfer.getData('text/plain');
        console.log('[DEBUG] URL data received:', url);
        if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
          console.log('[DEBUG] Processing URL as sticker');
          if (stageRef.current) {
            const stage = stageRef.current;
            const pointer = stage.getPointerPosition();
            console.log('[DEBUG] Stage pointer position:', pointer);
            if (pointer) {
              const transform = stage.getAbsoluteTransform().copy().invert();
              const pos = transform.point(pointer);
              console.log('[DEBUG] Transformed position:', pos);
              const img = new window.Image();
              img.src = url;
              img.onload = () => {
                console.log('[DEBUG] Sticker image loaded, creating element');
                const newSticker: UploadedElement = {
                  id: uuidv4(),
                  type: 'uploaded' as const,
                  x: pos.x - 40,
                  y: pos.y - 40,
                  width: 80,
                  height: 80,
                  image: img,
                  file: undefined as any,
                  canvasId: currentCanvas?.id || 'default',
                  rotation: 0
                };
                console.log('[DEBUG] Adding sticker to elements:', newSticker);
                setElements(prev => [...prev, newSticker]);
              };
            }
          }
        }
        return;
      }

      // If we are here, it's a library asset
      console.log('[DEBUG] Processing as library asset');
      console.log('[DEBUG] Dropped item:', droppedItem);
      console.log('[DEBUG] Stage ref exists:', !!stageRef.current);
      
      if (stageRef.current && droppedItem && droppedItem.svgPath) {
        console.log('[DEBUG] Stage and dropped item are valid');
        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        console.log('[DEBUG] Stage pointer position:', pointer);
        
        if (!pointer) {
          console.log('[DEBUG] No pointer position, returning');
          return;
        }

        const transform = stage.getAbsoluteTransform().copy().invert();
        const pos = transform.point(pointer);
        console.log('[DEBUG] Transformed position:', pos);

        console.log('[DEBUG] Creating image for asset:', droppedItem.svgPath);
        const image = new window.Image();
        image.src = droppedItem.svgPath;
        image.onload = () => {
          console.log('[DEBUG] Library asset image loaded');
          console.log('[DEBUG] Image natural dimensions:', image.naturalWidth, 'x', image.naturalHeight);
          
          const newElement: LibraryAssetElement = {
            id: uuidv4(),
            type: 'library-asset',
            x: pos.x - (image.naturalWidth || 100) / 2,
            y: pos.y - (image.naturalHeight || 100) / 2,
            width: image.naturalWidth || 100,
            height: image.naturalHeight || 100,
            src: droppedItem.svgPath,
            image: image,
            canvasId: currentCanvas.id,
            rotation: 0,
            name: droppedItem.name
          };
          console.log('[DEBUG] Creating library asset element:', newElement);
          setElements(prev => {
            console.log('[DEBUG] Current elements count:', prev.length);
            const newElements = [...prev, newElement];
            console.log('[DEBUG] New elements count:', newElements.length);
            return newElements;
          });
        };
        image.onerror = (error) => {
          console.error('[DEBUG] Failed to load library asset image:', error);
        };
      } else {
        console.log('[DEBUG] Invalid conditions for library asset processing');
        console.log('[DEBUG] Stage ref exists:', !!stageRef.current);
        console.log('[DEBUG] Dropped item exists:', !!droppedItem);
        console.log('[DEBUG] Dropped item svgPath exists:', !!(droppedItem && droppedItem.svgPath));
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
          return { ...el, ...newAttrs } as CanvasElement;
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
          // Uploaded images are rendered in their own dedicated layer with transformer
          // Skip rendering here to avoid conflicts
          return null;
        }
        case 'generated-image': {
          const genImage = element as GeneratedImageElement;
          
          // If image object is missing but we have a src, create the image object
          if (!(genImage.image instanceof window.Image) && genImage.src) {
            const img = new window.Image();
            img.src = genImage.src;
            img.onload = () => {
              // Update the element with the loaded image object
              setElements(prev => prev.map(el => 
                el.id === genImage.id 
                  ? { ...el, image: img }
                  : el
              ));
            };
            // Don't render until image is loaded
            return null;
          }
          
          if (!(genImage.image instanceof window.Image)) return null;
          
          return (
            <KonvaImage
              key={genImage.id}
              id={genImage.id}
              image={genImage.image}
              alt={genImage.alt}
              x={genImage.x}
              y={genImage.y}
              width={genImage.width}
              height={genImage.height}
              draggable
              onClick={() => {
                setSelectedId(genImage.id);
                setSelectedImageElement(genImage);
                
                // Position menu intelligently near the image
                const menuPosition = calculateMenuPosition(genImage);
                if (menuPosition) {
                  setImageMenuPosition(menuPosition);
                }
              }}
              onDragEnd={e => {
                const node = e.target;
                handleElementChange(genImage.id, { x: node.x(), y: node.y() });
              }}
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
                            border: '1px solid #E91E63',
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
                          stroke={isCellSelected ? '#E91E63' : (style.borderColor || table.borderColor || '#333')}
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
        case 'library-asset': {
          const assetElement = element as LibraryAssetElement;
          if (!assetElement.image || !(assetElement.image instanceof window.Image)) {
            // Preload the image if it's not already loaded
            if (assetElement.src) {
              const image = new window.Image();
              image.src = assetElement.src;
              image.onload = () => {
                setElements(prevElements => prevElements.map(el => {
                  if (el.id === assetElement.id) {
                    return { ...el, image: image, width: image.naturalWidth, height: image.naturalHeight };
                  }
                  return el;
                }));
              };
            }
            return null;
          }

          const isSelected = selectedId === assetElement.id;
          const isHovered = hoveredElementId === assetElement.id;

          return (
            <KonvaGroup key={assetElement.id}>
              <KonvaImage
                id={assetElement.id}
                image={assetElement.image}
                x={assetElement.x}
                y={assetElement.y}
                width={assetElement.width}
                height={assetElement.height}
                rotation={assetElement.rotation}
                draggable={tool === 'mouse'}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelectedId(assetElement.id);
                  setSelectedLibraryAsset(assetElement);
                  setIsExplicitlySelected(true);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  setSelectedId(assetElement.id);
                  setSelectedLibraryAsset(assetElement);
                  setIsExplicitlySelected(true);
                }}
                onMouseEnter={() => {
                  setHoveredElementId(assetElement.id);
                }}
                onMouseLeave={() => {
                  setHoveredElementId(null);
                }}
                onDragEnd={e => {
                  const node = e.target;
                  handleElementChange(assetElement.id, { x: node.x(), y: node.y() });
                }}
                onTransformEnd={e => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  handleElementChange(assetElement.id, {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(10, node.width() * scaleX),
                    height: Math.max(10, node.height() * scaleY),
                  });
                }}
              />
              

              
              {/* Hover border */}
              {isHovered && !isSelected && (
                <KonvaRect
                  x={assetElement.x - 3}
                  y={assetElement.y - 3}
                  width={assetElement.width + 6}
                  height={assetElement.height + 6}
                  stroke="#E91E63"
                  strokeWidth={1}
                  opacity={0.6}
                  listening={false}
                />
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
        
        // Restore spatial planning data if it exists
        if (previousState.spatialPlanning) {
          setWallSegments(previousState.spatialPlanning.walls || []);
          setDoors(previousState.spatialPlanning.doors || []);
          setWindows(previousState.spatialPlanning.windows || []);
          setPlacedDimensions(previousState.spatialPlanning.dimensions || []);
          setAnnotations(previousState.spatialPlanning.annotations || []);
          setFillElements((previousState.spatialPlanning as any).fills || []);
        }
        
        setHistoryIndex(historyIndex - 1);
      }
    };

    const handleRedo = () => {
      if (canRedo) {
        const nextState = history[historyIndex + 1];
        setElements(nextState.elements);
        setCanvasStack(nextState.canvasStack);
        
        // Restore spatial planning data if it exists
        if (nextState.spatialPlanning) {
          setWallSegments(nextState.spatialPlanning.walls || []);
          setDoors(nextState.spatialPlanning.doors || []);
          setWindows(nextState.spatialPlanning.windows || []);
          setPlacedDimensions(nextState.spatialPlanning.dimensions || []);
          setAnnotations(nextState.spatialPlanning.annotations || []);
          setFillElements((nextState.spatialPlanning as any).fills || []);
        }
        
        setHistoryIndex(historyIndex + 1);
      }
    };

    // Update history when elements or canvas stack changes
    useEffect(() => {
      const newState = {
        elements: [...elements],
        canvasStack: [...canvasStack],
        spatialPlanning: {
          walls: [...wallSegments],
          doors: [...doors],
          windows: [...windows],
          dimensions: [...placedDimensions],
          annotations: [...annotations],
          fills: [...fillElements]
        }
      };

      // Remove any future states if we're not at the end of history
      if (historyIndex < history.length - 1) {
        setHistory(history.slice(0, historyIndex + 1));
      }

      // Add new state to history
      setHistory(prev => [...prev, newState]);
      setHistoryIndex(prev => prev + 1);
    }, [elements, canvasStack, wallSegments, doors, windows, placedDimensions, annotations, fillElements]);

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
            className="invite-button flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex -space-x-2">
              {collaborators.slice(0, maxAvatars).map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="relative w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                >
                  {collaborator.user.image ? (
                    <NextImage
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

    const handleScreenshotModeChange = (isActive: boolean) => {
      setIsScreenshotModeActive(isActive);
      
      // Clear selection box when screenshot mode is activated
      if (isActive && selectionBox?.isSelecting) {
        setSelectionBox(null);
        setSelectedElementIds([]);
      }
    };

    const handleAddGeneratedImage = (imageUrl: string, prompt: string) => {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        // Scale down the image to a reasonable size for canvas
        const maxSize = 300; // Maximum width or height
        const aspectRatio = img.width / img.height;
        
        let scaledWidth, scaledHeight;
        if (img.width > img.height) {
          // Landscape orientation
          scaledWidth = Math.min(img.width, maxSize);
          scaledHeight = scaledWidth / aspectRatio;
        } else {
          // Portrait or square orientation
          scaledHeight = Math.min(img.height, maxSize);
          scaledWidth = scaledHeight * aspectRatio;
        }

        const newElement: GeneratedImageElement = {
          id: uuidv4(),
          type: 'generated-image',
          x: Math.random() * (canvasDimensions.width - scaledWidth),
          y: Math.random() * (canvasDimensions.height - scaledHeight),
          width: scaledWidth,
          height: scaledHeight,
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
    // Function to check if an element intersects with the selection box
    const isElementInSelection = (element: CanvasElement, selectionBox: { startX: number; startY: number; endX: number; endY: number }) => {
      // Skip invalid elements
      if (!element || !element.id || element.x === undefined || element.y === undefined) {
        return false;
      }
      
      // Skip elements with zero or very small dimensions (likely ghosts)
      const elementWidth = element.width || 0;
      const elementHeight = element.height || 0;
      if (elementWidth < 10 || elementHeight < 10) {
        return false;
      }

      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);

      // Skip selection boxes that are unreasonably large (likely coordinate transformation errors)
      const selectionWidth = maxX - minX;
      const selectionHeight = maxY - minY;
      if (selectionWidth > 3000 || selectionHeight > 3000) {
        return false;
      }

      // Check intersection based on element type
      const elementLeft = element.x;
      const elementTop = element.y;
      const elementRight = element.x + elementWidth;
      const elementBottom = element.y + elementHeight;

      // Check if element intersects with selection box
      return !(elementRight < minX || elementLeft > maxX || elementBottom < minY || elementTop > maxY);
    };

    const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
      
            // Handle selection box completion (but not during screenshot mode)
      if (selectionBox?.isSelecting && !isScreenshotModeActive) {
        const selectedIds: string[] = [];
        
        // Check if selection box is reasonable size
        const selectionWidth = Math.abs(selectionBox.endX - selectionBox.startX);
        const selectionHeight = Math.abs(selectionBox.endY - selectionBox.startY);
        
        if (selectionWidth > 3000 || selectionHeight > 3000) {
          setSelectionBox(null);
          
          // Reset cursor
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = 'default';
          }
          return;
        }
        
        // Filter elements to only selectable types and reasonable positions
        const selectableElements = elements.filter(element => {
          // Only include elements that should be selectable
          const selectableTypes = ['uploaded', 'generated-image', 'text', 'sticky-note', 'shape', 'table', 'library-asset'];
          if (!element || !element.id || !selectableTypes.includes(element.type)) {
            return false;
          }
          
          // Filter out elements that are way off-screen (likely orphaned/ghost elements)
          // Allow some reasonable margin for off-screen elements, but exclude extreme positions
          const maxOffScreenDistance = 2000; // Reduced to 2000 pixels off-screen
          if (Math.abs(element.x) > maxOffScreenDistance || Math.abs(element.y) > maxOffScreenDistance) {
            return false;
          }
          
          return true;
        });
        
        // Check all selectable elements for intersection with selection box
        selectableElements.forEach(element => {
          if (isElementInSelection(element, selectionBox)) {
            selectedIds.push(element.id);
          }
        });

        // Filter out any undefined or invalid elements
        const validSelectedIds = selectedIds.filter(id => {
          const element = elements.find(el => el.id === id);
          return element && element.id;
        });

        // Set selected elements
        setSelectedElementIds(validSelectedIds);
        
        // Clear selection box
        setSelectionBox(null);
        
        // Reset cursor to default after selection
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'default';
        }
        
        return;
      }
      
      // Stop canvas panning on middle mouse button release
      if (e.evt.button === 1 && isDraggingCanvas) {
        setIsDraggingCanvas(false);
        const stage = e.target.getStage();
        if (stage) {
          const container = stage.container();
          container.style.cursor = 'default';
        }
        return;
      }
      
      if (isDrawing && currentLine) {
        console.log('[DRAW] Finish line:', currentLine);
        setLines(prev => [...prev, currentLine]);
        setCurrentLine(null);
        setIsDrawing(false);
      }
    };
    const handleTransformEnd = () => {};
    const handleDragStart = () => {};
    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      
      const scaleBy = 1.1;
      const stage = e.target.getStage();
      if (!stage) return;
      
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      
      // Calculate new scale with limits
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      
      // Set zoom limits (10% to 500%)
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      
      // Calculate new position to zoom towards mouse pointer
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };
      
      setScale(clampedScale);
      setPosition(newPos);
    };
    const handleStageMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      // Set the cursor based on the current tool and dragging state
      if (tool === 'mouse') {
        // Only show grab cursor during canvas panning, otherwise default cursor for selection
        if (isDraggingCanvas) {
          stage.container().style.cursor = 'grabbing';
        } else if (selectionBox?.isSelecting) {
          stage.container().style.cursor = 'crosshair'; // Show crosshair during selection
        } else {
          stage.container().style.cursor = 'default'; // Default arrow cursor for mouse tool
        }
      } else if (tool === 'draw') {
        stage.container().style.cursor = 'crosshair';
      } else {
        stage.container().style.cursor = 'default';
      }
    };
    const handleMouseLeave = () => {
      // Stop panning if mouse leaves canvas
      if (isDraggingCanvas) {
        setIsDraggingCanvas(false);
      }
    };
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
      console.log('Shape placement handler triggered');
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
      setElements(prevElements => prevElements.map(el => {
        if (el.id === id && el.type === 'shape') {
          return { ...el, ...changes };
        }
        return el;
      }));
    };

    const handleShapeDelete = (id: string) => {
      setElements(prevElements => prevElements.filter(el => el.id !== id));
      setSelectedShapeElementId(null);
      setShapeMenuPosition(null);
    };

    // Update renderShapeElement to use handleShapeClick
    const renderShapeElement = (element: ShapeElement) => {
      const isSelected = selectedShapeElementId === element.id;
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

    // Add drag-and-drop for stickers and images
    const handleCanvasDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      
      // Check if dragging files (images) to show visual feedback
      const hasFiles = e.dataTransfer.types.includes('Files');
      const hasImageFiles = Array.from(e.dataTransfer.items || []).some(
        item => item.kind === 'file' && item.type.startsWith('image/')
      );
      
      if (hasFiles && hasImageFiles) {
        setIsDragOverCanvas(true);
      }
    };
    
    const handleCanvasDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      // Only hide drag feedback when leaving the canvas container
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragOverCanvas(false);
      }
    };
    const handleCanvasDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOverCanvas(false); // Clear drag state
      
      if (!stageRef.current) return;
      
      const stage = stageRef.current;
      const containerRect = stage.container().getBoundingClientRect();
      // Calculate position relative to the stage, then adjust for scale and pan
      const x = (e.clientX - containerRect.left - position.x) / scale;
      const y = (e.clientY - containerRect.top - position.y) / scale;
      
      // Handle file drops (images)
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      console.log('Dropped files:', files.length, 'Image files:', imageFiles.length);
      
      if (imageFiles.length > 0) {
        imageFiles.forEach((file, index) => {
          console.log(`Processing image ${index + 1}:`, file.name, file.type);
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const img = new window.Image();
              img.onload = () => {
                console.log(`Image loaded: ${img.naturalWidth}x${img.naturalHeight}`);
                // Calculate natural aspect ratio
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const maxSize = 200; // Maximum size for dropped images
                let width = maxSize;
                let height = maxSize;
                
                // Maintain aspect ratio
                if (aspectRatio > 1) {
                  height = width / aspectRatio;
                } else {
                  width = height * aspectRatio;
                }
                
                const imageX = x - width/2 + (index * 20);
                const imageY = y - height/2 + (index * 20);
                
                console.log(`Placing image at: x=${imageX}, y=${imageY}, w=${width}, h=${height}`);
                
                const newImage: UploadedElement = {
                  id: uuidv4(),
                  type: 'uploaded' as const,
                  x: imageX,
                  y: imageY,
                  width,
                  height,
                  image: img,
                  file: file,
                  canvasId: currentCanvas?.id || 'default',
                  rotation: 0
                };
                
                console.log('Created new image element:', newImage);
                setElements(prev => {
                  console.log('Adding to elements array. Current count:', prev.length);
                  return [...prev, newImage];
                });
                
                // Show success notification
                showNotification('success', 'Image Added', `${file.name} was added to the canvas`);
              };
              img.onerror = (error) => {
                console.error('Failed to load image:', error);
                showNotification('error', 'Image Error', `Failed to load ${file.name}`);
              };
              img.src = event.target.result as string;
            }
          };
          reader.onerror = (error) => {
            console.error('Failed to read file:', error);
            showNotification('error', 'File Error', `Failed to read ${file.name}`);
          };
          reader.readAsDataURL(file);
        });
        return;
      }
      
      // Handle URL drops (existing sticker functionality)
      const url = e.dataTransfer.getData('text/plain');
      if (url && url.startsWith('http')) {
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
          showNotification('success', 'Image Added', 'Image was added to the canvas');
        };
        // Close the sticker menu and switch back to mouse tool
        setShowStickersMenu(false);
        setSelectedTool('mouse');
        setTool('mouse');
      }
    };



    // Keydown handler for deleting selected elements and zoom shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Handle Shift key for wall constraint
        if (e.key === 'Shift') {
          setIsShiftPressed(true);
        }
        
        // Delete selected elements (multi-selection)
        if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElementIds.length > 0) {
          e.preventDefault();
          setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
          setSelectedElementIds([]);
          console.log('[DEBUG] Deleted selected elements:', selectedElementIds);
          return;
        }
        
        // Delete selected element (single selection)
        if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
          const selectedElement = elements.find(el => el.id === selectedId);
          if (selectedElement && (selectedElement.type === 'uploaded' || selectedElement.type === 'library-asset')) {
            setElements(prev => prev.filter(el => el.id !== selectedId));
            setSelectedId(null);
            setSelectedLibraryAsset(null);
          }
        }
        
        // Delete selected annotation
        if ((e.key === 'Backspace' || e.key === 'Delete') && selectedAnnotation) {
          handleAnnotationDelete(selectedAnnotation);
        }
        
        // Select all shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault();
          const allSelectableIds = elements
            .filter(el => el.type === 'uploaded' || el.type === 'generated-image' || 
                         el.type === 'text' || el.type === 'sticky-note' || 
                         el.type === 'shape' || el.type === 'table')
            .map(el => el.id);
          setSelectedElementIds(allSelectableIds);
          console.log('[DEBUG] Selected all elements:', allSelectableIds);
          return;
        }
        
        // Zoom shortcuts
        if (e.ctrlKey || e.metaKey) {
          if (e.key === '=' || e.key === '+') {
            e.preventDefault();
            const newScale = Math.min(5, scale * 1.2);
            setScale(newScale);
          } else if (e.key === '-') {
            e.preventDefault();
            const newScale = Math.max(0.1, scale / 1.2);
            setScale(newScale);
          } else if (e.key === '0') {
            e.preventDefault();
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }
        }
        
        // Handle Escape key to clear selection
        if (e.key === 'Escape' && selectedElementIds.length > 0) {
          e.preventDefault();
          setSelectedElementIds([]);
          console.log('[DEBUG] Cleared multi-selection');
          return;
        }
        
        // Handle Escape key for wall drawing
        if (e.key === 'Escape' && isDrawingWall) {
          handleWallCancel();
        }
        
        // Handle Escape key for door/window placement
        if (e.key === 'Escape' && (isDoorPlacement || isWindowPlacement)) {
          setIsDoorPlacement(false);
          setIsWindowPlacement(false);
          setShowSpatialPlanningMenu(false);
          setTool('mouse');
          setSelectedTool('mouse');
        }
        
        // Window type cycling during window placement
        if (isWindowPlacement && e.key === 'Tab') {
          e.preventDefault();
          const windowTypes: ('regular' | 'french' | 'bay' | 'sliding')[] = ['regular', 'french', 'bay', 'sliding'];
          const currentIndex = windowTypes.indexOf(selectedWindowType);
          const nextIndex = (currentIndex + 1) % windowTypes.length;
          setSelectedWindowType(windowTypes[nextIndex]);
        }
        
        // Window width adjustment during window placement
        if (isWindowPlacement && windowPlacementStep === 'orientation') {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const newWidth = Math.min(3.0, selectedWindowWidth + 0.1);
            setSelectedWindowWidth(newWidth);
            setWindowWidthInput(newWidth.toFixed(1));
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const newWidth = Math.max(0.3, selectedWindowWidth - 0.1);
            setSelectedWindowWidth(newWidth);
            setWindowWidthInput(newWidth.toFixed(1));
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            const newInput = windowWidthInput.slice(0, -1);
            setWindowWidthInput(newInput);
            const parsed = parseFloat(newInput);
            if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.0) {
              setSelectedWindowWidth(parsed);
            }
          } else if (e.key === 'Enter') {
            e.preventDefault();
            const parsed = parseFloat(windowWidthInput);
            if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.0) {
              setSelectedWindowWidth(parsed);
              setWindowWidthInput(parsed.toFixed(1));
            } else {
              // Reset to current valid value if invalid input
              setWindowWidthInput(selectedWindowWidth.toFixed(1));
            }
          } else if (/^[0-9.]$/.test(e.key)) {
            e.preventDefault();
            const newInput = windowWidthInput + e.key;
            // Prevent multiple decimal points
            if (e.key === '.' && windowWidthInput.includes('.')) {
              return;
            }
            setWindowWidthInput(newInput);
            const parsed = parseFloat(newInput);
            if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.0) {
              setSelectedWindowWidth(parsed);
            }
          }
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        // Handle Shift key release for wall constraint
        if (e.key === 'Shift') {
          setIsShiftPressed(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [selectedId, selectedElementIds, elements, scale, isDrawingWall, isWindowPlacement, windowPlacementStep, selectedWindowType, selectedWindowWidth, windowWidthInput, nearbyMeasurements, selectedAnnotation]);



    // Unified transformer for all image elements (uploaded, generated, library assets)
    useEffect(() => {
      if (!selectedId || !stageRef.current || !generatedImageTransformerRef.current) return;
      
      const selectedElement = elements.find(el => 
        el.id === selectedId && 
        (el.type === 'uploaded' || el.type === 'generated-image' || el.type === 'library-asset')
      );
      
      if (selectedElement) {
        const node = stageRef.current.findOne(`#${selectedId}`);
        
        if (node) {
          generatedImageTransformerRef.current.nodes([node]);
          generatedImageTransformerRef.current.getLayer()?.batchDraw();
        } else {
          // Clear transformer if no node found
          generatedImageTransformerRef.current.nodes([]);
          generatedImageTransformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        // Clear transformer if no valid selection
        generatedImageTransformerRef.current.nodes([]);
        generatedImageTransformerRef.current.getLayer()?.batchDraw();
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

    // Spatial planning handlers
    const handleSpatialPlanningToolSelect = (tool: string) => {
      setSpatialPlanningTool(tool);
      
      // Handle wall tool activation
      if (tool === 'wall') {
        setIsDrawingWall(true);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setIsDoorPlacement(false);
        setIsWindowPlacement(false);
      } else if (tool === 'door') {
        // Activate door placement mode
        setIsDoorPlacement(true);
        setIsDrawingWall(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setDoorPlacementStep('position');
        setLockedDoorPosition(null);
        setSelectedSwingOption(null);
        setIsWindowPlacement(false);
      } else if (tool === 'window') {
        // Activate window placement mode
        setIsWindowPlacement(true);
        setIsDrawingWall(false);
        setIsDoorPlacement(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setWindowPlacementStep('position');
        setLockedWindowPosition(null);
        setSelectedWindowType('regular');
        setSelectedWindowWidth(0.8);
        setWindowWidthInput('0.8');
        setNearbyMeasurements([]);
      } else if (tool === 'dimension') {
        // Activate dimensioning mode
        setIsDimensioning(true);
        setIsDrawingWall(false);
        setIsDoorPlacement(false);
        setIsWindowPlacement(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setDimensionStep('first-point');
        setDimensionFirstPoint(null);
        setDimensionSecondPoint(null);
        setDimensionPlacementPoint(null);
        setDimensionSnapPoint(null);
        setIsAnnotating(false);
        setSelectedAnnotation(null);
        setIsDraggingBend(null);
        setIsDraggingTextBox(null);
      } else if (tool === 'annotation') {
        // Activate annotation mode
        setIsAnnotating(true);
        setIsDrawingWall(false);
        setIsDoorPlacement(false);
        setIsWindowPlacement(false);
        setIsDimensioning(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setDimensionStep('first-point');
        setDimensionFirstPoint(null);
        setDimensionSecondPoint(null);
        setDimensionPlacementPoint(null);
        setDimensionSnapPoint(null);
        setSelectedAnnotation(null);
        setIsDraggingBend(null);
        setIsDraggingTextBox(null);
      } else if (tool === 'fill') {
        // Activate fill mode
        setIsFillMode(true);
        setFillPoints([]);
        setShowFillDoneButton(false);
        setIsDrawingWall(false);
        setIsDoorPlacement(false);
        setIsWindowPlacement(false);
        setIsDimensioning(false);
        setIsAnnotating(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setDoorPlacementStep('position');
        setLockedDoorPosition(null);
        setSelectedSwingOption(null);
        setWindowPlacementStep('position');
        setLockedWindowPosition(null);
        setSelectedWindowType('regular');
        setSelectedWindowWidth(0.8);
        setWindowWidthInput('0.8');
        setNearbyMeasurements([]);
        setHoveredWindowSide(null);
        setDimensionStep('first-point');
        setDimensionFirstPoint(null);
        setDimensionSecondPoint(null);
        setDimensionPlacementPoint(null);
        setDimensionSnapPoint(null);
        setSelectedAnnotation(null);
        setIsDraggingBend(null);
        setIsDraggingTextBox(null);
      } else {
        // Reset all drawing states when switching to other tools
        setIsDrawingWall(false);
        setIsDoorPlacement(false);
        setIsWindowPlacement(false);
        setIsDimensioning(false);
        setWallPoints([]);
        setCurrentMousePosition(null);
        setShowWallDoneButton(false);
        setDoorPlacementStep('position');
        setLockedDoorPosition(null);
        setSelectedSwingOption(null);
        setWindowPlacementStep('position');
        setLockedWindowPosition(null);
        setSelectedWindowType('regular');
        setSelectedWindowWidth(0.8);
        setWindowWidthInput('0.8');
        setNearbyMeasurements([]);
        setHoveredWindowSide(null);
        setDimensionStep('first-point');
        setDimensionFirstPoint(null);
        setDimensionSecondPoint(null);
        setDimensionPlacementPoint(null);
        setDimensionSnapPoint(null);
        setIsAnnotating(false);
        setSelectedAnnotation(null);
        setIsDraggingBend(null);
        setIsDraggingTextBox(null);
      }
    };

    const handleSpatialPlanningMenuClose = () => {
      setShowSpatialPlanningMenu(false);
      setSelectedTool('mouse');
      setTool('mouse');
      // Reset wall drawing state
      setIsDrawingWall(false);
      setWallPoints([]);
      setCurrentMousePosition(null);
      setShowWallDoneButton(false);
      setIsWindowPlacement(false);
      setWindowPlacementStep('position');
      setLockedWindowPosition(null);
      setSelectedWindowType('regular');
      setSelectedWindowWidth(0.8);
      setWindowWidthInput('0.8');
      setNearbyMeasurements([]);
      setHoveredWindowSide(null);
      setIsDimensioning(false);
      setDimensionStep('first-point');
      setDimensionFirstPoint(null);
      setDimensionSecondPoint(null);
      setDimensionPlacementPoint(null);
      setDimensionSnapPoint(null);
      setIsAnnotating(false);
      setSelectedAnnotation(null);
      setIsDraggingBend(null);
      setIsDraggingTextBox(null);
      setIsFillMode(false);
      setFillPoints([]);
      setFillSnapPoint(null);
      setShowFillDoneButton(false);
    };

    // Helper function to calculate smart menu positioning
    const calculateMenuPosition = (element: UploadedElement | GeneratedImageElement) => {
      const stage = stageRef.current;
      if (!stage) return null;

      const container = stage.container();
      const containerRect = container.getBoundingClientRect();
      
      // Calculate image position in screen coordinates
      const imageScreenX = containerRect.left + (element.x * scale) + position.x;
      const imageScreenY = containerRect.top + (element.y * scale) + position.y;
      const imageScreenWidth = element.width * scale;
      
      // Menu dimensions (approximate)
      const menuWidth = 200;
      const menuHeight = 240; // Slightly larger for generated image actions
      
      // Check if image is close to right edge of viewport
      const viewportWidth = window.innerWidth;
      const spaceOnRight = viewportWidth - (imageScreenX + imageScreenWidth);
      const spaceOnLeft = imageScreenX;
      
      let menuX, menuY;
      
      // Position menu on the side with more space
      if (spaceOnRight >= menuWidth + 20) {
        // Place on right side
        menuX = imageScreenX + imageScreenWidth + 10;
      } else if (spaceOnLeft >= menuWidth + 20) {
        // Place on left side
        menuX = imageScreenX - menuWidth - 10;
      } else {
        // Not enough space on either side, place on the side with more space
        if (spaceOnRight > spaceOnLeft) {
          menuX = imageScreenX + imageScreenWidth + 10;
        } else {
          menuX = imageScreenX - menuWidth - 10;
        }
      }
      
      // Vertically center the menu with the image, but keep it on screen
      const imageScreenHeight = element.height * scale;
      menuY = imageScreenY + (imageScreenHeight - menuHeight) / 2;
      
      // Ensure menu stays within viewport bounds
      menuX = Math.max(10, Math.min(menuX, viewportWidth - menuWidth - 10));
      menuY = Math.max(10, Math.min(menuY, window.innerHeight - menuHeight - 10));
      
      return { x: menuX, y: menuY };
    };

    // Image menu handlers
    const handleImageCrop = () => {
      // TODO: Implement crop functionality
      console.log('Crop image:', selectedImageElement?.id);
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    const handleImageDownload = () => {
      if (!selectedImageElement) return;

      if (selectedImageElement.type === 'uploaded' && selectedImageElement.image instanceof HTMLImageElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = selectedImageElement.image.naturalWidth;
          canvas.height = selectedImageElement.image.naturalHeight;
          ctx.drawImage(selectedImageElement.image, 0, 0);
          
          const link = document.createElement('a');
          link.download = selectedImageElement.alt || 'image.png';
          link.href = canvas.toDataURL();
          link.click();
        }
             } else if (selectedImageElement.type === 'generated-image') {
         const link = document.createElement('a');
         link.download = `generated-${selectedImageElement.id}.png`;
         link.href = selectedImageElement.src;
         link.click();
       }
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    const handleImageDelete = () => {
      if (selectedImageElement) {
        setElements(prev => prev.filter(el => el.id !== selectedImageElement.id));
        setSelectedId(null);
      }
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    const handleImageRegenerate = () => {
      if (selectedImageElement && selectedImageElement.type === 'generated-image') {
        // TODO: Implement regenerate functionality
        console.log('Regenerate image:', selectedImageElement.id, 'with prompt:', selectedImageElement.prompt);
      }
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    const handleImageCopyPrompt = () => {
      if (selectedImageElement && selectedImageElement.type === 'generated-image') {
        navigator.clipboard.writeText(selectedImageElement.prompt).then(() => {
          showNotification('success', 'Copied!', 'Prompt copied to clipboard');
        });
      }
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    const handleImageMenuClose = () => {
      setSelectedImageElement(null);
      setImageMenuPosition(null);
    };

    // Line intersection utility function for wall hatching
    const getLineIntersection = (
      x1: number, y1: number, x2: number, y2: number,
      x3: number, y3: number, x4: number, y4: number
    ): { x: number; y: number } | null => {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(denom) < 1e-10) return null; // Lines are parallel
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
      
      // Check if intersection is within both line segments
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        };
      }
      
      return null;
    };

    // Wall drawing handlers
    const handleWallClick = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawingWall || spatialPlanningTool !== 'wall') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      let newPoint = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // If shift is pressed and we have at least one point, constrain to cardinal directions
      if (isShiftPressed && wallPoints.length > 0) {
        const lastPoint = wallPoints[wallPoints.length - 1];
        newPoint = constrainToCardinalDirection(newPoint, lastPoint);
      }
      
      // Check if clicking near the first point to close the loop
      if (wallPoints.length >= 3) {
        const firstPoint = wallPoints[0];
        const distance = Math.sqrt(
          Math.pow(newPoint.x - firstPoint.x, 2) + Math.pow(newPoint.y - firstPoint.y, 2)
        );
        
        // If clicking within 20 pixels of the first point, close the loop
        if (distance < 20) {
          handleWallComplete(true);
          return;
        }
      }
      
      // Add new point
      const newWallPoints = [...wallPoints, newPoint];
      setWallPoints(newWallPoints);
      
      // Show done button after first point
      if (newWallPoints.length >= 1) {
        setShowWallDoneButton(true);
      }
    };

    // Helper function to constrain position to nearest cardinal direction
    const constrainToCardinalDirection = (mousePos: { x: number; y: number }, lastPoint: { x: number; y: number }) => {
      const dx = mousePos.x - lastPoint.x;
      const dy = mousePos.y - lastPoint.y;
      
      // Determine which direction is closer: horizontal or vertical
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal line - lock Y to last point's Y
        return { x: mousePos.x, y: lastPoint.y };
      } else {
        // Vertical line - lock X to last point's X
        return { x: lastPoint.x, y: mousePos.y };
      }
    };

    const handleWallMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawingWall || spatialPlanningTool !== 'wall') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      let mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // If shift is pressed and we have at least one point, constrain to cardinal directions
      if (isShiftPressed && wallPoints.length > 0) {
        const lastPoint = wallPoints[wallPoints.length - 1];
        mousePos = constrainToCardinalDirection(mousePos, lastPoint);
      }
      
      setCurrentMousePosition(mousePos);
    };

    const handleWallComplete = (isClosedShape: boolean = false) => {
      if (wallPoints.length >= 2) {
        // Only add the first point to complete the loop if it's explicitly a closed shape
        const completedPoints = isClosedShape 
          ? [...wallPoints, wallPoints[0]] 
          : [...wallPoints];
        
        // Create wall segment with closed flag for proper rendering
        const newWallSegment = {
          id: uuidv4(),
          points: completedPoints,
          thickness: mmToPixels(200), // Standard wall thickness (200mm)
          color: '#666666',
          isClosed: isClosedShape // Flag to indicate this is a closed shape
        };
        
        setWallSegments(prev => [...prev, newWallSegment]);
      }
      
      // Reset wall drawing state completely
      setWallPoints([]);
      setCurrentMousePosition(null);
      setShowWallDoneButton(false);
      setIsDrawingWall(false);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      
      // Switch back to mouse tool
      setTool('mouse');
    };

    const handleWallCancel = () => {
      // Reset wall drawing state completely
      setWallPoints([]);
      setCurrentMousePosition(null);
      setShowWallDoneButton(false);
      setIsDrawingWall(false);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      
      // Switch back to mouse tool
      setTool('mouse');
    };

    // Door placement functions
    interface NearestWallResult {
      wallId: string;
      position: { x: number; y: number };
      segmentIndex: number;
      wallAngle: number;
      segmentStart: { x: number; y: number };
      segmentEnd: { x: number; y: number };
      positionOnSegment: number;
    }

    const findNearestWall = (mouseX: number, mouseY: number): NearestWallResult | null => {
      let nearestWall: NearestWallResult | null = null;
      let minDistance = Infinity;
      const snapDistance = 20; // Pixels

      wallSegments.forEach((wall) => {
        for (let i = 0; i < wall.points.length - 1; i++) {
          const p1 = wall.points[i];
          const p2 = wall.points[i + 1];
          
          // Calculate distance from mouse to wall segment
          const A = mouseX - p1.x;
          const B = mouseY - p1.y;
          const C = p2.x - p1.x;
          const D = p2.y - p1.y;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          
          if (lenSq === 0) continue; // Zero length segment
          
          const param = dot / lenSq;
          
          let closestX, closestY;
          if (param < 0) {
            closestX = p1.x;
            closestY = p1.y;
          } else if (param > 1) {
            closestX = p2.x;
            closestY = p2.y;
          } else {
            closestX = p1.x + param * C;
            closestY = p1.y + param * D;
          }
          
          const distance = Math.sqrt((mouseX - closestX) ** 2 + (mouseY - closestY) ** 2);
          
          if (distance < snapDistance && distance < minDistance) {
            minDistance = distance;
            const wallAngle = Math.atan2(D, C);
            nearestWall = {
              wallId: wall.id,
              position: { x: closestX, y: closestY },
              segmentIndex: i,
              wallAngle,
              segmentStart: p1,
              segmentEnd: p2,
              positionOnSegment: param
            };
          }
        }
      });

      return nearestWall;
    };

    const handleDoorPlacement = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDoorPlacement || spatialPlanningTool !== 'door') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      if (doorPlacementStep === 'position') {
        // First click: Lock door position
        const nearestWall = findNearestWall(mousePos.x, mousePos.y);
        
        if (nearestWall) {
          setLockedDoorPosition({
            wallId: nearestWall.wallId,
            position: nearestWall.position,
            wallAngle: nearestWall.wallAngle,
            segmentIndex: nearestWall.segmentIndex,
            positionOnSegment: nearestWall.positionOnSegment
          });
          setDoorPlacementStep('swing');
        }
      } else if (doorPlacementStep === 'swing' && lockedDoorPosition && selectedSwingOption) {
        // Second click: Finalize door with selected swing option
        const newDoor: DoorElement = {
          id: uuidv4(),
          wallId: lockedDoorPosition.wallId,
          x: lockedDoorPosition.position.x,
          y: lockedDoorPosition.position.y,
          width: mmToPixels(900), // Standard door width (900mm/0.9m)
          angle: lockedDoorPosition.wallAngle,
          type: 'regular',
          swingOption: selectedSwingOption,
          position: lockedDoorPosition.positionOnSegment
        };
        
        setDoors(prev => [...prev, newDoor]);
        
        // Reset door placement mode
        setIsDoorPlacement(false);
        setSpatialPlanningTool('');
        setShowSpatialPlanningMenu(false);
        setTool('mouse');
        setDoorPlacementStep('position');
        setLockedDoorPosition(null);
        setSelectedSwingOption(null);
      }
    };

    const handleDoorMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDoorPlacement || spatialPlanningTool !== 'door') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      if (doorPlacementStep === 'position') {
        // First step: Show wall hover for position selection
        const nearestWall = findNearestWall(mousePos.x, mousePos.y);
        setHoveredWall(nearestWall);
      } else if (doorPlacementStep === 'swing' && lockedDoorPosition) {
        // Second step: Wall-angle-aware quadrant detection
        const doorPos = lockedDoorPosition.position;
        const wallAngle = lockedDoorPosition.wallAngle;
        
        // Calculate vector from door position to mouse
        const toMouseX = mousePos.x - doorPos.x;
        const toMouseY = mousePos.y - doorPos.y;
        
        // Rotate the mouse vector to align with wall coordinate system
        // This makes the wall appear "horizontal" for consistent quadrant logic
        const cos = Math.cos(-wallAngle);
        const sin = Math.sin(-wallAngle);
        const rotatedX = toMouseX * cos - toMouseY * sin;
        const rotatedY = toMouseX * sin + toMouseY * cos;
        
        // Apply quadrant detection in the rotated coordinate system
        // This maintains our preview design while adapting to wall angle
        let swingOption: 1 | 2 | 3 | 4;
        
        if (rotatedX < 0 && rotatedY < 0) {
          swingOption = 1; // Top-left quadrant (relative to wall)
        } else if (rotatedX < 0 && rotatedY >= 0) {
          swingOption = 2; // Bottom-left quadrant (relative to wall)
        } else if (rotatedX >= 0 && rotatedY >= 0) {
          swingOption = 3; // Bottom-right quadrant (relative to wall)
        } else {
          swingOption = 4; // Top-right quadrant (relative to wall)
        }
        
        setSelectedSwingOption(swingOption);
      }
    };

    // Window placement functions
    const handleWindowPlacement = (e: KonvaEventObject<MouseEvent>) => {
      if (!isWindowPlacement || spatialPlanningTool !== 'window') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      if (windowPlacementStep === 'position') {
        // First click: Lock window position
        const nearestWall = findNearestWall(mousePos.x, mousePos.y);
        
        if (nearestWall) {
          setLockedWindowPosition({
            wallId: nearestWall.wallId,
            position: nearestWall.position,
            wallAngle: nearestWall.wallAngle,
            segmentIndex: nearestWall.segmentIndex,
            positionOnSegment: nearestWall.positionOnSegment
          });
                  setWindowPlacementStep('orientation');
      }
        } else if (windowPlacementStep === 'orientation' && lockedWindowPosition && hoveredWindowSide) {
      // Second click: Finalize window with selected orientation
      const windowWidth = selectedWindowWidth * 100; // Convert meters to pixels
      const windowHeight = selectedWindowType === 'bay' ? 120 : 100;
      
      const newWindow: WindowElement = {
        id: uuidv4(),
        wallId: lockedWindowPosition.wallId,
        x: lockedWindowPosition.position.x,
        y: lockedWindowPosition.position.y,
        width: windowWidth,
        height: windowHeight,
        angle: lockedWindowPosition.wallAngle,
        type: selectedWindowType,
        position: lockedWindowPosition.positionOnSegment,
        orientation: hoveredWindowSide
      };
      
      setWindows(prev => [...prev, newWindow]);
      
      // Reset window placement mode
      setIsWindowPlacement(false);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      setTool('mouse');
      setWindowPlacementStep('position');
      setLockedWindowPosition(null);
      setSelectedWindowType('regular');
      setSelectedWindowWidth(0.8);
      setWindowWidthInput('0.8');
      setNearbyMeasurements([]);
      setHoveredWindowSide(null);
    }
    };

    // Function to calculate nearby measurements for real-time visualization
    const calculateNearbyMeasurements = (windowPosition: { x: number; y: number }, wallId?: string) => {

      
      const measurements: Array<{
        id: string;
        distance: number;
        startPoint: { x: number; y: number };
        endPoint: { x: number; y: number };
        type: 'wall-end' | 'door' | 'window';
        label: string;
      }> = [];

      const maxDistance = 300; // Maximum distance to show measurements (in pixels)

      // Find distances to wall ends
      wallSegments.forEach((wall, wallIndex) => {
        // Skip if wallId is provided and this is the same wall (avoid measuring to the wall we're placing on)
        if (wallId && wall.id === wallId) return;

        // Distance to wall start
        const startDistance = Math.sqrt(
          Math.pow(windowPosition.x - wall.points[0].x, 2) + 
          Math.pow(windowPosition.y - wall.points[0].y, 2)
        );
        
        if (startDistance < maxDistance && startDistance > 10) {
          measurements.push({
            id: `wall-start-${wallIndex}`,
            distance: startDistance / 100, // Convert to meters
            startPoint: windowPosition,
            endPoint: wall.points[0],
            type: 'wall-end',
            label: `${(startDistance / 100).toFixed(2)}m`
          });
        }

        // Distance to wall end
        const endPoint = wall.points[wall.points.length - 1];
        const endDistance = Math.sqrt(
          Math.pow(windowPosition.x - endPoint.x, 2) + 
          Math.pow(windowPosition.y - endPoint.y, 2)
        );
        
        if (endDistance < maxDistance && endDistance > 10) {
          measurements.push({
            id: `wall-end-${wallIndex}`,
            distance: endDistance / 100, // Convert to meters
            startPoint: windowPosition,
            endPoint: endPoint,
            type: 'wall-end',
            label: `${(endDistance / 100).toFixed(2)}m`
          });
        }
      });

      // Find distances to existing doors (measure to nearest edge)
      doors.forEach((door, doorIndex) => {
        // Calculate door edges based on door width and angle
        const doorWidth = door.width;
        const doorAngle = door.angle;
        
        // Calculate door edge points
        const halfWidth = doorWidth / 2;
        const cos = Math.cos(doorAngle);
        const sin = Math.sin(doorAngle);
        
        const doorEdge1 = {
          x: door.x - cos * halfWidth,
          y: door.y - sin * halfWidth
        };
        const doorEdge2 = {
          x: door.x + cos * halfWidth,
          y: door.y + sin * halfWidth
        };
        
        // Calculate distances to both edges
        const distance1 = Math.sqrt(
          Math.pow(windowPosition.x - doorEdge1.x, 2) + 
          Math.pow(windowPosition.y - doorEdge1.y, 2)
        );
        const distance2 = Math.sqrt(
          Math.pow(windowPosition.x - doorEdge2.x, 2) + 
          Math.pow(windowPosition.y - doorEdge2.y, 2)
        );
        
        // Use the nearest edge
        const nearestDistance = Math.min(distance1, distance2);
        const nearestEdge = distance1 < distance2 ? doorEdge1 : doorEdge2;
        
        if (nearestDistance < maxDistance && nearestDistance > 10) {
          measurements.push({
            id: `door-${doorIndex}`,
            distance: nearestDistance / 100, // Convert to meters
            startPoint: windowPosition,
            endPoint: nearestEdge,
            type: 'door',
            label: `${(nearestDistance / 100).toFixed(2)}m`
          });
        }
      });

      // Find distances to existing windows (measure to nearest edge)
      windows.forEach((window, windowIndex) => {
        // Calculate window edges based on window width and angle
        const windowWidth = window.width;
        const windowAngle = window.angle;
        
        // Calculate window edge points
        const halfWidth = windowWidth / 2;
        const cos = Math.cos(windowAngle);
        const sin = Math.sin(windowAngle);
        
        const windowEdge1 = {
          x: window.x - cos * halfWidth,
          y: window.y - sin * halfWidth
        };
        const windowEdge2 = {
          x: window.x + cos * halfWidth,
          y: window.y + sin * halfWidth
        };
        
        // Calculate distances to both edges
        const distance1 = Math.sqrt(
          Math.pow(windowPosition.x - windowEdge1.x, 2) + 
          Math.pow(windowPosition.y - windowEdge1.y, 2)
        );
        const distance2 = Math.sqrt(
          Math.pow(windowPosition.x - windowEdge2.x, 2) + 
          Math.pow(windowPosition.y - windowEdge2.y, 2)
        );
        
        // Use the nearest edge
        const nearestDistance = Math.min(distance1, distance2);
        const nearestEdge = distance1 < distance2 ? windowEdge1 : windowEdge2;
        
        if (nearestDistance < maxDistance && nearestDistance > 10) {
          measurements.push({
            id: `window-${windowIndex}`,
            distance: nearestDistance / 100, // Convert to meters
            startPoint: windowPosition,
            endPoint: nearestEdge,
            type: 'window',
            label: `${(nearestDistance / 100).toFixed(2)}m`
          });
        }
      });

      // Sort by distance and limit to closest 4 measurements
      const finalMeasurements = measurements
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);
      
      return finalMeasurements;
    };

    // Function to find nearby snap points for dimensioning
    const findNearbySnapPoints = (mousePos: { x: number; y: number }, snapDistance: number = 20) => {
      const snapPoints: Array<{ x: number; y: number; type: 'wall-end' | 'door-center' | 'window-center'; id: string }> = [];
      
      // Add wall end points
      wallSegments.forEach((wall, index) => {
        if (!wall.points || wall.points.length === 0) return;
        
        // First point (start)
        const firstPoint = wall.points[0];
        if (firstPoint) {
          const startDistance = Math.sqrt(Math.pow(firstPoint.x - mousePos.x, 2) + Math.pow(firstPoint.y - mousePos.y, 2));
          if (startDistance <= snapDistance) {
            snapPoints.push({
              x: firstPoint.x,
              y: firstPoint.y,
              type: 'wall-end',
              id: `wall-${index}-start`
            });
          }
        }
        
        // Last point (end)
        const lastPoint = wall.points[wall.points.length - 1];
        if (lastPoint && wall.points.length > 1) {
          const endDistance = Math.sqrt(Math.pow(lastPoint.x - mousePos.x, 2) + Math.pow(lastPoint.y - mousePos.y, 2));
          if (endDistance <= snapDistance) {
            snapPoints.push({
              x: lastPoint.x,
              y: lastPoint.y,
              type: 'wall-end',
              id: `wall-${index}-end`
            });
          }
        }
        
        // Add all intermediate points as well
        for (let i = 1; i < wall.points.length - 1; i++) {
          const point = wall.points[i];
          if (point) {
            const pointDistance = Math.sqrt(Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2));
            if (pointDistance <= snapDistance) {
              snapPoints.push({
                x: point.x,
                y: point.y,
                type: 'wall-end',
                id: `wall-${index}-point-${i}`
              });
            }
          }
        }
      });
      
      // Add door centers
      doors.forEach((door) => {
        const doorDistance = Math.sqrt(Math.pow(door.x - mousePos.x, 2) + Math.pow(door.y - mousePos.y, 2));
        if (doorDistance <= snapDistance) {
          snapPoints.push({
            x: door.x,
            y: door.y,
            type: 'door-center',
            id: door.id
          });
        }
      });
      
      // Add window centers
      windows.forEach((window) => {
        const windowDistance = Math.sqrt(Math.pow(window.x - mousePos.x, 2) + Math.pow(window.y - mousePos.y, 2));
        if (windowDistance <= snapDistance) {
          snapPoints.push({
            x: window.x,
            y: window.y,
            type: 'window-center',
            id: window.id
          });
        }
      });
      
      // Return the closest snap point
      if (snapPoints.length === 0) return null;
      
      return snapPoints.reduce((closest, point) => {
        const pointDistance = Math.sqrt(Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2));
        const closestDistance = Math.sqrt(Math.pow(closest.x - mousePos.x, 2) + Math.pow(closest.y - mousePos.y, 2));
        return pointDistance < closestDistance ? point : closest;
      });
    };

    // Dimensioning tool handlers
    const handleDimensionPlacement = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDimensioning || spatialPlanningTool !== 'dimension') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const clickPos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // Check for snap points and use them if available
      const snapPoint = findNearbySnapPoints(clickPos);
      const finalPos = snapPoint || clickPos;
      
      if (dimensionStep === 'first-point') {
        // Set first point
        setDimensionFirstPoint(finalPos);
        setDimensionStep('second-point');
      } else if (dimensionStep === 'second-point' && dimensionFirstPoint) {
        // Set second point
        setDimensionSecondPoint(finalPos);
        setDimensionStep('placement');
      } else if (dimensionStep === 'placement' && dimensionFirstPoint && dimensionSecondPoint) {
        // Place the dimension
        const distance = Math.sqrt(
          Math.pow(dimensionSecondPoint.x - dimensionFirstPoint.x, 2) + 
          Math.pow(dimensionSecondPoint.y - dimensionFirstPoint.y, 2)
        );
        
        const newDimension = {
          id: uuidv4(),
          startPoint: dimensionFirstPoint,
          endPoint: dimensionSecondPoint,
          placementPoint: clickPos,
          distance: distance / 100, // Convert to meters
          label: `${(distance / 100).toFixed(2)}m`
        };
        
        setPlacedDimensions(prev => [...prev, newDimension]);
        
        // Reset for next dimension
        setDimensionStep('first-point');
        setDimensionFirstPoint(null);
        setDimensionSecondPoint(null);
        setDimensionPlacementPoint(null);
        setDimensionSnapPoint(null);
      }
    };
    
    const handleDimensionMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      if (!isDimensioning || spatialPlanningTool !== 'dimension') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // Check for snap points during first-point and second-point steps
      if (dimensionStep === 'first-point' || dimensionStep === 'second-point') {
        const snapPoint = findNearbySnapPoints(mousePos);
        setDimensionSnapPoint(snapPoint);
      } else {
        setDimensionSnapPoint(null);
      }
      
      if (dimensionStep === 'placement') {
        setDimensionPlacementPoint(mousePos);
      }
    };

    // Annotation tool handlers
    const handleAnnotationPlacement = (e: KonvaEventObject<MouseEvent>) => {
      if (!isAnnotating || spatialPlanningTool !== 'annotation') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const clickPos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // Create new annotation
      const newAnnotation: AnnotationElement = {
        id: uuidv4(),
        targetPoint: clickPos,
        bendPoint: {
          x: clickPos.x + 100,
          y: clickPos.y - 50
        },
        textBox: {
          x: clickPos.x + 150,
          y: clickPos.y - 75,
          width: 120,
          height: 50,
          text: 'New annotation'
        },
        isEditing: true
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotation(newAnnotation.id);
      
      // Switch back to mouse tool after placing annotation
      setIsAnnotating(false);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      setTool('mouse');
      setSelectedTool('mouse');
    };

    const handleAnnotationMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      // This will be used for drag operations
      if (!isDraggingBend && !isDraggingTextBox) return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      if (isDraggingBend) {
        setAnnotations(prev => prev.map(annotation => 
          annotation.id === isDraggingBend
            ? { 
                ...annotation, 
                bendPoint: mousePos,
                textBox: {
                  ...annotation.textBox,
                  // Keep text box at the same horizontal level as bend point
                  y: mousePos.y - annotation.textBox.height / 2,
                  // Maintain horizontal distance from bend point
                  x: mousePos.x + (annotation.textBox.x - annotation.bendPoint.x)
                }
              }
            : annotation
        ));
      } else if (isDraggingTextBox) {
        setAnnotations(prev => prev.map(annotation => 
          annotation.id === isDraggingTextBox
            ? { 
                ...annotation, 
                textBox: {
                  ...annotation.textBox,
                  x: mousePos.x,
                  y: mousePos.y
                }
              }
            : annotation
        ));
      }
    };

    const handleAnnotationMouseUp = () => {
      setIsDraggingBend(null);
      setIsDraggingTextBox(null);
    };

    const handleBendPointDragStart = (annotationId: string) => {
      setIsDraggingBend(annotationId);
    };

    const handleTextBoxDragStart = (annotationId: string) => {
      setIsDraggingTextBox(annotationId);
    };

    const handleAnnotationTextChange = (annotationId: string, newText: string) => {
      setAnnotations(prev => prev.map(annotation => 
        annotation.id === annotationId
          ? { 
              ...annotation, 
              textBox: { ...annotation.textBox, text: newText },
              isEditing: false
            }
          : annotation
      ));
    };

    const handleAnnotationEdit = (annotationId: string) => {
      setAnnotations(prev => prev.map(annotation => 
        annotation.id === annotationId
          ? { ...annotation, isEditing: true }
          : { ...annotation, isEditing: false }
      ));
      setSelectedAnnotation(annotationId);
    };

    const handleAnnotationDelete = (annotationId: string) => {
      setAnnotations(prev => prev.filter(annotation => annotation.id !== annotationId));
      setSelectedAnnotation(null);
    };

    // Fill tool wall edge snapping function
    interface WallEdgeSnapResult {
      x: number;
      y: number;
      wallId: string;
      distance: number;
      segmentIndex?: number;
      pointIndex?: number;
      isCorner?: boolean;
    }

    const findNearestWallEdgeForFill = (mouseX: number, mouseY: number): WallEdgeSnapResult | null => {
      let nearestSnapPoint: WallEdgeSnapResult | null = null;
      let minDistance = Infinity;
      const snapDistance = 20; // Pixels

      wallSegments.forEach((wall) => {
        for (let i = 0; i < wall.points.length - 1; i++) {
          const p1 = wall.points[i];
          const p2 = wall.points[i + 1];
          
          // Check snap to wall segment edge (closest point on line)
          const A = mouseX - p1.x;
          const B = mouseY - p1.y;
          const C = p2.x - p1.x;
          const D = p2.y - p1.y;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          
          if (lenSq === 0) continue; // Zero length segment
          
          const param = dot / lenSq;
          
          let closestX, closestY;
          if (param < 0) {
            closestX = p1.x;
            closestY = p1.y;
          } else if (param > 1) {
            closestX = p2.x;
            closestY = p2.y;
          } else {
            closestX = p1.x + param * C;
            closestY = p1.y + param * D;
          }
          
          const distance = Math.sqrt((mouseX - closestX) ** 2 + (mouseY - closestY) ** 2);
          
          if (distance < snapDistance && distance < minDistance) {
            minDistance = distance;
            nearestSnapPoint = {
              x: closestX,
              y: closestY,
              wallId: wall.id,
              segmentIndex: i,
              distance: distance
            };
          }
        }
        
        // Also check for snap to wall corners/vertices
        wall.points.forEach((point, pointIndex) => {
          const distance = Math.sqrt(
            Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
          );
          
          if (distance < snapDistance && distance < minDistance) {
            minDistance = distance;
            nearestSnapPoint = {
              x: point.x,
              y: point.y,
              wallId: wall.id,
              pointIndex: pointIndex,
              distance: distance,
              isCorner: true
            };
          }
        });
      });

      return nearestSnapPoint;
    };

    // Fill tool handlers
    const handleFillClick = (e: KonvaEventObject<MouseEvent>) => {
      if (!isFillMode || spatialPlanningTool !== 'fill') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      let newPoint = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // Check for wall edge snapping
      const nearestWallEdge = findNearestWallEdgeForFill(newPoint.x, newPoint.y);
      if (nearestWallEdge) {
        newPoint = {
          x: nearestWallEdge.x,
          y: nearestWallEdge.y
        };
      }
      
      // Check if clicking near the first point to close the loop
      if (fillPoints.length >= 3) {
        const firstPoint = fillPoints[0];
        const distance = Math.sqrt(
          Math.pow(newPoint.x - firstPoint.x, 2) + Math.pow(newPoint.y - firstPoint.y, 2)
        );
        
        // If clicking within 20 pixels of the first point, close the loop
        if (distance < 20) {
          handleFillComplete();
          return;
        }
      }
      
      // Add new point
      const newFillPoints = [...fillPoints, newPoint];
      setFillPoints(newFillPoints);
      
      // Show done button after first point
      if (newFillPoints.length >= 1) {
        setShowFillDoneButton(true);
      }
    };

    const handleFillComplete = () => {
      if (fillPoints.length >= 3) {
        // Store pending fill and show material picker
        setPendingFill({ points: [...fillPoints] });
        setShowMaterialPicker(true);
      }
      
      // Reset fill drawing state
      setFillPoints([]);
      setShowFillDoneButton(false);
      setIsFillMode(false);
      setFillSnapPoint(null);
    };

    const handleFillCancel = () => {
      // Reset fill drawing state
      setFillPoints([]);
      setShowFillDoneButton(false);
      setIsFillMode(false);
      setFillSnapPoint(null);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      
      // Switch back to mouse tool
      setTool('mouse');
      setSelectedTool('mouse');
    };

    // Material selection state
    const [selectedMaterial, setSelectedMaterial] = React.useState<{
      materialType: 'wood' | 'tile';
      patternId: string;
    } | null>(null);
    const [materialParameters, setMaterialParameters] = React.useState({
      opacity: 1.0,
      scale: 1.0,
      rotation: 0,
      realWorldSize: 200 // mm - default plank/tile size
    });

    const handleMaterialSelect = (materialType: 'wood' | 'tile', patternId: string) => {
      // Set default real-world sizes based on material type
      const defaultSizes = {
        wood: 200, // 200mm wide planks
        tile: 300  // 300mm ceramic tiles
      };
      
      setSelectedMaterial({ materialType, patternId });
      setMaterialParameters(prev => ({
        ...prev,
        realWorldSize: defaultSizes[materialType]
      }));
    };

    const handleParameterConfirm = () => {
      if (!pendingFill || !selectedMaterial) return;
      
      // Calculate scale based on real-world size and grid
      // Grid is 1m = 1000mm, so scale = realWorldSize / 1000
      const calculatedScale = materialParameters.realWorldSize / 1000;
      
      const newFill: FillElement = {
        id: uuidv4(),
        points: pendingFill.points,
        materialType: selectedMaterial.materialType,
        patternId: selectedMaterial.patternId,
        opacity: materialParameters.opacity,
        scale: calculatedScale,
        rotation: materialParameters.rotation
      };
      
      setFillElements(prev => [...prev, newFill]);
      
      // Clean up
      setPendingFill(null);
      setShowMaterialPicker(false);
      setSelectedMaterial(null);
      setMaterialParameters({
        opacity: 1.0,
        scale: 1.0,
        rotation: 0,
        realWorldSize: 200
      });
      setFillSnapPoint(null);
      setSpatialPlanningTool('');
      setShowSpatialPlanningMenu(false);
      setTool('mouse');
      setSelectedTool('mouse');
    };

    const handleParameterCancel = () => {
      setSelectedMaterial(null);
      setMaterialParameters({
        opacity: 1.0,
        scale: 1.0,
        rotation: 0,
        realWorldSize: 200
      });
    };

    const handleFillMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      if (!isFillMode || spatialPlanningTool !== 'fill') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      // Check for wall edge snapping and update snap point
      const nearestWallEdge = findNearestWallEdgeForFill(mousePos.x, mousePos.y);
      if (nearestWallEdge) {
        setFillSnapPoint({
          x: nearestWallEdge.x,
          y: nearestWallEdge.y,
          isCorner: nearestWallEdge.isCorner
        });
      } else {
        setFillSnapPoint(null);
      }
    };

    const handleWindowMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      if (!isWindowPlacement || spatialPlanningTool !== 'window') return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Convert screen coordinates to canvas coordinates
      const mousePos = {
        x: (pointerPosition.x - position.x) / scale,
        y: (pointerPosition.y - position.y) / scale
      };
      
      if (windowPlacementStep === 'position') {
        // First step: Show wall hover for position selection
        const nearestWall = findNearestWall(mousePos.x, mousePos.y);
        setHoveredWall(nearestWall);
        
        // Calculate nearby measurements for real-time visualization
        if (nearestWall) {
          const measurements = calculateNearbyMeasurements(nearestWall.position);

          setNearbyMeasurements(measurements);
        } else {
          setNearbyMeasurements([]);
        }
      } else if (windowPlacementStep === 'orientation' && lockedWindowPosition) {
        // Second step: Detect which side of the wall the mouse is on
        const wallAngle = lockedWindowPosition.wallAngle;
        const wallPos = lockedWindowPosition.position;
        
        // Calculate perpendicular direction to wall
        const perpCos = Math.cos(wallAngle - Math.PI / 2);
        const perpSin = Math.sin(wallAngle - Math.PI / 2);
        
        // Vector from wall position to mouse
        const toMouseX = mousePos.x - wallPos.x;
        const toMouseY = mousePos.y - wallPos.y;
        
        // Dot product to determine which side of wall mouse is on
        const dotProduct = toMouseX * perpCos + toMouseY * perpSin;
        
        // Positive dot product means "outside", negative means "inside"
        setHoveredWindowSide(dotProduct > 0 ? 'outside' : 'inside');
        
        // Update measurements for locked position
        const measurements = calculateNearbyMeasurements(lockedWindowPosition.position);

        setNearbyMeasurements(measurements);
      }
    };

    return (
      <div
        className="h-screen w-full relative bg-[#fafafa]"
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
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
        <div 
          className="pt-16"
          style={{
            cursor: isScreenshotModeActive ? 'crosshair' : 'default'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
            width={canvasDimensions.width}
                          height={canvasDimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            onMouseDown={e => { handleCanvasClick(e); handleSimpleDrawMouseDown(e); handleStageClick(e); handleSimpleStickyNoteCanvasClick(e); handleShapePlacement(e); handleMindMapCanvasClick(e); handleWallClick(e); handleDoorPlacement(e); handleWindowPlacement(e); handleDimensionPlacement(e); handleAnnotationPlacement(e); handleFillClick(e); }}
            onMouseUp={e => { handleMouseUp(e); handleSimpleDrawMouseUp(e); handleAnnotationMouseUp(); }}
            onMouseMove={e => { handleMouseMove(e); handleSimpleDrawMouseMove(e); handleWallMouseMove(e); handleDoorMouseMove(e); handleWindowMouseMove(e); handleDimensionMouseMove(e); handleAnnotationMouseMove(e); handleFillMouseMove(e); }}
            onWheel={handleWheel}
            onMouseEnter={handleStageMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={stageRef}
            draggable={isDraggingCanvas}
            onDragStart={handleDragStart}
            id="studio-canvas"
            style={{
              display: 'block',
              backgroundColor: 'white',
              cursor: isScreenshotModeActive ? 'crosshair' : isDrawingWall ? 'crosshair' : 'default'
            }}
          >
            <Layer>
              {/* Restore the polka dot grid */}
              <KonvaGroup>
                {renderGrid()}
              </KonvaGroup>

              {/* Fill tool visualization - Bottom layer for floor materials */}
              <KonvaGroup>
                {/* Completed fill elements */}
                {fillElements.map((fill) => {
                    // Create pattern fill component
                    const PatternFillShape = () => {
                      const [patternCanvas, setPatternCanvas] = React.useState<HTMLCanvasElement | null>(null);
                      const [isPatternLoading, setIsPatternLoading] = React.useState(true);

                      React.useEffect(() => {
                        // Create PNG pattern canvas
                        const createPatternCanvas = async () => {
                          try {

                            
                            // Determine the correct file name based on pattern ID
                            let fileName = fill.patternId;
                            
                            // Handle old/invalid pattern IDs
                            if (!fileName || fileName === 'wood-pattern' || fileName === 'undefined') {
                              fileName = 'Wood-01';
                            }
                            
                            if (!fileName.endsWith('.png')) {
                              fileName = `${fileName}.png`;
                            }
                            
                            const encodedPath = `/patterns/${encodeURIComponent(fileName)}`;
                            
                            // Create an image element to load the PNG directly
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            
                            img.onload = () => {
                              try {
                                // Create a canvas to render the pattern
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                
                                if (ctx) {
                                  // Use a reasonable pattern size that balances quality and performance
                                  const patternSize = 256; // Power of 2 for better GPU performance
                                  canvas.width = patternSize;
                                  canvas.height = patternSize;
                                  
                                  // Set canvas context properties for better image quality
                                  ctx.imageSmoothingEnabled = true; // Enable smoothing for better scaling
                                  ctx.imageSmoothingQuality = 'high';
                                  
                                  // Calculate optimal tile size to preserve pattern detail
                                  // Use a scale that makes the pattern visible but not too large
                                  const targetTileSize = Math.min(patternSize / 3, 120); // Max 120px tiles
                                  const scale = Math.min(
                                    targetTileSize / img.naturalWidth,
                                    targetTileSize / img.naturalHeight
                                  );
                                  
                                  const scaledWidth = img.naturalWidth * scale;
                                  const scaledHeight = img.naturalHeight * scale;
                                  
                                  // Draw the PNG image tiled across the canvas
                                  for (let x = 0; x < patternSize; x += scaledWidth) {
                                    for (let y = 0; y < patternSize; y += scaledHeight) {
                                      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                                    }
                                  }
                                  
                                  setPatternCanvas(canvas);
                                  setIsPatternLoading(false);
                                } else {
                                  setIsPatternLoading(false);
                                }
                              } catch (error) {
                                setIsPatternLoading(false);
                              }
                            };
                            
                            img.onerror = () => {
                              setIsPatternLoading(false);
                            };
                            
                            // Load PNG directly as image
                            img.src = encodedPath;
                            
                          } catch (error) {
                            // Handle any errors silently
                          }
                        };

                        createPatternCanvas();
                      }, []);

                      // Fallback colors if pattern doesn't load
                      const getFallbackColor = (materialType: string, patternId: string) => {
                        // Handle old fills without materialType
                        if (!materialType) {
                          return '#DEB887'; // Default wood color for old fills
                        }
                        
                        if (materialType === 'wood') {
                          switch (patternId) {
                            case 'Wood-01': return '#D2B48C'; // Classic Oak - tan
                            case 'Wood-02': return '#A0522D'; // Modern Plank - sienna
                            case 'Wood-03': return '#DEB887'; // Rustic Pine - burlywood
                            case 'Wood-04': return '#8B4513'; // Mahogany - saddle brown
                            case 'Wood-05': return '#CD853F'; // Bamboo - peru
                            case 'Wood-06': return '#654321'; // Walnut - dark brown
                            default: return '#DEB887';
                          }
                        } else {
                          switch (patternId) {
                            case 'Ceramic-07': return '#F2F2F2'; // Very light gray
                            default: return '#F5F5F5';
                          }
                        }
                      };

                      const getStrokeColor = (materialType: string, patternId: string) => {
                        // Handle old fills without materialType
                        if (!materialType) {
                          return '#8B4513'; // Default to wood stroke for old fills
                        }
                        
                        if (materialType === 'wood') {
                          return '#8B4513'; // Darker brown for wood edges
                        } else {
                          return '#D3D3D3'; // Light gray for tile edges
                        }
                      };


                      
                      const fillProps: any = patternCanvas 
                        ? {
                            fillPatternImage: patternCanvas,
                            fillPatternScaleX: (fill.scale || 1) * 1.5, // Moderate scale for good visibility
                            fillPatternScaleY: (fill.scale || 1) * 1.5,
                            fillPatternRotation: fill.rotation || 0,
                            fillPatternRepeat: 'repeat',
                            fillPatternOffsetX: 0,
                            fillPatternOffsetY: 0
                          }
                        : isPatternLoading
                        ? {
                            fill: 'transparent' // Don't show fallback color while loading
                          }
                        : {
                            fill: getFallbackColor(fill.materialType, fill.patternId)
                          };

                      const points = fill.points.flatMap(p => [p.x, p.y]);
                      const strokeColor = getStrokeColor(fill.materialType, fill.patternId);
                  
                  return (
                    <KonvaLine
                          points={points}
                          {...fillProps}
                          stroke={strokeColor}
                          strokeWidth={0.5}
                      closed={true}
                      opacity={fill.opacity}
                    />
                  );
                    };
                    
                    return <PatternFillShape key={fill.id} />;
                })}
                
                {/* Current fill drawing preview */}
                {isFillMode && fillPoints.length > 0 && (
                  <KonvaGroup>
                    {/* Fill preview line */}
                    <KonvaLine
                      points={fillPoints.flatMap(p => [p.x, p.y])}
                      stroke="#2563eb"
                      strokeWidth={2}
                      dash={[5, 5]}
                      closed={false}
                    />
                    
                    {/* Fill points */}
                    {fillPoints.map((point, index) => (
                      <KonvaCircle
                        key={index}
                        x={point.x}
                        y={point.y}
                        radius={4}
                        fill={index === 0 ? "#dc2626" : "#2563eb"}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                    
                    {/* First point indicator for closing */}
                    {fillPoints.length >= 3 && (
                      <KonvaCircle
                        x={fillPoints[0].x}
                        y={fillPoints[0].y}
                        radius={8}
                        stroke="#dc2626"
                        strokeWidth={2}
                        dash={[3, 3]}
                        fill="transparent"
                      />
                    )}
                    
                    {/* Wall edge snap point indicator */}
                    {fillSnapPoint && (
                      <KonvaGroup>
                        {/* Snap point indicator */}
                        <KonvaCircle
                          x={fillSnapPoint.x}
                          y={fillSnapPoint.y}
                          radius={6}
                          fill="transparent"
                          stroke={fillSnapPoint.isCorner ? "#ff6b35" : "#4CAF50"}
                          strokeWidth={2}
                          dash={[3, 3]}
                        />
                        
                        {/* Inner snap point dot */}
                        <KonvaCircle
                          x={fillSnapPoint.x}
                          y={fillSnapPoint.y}
                          radius={2}
                          fill={fillSnapPoint.isCorner ? "#ff6b35" : "#4CAF50"}
                        />
                        
                        {/* Snap point label */}
                        <KonvaRect
                          x={fillSnapPoint.x + 10}
                          y={fillSnapPoint.y - 12}
                          width={fillSnapPoint.isCorner ? 50 : 60}
                          height={16}
                          fill="white"
                          stroke={fillSnapPoint.isCorner ? "#ff6b35" : "#4CAF50"}
                          strokeWidth={1}
                          cornerRadius={3}
                          opacity={0.95}
                        />
                        
                        <KonvaText
                          x={fillSnapPoint.x + 10}
                          y={fillSnapPoint.y - 8}
                          width={fillSnapPoint.isCorner ? 50 : 60}
                          text={fillSnapPoint.isCorner ? "Corner" : "Wall Edge"}
                          fontSize={9}
                          fill={fillSnapPoint.isCorner ? "#ff6b35" : "#4CAF50"}
                          align="center"
                          fontStyle="bold"
                        />
                      </KonvaGroup>
                    )}
                  </KonvaGroup>
                )}
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

              {/* Wall Drawing Layer */}
              <KonvaGroup>
                {/* Completed wall segments */}
                {wallSegments.map((wall) => {
                  // Create wall shape with proper thickness and joinery
                  const wallThickness = wall.thickness;
                  
                  if (wall.points.length < 2) return null;
                  
                  // Calculate all wall segments with proper joinery
                  const wallPath: number[] = [];
                  
                  // Helper function to calculate perpendicular offset
                  const getPerpendicular = (p1: {x: number, y: number}, p2: {x: number, y: number}, thickness: number) => {
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    if (length === 0) return { perpX: 0, perpY: 0 };
                    
                    const dirX = dx / length;
                    const dirY = dy / length;
                    return {
                      perpX: -dirY * thickness / 2,
                      perpY: dirX * thickness / 2
                    };
                  };
                  
                  // Helper function to find intersection of two lines
                  const findLineIntersection = (
                    p1: {x: number, y: number}, p2: {x: number, y: number},
                    p3: {x: number, y: number}, p4: {x: number, y: number}
                  ) => {
                    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
                    if (Math.abs(denom) < 1e-10) return null;
                    
                    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
                    return {
                      x: p1.x + t * (p2.x - p1.x),
                      y: p1.y + t * (p2.y - p1.y)
                    };
                  };
                  
                  // Calculate outer edge points with proper mitering
                  const outerPoints: {x: number, y: number}[] = [];
                  const innerPoints: {x: number, y: number}[] = [];
                  
                  // For closed shapes, we need to handle the first and last points differently
                  const isClosedShape = wall.isClosed && wall.points.length > 3;
                  
                  for (let i = 0; i < wall.points.length; i++) {
                    let prevPoint, currentPoint, nextPoint;
                    
                                          if (isClosedShape) {
                        // For closed shapes, wrap around for first and last points
                        if (i === wall.points.length - 1) {
                          // This is the duplicate last point (same as first point)
                          // Skip processing it since it's identical to the first point
                          continue;
                        }
                        prevPoint = wall.points[i === 0 ? wall.points.length - 2 : i - 1]; // Skip the duplicate last point
                        currentPoint = wall.points[i];
                        nextPoint = wall.points[i === wall.points.length - 2 ? 0 : i + 1]; // Wrap to first point when at second-to-last
                      } else {
                        prevPoint = wall.points[i - 1];
                        currentPoint = wall.points[i];
                        nextPoint = wall.points[i + 1];
                      }
                    
                                          if (!isClosedShape && i === 0) {
                        // First point of open wall - no previous segment
                        const perp = getPerpendicular(currentPoint, nextPoint, wallThickness);
                        outerPoints.push({
                          x: currentPoint.x + perp.perpX,
                          y: currentPoint.y + perp.perpY
                        });
                        innerPoints.push({
                          x: currentPoint.x - perp.perpX,
                          y: currentPoint.y - perp.perpY
                        });
                      } else if (!isClosedShape && i === wall.points.length - 1) {
                        // Last point of open wall - no next segment
                        const perp = getPerpendicular(prevPoint, currentPoint, wallThickness);
                        outerPoints.push({
                          x: currentPoint.x + perp.perpX,
                          y: currentPoint.y + perp.perpY
                        });
                        innerPoints.push({
                          x: currentPoint.x - perp.perpX,
                          y: currentPoint.y - perp.perpY
                        });
                    } else {
                      // Middle point or closed shape point - calculate miter joint
                      const perp1 = getPerpendicular(prevPoint, currentPoint, wallThickness);
                      const perp2 = getPerpendicular(currentPoint, nextPoint, wallThickness);
                      
                      // Outer edge intersection
                      const outerLine1Start = { x: prevPoint.x + perp1.perpX, y: prevPoint.y + perp1.perpY };
                      const outerLine1End = { x: currentPoint.x + perp1.perpX, y: currentPoint.y + perp1.perpY };
                      const outerLine2Start = { x: currentPoint.x + perp2.perpX, y: currentPoint.y + perp2.perpY };
                      const outerLine2End = { x: nextPoint.x + perp2.perpX, y: nextPoint.y + perp2.perpY };
                      
                      const outerIntersection = findLineIntersection(outerLine1Start, outerLine1End, outerLine2Start, outerLine2End);
                      
                      // Inner edge intersection
                      const innerLine1Start = { x: prevPoint.x - perp1.perpX, y: prevPoint.y - perp1.perpY };
                      const innerLine1End = { x: currentPoint.x - perp1.perpX, y: currentPoint.y - perp1.perpY };
                      const innerLine2Start = { x: currentPoint.x - perp2.perpX, y: currentPoint.y - perp2.perpY };
                      const innerLine2End = { x: nextPoint.x - perp2.perpX, y: nextPoint.y - perp2.perpY };
                      
                      const innerIntersection = findLineIntersection(innerLine1Start, innerLine1End, innerLine2Start, innerLine2End);
                      
                      outerPoints.push(outerIntersection || {
                        x: currentPoint.x + perp1.perpX,
                        y: currentPoint.y + perp1.perpY
                      });
                      
                      innerPoints.push(innerIntersection || {
                        x: currentPoint.x - perp1.perpX,
                        y: currentPoint.y - perp1.perpY
                      });
                    }
                  }
                  
                                    // For closed shapes, render fill per segment to avoid path winding issues
                  const actualPoints = isClosedShape ? wall.points.slice(0, -1) : wall.points;
                  const numSegments = isClosedShape ? actualPoints.length : actualPoints.length - 1;

                  
                  return (
                    <KonvaGroup key={wall.id}>
                      {/* Wall fill - render per segment to avoid winding issues */}
                      {(() => {
                        const fillSegments: JSX.Element[] = [];
                        
                        for (let segIdx = 0; segIdx < numSegments; segIdx++) {
                          const p1 = actualPoints[segIdx];
                          const p2 = isClosedShape 
                            ? actualPoints[(segIdx + 1) % actualPoints.length]
                            : actualPoints[segIdx + 1];
                          
                          // Calculate segment perpendicular
                          const dx = p2.x - p1.x;
                          const dy = p2.y - p1.y;
                          const length = Math.sqrt(dx * dx + dy * dy);
                          
                          if (length === 0) continue;
                          
                          const dirX = dx / length;
                          const dirY = dy / length;
                          const perpX = -dirY * wallThickness / 2;
                          const perpY = dirX * wallThickness / 2;
                          
                          // Segment fill rectangle
                          const segmentFillPoints = [
                            p1.x + perpX, p1.y + perpY,  // outer start
                            p2.x + perpX, p2.y + perpY,  // outer end
                            p2.x - perpX, p2.y - perpY,  // inner end
                            p1.x - perpX, p1.y - perpY   // inner start
                          ];
                          
                          fillSegments.push(
                            <KonvaLine
                              key={`fill-${wall.id}-${segIdx}`}
                              points={segmentFillPoints}
                              closed={true}
                              fill="#f5f5f5"
                              stroke=""
                              perfectDrawEnabled={false}
                              listening={false}
                            />
                          );
                        }
                        
                        return fillSegments;
                      })()}
                      
                      {/* Wall stroke - outer edge */}
                      <KonvaLine
                        points={outerPoints.flatMap(p => [p.x, p.y])}
                        closed={isClosedShape}
                        fill=""
                        stroke="#333333"
                        strokeWidth={1}
                        perfectDrawEnabled={false}
                        listening={false}
                      />
                      
                      {/* Wall stroke - inner edge */}
                      <KonvaLine
                        points={innerPoints.flatMap(p => [p.x, p.y])}
                        closed={isClosedShape}
                        fill=""
                        stroke="#333333"
                        strokeWidth={1}
                        perfectDrawEnabled={false}
                        listening={false}
                      />

                      
                      {/* Hatching pattern - applied to each segment individually */}
                      {(() => {
                        const hatchLines: JSX.Element[] = [];
                        const hatchSpacing = 8;
                        
                        // Apply hatching to each wall segment individually
                        // For closed shapes, we need to include all segments including the closing one
                        const actualPoints = isClosedShape ? wall.points.slice(0, -1) : wall.points; // Remove duplicate last point for closed shapes
                        const numSegments = isClosedShape ? actualPoints.length : actualPoints.length - 1;
                        
                        for (let segIdx = 0; segIdx < numSegments; segIdx++) {
                          const p1 = actualPoints[segIdx];
                          const p2 = isClosedShape 
                            ? actualPoints[(segIdx + 1) % actualPoints.length] // Wrap around for closed shapes
                            : actualPoints[segIdx + 1];
                          
                          // Calculate segment perpendicular
                          const dx = p2.x - p1.x;
                          const dy = p2.y - p1.y;
                          const length = Math.sqrt(dx * dx + dy * dy);
                          
                          if (length === 0) continue;
                          
                          const dirX = dx / length;
                          const dirY = dy / length;
                          const perpX = -dirY * wallThickness / 2;
                          const perpY = dirX * wallThickness / 2;
                          
                          // Segment corners
                          const segmentCorners = [
                            { x: p1.x + perpX, y: p1.y + perpY },
                            { x: p2.x + perpX, y: p2.y + perpY },
                            { x: p2.x - perpX, y: p2.y - perpY },
                            { x: p1.x - perpX, y: p1.y - perpY }
                          ];
                          
                          // Calculate segment bounds
                          const minX = Math.min(...segmentCorners.map(c => c.x));
                          const maxX = Math.max(...segmentCorners.map(c => c.x));
                          const minY = Math.min(...segmentCorners.map(c => c.y));
                          const maxY = Math.max(...segmentCorners.map(c => c.y));
                          
                          // Create diagonal hatch lines for this segment
                          const segmentWidth = maxX - minX;
                          const segmentHeight = maxY - minY;
                          const diagonal = Math.sqrt(segmentWidth * segmentWidth + segmentHeight * segmentHeight);
                          const numLines = Math.ceil(diagonal / hatchSpacing) + 4;
                          
                          for (let j = -numLines; j <= numLines; j++) {
                            const offset = j * hatchSpacing;
                            
                            // Create a diagonal line (45 degrees) across the segment
                            const lineStart = {
                              x: minX - diagonal + offset,
                              y: minY - diagonal
                            };
                            const lineEnd = {
                              x: maxX + diagonal + offset,
                              y: maxY + diagonal
                            };
                            
                            // Find intersections with segment edges
                            const intersections: { x: number; y: number }[] = [];
                            
                            // Check intersection with each segment edge
                            for (let k = 0; k < 4; k++) {
                              const edgeStart = segmentCorners[k];
                              const edgeEnd = segmentCorners[(k + 1) % 4];
                              
                              const intersection = getLineIntersection(
                                lineStart.x, lineStart.y, lineEnd.x, lineEnd.y,
                                edgeStart.x, edgeStart.y, edgeEnd.x, edgeEnd.y
                              );
                              
                              if (intersection) {
                                intersections.push(intersection);
                              }
                            }
                            
                            // Draw line segments between intersection pairs
                            if (intersections.length >= 2) {
                              // Sort intersections by distance along the line
                              intersections.sort((a, b) => {
                                const distA = Math.sqrt((a.x - lineStart.x) ** 2 + (a.y - lineStart.y) ** 2);
                                const distB = Math.sqrt((b.x - lineStart.x) ** 2 + (b.y - lineStart.y) ** 2);
                                return distA - distB;
                              });
                              
                              // Take the first and last intersection points
                              const start = intersections[0];
                              const end = intersections[intersections.length - 1];
                              
                              hatchLines.push(
                                <KonvaLine
                                  key={`hatch-${wall.id}-${segIdx}-${j}`}
                                  points={[start.x, start.y, end.x, end.y]}
                                  stroke="#999999"
                                  strokeWidth={0.5}
                                  opacity={0.6}
                                />
                              );
                            }
                          }
                        }
                        
                        return hatchLines;
                      })()}
                    </KonvaGroup>
                  );
                })}
                
                {/* Door elements */}
                {doors.map((door) => {
                  const doorWidth = door.width;
                  const swingRadius = doorWidth;
                  
                  // Door frame aligned with wall angle (matching preview)
                  const cos = Math.cos(door.angle);
                  const sin = Math.sin(door.angle);
                  const frameStartX = door.x - cos * doorWidth / 2;
                  const frameStartY = door.y - sin * doorWidth / 2;
                  const frameEndX = door.x + cos * doorWidth / 2;
                  const frameEndY = door.y + sin * doorWidth / 2;
                  
                  // Calculate perpendicular directions for swing options
                  const perpCos = Math.cos(door.angle - Math.PI / 2);
                  const perpSin = Math.sin(door.angle - Math.PI / 2);
                  
                  // Define swing parameters based on option (matching preview logic)
                  let pivotX: number, pivotY: number, panelEndX: number, panelEndY: number, arcRotation: number;
                  
                  switch (door.swingOption) {
                    case 1: // Top-Left
                      pivotX = frameStartX;
                      pivotY = frameStartY;
                      panelEndX = frameStartX + perpCos * swingRadius;
                      panelEndY = frameStartY + perpSin * swingRadius;
                      arcRotation = (door.angle * 180 / Math.PI) + 270;
                      break;
                    case 2: // Bottom-Left
                      pivotX = frameStartX;
                      pivotY = frameStartY;
                      panelEndX = frameStartX - perpCos * swingRadius;
                      panelEndY = frameStartY - perpSin * swingRadius;
                      arcRotation = (door.angle * 180 / Math.PI) + 0;
                      break;
                    case 3: // Bottom-Right
                      pivotX = frameEndX;
                      pivotY = frameEndY;
                      panelEndX = frameEndX - perpCos * swingRadius;
                      panelEndY = frameEndY - perpSin * swingRadius;
                      arcRotation = (door.angle * 180 / Math.PI) + 90;
                      break;
                    case 4: // Top-Right
                      pivotX = frameEndX;
                      pivotY = frameEndY;
                      panelEndX = frameEndX + perpCos * swingRadius;
                      panelEndY = frameEndY + perpSin * swingRadius;
                      arcRotation = (door.angle * 180 / Math.PI) + 180;
                      break;
                  }
                  
                  return (
                    <KonvaGroup key={door.id}>
                      {/* Door frame - follows wall angle */}
                      <KonvaLine
                        points={[frameStartX, frameStartY, frameEndX, frameEndY]}
                        stroke="white"
                        strokeWidth={12}
                      />
                      
                      {/* Door swing arc */}
                      <KonvaArc
                        x={pivotX}
                        y={pivotY}
                        innerRadius={0}
                        outerRadius={swingRadius}
                        angle={90}
                        rotation={arcRotation}
                        stroke="#8B4513"
                        strokeWidth={1}
                        dash={[5, 5]}
                        opacity={0.6}
                      />
                      
                      {/* Door panel (door slab line) */}
                      <KonvaLine
                        points={[pivotX, pivotY, panelEndX, panelEndY]}
                        stroke="#8B4513"
                        strokeWidth={2}
                        opacity={0.8}
                      />
                    </KonvaGroup>
                  );
                })}
                
                {/* Door placement preview */}
                {isDoorPlacement && (
                  <KonvaGroup>
                    {/* Step 1: Position selection preview */}
                    {doorPlacementStep === 'position' && hoveredWall && (
                      <>
                        {/* Preview door frame */}
                        <KonvaCircle
                          x={hoveredWall.position.x}
                          y={hoveredWall.position.y}
                          radius={8}
                          fill="#E91E63"
                          stroke="white"
                          strokeWidth={2}
                          opacity={0.8}
                        />
                        
                        {/* Preview door symbol - rotated to match wall angle */}
                        <KonvaLine
                          points={[
                            hoveredWall.position.x - Math.cos(hoveredWall.wallAngle) * 22.5,
                            hoveredWall.position.y - Math.sin(hoveredWall.wallAngle) * 22.5,
                            hoveredWall.position.x + Math.cos(hoveredWall.wallAngle) * 22.5,
                            hoveredWall.position.y + Math.sin(hoveredWall.wallAngle) * 22.5
                          ]}
                          stroke="#E91E63"
                          strokeWidth={2}
                          opacity={0.6}
                          dash={[5, 5]}
                        />
                      </>
                    )}
                    
                    {/* Step 2: Swing direction preview */}
                    {doorPlacementStep === 'swing' && lockedDoorPosition && (
                      <>
                        {/* Locked door position indicator */}
                        <KonvaCircle
                          x={lockedDoorPosition.position.x}
                          y={lockedDoorPosition.position.y}
                          radius={6}
                          fill="#E91E63"
                          stroke="white"
                          strokeWidth={2}
                        />
                        
                        {/* Door frame preview - follows wall angle */}
                        <KonvaLine
                          points={[
                            lockedDoorPosition.position.x - Math.cos(lockedDoorPosition.wallAngle) * 22.5,
                            lockedDoorPosition.position.y - Math.sin(lockedDoorPosition.wallAngle) * 22.5,
                            lockedDoorPosition.position.x + Math.cos(lockedDoorPosition.wallAngle) * 22.5,
                            lockedDoorPosition.position.y + Math.sin(lockedDoorPosition.wallAngle) * 22.5
                          ]}
                          stroke="white"
                          strokeWidth={12}
                        />
                        
                        {/* Four swing option previews - wall-angle-aware layout */}
                        {(() => {
                          const doorPos = lockedDoorPosition.position;
                          const wallAngle = lockedDoorPosition.wallAngle;
                          const doorWidth = mmToPixels(900); // Standard door width
                          
                          // Calculate door frame endpoints based on wall angle
                          const cos = Math.cos(wallAngle);
                          const sin = Math.sin(wallAngle);
                          const frameStartX = doorPos.x - cos * doorWidth / 2;
                          const frameStartY = doorPos.y - sin * doorWidth / 2;
                          const frameEndX = doorPos.x + cos * doorWidth / 2;
                          const frameEndY = doorPos.y + sin * doorWidth / 2;
                          
                          // Calculate perpendicular directions for swing options
                          const perpCos = Math.cos(wallAngle - Math.PI / 2);
                          const perpSin = Math.sin(wallAngle - Math.PI / 2);
                          
                          const swingOptions = [
                            { 
                              id: 1, 
                              label: 'Top-Left', 
                              pivotX: frameStartX, 
                              pivotY: frameStartY, 
                              panelEndX: frameStartX + perpCos * 45, 
                              panelEndY: frameStartY + perpSin * 45,
                              arcRotation: (wallAngle * 180 / Math.PI) + 270
                            },
                            { 
                              id: 2, 
                              label: 'Bottom-Left', 
                              pivotX: frameStartX, 
                              pivotY: frameStartY, 
                              panelEndX: frameStartX - perpCos * 45, 
                              panelEndY: frameStartY - perpSin * 45,
                              arcRotation: (wallAngle * 180 / Math.PI) + 0
                            },
                            { 
                              id: 3, 
                              label: 'Bottom-Right', 
                              pivotX: frameEndX, 
                              pivotY: frameEndY, 
                              panelEndX: frameEndX - perpCos * 45, 
                              panelEndY: frameEndY - perpSin * 45,
                              arcRotation: (wallAngle * 180 / Math.PI) + 90
                            },
                            { 
                              id: 4, 
                              label: 'Top-Right', 
                              pivotX: frameEndX, 
                              pivotY: frameEndY, 
                              panelEndX: frameEndX + perpCos * 45, 
                              panelEndY: frameEndY + perpSin * 45,
                              arcRotation: (wallAngle * 180 / Math.PI) + 180
                            }
                          ];
                          
                          return swingOptions.map((option) => {
                            const isSelected = selectedSwingOption === option.id;
                            const opacity = isSelected ? 1.0 : 0.3;
                            const strokeWidth = isSelected ? 3 : 1;
                            const color = isSelected ? "#4CAF50" : "#999999";
                            
                                                          return (
                                <KonvaGroup key={option.id}>
                                  {/* Swing arc */}
                                  <KonvaArc
                                    x={option.pivotX}
                                    y={option.pivotY}
                                    innerRadius={0}
                                    outerRadius={45}
                                    angle={90}
                                    rotation={option.arcRotation}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    dash={[6, 3]}
                                    opacity={opacity}
                                  />
                                  
                                  {/* Door panel - hidden */}
                                  {/* <KonvaLine
                                    points={[option.pivotX, option.pivotY, option.panelEndX, option.panelEndY]}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    opacity={opacity}
                                  /> */}
                                  
                                  {/* Option number - hidden */}
                                  {/* <KonvaText
                                    x={option.panelEndX - 8}
                                    y={option.panelEndY - 8}
                                    text={option.id.toString()}
                                    fontSize={16}
                                    fill={color}
                                    fontStyle="bold"
                                    opacity={opacity}
                                  /> */}
                                </KonvaGroup>
                              );
                          });
                        })()}
                      </>
                    )}
                  </KonvaGroup>
                )}

                {/* Window elements */}
                {windows.map((window) => {
                  const windowWidth = window.width;
                  const windowHeight = window.height;
                  
                  // Window frame aligned with wall angle
                  const cos = Math.cos(window.angle);
                  const sin = Math.sin(window.angle);
                  const frameStartX = window.x - cos * windowWidth / 2;
                  const frameStartY = window.y - sin * windowWidth / 2;
                  const frameEndX = window.x + cos * windowWidth / 2;
                  const frameEndY = window.y + sin * windowWidth / 2;
                  
                  // Calculate perpendicular directions for window depth
                  const perpCos = Math.cos(window.angle - Math.PI / 2);
                  const perpSin = Math.sin(window.angle - Math.PI / 2);
                  const depthOffset = 8; // Window depth offset
                  
                  return (
                    <KonvaGroup key={window.id}>
                      {/* Standard architectural window symbol */}
                      
                      {/* White fill to represent opening in wall - hides wall lines */}
                      <KonvaLine
                        points={[
                          frameStartX - perpCos * 5, 
                          frameStartY - perpSin * 5,
                          frameEndX - perpCos * 5, 
                          frameEndY - perpSin * 5,
                          frameEndX + perpCos * 5, 
                          frameEndY + perpSin * 5,
                          frameStartX + perpCos * 5, 
                          frameStartY + perpSin * 5
                        ]}
                        closed={true}
                        fill="white"
                        stroke="white"
                        strokeWidth={1}
                      />
                      
                      {/* Window frame line flush with one wall edge */}
                      <KonvaLine
                        points={[
                          frameStartX - perpCos * 5, 
                          frameStartY - perpSin * 5,
                          frameEndX - perpCos * 5, 
                          frameEndY - perpSin * 5
                        ]}
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      
                      {/* Window frame line flush with opposite wall edge */}
                      <KonvaLine
                        points={[
                          frameStartX + perpCos * 5, 
                          frameStartY + perpSin * 5,
                          frameEndX + perpCos * 5, 
                          frameEndY + perpSin * 5
                        ]}
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      
                      {/* Window sash lines within the opening */}
                      <KonvaLine
                        points={[
                          frameStartX - perpCos * 2, 
                          frameStartY - perpSin * 2,
                          frameEndX - perpCos * 2, 
                          frameEndY - perpSin * 2
                        ]}
                        stroke="#000000"
                        strokeWidth={0.5}
                      />
                      <KonvaLine
                        points={[
                          frameStartX + perpCos * 2, 
                          frameStartY + perpSin * 2,
                          frameEndX + perpCos * 2, 
                          frameEndY + perpSin * 2
                        ]}
                        stroke="#000000"
                        strokeWidth={0.5}
                      />
                      
                      {/* Window frame left and right strokes */}
                      <KonvaLine
                        points={[
                          frameStartX - perpCos * 5,
                          frameStartY - perpSin * 5,
                          frameStartX + perpCos * 5,
                          frameStartY + perpSin * 5
                        ]}
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      <KonvaLine
                        points={[
                          frameEndX - perpCos * 5,
                          frameEndY - perpSin * 5,
                          frameEndX + perpCos * 5,
                          frameEndY + perpSin * 5
                        ]}
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      
                      {/* Window type specific symbols */}
                      {window.type === 'regular' && (
                        // Regular window - single pane with cross
                        <KonvaGroup>
                          {/* Horizontal divider across window opening */}
                          <KonvaLine
                            points={[
                              frameStartX + (frameEndX - frameStartX) * 0.5 - perpCos * 5,
                              frameStartY + (frameEndY - frameStartY) * 0.5 - perpSin * 5,
                              frameStartX + (frameEndX - frameStartX) * 0.5 + perpCos * 5,
                              frameStartY + (frameEndY - frameStartY) * 0.5 + perpSin * 5
                            ]}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.7}
                          />
                          {/* Vertical divider along window length */}
                          <KonvaLine
                            points={[
                              frameStartX + (frameEndX - frameStartX) * 0.5,
                              frameStartY + (frameEndY - frameStartY) * 0.5,
                              frameStartX + (frameEndX - frameStartX) * 0.5,
                              frameStartY + (frameEndY - frameStartY) * 0.5
                            ]}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.7}
                          />
                        </KonvaGroup>
                      )}
                      
                      {window.type === 'french' && (
                        // French window - double doors with center line
                        <KonvaGroup>
                          {/* Center divider across window opening */}
                          <KonvaLine
                            points={[
                              frameStartX + (frameEndX - frameStartX) * 0.5 - perpCos * 5,
                              frameStartY + (frameEndY - frameStartY) * 0.5 - perpSin * 5,
                              frameStartX + (frameEndX - frameStartX) * 0.5 + perpCos * 5,
                              frameStartY + (frameEndY - frameStartY) * 0.5 + perpSin * 5
                            ]}
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          {/* Swing arcs for french doors from window frame */}
                          <KonvaArc
                            x={frameStartX - perpCos * 5}
                            y={frameStartY - perpSin * 5}
                            innerRadius={0}
                            outerRadius={15}
                            angle={90}
                            rotation={window.angle * 180 / Math.PI + (window.orientation === 'outside' ? 0 : 180)}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.5}
                          />
                          <KonvaArc
                            x={frameEndX - perpCos * 5}
                            y={frameEndY - perpSin * 5}
                            innerRadius={0}
                            outerRadius={15}
                            angle={90}
                            rotation={window.angle * 180 / Math.PI + (window.orientation === 'outside' ? 180 : 0)}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.5}
                          />
                        </KonvaGroup>
                      )}
                      
                      {window.type === 'bay' && (
                        // Bay window - angled projection from wall edge
                        <KonvaGroup>
                          {/* Bay window projection lines from window frame */}
                          <KonvaLine
                            points={[
                              frameStartX - perpCos * 5,
                              frameStartY - perpSin * 5,
                              frameStartX + perpCos * 12 - Math.cos(window.angle + Math.PI/6) * 8,
                              frameStartY + perpSin * 12 - Math.sin(window.angle + Math.PI/6) * 8
                            ]}
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          <KonvaLine
                            points={[
                              frameEndX - perpCos * 5,
                              frameEndY - perpSin * 5,
                              frameEndX + perpCos * 12 - Math.cos(window.angle - Math.PI/6) * 8,
                              frameEndY + perpSin * 12 - Math.sin(window.angle - Math.PI/6) * 8
                            ]}
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          {/* Bay window front edge */}
                          <KonvaLine
                            points={[
                              frameStartX + perpCos * 12 - Math.cos(window.angle + Math.PI/6) * 8,
                              frameStartY + perpSin * 12 - Math.sin(window.angle + Math.PI/6) * 8,
                              frameEndX + perpCos * 12 - Math.cos(window.angle - Math.PI/6) * 8,
                              frameEndY + perpSin * 12 - Math.sin(window.angle - Math.PI/6) * 8
                            ]}
                            stroke="#000000"
                            strokeWidth={2}
                          />
                        </KonvaGroup>
                      )}
                      
                      {window.type === 'sliding' && (
                        // Sliding window - overlapping rectangles with arrow
                        <KonvaGroup>
                          {/* Sliding track indicator centered in opening */}
                          <KonvaLine
                            points={[
                              frameStartX + (frameEndX - frameStartX) * 0.25 + perpCos * 3,
                              frameStartY + (frameEndY - frameStartY) * 0.25 + perpSin * 3,
                              frameStartX + (frameEndX - frameStartX) * 0.75 + perpCos * 3,
                              frameStartY + (frameEndY - frameStartY) * 0.75 + perpSin * 3
                            ]}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.7}
                          />
                          {/* Sliding direction arrow centered in opening */}
                          <KonvaLine
                            points={[
                              frameStartX + (frameEndX - frameStartX) * 0.3 + perpCos * 3,
                              frameStartY + (frameEndY - frameStartY) * 0.3 + perpSin * 3,
                              frameStartX + (frameEndX - frameStartX) * 0.7 + perpCos * 3,
                              frameStartY + (frameEndY - frameStartY) * 0.7 + perpSin * 3,
                              frameStartX + (frameEndX - frameStartX) * 0.6 + perpCos * 1,
                              frameStartY + (frameEndY - frameStartY) * 0.6 + perpSin * 1,
                              frameStartX + (frameEndX - frameStartX) * 0.7 + perpCos * 3,
                              frameStartY + (frameEndY - frameStartY) * 0.7 + perpSin * 3,
                              frameStartX + (frameEndX - frameStartX) * 0.6 + perpCos * 5,
                              frameStartY + (frameEndY - frameStartY) * 0.6 + perpSin * 5
                            ]}
                            stroke="#000000"
                            strokeWidth={1}
                            opacity={0.8}
                          />
                        </KonvaGroup>
                      )}
                    </KonvaGroup>
                  );
                })}

                {/* Window placement preview */}
                {isWindowPlacement && (
                  <KonvaGroup>
                    {/* Real-time measurement visualizer */}
                    {nearbyMeasurements.map((measurement) => {
                      const midX = (measurement.startPoint.x + measurement.endPoint.x) / 2;
                      const midY = (measurement.startPoint.y + measurement.endPoint.y) / 2;
                      const angle = Math.atan2(
                        measurement.endPoint.y - measurement.startPoint.y,
                        measurement.endPoint.x - measurement.startPoint.x
                      );
                      
                      // Offset the label slightly from the line
                      const labelOffsetX = Math.cos(angle + Math.PI / 2) * 15;
                      const labelOffsetY = Math.sin(angle + Math.PI / 2) * 15;
                      
                      const getColorByType = (type: string) => {
                        switch (type) {
                          case 'wall-end': return '#10B981'; // Green
                          case 'door': return '#F59E0B'; // Amber
                          case 'window': return '#3B82F6'; // Blue
                          default: return '#6B7280'; // Gray
                        }
                      };
                      
                      return (
                        <KonvaGroup key={measurement.id}>
                          {/* Measurement line */}
                          <KonvaLine
                            points={[
                              measurement.startPoint.x,
                              measurement.startPoint.y,
                              measurement.endPoint.x,
                              measurement.endPoint.y
                            ]}
                            stroke={getColorByType(measurement.type)}
                            strokeWidth={1}
                            dash={[5, 5]}
                            opacity={0.7}
                          />
                          
                          {/* Start point indicator */}
                          <KonvaCircle
                            x={measurement.startPoint.x}
                            y={measurement.startPoint.y}
                            radius={2}
                            fill={getColorByType(measurement.type)}
                            opacity={0.8}
                          />
                          
                          {/* End point indicator */}
                          <KonvaCircle
                            x={measurement.endPoint.x}
                            y={measurement.endPoint.y}
                            radius={2}
                            fill={getColorByType(measurement.type)}
                            opacity={0.8}
                          />
                          
                          {/* Distance label background */}
                          <KonvaRect
                            x={midX + labelOffsetX - 20}
                            y={midY + labelOffsetY - 8}
                            width={40}
                            height={16}
                            fill="white"
                            stroke={getColorByType(measurement.type)}
                            strokeWidth={1}
                            cornerRadius={3}
                            opacity={0.95}
                          />
                          
                          {/* Distance label text */}
                          <KonvaText
                            x={midX + labelOffsetX - 18}
                            y={midY + labelOffsetY - 5}
                            text={measurement.label}
                            fontSize={10}
                            fill={getColorByType(measurement.type)}
                            fontStyle="bold"
                          />
                        </KonvaGroup>
                      );
                    })}
                    {/* Step 1: Position selection preview */}
                    {windowPlacementStep === 'position' && hoveredWall && (
                      <>
                        {/* Preview window position */}
                        <KonvaCircle
                          x={hoveredWall.position.x}
                          y={hoveredWall.position.y}
                          radius={8}
                          fill="#3B82F6"
                          stroke="white"
                          strokeWidth={2}
                          opacity={0.8}
                        />
                        
                        {/* Preview window symbol - rotated to match wall angle */}
                        <KonvaLine
                          points={[
                            hoveredWall.position.x - Math.cos(hoveredWall.wallAngle) * (selectedWindowWidth * 100 / 2),
                            hoveredWall.position.y - Math.sin(hoveredWall.wallAngle) * (selectedWindowWidth * 100 / 2),
                            hoveredWall.position.x + Math.cos(hoveredWall.wallAngle) * (selectedWindowWidth * 100 / 2),
                            hoveredWall.position.y + Math.sin(hoveredWall.wallAngle) * (selectedWindowWidth * 100 / 2)
                          ]}
                          stroke="#3B82F6"
                          strokeWidth={6}
                          opacity={0.6}
                        />
                      </>
                    )}
                    
                    {/* Step 2: Window orientation selection */}
                    {windowPlacementStep === 'orientation' && lockedWindowPosition && (
                      <>
                        {/* Locked window position indicator */}
                        <KonvaCircle
                          x={lockedWindowPosition.position.x}
                          y={lockedWindowPosition.position.y}
                          radius={6}
                          fill="#3B82F6"
                          stroke="white"
                          strokeWidth={2}
                        />
                        
                        {/* Window frame preview */}
                        <KonvaLine
                          points={[
                            lockedWindowPosition.position.x - Math.cos(lockedWindowPosition.wallAngle) * (selectedWindowWidth * 100 / 2),
                            lockedWindowPosition.position.y - Math.sin(lockedWindowPosition.wallAngle) * (selectedWindowWidth * 100 / 2),
                            lockedWindowPosition.position.x + Math.cos(lockedWindowPosition.wallAngle) * (selectedWindowWidth * 100 / 2),
                            lockedWindowPosition.position.y + Math.sin(lockedWindowPosition.wallAngle) * (selectedWindowWidth * 100 / 2)
                          ]}
                          stroke="#3B82F6"
                          strokeWidth={8}
                          opacity={0.8}
                        />
                        
                        {/* Window orientation guide */}
                        <KonvaGroup>
                          {/* Show both sides of the wall */}
                          {(() => {
                            const wallAngle = lockedWindowPosition.wallAngle;
                            const wallPos = lockedWindowPosition.position;
                            const perpCos = Math.cos(wallAngle - Math.PI / 2);
                            const perpSin = Math.sin(wallAngle - Math.PI / 2);
                            const sideOffset = 30;
                            
                            return (
                              <>
                                {/* Inside triangle indicator */}
                                <KonvaLine
                                  points={[
                                    // Triangle pointing toward inside
                                    wallPos.x - perpCos * sideOffset + perpCos * 8 - Math.cos(wallAngle) * 6,
                                    wallPos.y - perpSin * sideOffset + perpSin * 8 - Math.sin(wallAngle) * 6,
                                    wallPos.x - perpCos * sideOffset,
                                    wallPos.y - perpSin * sideOffset,
                                    wallPos.x - perpCos * sideOffset + perpCos * 8 + Math.cos(wallAngle) * 6,
                                    wallPos.y - perpSin * sideOffset + perpSin * 8 + Math.sin(wallAngle) * 6
                                  ]}
                                  closed={true}
                                  fill={hoveredWindowSide === 'inside' ? "#10B981" : "#6B7280"}
                                  stroke={hoveredWindowSide === 'inside' ? "#10B981" : "#6B7280"}
                                  strokeWidth={1}
                                  opacity={hoveredWindowSide === 'inside' ? 1.0 : 0.6}
                                />
                                
                                {/* Outside triangle indicator */}
                                <KonvaLine
                                  points={[
                                    // Triangle pointing toward outside
                                    wallPos.x + perpCos * sideOffset - perpCos * 8 - Math.cos(wallAngle) * 6,
                                    wallPos.y + perpSin * sideOffset - perpSin * 8 - Math.sin(wallAngle) * 6,
                                    wallPos.x + perpCos * sideOffset,
                                    wallPos.y + perpSin * sideOffset,
                                    wallPos.x + perpCos * sideOffset - perpCos * 8 + Math.cos(wallAngle) * 6,
                                    wallPos.y + perpSin * sideOffset - perpSin * 8 + Math.sin(wallAngle) * 6
                                  ]}
                                  closed={true}
                                  fill={hoveredWindowSide === 'outside' ? "#10B981" : "#6B7280"}
                                  stroke={hoveredWindowSide === 'outside' ? "#10B981" : "#6B7280"}
                                  strokeWidth={1}
                                  opacity={hoveredWindowSide === 'outside' ? 1.0 : 0.6}
                                />
                              </>
                            );
                                                      })()}
                            
                          {/* Window width input bubble */}
                          <KonvaGroup>
                            {/* Subtle purple border */}
                            <KonvaRect
                              x={lockedWindowPosition.position.x - 61}
                              y={lockedWindowPosition.position.y - 66}
                              width={122}
                              height={37}
                              fill="#8B5CF6"
                              cornerRadius={6}
                              opacity={0.9}
                            />
                            
                            {/* Inner white background */}
                            <KonvaRect
                              x={lockedWindowPosition.position.x - 60}
                              y={lockedWindowPosition.position.y - 65}
                              width={120}
                              height={35}
                              fill="white"
                              cornerRadius={5}
                              opacity={1.0}
                            />
                            
                            {/* Width label */}
                            <KonvaText
                              x={lockedWindowPosition.position.x - 55}
                              y={lockedWindowPosition.position.y - 57}
                              text={`Width: ${windowWidthInput}m`}
                              fontSize={12}
                              fill="#374151"
                              fontStyle="bold"
                            />
                            
                            {/* Instructions */}
                            <KonvaText
                              x={lockedWindowPosition.position.x - 55}
                              y={lockedWindowPosition.position.y - 42}
                              text="↑↓ or type to adjust"
                              fontSize={9}
                              fill="#6B7280"
                            />
                          </KonvaGroup>
 
                          </KonvaGroup>
                      </>
                    )}
                  </KonvaGroup>
                )}

                {/* Dimensioning tool visualization */}
                {isDimensioning && (
                  <KonvaGroup>
                    {/* Render placed dimensions */}
                    {placedDimensions.map((dim) => {
                      // Calculate dimension line position and witness lines
                      const dx = dim.endPoint.x - dim.startPoint.x;
                      const dy = dim.endPoint.y - dim.startPoint.y;
                      const length = Math.sqrt(dx * dx + dy * dy);
                      
                      if (length === 0) return null;
                      
                      // Unit vector along the dimension line
                      const unitX = dx / length;
                      const unitY = dy / length;
                      
                      // Perpendicular vector
                      const perpX = -unitY;
                      const perpY = unitX;
                      
                      // Project placement point onto dimension line to get offset distance
                      const toPlacementX = dim.placementPoint.x - dim.startPoint.x;
                      const toPlacementY = dim.placementPoint.y - dim.startPoint.y;
                      const offset = toPlacementX * perpX + toPlacementY * perpY;
                      
                      // Dimension line points
                      const dimStartX = dim.startPoint.x + perpX * offset;
                      const dimStartY = dim.startPoint.y + perpY * offset;
                      const dimEndX = dim.endPoint.x + perpX * offset;
                      const dimEndY = dim.endPoint.y + perpY * offset;
                      
                      // Text position (middle of dimension line)
                      const textX = (dimStartX + dimEndX) / 2;
                      const textY = (dimStartY + dimEndY) / 2;
                      
                      return (
                        <KonvaGroup key={dim.id}>
                          {/* Witness line 1 */}
                          <KonvaLine
                            points={[
                              dim.startPoint.x, dim.startPoint.y,
                              dimStartX, dimStartY
                            ]}
                            stroke="#666666"
                            strokeWidth={1}
                            dash={[2, 2]}
                          />
                          
                          {/* Witness line 2 */}
                          <KonvaLine
                            points={[
                              dim.endPoint.x, dim.endPoint.y,
                              dimEndX, dimEndY
                            ]}
                            stroke="#666666"
                            strokeWidth={1}
                            dash={[2, 2]}
                          />
                          
                          {/* Main dimension line */}
                          <KonvaLine
                            points={[dimStartX, dimStartY, dimEndX, dimEndY]}
                            stroke="#000000"
                            strokeWidth={2}
                          />
                          
                          {/* Arrow heads */}
                          <KonvaLine
                            points={[
                              dimStartX, dimStartY,
                              dimStartX + unitX * 8 - perpX * 4,
                              dimStartY + unitY * 8 - perpY * 4,
                              dimStartX + unitX * 8 + perpX * 4,
                              dimStartY + unitY * 8 + perpY * 4,
                              dimStartX, dimStartY
                            ]}
                            closed={true}
                            fill="#000000"
                          />
                          
                          <KonvaLine
                            points={[
                              dimEndX, dimEndY,
                              dimEndX - unitX * 8 - perpX * 4,
                              dimEndY - unitY * 8 - perpY * 4,
                              dimEndX - unitX * 8 + perpX * 4,
                              dimEndY - unitY * 8 + perpY * 4,
                              dimEndX, dimEndY
                            ]}
                            closed={true}
                            fill="#000000"
                          />
                          
                          {/* Dimension text background and text */}
                          {(() => {
                            // Determine if this is a vertical dimension (more vertical than horizontal)
                            const isVertical = Math.abs(dy) > Math.abs(dx);
                            
                            if (isVertical) {
                              // For vertical dimensions, rotate text to face right
                              const rotation = dy > 0 ? 90 : -90; // Rotate based on direction
                              
                              return (
                                <KonvaGroup
                                  x={textX}
                                  y={textY}
                                  rotation={rotation}
                                >
                                  {/* Background */}
                                  <KonvaRect
                                    x={-25}
                                    y={-8}
                                    width={50}
                                    height={16}
                                    fill="white"
                                    stroke="#000000"
                                    strokeWidth={1}
                                  />
                                  
                                  {/* Text */}
                                  <KonvaText
                                    x={-25}
                                    y={-5}
                                    width={50}
                                    text={dim.label}
                                    fontSize={12}
                                    fill="#000000"
                                    align="center"
                                    fontStyle="bold"
                                  />
                                </KonvaGroup>
                              );
                            } else {
                              // For horizontal dimensions, keep text horizontal
                              return (
                                <>
                                  <KonvaRect
                                    x={textX - 25}
                                    y={textY - 8}
                                    width={50}
                                    height={16}
                                    fill="white"
                                    stroke="#000000"
                                    strokeWidth={1}
                                  />
                                  
                                  <KonvaText
                                    x={textX - 25}
                                    y={textY - 5}
                                    width={50}
                                    text={dim.label}
                                    fontSize={12}
                                    fill="#000000"
                                    align="center"
                                    fontStyle="bold"
                                  />
                                </>
                              );
                            }
                          })()}
                        </KonvaGroup>
                      );
                    })}
                    
                    {/* Preview dimension during placement */}
                    {dimensionFirstPoint && (
                      <KonvaGroup>
                        {/* First point indicator */}
                        <KonvaCircle
                          x={dimensionFirstPoint.x}
                          y={dimensionFirstPoint.y}
                          radius={4}
                          fill="#FF6B6B"
                          stroke="white"
                          strokeWidth={2}
                        />
                        
                        {dimensionSecondPoint && (
                          <>
                            {/* Second point indicator */}
                            <KonvaCircle
                              x={dimensionSecondPoint.x}
                              y={dimensionSecondPoint.y}
                              radius={4}
                              fill="#FF6B6B"
                              stroke="white"
                              strokeWidth={2}
                            />
                            
                            {/* Preview line between points */}
                            <KonvaLine
                              points={[
                                dimensionFirstPoint.x, dimensionFirstPoint.y,
                                dimensionSecondPoint.x, dimensionSecondPoint.y
                              ]}
                              stroke="#FF6B6B"
                              strokeWidth={2}
                              dash={[5, 5]}
                            />
                            
                            {dimensionPlacementPoint && (
                              <>
                                {/* Preview dimension with witness lines */}
                                {(() => {
                                  const dx = dimensionSecondPoint.x - dimensionFirstPoint.x;
                                  const dy = dimensionSecondPoint.y - dimensionFirstPoint.y;
                                  const length = Math.sqrt(dx * dx + dy * dy);
                                  
                                  if (length === 0) return null;
                                  
                                  const unitX = dx / length;
                                  const unitY = dy / length;
                                  const perpX = -unitY;
                                  const perpY = unitX;
                                  
                                  const toPlacementX = dimensionPlacementPoint.x - dimensionFirstPoint.x;
                                  const toPlacementY = dimensionPlacementPoint.y - dimensionFirstPoint.y;
                                  const offset = toPlacementX * perpX + toPlacementY * perpY;
                                  
                                  const dimStartX = dimensionFirstPoint.x + perpX * offset;
                                  const dimStartY = dimensionFirstPoint.y + perpY * offset;
                                  const dimEndX = dimensionSecondPoint.x + perpX * offset;
                                  const dimEndY = dimensionSecondPoint.y + perpY * offset;
                                  
                                  const textX = (dimStartX + dimEndX) / 2;
                                  const textY = (dimStartY + dimEndY) / 2;
                                  const distance = length / 100;
                                  
                                  return (
                                    <KonvaGroup>
                                      {/* Preview witness lines */}
                                      <KonvaLine
                                        points={[
                                          dimensionFirstPoint.x, dimensionFirstPoint.y,
                                          dimStartX, dimStartY
                                        ]}
                                        stroke="#FF6B6B"
                                        strokeWidth={1}
                                        dash={[3, 3]}
                                        opacity={0.7}
                                      />
                                      
                                      <KonvaLine
                                        points={[
                                          dimensionSecondPoint.x, dimensionSecondPoint.y,
                                          dimEndX, dimEndY
                                        ]}
                                        stroke="#FF6B6B"
                                        strokeWidth={1}
                                        dash={[3, 3]}
                                        opacity={0.7}
                                      />
                                      
                                      {/* Preview dimension line */}
                                      <KonvaLine
                                        points={[dimStartX, dimStartY, dimEndX, dimEndY]}
                                        stroke="#FF6B6B"
                                        strokeWidth={2}
                                        opacity={0.8}
                                      />
                                      
                                      {/* Preview dimension text */}
                                      {(() => {
                                        // Determine if this is a vertical dimension (more vertical than horizontal)
                                        const isVertical = Math.abs(dy) > Math.abs(dx);
                                        
                                        if (isVertical) {
                                          // For vertical dimensions, rotate text to face right
                                          const rotation = dy > 0 ? 90 : -90; // Rotate based on direction
                                          
                                          return (
                                            <KonvaGroup
                                              x={textX}
                                              y={textY}
                                              rotation={rotation}
                                              opacity={0.9}
                                            >
                                              {/* Background */}
                                              <KonvaRect
                                                x={-25}
                                                y={-8}
                                                width={50}
                                                height={16}
                                                fill="white"
                                                stroke="#FF6B6B"
                                                strokeWidth={1}
                                              />
                                              
                                              {/* Text */}
                                              <KonvaText
                                                x={-25}
                                                y={-5}
                                                width={50}
                                                text={`${distance.toFixed(2)}m`}
                                                fontSize={12}
                                                fill="#FF6B6B"
                                                align="center"
                                                fontStyle="bold"
                                              />
                                            </KonvaGroup>
                                          );
                                        } else {
                                          // For horizontal dimensions, keep text horizontal
                                          return (
                                            <>
                                              <KonvaRect
                                                x={textX - 25}
                                                y={textY - 8}
                                                width={50}
                                                height={16}
                                                fill="white"
                                                stroke="#FF6B6B"
                                                strokeWidth={1}
                                                opacity={0.9}
                                              />
                                              
                                              <KonvaText
                                                x={textX - 25}
                                                y={textY - 5}
                                                width={50}
                                                text={`${distance.toFixed(2)}m`}
                                                fontSize={12}
                                                fill="#FF6B6B"
                                                align="center"
                                                fontStyle="bold"
                                              />
                                            </>
                                          );
                                        }
                                      })()}
                                    </KonvaGroup>
                                  );
                                })()}
                              </>
                            )}
                          </>
                        )}
                      </KonvaGroup>
                    )}
                    
                    {/* Snap point visualization */}
                    {dimensionSnapPoint && (
                      <KonvaGroup>
                        {/* Snap point indicator */}
                        <KonvaCircle
                          x={dimensionSnapPoint.x}
                          y={dimensionSnapPoint.y}
                          radius={8}
                          fill="transparent"
                          stroke={
                            dimensionSnapPoint.type === 'wall-end' ? '#4CAF50' :
                            dimensionSnapPoint.type === 'door-center' ? '#FF9800' :
                            '#2196F3'
                          }
                          strokeWidth={3}
                          dash={[4, 4]}
                        />
                        
                        {/* Inner snap point dot */}
                        <KonvaCircle
                          x={dimensionSnapPoint.x}
                          y={dimensionSnapPoint.y}
                          radius={3}
                          fill={
                            dimensionSnapPoint.type === 'wall-end' ? '#4CAF50' :
                            dimensionSnapPoint.type === 'door-center' ? '#FF9800' :
                            '#2196F3'
                          }
                        />
                        
                        {/* Snap point label */}
                        <KonvaRect
                          x={dimensionSnapPoint.x + 12}
                          y={dimensionSnapPoint.y - 8}
                          width={60}
                          height={16}
                          fill="white"
                          stroke={
                            dimensionSnapPoint.type === 'wall-end' ? '#4CAF50' :
                            dimensionSnapPoint.type === 'door-center' ? '#FF9800' :
                            '#2196F3'
                          }
                          strokeWidth={1}
                          cornerRadius={3}
                          opacity={0.95}
                        />
                        
                        <KonvaText
                          x={dimensionSnapPoint.x + 12}
                          y={dimensionSnapPoint.y - 5}
                          width={60}
                          text={
                            dimensionSnapPoint.type === 'wall-end' ? 'Wall End' :
                            dimensionSnapPoint.type === 'door-center' ? 'Door' :
                            'Window'
                          }
                          fontSize={10}
                          fill={
                            dimensionSnapPoint.type === 'wall-end' ? '#4CAF50' :
                            dimensionSnapPoint.type === 'door-center' ? '#FF9800' :
                            '#2196F3'
                          }
                          align="center"
                          fontStyle="bold"
                        />
                      </KonvaGroup>
                    )}
                  </KonvaGroup>
                )}


                
                {/* Current wall being drawn */}
                {isDrawingWall && wallPoints.length > 0 && (
                  <>
                    {/* Preview wall segments */}
                    {wallPoints.length > 1 && (
                      (() => {
                        const previewWalls: JSX.Element[] = [];
                        const wallThickness = mmToPixels(200); // Standard wall thickness (200mm)
                        
                        for (let i = 0; i < wallPoints.length - 1; i++) {
                          const p1 = wallPoints[i];
                          const p2 = wallPoints[i + 1];
                          
                          const dx = p2.x - p1.x;
                          const dy = p2.y - p1.y;
                          const length = Math.sqrt(dx * dx + dy * dy);
                          
                          if (length === 0) continue;
                          
                          const dirX = dx / length;
                          const dirY = dy / length;
                          const perpX = -dirY * wallThickness / 2;
                          const perpY = dirX * wallThickness / 2;
                          
                          const corners = [
                            p1.x + perpX, p1.y + perpY,
                            p2.x + perpX, p2.y + perpY,
                            p2.x - perpX, p2.y - perpY,
                            p1.x - perpX, p1.y - perpY
                          ];
                          
                          previewWalls.push(
                            <KonvaLine
                              key={`preview-${i}`}
                              points={corners}
                              closed={true}
                              fill="#f5f5f5"
                              stroke="#666666"
                              strokeWidth={1}
                              opacity={0.8}
                            />
                          );
                        }
                        
                        return previewWalls;
                      })()
                    )}
                    
                    {/* Preview line from last point to mouse */}
                    {currentMousePosition && wallPoints.length >= 1 && (
                      (() => {
                        const p1 = wallPoints[wallPoints.length - 1];
                        const p2 = currentMousePosition;
                        const wallThickness = mmToPixels(200); // Standard wall thickness (200mm)
                        
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        
                        if (length === 0) return null;
                        
                        const dirX = dx / length;
                        const dirY = dy / length;
                        const perpX = -dirY * wallThickness / 2;
                        const perpY = dirX * wallThickness / 2;
                        
                        const corners = [
                          p1.x + perpX, p1.y + perpY,
                          p2.x + perpX, p2.y + perpY,
                          p2.x - perpX, p2.y - perpY,
                          p1.x - perpX, p1.y - perpY
                        ];
                        
                        // Calculate dimension in meters using our scale (1 pixel = 20mm)
                        const dimensionInMeters = (length * SCALE_MM_PER_PIXEL / 1000).toFixed(2);
                        
                        // Calculate midpoint for dimension label
                        const midX = (p1.x + p2.x) / 2;
                        const midY = (p1.y + p2.y) / 2;
                        
                        // Calculate offset for dimension label (perpendicular to wall)
                        const labelOffsetDistance = 25;
                        const labelX = midX + perpX * (labelOffsetDistance / (wallThickness / 2));
                        const labelY = midY + perpY * (labelOffsetDistance / (wallThickness / 2));
                        
                        return (
                          <>
                            <KonvaLine
                              points={corners}
                              closed={true}
                              fill="#f5f5f5"
                              stroke="#666666"
                              strokeWidth={1}
                              opacity={0.5}
                              dash={[5, 5]}
                            />
                            
                            {/* Dimension label */}
                            <KonvaGroup>
                              {/* Background for dimension text */}
                              <KonvaRect
                                x={labelX - 20}
                                y={labelY - 10}
                                width={40}
                                height={20}
                                fill="white"
                                stroke="#4A90E2"
                                strokeWidth={1}
                                cornerRadius={4}
                                opacity={0.9}
                              />
                              
                              {/* Dimension text */}
                              <KonvaText
                                x={labelX - 20}
                                y={labelY - 10}
                                width={40}
                                height={20}
                                text={`${dimensionInMeters}m`}
                                fontSize={12}
                                fontFamily="Arial"
                                fill="#4A90E2"
                                align="center"
                                verticalAlign="middle"
                                fontStyle="bold"
                              />
                            </KonvaGroup>
                          </>
                        );
                      })()
                    )}
                    
                    {/* Point indicators */}
                    {wallPoints.map((point, index) => (
                      <KonvaCircle
                        key={index}
                        x={point.x}
                        y={point.y}
                        radius={6}
                        fill={index === 0 ? "#E91E63" : "#666666"}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                    
                    {/* Highlight first point when close enough to close loop */}
                    {wallPoints.length >= 3 && currentMousePosition && (
                      (() => {
                        const firstPoint = wallPoints[0];
                        const distance = Math.sqrt(
                          Math.pow(currentMousePosition.x - firstPoint.x, 2) + 
                          Math.pow(currentMousePosition.y - firstPoint.y, 2)
                        );
                        return distance < 20 ? (
                          <KonvaCircle
                            x={firstPoint.x}
                            y={firstPoint.y}
                            radius={12}
                            fill="transparent"
                            stroke="#E91E63"
                            strokeWidth={3}
                            dash={[5, 5]}
                          />
                        ) : null;
                      })()
                    )}
                  </>
                )}
              </KonvaGroup>

              {/* Elements Layer - excluding generated images and uploaded images which have their own layers */}
              {visibleElements.filter(el => el.type !== 'generated-image' && el.type !== 'uploaded').map((el) => (
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
                  fill="rgba(74, 144, 226, 0.1)"
                  stroke="#4A90E2"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                />
              )}

              {/* Render selection highlight for selected elements */}
              {selectedElementIds.map(elementId => {
                const element = elements.find(el => el.id === elementId);
                if (!element) return null;
                
                return (
                  <KonvaRect
                    key={`selection-${elementId}`}
                    x={element.x - 2}
                    y={element.y - 2}
                    width={(element.width || 0) + 4}
                    height={(element.height || 0) + 4}
                    fill="transparent"
                    stroke="#4A90E2"
                    strokeWidth={2}
                    dash={[3, 3]}
                    listening={false}
                  />
                );
              })}
            </Layer>
            {/* SimpleDraw Layer - moved inside Stage */}
            <Layer>
              {simpleDrawLines.map((line, idx) => (
                <KonvaLine
                  key={idx}
                  ref={el => { simpleDrawLineRefs.current[idx] = el; }}
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
                  anchorStroke="#E91E63"
                  anchorFill="#fff"
                  borderStroke="#E91E63"
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
                    onClick={() => {
                      setSelectedId(element.id);
                      setSelectedImageElement(element);
                      
                      // Position menu intelligently near the image
                      const menuPosition = calculateMenuPosition(element);
                      if (menuPosition) {
                        setImageMenuPosition(menuPosition);
                      }
                    }}
                    onDragEnd={e => {
                      const node = e.target;
                      handleElementChange(element.id, { x: node.x(), y: node.y() });
                    }}
                    style={{
                      transform: `rotate(${element.rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                  />
                );
              })}
              {/* Unified transformer for all image elements */}
              {selectedId && elements.find(el => 
                el.id === selectedId && 
                (el.type === 'uploaded' || el.type === 'generated-image' || el.type === 'library-asset')
              ) && (
                  <KonvaTransformer
                    ref={generatedImageTransformerRef}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    borderEnabled={true}
                    rotateEnabled={true}
                    anchorSize={6}
                    anchorStroke="#E91E63"
                    anchorFill="#fff"
                    borderStroke="#E91E63"
                    borderDash={[4, 4]}
                  rotationSnaps={[0, 90, 180, 270]}
                  rotationSnapTolerance={10}
                  onTransform={(e) => {
                    const node = e.target;
                    const stage = node.getStage();
                    
                    // Check if shift key is pressed
                    if (stage && stage.container()) {
                      const isShiftPressed = (window.event as any)?.shiftKey || false;
                      
                      if (isShiftPressed) {
                        const rotation = node.rotation();
                        // Snap to nearest 90-degree increment
                        const snapAngles = [0, 90, 180, 270, 360];
                        let closestAngle = 0;
                        let minDiff = Infinity;
                        
                        snapAngles.forEach(angle => {
                          const diff = Math.abs(rotation - angle);
                          const wrappedDiff = Math.abs(rotation - (angle - 360));
                          const minCurrentDiff = Math.min(diff, wrappedDiff);
                          
                          if (minCurrentDiff < minDiff) {
                            minDiff = minCurrentDiff;
                            closestAngle = angle === 360 ? 0 : angle;
                          }
                        });
                        
                        // Apply snap if within tolerance
                        if (minDiff <= 15) { // 15-degree tolerance
                          node.rotation(closestAngle);
                        }
                      }
                    }
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    const rotation = node.rotation();
                    
                    // Find the selected element regardless of type
                    const selectedElement = elements.find(el => 
                      el.id === selectedId && 
                      (el.type === 'uploaded' || el.type === 'generated-image' || el.type === 'library-asset')
                    );
                    
                    if (selectedElement) {
                      handleElementChange(selectedElement.id, {
                        x: node.x(),
                        y: node.y(),
                        width: Math.max(10, node.width() * scaleX),
                        height: Math.max(10, node.height() * scaleY),
                        rotation: rotation,
                      });
                      node.scaleX(1);
                      node.scaleY(1);
                    }
                  }}
                />
              )}
            </Layer>
            {/* Layer for generated images (AI renders) */}
            <Layer>
              {elements.filter(el => el.type === 'generated-image').map(renderElement)}
            </Layer>
            {/* Render mind map nodes and connections */}
            <Layer>
              {renderMindMap()}
            </Layer>
            
            {/* Annotation tool visualization - Top layer for highest z-index */}
            <Layer>
              {annotations.map((annotation) => (
                <KonvaGroup key={annotation.id}>
                  {/* Line from target to bend point */}
                  <KonvaLine
                    points={[
                      annotation.targetPoint.x, annotation.targetPoint.y,
                      annotation.bendPoint.x, annotation.bendPoint.y
                    ]}
                    stroke="#FF6B35"
                    strokeWidth={2}
                    lineCap="round"
                  />
                  
                  {/* Line from bend point to text box */}
                  <KonvaLine
                    points={[
                      annotation.bendPoint.x, annotation.bendPoint.y,
                      annotation.textBox.x, annotation.textBox.y + annotation.textBox.height / 2
                    ]}
                    stroke="#FF6B35"
                    strokeWidth={2}
                    lineCap="round"
                  />
                  
                  {/* Arrow head at target point */}
                  {(() => {
                    // Calculate arrow direction from bend point to target point
                    const dx = annotation.targetPoint.x - annotation.bendPoint.x;
                    const dy = annotation.targetPoint.y - annotation.bendPoint.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    if (length === 0) return null;
                    
                    // Unit vector pointing towards target
                    const unitX = dx / length;
                    const unitY = dy / length;
                    
                    // Perpendicular vector for arrow wings
                    const perpX = -unitY;
                    const perpY = unitX;
                    
                    const arrowSize = 8;
                    
                    return (
                      <KonvaLine
                        points={[
                          annotation.targetPoint.x, annotation.targetPoint.y,
                          annotation.targetPoint.x - unitX * arrowSize + perpX * (arrowSize / 2),
                          annotation.targetPoint.y - unitY * arrowSize + perpY * (arrowSize / 2),
                          annotation.targetPoint.x - unitX * arrowSize - perpX * (arrowSize / 2),
                          annotation.targetPoint.y - unitY * arrowSize - perpY * (arrowSize / 2),
                          annotation.targetPoint.x, annotation.targetPoint.y
                        ]}
                        closed={true}
                        fill="#FF6B35"
                        stroke="#FF6B35"
                        strokeWidth={1}
                      />
                    );
                  })()}
                  
                  {/* Bend point handle (draggable) */}
                  <KonvaCircle
                    x={annotation.bendPoint.x}
                    y={annotation.bendPoint.y}
                    radius={3}
                    fill={selectedAnnotation === annotation.id ? "#FF6B35" : "white"}
                    stroke="#FF6B35"
                    strokeWidth={1}
                    onMouseDown={() => handleBendPointDragStart(annotation.id)}
                    onMouseEnter={(e) => {
                      e.target.getStage()!.container().style.cursor = 'move';
                    }}
                    onMouseLeave={(e) => {
                      e.target.getStage()!.container().style.cursor = 'default';
                    }}
                  />
                  
                  {/* Text box background */}
                  <KonvaRect
                    x={annotation.textBox.x}
                    y={annotation.textBox.y}
                    width={annotation.textBox.width}
                    height={annotation.textBox.height}
                    fill="white"
                    stroke={selectedAnnotation === annotation.id ? "#FF6B35" : "#CCCCCC"}
                    strokeWidth={selectedAnnotation === annotation.id ? 2 : 1}
                    cornerRadius={4}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowBlur={4}
                    shadowOffsetX={2}
                    shadowOffsetY={2}
                    onClick={() => setSelectedAnnotation(annotation.id)}
                    onMouseDown={() => handleTextBoxDragStart(annotation.id)}
                    onMouseEnter={(e) => {
                      e.target.getStage()!.container().style.cursor = 'move';
                    }}
                    onMouseLeave={(e) => {
                      e.target.getStage()!.container().style.cursor = 'default';
                    }}
                  />
                  
                  {/* Text content */}
                  {!annotation.isEditing ? (
                    <KonvaText
                      x={annotation.textBox.x + 8}
                      y={annotation.textBox.y + 8}
                      width={annotation.textBox.width - 16}
                      height={annotation.textBox.height - 16}
                      text={annotation.textBox.text}
                      fontSize={12}
                      fill="#333333"
                      align="left"
                      verticalAlign="top"
                      wrap="word"
                      onDblClick={() => handleAnnotationEdit(annotation.id)}
                    />
                  ) : (
                    <Html
                      groupProps={{ x: annotation.textBox.x + 8, y: annotation.textBox.y + 8 }}
                      divProps={{
                        style: {
                          width: annotation.textBox.width - 16,
                          height: annotation.textBox.height - 16,
                          zIndex: 1000
                        }
                      }}
                    >
                      <textarea
                        defaultValue={annotation.textBox.text}
                        onBlur={(e) => handleAnnotationTextChange(annotation.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAnnotationTextChange(annotation.id, e.currentTarget.value);
                          }
                          if (e.key === 'Escape') {
                            handleAnnotationTextChange(annotation.id, annotation.textBox.text);
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          resize: 'none',
                          fontFamily: 'inherit',
                          fontSize: '12px',
                          color: '#333333'
                        }}
                        autoFocus
                      />
                    </Html>
                  )}
                </KonvaGroup>
              ))}
            </Layer>
          </Stage>
          
          {/* Drag and Drop Overlay */}
          {isDragOverCanvas && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-blue-500 border-dashed flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="text-2xl mb-2">📁</div>
                <div className="text-lg font-semibold text-gray-800">Drop images here</div>
                <div className="text-sm text-gray-600">Images will be added to the canvas</div>
              </div>
            </div>
          )}
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
          className="ai-chat-toggle fixed bottom-4 right-4 p-3 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-full shadow-lg transition-colors pointer-events-auto"
        >
          <div className="w-6 h-6 relative">
            <NextImage
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
          stageRef={stageRef}
          canvasPosition={position}
          canvasScale={scale}
          onScreenshotModeChange={handleScreenshotModeChange}
          isOnboardingActive={showOnboarding}
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
                      width: canvasDimensions.width - (isChatOpen ? 400 : 0),
                      height: canvasDimensions.height,
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

      {/* Zoom Controls */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 z-50">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Out Button */}
          <button
            onClick={() => {
              const newScale = Math.max(0.1, scale / 1.2);
              setScale(newScale);
            }}
            disabled={scale <= 0.1}
            className="p-2 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-lg shadow-lg transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          {/* Zoom Percentage Indicator */}
          <div className="px-3 py-2 bg-white border border-[#E0DAF3] rounded-lg shadow-lg text-sm font-medium text-gray-700 pointer-events-auto min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </div>
          
          {/* Zoom In Button */}
          <button
            onClick={() => {
              const newScale = Math.min(5, scale * 1.2);
              setScale(newScale);
            }}
            disabled={scale >= 5}
            className="p-2 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-lg shadow-lg transition-colors pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetView}
            className="p-2 bg-white border border-[#E0DAF3] hover:bg-gray-50 text-[#814ADA] rounded-lg shadow-lg transition-colors pointer-events-auto"
            title="Reset View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Scale Indicator */}
        <div className="pointer-events-auto max-w-[200px]">
          <div className="flex flex-col gap-0.5">
            {/* Scale Bar */}
            <div className="flex items-end">
              {(() => {
                // Calculate the grid size in current view (50 pixels = 1 meter at 1x scale)
                const gridPixelsAtCurrentZoom = GRID_SIZE_PIXELS * scale;
                
                // Choose appropriate intervals based on zoom level, keeping max width around 120px
                let intervals: { meters: number; segments: number }[];
                
                if (gridPixelsAtCurrentZoom >= 150) {
                  // Very zoomed in: show 0.5m segments
                  intervals = [{ meters: 0.5, segments: 2 }];
                } else if (gridPixelsAtCurrentZoom >= 60) {
                  // Medium zoom: show 1m segments  
                  intervals = [{ meters: 1, segments: 2 }];
                } else if (gridPixelsAtCurrentZoom >= 30) {
                  // Normal zoom: show 2m segments
                  intervals = [{ meters: 2, segments: 2 }];
                } else if (gridPixelsAtCurrentZoom >= 15) {
                  // Zoomed out: show 5m segments
                  intervals = [{ meters: 5, segments: 2 }];
                } else {
                  // Very zoomed out: show 10m segments
                  intervals = [{ meters: 10, segments: 2 }];
                }
                
                const { meters, segments } = intervals[0];
                const segmentPixels = (meters * 1000 / SCALE_MM_PER_PIXEL) * scale;
                
                // Cap the maximum width to keep it reasonable
                const cappedSegmentPixels = Math.min(segmentPixels, 60);
                const totalWidth = cappedSegmentPixels * segments;
                
                return (
                  <div className="flex flex-col relative">
                    {/* Scale numbers */}
                    <div className="relative text-xs text-gray-700 mb-0.5 h-4">
                      <span className="absolute left-0">0</span>
                      <span className="absolute right-0">
                        {segments * meters >= 1000 ? 
                          `${(segments * meters / 1000).toFixed(1)}km` : 
                          `${segments * meters}m`
                        }
                      </span>
                    </div>
                    
                    {/* Main scale bar */}
                    <div className="flex">
                      {Array.from({ length: segments }, (_, i) => (
                        <div key={i} className="flex flex-col items-start">
                          {/* Alternating black/white segments for better visibility */}
                          <div 
                            className={`h-1.5 border border-gray-800 ${
                              i % 2 === 0 ? 'bg-gray-800' : 'bg-white'
                            }`}
                            style={{ width: `${cappedSegmentPixels}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* Tick marks */}
                    <div className="flex">
                      {Array.from({ length: segments + 1 }, (_, i) => (
                        <div 
                          key={i} 
                          className="h-1 w-0.5 bg-gray-800"
                          style={{ 
                            marginLeft: i === 0 ? '0' : `${cappedSegmentPixels - 1}px` 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

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
            <p className="text-purple-600 font-medium">Drop here to add to canvas</p>
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
              const centerX = (canvasDimensions.width - width) / 2 / scale - position.x / scale;
                              const centerY = (canvasDimensions.height - height) / 2 / scale - position.y / scale;
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
      {/* Wall Drawing Done Button */}
      {showWallDoneButton && isDrawingWall && wallPoints.length >= 1 && (
        <div
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
            <button
              onClick={() => handleWallComplete()}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors text-sm font-medium"
            >
              Done
            </button>
            <button
              onClick={handleWallCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fill Drawing Done Button */}
      {showFillDoneButton && isFillMode && fillPoints.length >= 3 && (
        <div
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2">
            <button
              onClick={handleFillComplete}
              className="px-4 py-2 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors text-sm font-medium"
            >
              Done
            </button>
            <button
              onClick={handleFillCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Render SpatialPlanningMenu when spatial planning tool is active */}
      {showSpatialPlanningMenu && (
        <SpatialPlanningMenu
          selectedTool={spatialPlanningTool}
          onToolSelect={handleSpatialPlanningToolSelect}
          onClose={handleSpatialPlanningMenuClose}
        />
      )}

      {/* Image Menu (for both uploaded and generated images) */}
      {selectedImageElement && imageMenuPosition && (
        <ImageMenu
          position={imageMenuPosition}
          imageName={selectedImageElement.type === 'uploaded' ? selectedImageElement.alt : selectedImageElement.prompt}
          imageUrl={selectedImageElement.type === 'uploaded' 
            ? (selectedImageElement.image instanceof HTMLImageElement ? selectedImageElement.image.src : '')
            : selectedImageElement.src
          }
          imageType={selectedImageElement.type === 'uploaded' ? 'uploaded' : 'generated'}
          onCrop={handleImageCrop}
          onDownload={handleImageDownload}
          onDelete={handleImageDelete}
          onClose={handleImageMenuClose}
          onPositionChange={setImageMenuPosition}
          onRegenerate={selectedImageElement.type === 'generated-image' ? handleImageRegenerate : undefined}
          onCopyPrompt={selectedImageElement.type === 'generated-image' ? handleImageCopyPrompt : undefined}
        />
      )}

      {/* Material Picker Modal */}
      {showMaterialPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="relative overflow-hidden px-8 py-8 border-b border-gray-100 min-h-[120px]">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('/thumbnails/Brown Minimalist Podcast Promotion Youtube Thumbnail.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50" />
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                  {selectedMaterial && (
              <button
                      onClick={handleParameterCancel}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {selectedMaterial ? 'Adjust Material Properties' : 'Choose Floor Material'}
                    </h3>
                    <p className="text-gray-100 text-sm drop-shadow-md">
                      {selectedMaterial 
                        ? 'Fine-tune the appearance and scale for realistic proportions'
                        : 'Select a high-quality material pattern for your floor area'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMaterialPicker(false);
                    setPendingFill(null);
                    setSelectedMaterial(null);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group border border-white/20"
                >
                  <svg className="w-5 h-5 text-white group-hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {selectedMaterial ? (
                /* Parameter Adjustment Panel */
                <div className="max-w-2xl mx-auto">
                  {/* Selected Material Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={`/patterns/${selectedMaterial.patternId}.png`}
                          alt={selectedMaterial.patternId}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{selectedMaterial.patternId}</h3>
                        <p className="text-gray-600 capitalize">{selectedMaterial.materialType} Pattern</p>
                      </div>
                    </div>
                  </div>

                  {/* Parameter Controls */}
                  <div className="space-y-6">
                    {/* Real-World Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Real-World Size (Grid: 1m × 1m)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={selectedMaterial.materialType === 'wood' ? 100 : 200}
                          max={selectedMaterial.materialType === 'wood' ? 400 : 800}
                          step="50"
                          value={materialParameters.realWorldSize}
                          onChange={(e) => setMaterialParameters(prev => ({
                            ...prev,
                            realWorldSize: parseInt(e.target.value)
                          }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-sm font-medium text-gray-700 min-w-[80px]">
                          {materialParameters.realWorldSize}mm
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{selectedMaterial.materialType === 'wood' ? '100mm' : '200mm'}</span>
                        <span>{selectedMaterial.materialType === 'wood' ? '400mm' : '800mm'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedMaterial.materialType === 'wood' 
                          ? 'Typical wood plank widths: 100-400mm'
                          : 'Typical ceramic tile sizes: 200-800mm'
                        }
                      </p>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Opacity
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={materialParameters.opacity}
                          onChange={(e) => setMaterialParameters(prev => ({
                            ...prev,
                            opacity: parseFloat(e.target.value)
                          }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-sm font-medium text-gray-700 min-w-[60px]">
                          {Math.round(materialParameters.opacity * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rotation
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="15"
                          value={materialParameters.rotation}
                          onChange={(e) => setMaterialParameters(prev => ({
                            ...prev,
                            rotation: parseInt(e.target.value)
                          }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-sm font-medium text-gray-700 min-w-[60px]">
                          {materialParameters.rotation}°
                        </div>
                      </div>
                    </div>

                    {/* Scale Preview */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Scale Preview</h4>
                          <p className="text-sm text-blue-700">
                            Pattern scale: {(materialParameters.realWorldSize / 1000).toFixed(3)}x relative to 1m grid
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Each pattern tile represents {materialParameters.realWorldSize}mm in real world
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                      onClick={handleParameterConfirm}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply Material
                    </button>
                    <button
                      onClick={handleParameterCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                /* Material Selection Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Wood Flooring Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Wood Flooring
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Wood-01', name: 'Wood-01', file: 'Wood-01.png' },
                      { id: 'Wood-02', name: 'Wood-02', file: 'Wood-02.png' },
                      { id: 'Wood-03', name: 'Wood-03', file: 'Wood-03.png' },
                      { id: 'Wood-04', name: 'Wood-04', file: 'Wood-04.png' },
                      { id: 'Wood-05', name: 'Wood-05', file: 'Wood-05.png' },
                      { id: 'Wood-06', name: 'Wood-06', file: 'Wood-06.png' }
                    ].map((wood) => {
                      const PatternThumbnail = ({ patternFile }: { patternFile: string }) => {
                        const [thumbnailSrc, setThumbnailSrc] = React.useState<string>('');
                        const [isLoading, setIsLoading] = React.useState(true);

                        React.useEffect(() => {
                          const createThumbnail = async () => {
                            try {
                              console.log(`[THUMBNAIL] Starting thumbnail creation for: ${patternFile}`);
                              setIsLoading(true);
                              
                              const encodedPath = `/patterns/${encodeURIComponent(patternFile)}`;
                              console.log(`[THUMBNAIL] Encoded path: ${encodedPath}`);
                              
                              // Create an image element to load the SVG directly
                              const img = new Image();
                              img.crossOrigin = 'anonymous';
                              
                              img.onload = () => {
                                try {
                                  console.log(`[THUMBNAIL] Image loaded successfully: ${patternFile}`);
                                  console.log(`[THUMBNAIL] Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
                                  
                                  // Create a canvas to render the thumbnail
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  
                                  if (ctx) {
                                    // Set canvas size for thumbnail
                                    canvas.width = 120;
                                    canvas.height = 120;
                                    
                                    // Fill with white background
                                    ctx.fillStyle = '#ffffff';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    
                                    // Calculate scale to fit the SVG in a tile
                                    const tileSize = 60;
                                    const scaleX = tileSize / img.naturalWidth;
                                    const scaleY = tileSize / img.naturalHeight;
                                    const scale = Math.min(scaleX, scaleY);
                                    
                                    const scaledWidth = img.naturalWidth * scale;
                                    const scaledHeight = img.naturalHeight * scale;
                                    
                                    console.log(`[THUMBNAIL] Scale: ${scale}, Scaled dimensions: ${scaledWidth}x${scaledHeight}`);
                                    
                                    // Draw the SVG image tiled
                                    for (let x = 0; x < canvas.width; x += tileSize) {
                                      for (let y = 0; y < canvas.height; y += tileSize) {
                                        const centerX = x + (tileSize - scaledWidth) / 2;
                                        const centerY = y + (tileSize - scaledHeight) / 2;
                                        ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
                                      }
                                    }
                                    
                                    // Convert canvas to data URL
                                    const dataUrl = canvas.toDataURL('image/png');
                                    setThumbnailSrc(dataUrl);
                                    console.log(`[THUMBNAIL] Thumbnail created successfully for: ${patternFile}`);
                                  } else {
                                    console.error(`[THUMBNAIL] Failed to get canvas context for: ${patternFile}`);
                                  }
                                } catch (error) {
                                  console.error(`[THUMBNAIL] Error rendering thumbnail for ${patternFile}:`, error);
                                } finally {
                                  setIsLoading(false);
                                }
                              };
                              
                              img.onerror = (error) => {
                                console.error(`[THUMBNAIL] Failed to load image for ${patternFile}:`, error);
                                console.error(`[THUMBNAIL] Attempted URL: ${encodedPath}`);
                                setIsLoading(false);
                              };
                              
                              // Load SVG directly as image (encode spaces in filename)
                              console.log(`[THUMBNAIL] Attempting to load: ${encodedPath}`);
                              img.src = encodedPath;
                              
                            } catch (error) {
                              console.error(`[THUMBNAIL] Error creating thumbnail for ${patternFile}:`, error);
                              setIsLoading(false);
                            }
                          };

                          createThumbnail();
                        }, [patternFile]);

                        return (
                          <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50 relative border border-gray-200">
                            {thumbnailSrc ? (
                              <img 
                                src={thumbnailSrc} 
                                alt={`${patternFile} pattern`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                {isLoading ? 'Loading...' : 'Failed to load'}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        );
                      };

                      return (
                        <button
                          key={wood.id}
                          onClick={() => handleMaterialSelect('wood', wood.id)}
                          className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div className="aspect-square p-3">
                            <PatternThumbnail patternFile={wood.file} />
                          </div>
                          <div className="px-3 pb-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors text-center">
                              {wood.name}
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
              </button>
                      );
                    })}
                  </div>
            </div>
            
                {/* Ceramic Tiles Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    Ceramic Tiles
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                                              { id: 'Ceramic-07', name: 'Ceramic Tiles-07', file: 'Ceramic-07.png' }
                    ].map((tile) => {
                      const PatternThumbnail = ({ patternFile }: { patternFile: string }) => {
                        const [thumbnailSrc, setThumbnailSrc] = React.useState<string>('');
                        const [isLoading, setIsLoading] = React.useState(true);

                        React.useEffect(() => {
                          const createThumbnail = async () => {
                            try {
                              setIsLoading(true);
                              
                              // Create an image element to load the SVG directly
                              const img = new Image();
                              img.crossOrigin = 'anonymous';
                              
                              img.onload = () => {
                                try {
                                  // Create a canvas to render the thumbnail
                                  const canvas = document.createElement('canvas');
                                  const ctx = canvas.getContext('2d');
                                  
                                  if (ctx) {
                                    // Set canvas size for thumbnail
                                    canvas.width = 120;
                                    canvas.height = 120;
                                    
                                    // Fill with white background
                                    ctx.fillStyle = '#ffffff';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    
                                    // Calculate scale to fit the SVG in a tile
                                    const tileSize = 40; // Smaller tiles for ceramic patterns
                                    const scaleX = tileSize / img.naturalWidth;
                                    const scaleY = tileSize / img.naturalHeight;
                                    const scale = Math.min(scaleX, scaleY);
                                    
                                    const scaledWidth = img.naturalWidth * scale;
                                    const scaledHeight = img.naturalHeight * scale;
                                    
                                    // Draw the SVG image tiled
                                    for (let x = 0; x < canvas.width; x += tileSize) {
                                      for (let y = 0; y < canvas.height; y += tileSize) {
                                        const centerX = x + (tileSize - scaledWidth) / 2;
                                        const centerY = y + (tileSize - scaledHeight) / 2;
                                        ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
                                      }
                                    }
                                    
                                    // Convert canvas to data URL
                                    const dataUrl = canvas.toDataURL('image/png');
                                    setThumbnailSrc(dataUrl);
                                  }
                                } catch (error) {
                                  console.error('Error rendering thumbnail:', error);
                                } finally {
                                  setIsLoading(false);
                                }
                              };
                              
                              img.onerror = (error) => {
                                console.error(`Failed to load pattern: ${patternFile}`, error);
                                setIsLoading(false);
                              };
                              
                              // Load SVG directly as image (encode spaces in filename)
                              img.src = `/patterns/${encodeURIComponent(patternFile)}`;
                              
                            } catch (error) {
                              console.error('Error creating thumbnail:', error);
                              setIsLoading(false);
                            }
                          };

                          createThumbnail();
                        }, [patternFile]);

                        return (
                          <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50 relative border border-gray-200">
                            {thumbnailSrc ? (
                              <img 
                                src={thumbnailSrc} 
                                alt={`${patternFile} pattern`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                {isLoading ? 'Loading...' : 'Failed to load'}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        );
                      };

                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleMaterialSelect('tile', tile.id)}
                          className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                          <div className="aspect-square p-3">
                            <PatternThumbnail patternFile={tile.file} />
                          </div>
                          <div className="px-3 pb-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors text-center">
                              {tile.name}
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Action Buttons - Only show for material selection */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowMaterialPicker(false);
                  setPendingFill(null);
                }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
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

