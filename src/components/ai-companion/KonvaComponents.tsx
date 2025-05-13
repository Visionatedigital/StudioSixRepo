import { Stage, Layer, Rect, Circle, Line, Text, Image, Transformer, Group, Path } from 'react-konva';

// Export with Konva prefix to avoid naming conflicts
export const KonvaRect = Rect;
export const KonvaCircle = Circle;
export const KonvaLine = Line;
export const KonvaText = Text;
export const KonvaImage = Image;
export const KonvaTransformer = Transformer;
export const KonvaGroup = Group;

// Export original components
export { Stage, Layer, Path }; 