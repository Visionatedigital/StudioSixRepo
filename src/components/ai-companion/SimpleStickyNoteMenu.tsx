import React, { useEffect, useRef } from 'react';

export default function SimpleStickyNoteMenu({ position, note, onChange, onDelete, onUnselect }: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onUnselect && onUnselect();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onUnselect]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y - 56,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Font selector */}
      <select value={note.font} onChange={e => onChange({ font: e.target.value })} style={{ fontSize: 16, padding: 2 }}>
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Comic Sans MS">Comic Sans</option>
        <option value="Times New Roman">Times</option>
      </select>
      {/* Color picker */}
      <input type="color" value={note.color} onChange={e => onChange({ color: e.target.value })} style={{ width: 18, height: 18, padding: 0, border: 'none', background: 'none' }} />
      {/* Alignment icons */}
      <button onClick={() => onChange({ align: 'left' })} style={{ background: note.align === 'left' ? '#f3f3f3' : 'transparent', borderRadius: 4, padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/icons/align-left-icon.svg" alt="Align left" style={{ width: 20, height: 20, opacity: note.align === 'left' ? 1 : 0.6 }} />
      </button>
      <button onClick={() => onChange({ align: 'center' })} style={{ background: note.align === 'center' ? '#f3f3f3' : 'transparent', borderRadius: 4, padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/icons/align-center-icon.svg" alt="Align center" style={{ width: 20, height: 20, opacity: note.align === 'center' ? 1 : 0.6 }} />
      </button>
      <button onClick={() => onChange({ align: 'right' })} style={{ background: note.align === 'right' ? '#f3f3f3' : 'transparent', borderRadius: 4, padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/icons/align-right-icon.svg" alt="Align right" style={{ width: 20, height: 20, opacity: note.align === 'right' ? 1 : 0.6 }} />
      </button>
      {/* X button for delete */}
      <button onClick={onDelete} style={{ color: 'red', fontWeight: 'bold', fontSize: 22, width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}>✕</button>
    </div>
  );
} 