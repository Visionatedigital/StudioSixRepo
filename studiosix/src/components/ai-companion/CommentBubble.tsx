import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface CommentBubbleProps {
  id: string;
  x: number;
  y: number;
  text: string;
  isNew?: boolean;
  onSave?: (text: string) => void;
  onCancel?: () => void;
}

const CommentBubble: React.FC<CommentBubbleProps> = ({
  id,
  x,
  y,
  text,
  isNew = false,
  onSave,
  onCancel
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedText, setEditedText] = useState(text);
  const groupRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isEditing && groupRef.current) {
      const stage = groupRef.current.getStage();
      if (!stage) return;

      const transform = groupRef.current.getAbsoluteTransform();
      const pos = transform.point({ x: 0, y: 0 });
      const scale = stage.scaleX();

      const textarea = document.createElement('textarea');
      textarea.style.position = 'absolute';
      textarea.style.top = `${pos.y}px`;
      textarea.style.left = `${pos.x}px`;
      textarea.style.width = '200px';
      textarea.style.height = '100px';
      textarea.style.fontSize = `${14 * scale}px`;
      textarea.style.padding = '8px';
      textarea.style.border = '2px solid #814ADA';
      textarea.style.borderRadius = '8px';
      textarea.style.background = 'white';
      textarea.style.resize = 'none';
      textarea.style.zIndex = '1000';
      textarea.value = editedText;
      inputRef.current = textarea;

      const handleBlur = () => {
        if (onSave && editedText.trim()) {
          onSave(editedText);
        } else if (onCancel) {
          onCancel();
        }
        setIsEditing(false);
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (onCancel) onCancel();
          setIsEditing(false);
          if (document.body.contains(textarea)) {
            document.body.removeChild(textarea);
          }
        }
      };

      textarea.addEventListener('blur', handleBlur);
      textarea.addEventListener('keydown', handleKeyDown);
      textarea.addEventListener('input', (e) => {
        setEditedText((e.target as HTMLTextAreaElement).value);
      });

      document.body.appendChild(textarea);
      textarea.focus();

      return () => {
        textarea.removeEventListener('blur', handleBlur);
        textarea.removeEventListener('keydown', handleKeyDown);
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      };
    }
  }, [isEditing, editedText, onSave, onCancel]);

  if (isEditing) {
    return (
      <Group ref={groupRef} x={x} y={y}>
        <Rect
          width={200}
          height={100}
          fill="transparent"
        />
      </Group>
    );
  }

  return (
    <Group x={x} y={y}>
      <Rect
        width={200}
        height={Math.max(60, Math.ceil(text.length / 30) * 20)}
        fill="white"
        stroke="#814ADA"
        strokeWidth={1}
        cornerRadius={8}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={8}
        shadowOffsetY={2}
      />
      <Text
        text={text}
        fontSize={14}
        fontFamily="sans-serif"
        fill="#4B5563"
        width={180}
        padding={10}
        wrap="word"
      />
    </Group>
  );
};

export default CommentBubble; 