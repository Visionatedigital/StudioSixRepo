"use client";

import React, { useState, useEffect, useRef } from "react";
import { MATERIALS, Material } from "./materialsData";

const BOARD_STORAGE_KEY = "visual-planning-material-board";

function getInitialBoard(): Material[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(BOARD_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  }
  return [];
}

const categories = [
  ...Array.from(new Set(MATERIALS.map((m) => m.category))),
  "All"
];

export default function MaterialTextureBoard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [board, setBoard] = useState<Material[]>(() => getInitialBoard());
  const [gallery, setGallery] = useState<Material[]>(MATERIALS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  function handleAddToBoard(material: Material) {
    setBoard((prev) => [...prev, material]);
  }

  function handleRemoveFromBoard(idx: number) {
    setBoard((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    if (cat === "All") {
      setGallery(MATERIALS);
    } else {
      setGallery(MATERIALS.filter((m) => m.category === cat));
    }
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const name = prompt("Enter a name for this material:") || "Custom Material";
      const newMaterial: Material = {
        name,
        category: "Custom",
        image: event.target?.result as string,
      };
      setGallery((prev) => [newMaterial, ...prev]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Category Filter & Upload */}
      <div className="flex flex-wrap gap-3 items-center mb-2">
        <span className="font-medium text-sm">Filter by:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors
              ${selectedCategory === cat ? "bg-[#844BDC] text-white border-[#844BDC]" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
        <button
          className="ml-auto px-4 py-2 rounded bg-[#F6F8FA] text-[#844BDC] font-medium border border-[#E0DAF3] hover:bg-[#ede9fe]"
          onClick={() => fileInputRef.current?.click()}
        >
          + Upload Material
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {/* Gallery */}
      <div>
        <h3 className="font-semibold text-base mb-2">Material Library</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {gallery.map((mat, idx) => (
            <div
              key={mat.name + idx}
              className="flex flex-col items-center group"
            >
              {mat.image ? (
                <img
                  src={mat.image}
                  alt={mat.name}
                  className="w-16 h-16 object-cover rounded mb-2 border border-gray-200"
                  onError={(e) => (e.currentTarget.src = '/materials/placeholder.jpg')}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center rounded mb-2 border border-dashed border-gray-300 text-gray-300">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 15l2-2.5 2 2.5 3-4 3 4.5"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
                </div>
              )}
              <span className="text-xs font-medium text-center mb-1 mt-1 group-hover:underline">{mat.name}</span>
              <button
                className="px-3 py-1 rounded border border-[#816CFF] text-[#816CFF] text-xs font-medium hover:bg-[#F3F0FF] transition-colors mt-1"
                onClick={() => handleAddToBoard(mat)}
              >
                Add to Board
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Board */}
      <div>
        <h3 className="font-semibold text-base mb-2">Your Board</h3>
        {board.length === 0 ? (
          <div className="text-gray-400 text-sm">No materials added yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {board.map((mat, idx) => (
              <div key={mat.name + idx} className="relative flex flex-col items-center bg-white rounded-lg shadow border border-[#E0DAF3] p-3">
                <button
                  className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveFromBoard(idx)}
                  title="Remove"
                >
                  ×
                </button>
                <img
                  src={mat.image}
                  alt={mat.name}
                  className="w-20 h-20 object-cover rounded mb-2 border"
                  onError={(e) => (e.currentTarget.src = '/materials/placeholder.jpg')}
                />
                <span className="text-xs font-medium text-center">{mat.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 