"use client";

import React, { useState, useEffect, useRef } from "react";

const PALETTE_STORAGE_KEY = "visual-planning-color-palette";
const PALETTE_HISTORY_KEY = "visual-planning-palette-history";
const PALETTE_SIZE = 5;

const TAGS = [
  { label: "Warm", value: "warm" },
  { label: "Cool", value: "cool" },
  { label: "Earthy", value: "earthy" },
  { label: "Pastel", value: "pastel" },
  { label: "Vibrant", value: "vibrant" },
  { label: "Neutral", value: "neutral" },
  { label: "Monochrome", value: "monochrome" },
  { label: "Custom", value: "custom" },
];

function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

function getRandomFromRange(hueRange: [number, number], satRange: [number, number], lightRange: [number, number]) {
  // HSL to HEX
  const h = Math.floor(Math.random() * (hueRange[1] - hueRange[0] + 1)) + hueRange[0];
  const s = Math.floor(Math.random() * (satRange[1] - satRange[0] + 1)) + satRange[0];
  const l = Math.floor(Math.random() * (lightRange[1] - lightRange[0] + 1)) + lightRange[0];
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function generatePaletteByTag(tag: string, baseColor?: string): string[] {
  switch (tag) {
    case "warm":
      // Red, orange, yellow
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([0, 60], [70, 100], [50, 70]));
    case "cool":
      // Blue, green, purple
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([180, 300], [60, 100], [50, 70]));
    case "earthy":
      // Browns, greens, muted
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([30, 120], [30, 60], [30, 60]));
    case "pastel":
      // Soft, light colors
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([0, 360], [40, 70], [80, 95]));
    case "vibrant":
      // Bold, saturated
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([0, 360], [80, 100], [50, 60]));
    case "neutral":
      // Grays, beiges
      return Array.from({ length: PALETTE_SIZE }, () => getRandomFromRange([0, 60], [0, 10], [70, 95]));
    case "monochrome":
      // Shades of one color (use baseColor or random)
      let base = baseColor || getRandomColor();
      let shades = [];
      for (let i = 0; i < PALETTE_SIZE; i++) {
        // Adjust lightness for each shade
        let l = 30 + i * 15;
        shades.push(hslToHex(hexToH(base), hexToS(base), l));
      }
      return shades;
    case "custom": {
      // First swatch is input color, rest are shades/tints
      let base = baseColor || getRandomColor();
      let { h, s, l } = hexToHSL(base);
      let palette = [base];
      for (let i = 1; i < PALETTE_SIZE; i++) {
        // Alternate lighter and darker tints
        let newL = l + (i % 2 === 0 ? i * 8 : -i * 8);
        newL = Math.max(10, Math.min(90, newL));
        palette.push(hslToHex(h, s, newL));
      }
      return palette;
    }
    default:
      // Default: random
      return Array.from({ length: PALETTE_SIZE }, getRandomColor);
  }
}

function hexToH(hex: string) {
  // Convert HEX to HSL and return H
  let { h } = hexToHSL(hex);
  return h;
}
function hexToS(hex: string) {
  let { s } = hexToHSL(hex);
  return s;
}
function hexToHSL(H: string) {
  // Convert hex to HSL
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = parseInt("0x" + H[1] + H[1]);
    g = parseInt("0x" + H[2] + H[2]);
    b = parseInt("0x" + H[3] + H[3]);
  } else if (H.length === 7) {
    r = parseInt("0x" + H[1] + H[2], 16);
    g = parseInt("0x" + H[3] + H[4], 16);
    b = parseInt("0x" + H[5] + H[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getInitialPalette() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  }
  return Array.from({ length: PALETTE_SIZE }, getRandomColor);
}

function getInitialHistory() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PALETTE_HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  }
  return [];
}

