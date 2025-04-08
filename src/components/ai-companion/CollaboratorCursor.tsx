import React from 'react';

interface CollaboratorCursorProps {
  x: number;
  y: number;
  userName: string;
  color: string;
}

const CollaboratorCursor: React.FC<CollaboratorCursorProps> = ({ x, y, userName, color }) => {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }}
    >
      {/* Custom cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`
        }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
        />
      </svg>

      {/* Username label */}
      <div
        className="absolute left-5 top-0 whitespace-nowrap rounded-md px-2 py-1"
        style={{
          backgroundColor: color,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {userName}
      </div>
    </div>
  );
};

export default CollaboratorCursor; 