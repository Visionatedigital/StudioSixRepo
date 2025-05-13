// This is a mock version of KonvaComponents that doesn't rely on the actual Konva library
import React from 'react';

// Create simple mock components for debugging
export const Stage = ({ children, ...props }: any) => (
  <div className="mock-stage" {...props}>
    {children}
  </div>
);

export const Layer = ({ children, ...props }: any) => (
  <div className="mock-layer" {...props}>
    {children}
  </div>
);

export const KonvaRect = ({ ...props }: any) => (
  <div className="mock-rect" style={{ width: props.width, height: props.height }}>
    Rectangle Mock
  </div>
);

export const KonvaCircle = ({ ...props }: any) => (
  <div className="mock-circle" style={{ width: props.radius * 2, height: props.radius * 2 }}>
    Circle Mock
  </div>
);

export const KonvaLine = ({ ...props }: any) => (
  <div className="mock-line">Line Mock</div>
);

export const KonvaText = ({ text, ...props }: any) => (
  <div className="mock-text" {...props}>{text || 'Text Mock'}</div>
);

export const KonvaImage = ({ ...props }: any) => (
  <div className="mock-image">Image Mock</div>
);

export const KonvaTransformer = ({ ...props }: any) => (
  <div className="mock-transformer">Transformer Mock</div>
);

export const KonvaGroup = ({ children, ...props }: any) => (
  <div className="mock-group" {...props}>
    {children}
  </div>
);

export const Path = ({ ...props }: any) => (
  <div className="mock-path">Path Mock</div>
); 