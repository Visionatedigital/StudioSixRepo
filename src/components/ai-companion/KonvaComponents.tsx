import dynamic from 'next/dynamic';

export const Stage = dynamic(() => import('react-konva').then((mod) => mod.Stage), { ssr: false });
export const Layer = dynamic(() => import('react-konva').then((mod) => mod.Layer), { ssr: false });
export const KonvaRect = dynamic(() => import('react-konva').then((mod) => mod.Rect), { ssr: false });
export const KonvaCircle = dynamic(() => import('react-konva').then((mod) => mod.Circle), { ssr: false });
export const KonvaLine = dynamic(() => import('react-konva').then((mod) => mod.Line), { ssr: false });
export const KonvaText = dynamic(() => import('react-konva').then((mod) => mod.Text), { ssr: false });
export const KonvaImage = dynamic(() => import('react-konva').then((mod) => mod.Image), { ssr: false });
export const KonvaTransformer = dynamic(() => import('react-konva').then((mod) => mod.Transformer), { ssr: false });
export const KonvaGroup = dynamic(() => import('react-konva').then((mod) => mod.Group), { ssr: false });
export const Path = dynamic(() => import('react-konva').then((mod) => mod.Path), { ssr: false }); 