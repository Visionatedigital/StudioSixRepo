import React from 'react';

interface TableFormatMenuProps {
  position: { x: number; y: number };
  table: any;
  onChange: (changes: Partial<any>) => void;
  onLock: () => void;
  onDelete: () => void;
  selectedCell?: { tableId: string; row: number; col: number } | null;
  cellStyle?: any;
}

const fonts = ['System', 'Inter', 'Arial', 'Georgia', 'Courier New', 'Times New Roman'];

export default function TableFormatMenu({ position, table, onChange, onLock, onDelete, selectedCell, cellStyle }: TableFormatMenuProps) {
  const style = selectedCell ? (cellStyle || {}) : table;
  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '6px 10px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        fontSize: 15,
        minWidth: 0,
        height: 36,
      }}
    >
      <span style={{ fontWeight: 500, fontSize: 13, marginRight: 6 }}>{selectedCell ? 'Cell' : 'Table'}</span>
      {/* Border color */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 13 }}>Border</span>
        <input type="color" value={style.borderColor || '#333333'} onChange={e => onChange({ borderColor: e.target.value })} style={{ width: 22, height: 22, padding: 0, border: 'none', background: 'none' }} />
      </label>
      {/* Cell fill */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 13 }}>Fill</span>
        <input type="color" value={style.fill || '#ffffff'} onChange={e => onChange({ fill: e.target.value })} style={{ width: 22, height: 22, padding: 0, border: 'none', background: 'none' }} />
      </label>
      {/* Font family */}
      <select
        value={style.fontFamily || 'System'}
        onChange={e => onChange({ fontFamily: e.target.value })}
        style={{
          fontSize: 15,
          height: 28,
          width: 100,
          minWidth: 0,
          padding: '0 6px',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          borderRadius: 6,
        }}
      >
        {fonts.map(font => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
      </select>
      {/* Font size */}
      <input
        type="number"
        min={8}
        max={72}
        value={style.fontSize || 14}
        onChange={e => onChange({ fontSize: parseInt(e.target.value, 10) })}
        style={{ width: 36, height: 24, fontSize: 15, padding: '0 4px' }}
      />
      {/* Lock/unlock */}
      <button
        onClick={onLock}
        title={table.isLocked ? 'Unlock table' : 'Lock table'}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <img src="/icons/lock-unlocked-svgrepo-com.svg" alt="Lock/Unlock" style={{ width: 20, height: 20 }} />
      </button>
      {/* Delete */}
      <button
        onClick={onDelete}
        title="Delete table"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <img src="/icons/trashbin-icon.svg" alt="Delete" style={{ width: 20, height: 20 }} />
      </button>
    </div>
  );
} 