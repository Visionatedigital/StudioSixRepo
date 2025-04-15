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
  onSelect: () => void;
  onChange: (attrs: any) => void;
  onDoubleClick: () => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
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
  const [isHovered, setIsHovered] = useState(false);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  const handleNameClick = () => {
    const newName = window.prompt('Enter new name:', name);
    if (newName !== null) { // Check for cancel
      if (newName.trim() === '') {
        window.alert('Board name cannot be empty');
        return;
      }
      onNameChange(newName.trim());
    }
  };

  const handleDeleteClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent event bubbling
    if (window.confirm('Are you sure you want to delete this board?')) {
      onDelete();
    }
  };

  return (
    <Group
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      onClick={onSelect}
      onDblClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background */}
      <Rect
        width={width}
        height={height}
        fill="#ffffff"
        stroke={isSelected ? "#814ADA" : isHovered ? "#B794F4" : "#E5E7EB"}
        strokeWidth={isHovered ? 2.5 : 2}
        cornerRadius={8}
        perfectDrawEnabled={false}
        shadowColor={isHovered ? "rgba(129, 74, 218, 0.2)" : "transparent"}
        shadowBlur={isHovered ? 6 : 0}
        shadowOffset={{ x: 0, y: 2 }}
        shadowOpacity={0.3}
      />
      
      {/* Header */}
      <Rect
        y={0}
        width={width}
        height={40}
        fill={isHovered ? "#F4F2FF" : "#F3F4F6"}
        stroke={isSelected ? "#814ADA" : isHovered ? "#B794F4" : "#E5E7EB"}
        strokeWidth={isHovered ? 2.5 : 2}
        cornerRadius={[8, 8, 0, 0]}
        perfectDrawEnabled={false}
      />
      
      {/* Board Name */}
      <Text
        x={12}
        y={12}
        text={name}
        fontSize={14}
        fill={isNameHovered ? "#814ADA" : "#374151"}
        width={width - 60}
        height={20}
        onClick={handleNameClick}
        onMouseEnter={() => setIsNameHovered(true)}
        onMouseLeave={() => setIsNameHovered(false)}
        cursor="pointer"
      />
      
      {/* Delete Button */}
      <Group 
        x={width - 32} 
        y={8}
        onMouseEnter={() => setIsDeleteHovered(true)}
        onMouseLeave={() => setIsDeleteHovered(false)}
      >
        <Rect
          width={24}
          height={24}
          cornerRadius={4}
          fill={isDeleteHovered ? "#FEE2E2" : "transparent"}
          onClick={handleDeleteClick}
          cursor="pointer"
        />
        <Text
          x={6}
          y={4}
          text="×"
          fontSize={16}
          fill={isDeleteHovered ? "#EF4444" : "#9CA3AF"}
          onClick={handleDeleteClick}
          cursor="pointer"
        />
      </Group>
    </Group>
  );
};

export default Board; 