export default function ColorPaletteGenerator() {
  const [palette, setPalette] = useState<string[]>(() => getInitialPalette());
  const [inputColor, setInputColor] = useState<string>(palette[0] || "#816CFF");
  const [history, setHistory] = useState<string[][]>(() => getInitialHistory());
  const [selectedTag, setSelectedTag] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palette));
  }, [palette]);

  useEffect(() => {
    localStorage.setItem(PALETTE_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  function regeneratePalette(baseColor?: string) {
    let newPalette: string[];
    if (selectedTag) {
      newPalette = generatePaletteByTag(selectedTag, baseColor);
    } else {
      newPalette = [baseColor || getRandomColor(), ...Array.from({ length: PALETTE_SIZE - 1 }, getRandomColor)];
    }
    setPalette(newPalette);
    setInputColor(newPalette[0]);
    setHistory((prev) => [newPalette, ...prev.slice(0, 7)]); // keep last 8
  }

  function handleColorChange(idx: number, color: string) {
    setPalette((prev) => prev.map((c, i) => (i === idx ? color : c)));
  }

  function handleCopy(color: string) {
    navigator.clipboard.writeText(color);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputColor(e.target.value);
  }

  function handleInputSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
      regeneratePalette(inputColor);
    } else {
      alert("Please enter a valid 6-digit HEX color code (e.g. #816CFF)");
    }
  }

  function handleSavePalette() {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palette));
    alert("Palette saved!");
  }

  // Stub for image extraction
  function handleExtractFromImage(e: React.ChangeEvent<HTMLInputElement>) {
    alert("Image to palette extraction coming soon!");
    e.target.value = "";
  }

  // Stub for download as image
  function handleDownloadPalette() {
    alert("Download palette as image coming soon!");
  }

  function handleTagSelect(tag: string) {
    setSelectedTag(tag);
    regeneratePalette();
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Mood/Style Tags */}
      <div className="flex gap-2 mb-6 flex-wrap justify-center">
        {TAGS.map((tag) => (
          <button
            key={tag.value}
            className={`px-4 py-1 rounded-full border font-medium text-sm transition-colors
              ${selectedTag === tag.value ? "bg-[#816CFF] text-white border-[#816CFF]" : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"}`}
            onClick={() => handleTagSelect(tag.value)}
            type="button"
          >
            {tag.label}
          </button>
        ))}
      </div>
      {/* Color code input and generate */}
      <form onSubmit={handleInputSubmit} className="flex items-center gap-4 mb-8 w-full justify-center">
        <input
          type="text"
          value={inputColor}
          onChange={handleInputChange}
          className="text-4xl font-mono border-b-2 w-60 text-center focus:outline-none focus:border-[#816CFF] bg-transparent"
          placeholder="#816CFF"
          maxLength={7}
        />
        <button
          type="submit"
          className="bg-[#816CFF] text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-2 shadow hover:bg-[#6c3cff] transition-colors"
        >
          Generate
          <span className="text-2xl">→</span>
        </button>
      </form>
      {/* Palette Swatches */}
      <div className="flex gap-4 mb-8">
        {palette.map((color, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-lg border-2 border-[#E0DAF3] cursor-pointer"
                style={{ background: color }}
                title="Click to edit color"
                onClick={() => {
                  const input = document.getElementById(`color-input-${idx}`) as HTMLInputElement;
                  input?.click();
                }}
              />
              <input
                id={`color-input-${idx}`}
                type="color"
                value={color}
                className="absolute top-0 left-0 w-24 h-24 opacity-0 cursor-pointer"
                onChange={(e) => handleColorChange(idx, e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-base">{color.toUpperCase()}</span>
              <button
                className="text-xs text-[#816CFF] hover:underline"
                onClick={() => handleCopy(color)}
                title="Copy HEX"
              >
                📋
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div className="flex gap-3 mb-8">
        <button
          className="px-4 py-2 rounded bg-[#816CFF] text-white font-medium hover:bg-[#6c3cff]"
          onClick={() => regeneratePalette()}
          type="button"
        >
          Regenerate
        </button>
        <button
          className="px-4 py-2 rounded bg-[#F6F8FA] text-[#816CFF] font-medium border border-[#E0DAF3] hover:bg-[#ede9fe]"
          onClick={handleSavePalette}
          type="button"
        >
          Save Palette
        </button>
        <button
          className="px-4 py-2 rounded bg-[#F6F8FA] text-[#816CFF] font-medium border border-[#E0DAF3] hover:bg-[#ede9fe]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Extract from Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleExtractFromImage}
        />
      </div>
      {/* Explore/History Section */}
      <div className="w-full mt-8">
        <h3 className="mb-2 text-lg font-semibold">Explore</h3>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {history.length === 0 && (
            <div className="text-gray-400 text-sm">No palettes yet. Generate some!</div>
          )}
          {history.map((hist, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[180px]">
              <div className="flex gap-1 mb-1">
                {hist.map((color, cidx) => (
                  <div key={cidx} className="w-6 h-12 rounded" style={{ background: color }} />
                ))}
              </div>
              <button
                className="text-xs text-[#816CFF] hover:underline"
                onClick={() => setPalette(hist)}
              >
                Use Palette
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        className="mt-8 bg-gray-200 px-6 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-300"
        onClick={handleDownloadPalette}
        type="button"
      >
        Download palette
      </button>
    </div>
  );
} 