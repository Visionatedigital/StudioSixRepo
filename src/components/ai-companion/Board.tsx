import { useState, useRef, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Group, Rect, Text, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

interface BoardProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  isSelected: boolean;
  activeTool: string;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
  onChange: (attrs: any) => void;
  onDoubleClick: () => void;
  onNameChange: (newName: string) => void;
  onDelete?: () => void;
}

const Board: React.FC<BoardProps> = ({
  id,
  x,
  y,
  width,
  height,
  name,
  isSelected,
  activeTool,
  onSelect,
  onChange,
  onDoubleClick,
  onNameChange,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [deleteIconHovered, setDeleteIconHovered] = useState(false);
  const groupRef = useRef<Konva.Group>(null);
  const deleteIconRef = useRef<HTMLImageElement | null>(null);
  const titleHeight = 40;

  // Load delete icon
  useEffect(() => {
    const img = new Image();
    img.src = '/icons/trashbin-icon.svg';
    img.onload = () => {
      deleteIconRef.current = img;
      // Force a re-render
      setDeleteIconHovered(false);
    };
  }, []);

  useEffect(() => {
    if (isEditing && groupRef.current) {
      const stage = groupRef.current.getStage();
      if (!stage) return;

      // Get the absolute position of the board
      const transform = groupRef.current.getAbsoluteTransform();
      const absPos = transform.point({ x: 12, y: 12 });
      const scale = stage.scaleX();

      // Create and position the input element
      const input = document.createElement('input');
      input.style.position = 'absolute';
      input.style.top = `${absPos.y}px`;
      input.style.left = `${absPos.x}px`;
      input.style.width = `${(width - 24) * scale}px`;
      input.style.fontSize = `${14 * scale}px`;
      input.style.fontFamily = 'sans-serif';
      input.style.padding = '2px';
      input.style.border = '1px solid #814ADA';
      input.style.borderRadius = '4px';
      input.style.outline = 'none';
      input.style.zIndex = '1000';
      input.value = editedName;

      const safeRemoveInput = () => {
        if (input && document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };

      const handleBlur = () => {
        handleNameSubmit(input.value);
        safeRemoveInput();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          input.blur();
        } else if (e.key === 'Escape') {
          setIsEditing(false);
          setEditedName(name);
          safeRemoveInput();
        }
      };

      input.addEventListener('blur', handleBlur);
      input.addEventListener('keydown', handleKeyDown);

      document.body.appendChild(input);
      input.focus();
      input.select();

      return () => {
        input.removeEventListener('blur', handleBlur);
        input.removeEventListener('keydown', handleKeyDown);
        safeRemoveInput();
      };
    }
  }, [isEditing, width, editedName, name]);

  const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = groupRef.current?.getStage();
    if (!stage) return;

    const transform = groupRef.current!.getTransform().copy();
    transform.invert();
    const pos = transform.point({ x: e.evt.offsetX, y: e.evt.offsetY });
    
    console.log('Board double-click:', { pos, titleHeight, isTitle: pos.y < titleHeight });

    if (pos.y <= titleHeight) {
      console.log('Starting name edit');
      setIsEditing(true);
      e.cancelBubble = true;
    } else {
      console.log('Navigating to sub-canvas');
      onDoubleClick();
    }
  };

  const handleNameSubmit = (value: string) => {
    console.log('Submitting name:', value);
    setIsEditing(false);
    const newName = value.trim();
    if (newName && newName !== name) {
      onNameChange(newName);
    }
    setEditedName(newName || name);
  };

  const handleDeleteClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onDelete) {
      onDelete();
    }
  };

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'mouse') {
      onSelect(e);
    }
  };

  return (
    <Group
      id={id}
      x={x}
      y={y}
      ref={groupRef}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      draggable={activeTool === 'mouse'}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      name="selectable"
    >
      {/* Board background with subtle border */}
      <Rect
        width={width}
        height={height}
        fill="#FFFFFF"
        stroke="rgba(129, 74, 218, 0.3)"
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.06)"
        shadowBlur={12}
        shadowOffsetY={3}
        perfectDrawEnabled={false}
      />

      {/* Title area with white background */}
      <Rect
        width={width}
        height={titleHeight}
        fill="#FFFFFF"
        stroke="rgba(129, 74, 218, 0.3)"
        strokeWidth={1}
        cornerRadius={[8, 8, 0, 0]}
        perfectDrawEnabled={false}
      />

      {/* Title text */}
      <Text
        x={12}
        y={12}
        text={editedName}
        fontSize={14}
        fontFamily="sans-serif"
        fill="#4B5563"
        width={width - 24}
        ellipsis={true}
      />

      {/* Delete Icon - Only show when selected */}
      {isSelected && deleteIconRef.current && (
        <Group
          x={width - 28}
          y={titleHeight - 28}
          opacity={deleteIconHovered ? 1 : 0.6}
          onMouseEnter={() => setDeleteIconHovered(true)}
          onMouseLeave={() => setDeleteIconHovered(false)}
          onClick={handleDeleteClick}
        >
          <KonvaImage
            image={deleteIconRef.current}
            width={16}
            height={16}
          />
        </Group>
      )}

      {/* Preview area with subtle background */}
      <Rect
        y={titleHeight}
        width={width}
        height={height - titleHeight}
        fill="#F8FAFC"
        cornerRadius={[0, 0, 8, 8]}
        perfectDrawEnabled={false}
      />

      {/* Selection border with softer appearance */}
      {isSelected && (
        <Rect
          width={width}
          height={height}
          stroke="rgba(129, 74, 218, 0.5)"
          strokeWidth={1}
          dash={[4, 4]}
          cornerRadius={8}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  );
};

export default Board; 