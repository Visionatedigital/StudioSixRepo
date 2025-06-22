"use client";

import React, { useRef, useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "visual-planning-moodboard";

type MoodBoardItem =
  | { id: number; type: "image"; src: string | ArrayBuffer | null }
  | { id: number; type: "note"; text: string }
  | { id: number; type: "color"; color: string };

export default function MoodBoard() {
  const [items, setItems] = useState<MoodBoardItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items from localStorage after component mounts
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save items to localStorage when they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isClient]);

  function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setItems((prev: MoodBoardItem[]) => [
        ...prev,
        { id: Date.now(), type: "image", src: event.target?.result || null }
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleAddNote() {
    const text = prompt("Enter note text:");
    if (text) {
      setItems((prev: MoodBoardItem[]) => [
        ...prev,
        { id: Date.now(), type: "note", text }
      ]);
    }
  }

  function handleAddColor() {
    const color = prompt("Enter hex color (e.g. #844BDC):");
    if (color) {
      setItems((prev: MoodBoardItem[]) => [
        ...prev,
        { id: Date.now(), type: "color", color }
      ]);
    }
  }

  function handleRemove(id: number) {
    setItems((prev: MoodBoardItem[]) => prev.filter((item) => item.id !== id));
  }

  // Don't render anything until we're on the client side
  if (!isClient) {
    return null;
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <button
          className="px-4 py-2 rounded bg-[#844BDC] text-white font-medium hover:bg-[#6c3cff]"
          onClick={() => fileInputRef.current?.click()}
        >
          + Add Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleAddImage}
        />
        <button
          className="px-4 py-2 rounded bg-[#F6F8FA] text-[#844BDC] font-medium border border-[#E0DAF3] hover:bg-[#ede9fe]"
          onClick={handleAddNote}
        >
          + Add Note
        </button>
        <button
          className="px-4 py-2 rounded bg-[#F6F8FA] text-[#844BDC] font-medium border border-[#E0DAF3] hover:bg-[#ede9fe]"
          onClick={handleAddColor}
        >
          + Add Color
        </button>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item: MoodBoardItem) => (
          <div key={item.id} className="relative group bg-white rounded-lg shadow border border-[#E0DAF3] p-3 flex flex-col items-center justify-center min-h-[120px]">
            <button
              className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500"
              onClick={() => handleRemove(item.id)}
              title="Remove"
            >
              ×
            </button>
            {item.type === "image" && (
              <img src={typeof item.src === 'string' ? item.src : undefined} alt="Moodboard" className="max-h-32 max-w-full rounded" />
            )}
            {item.type === "note" && (
              <div className="bg-yellow-100 text-yellow-900 rounded p-2 w-full text-center">
                {item.text}
              </div>
            )}
            {item.type === "color" && (
              <div className="w-12 h-12 rounded-full border-2 border-[#E0DAF3]" style={{ background: item.color }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 