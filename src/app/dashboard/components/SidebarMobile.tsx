import React, { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface NavLink {
  label: string;
  icon: string;
  href?: string;
  isSection?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Home', icon: 'home', href: '/dashboard' },
  { label: 'AI Tools', icon: 'sparkles', isSection: true },
  { label: 'Exterior AI', icon: 'building', href: '/generate/exterior' },
  { label: 'Interior AI', icon: 'couch', href: '/generate/interior' },
  { label: 'Render Enhancer', icon: 'sparkles', href: '/generate/enhance' },
  { label: 'Landscape AI', icon: 'tree', href: '/generate/landscape' },
  { label: 'Site Analysis AI', icon: 'map-pin', href: '/generate/site-analysis' },
  { label: 'Case Studies', icon: 'document', href: '/case-studies' },
  { label: 'Concept Generator AI', icon: 'light-bulb', href: '/generate/concept' },
  { label: 'Floor Plan AI', icon: 'table-cells', href: '/generate/floor-plan' },
  { label: 'Video Generator AI', icon: 'play-circle', href: '/generate/video' },
  { label: 'AI Design Assistant', icon: 'pencil-square', href: '/generate/assistant' },
];

function IconByName({ name, className }: { name: string; className?: string }) {
  // You can swap these for your own icon set or use Heroicons/Phosphor icons
  switch (name) {
    case 'home': return <span className={className}>🏠</span>;
    case 'sparkles': return <span className={className}>✨</span>;
    case 'building': return <span className={className}>🏢</span>;
    case 'couch': return <span className={className}>🛋️</span>;
    case 'tree': return <span className={className}>🌳</span>;
    case 'map-pin': return <span className={className}>📍</span>;
    case 'document': return <span className={className}>📄</span>;
    case 'light-bulb': return <span className={className}>💡</span>;
    case 'table-cells': return <span className={className}>🗂️</span>;
    case 'play-circle': return <span className={className}>🎬</span>;
    case 'pencil-square': return <span className={className}>✏️</span>;
    default: return <span className={className}>🔗</span>;
  }
}

export default function SidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="md:hidden p-2 focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="w-7 h-7 text-[#1B1464]" />
      </button>

      {/* Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'visible' : 'invisible pointer-events-none'}`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[90vw] bg-gradient-to-b from-[#F8F9FF] via-[#F0F2FF] to-[#E8EBFF] shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#E0DAF3] bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm">
            <span className="font-bold text-lg bg-gradient-to-r from-[#814ADA] to-[#AB4FF0] bg-clip-text text-transparent">StudioSix</span>
            <button onClick={() => setOpen(false)} aria-label="Close sidebar" className="p-1 rounded-lg hover:bg-white/50 transition-colors">
              <XMarkIcon className="w-7 h-7 text-[#844BDC]" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-2 py-4 bg-gradient-to-br from-white/90 via-white/95 to-white/80 backdrop-blur-sm">
            {navLinks.map((link, idx) =>
              link.isSection ? (
                <div key={idx} className="flex items-center gap-2 px-2 py-2 text-[#844BDC] font-semibold text-base">
                  <IconByName name={link.icon} className="w-5 h-5" />
                  {link.label}
                </div>
              ) : (
                <Link
                  key={idx}
                  href={link.href || '#'}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gradient-to-r hover:from-[#844BDC]/5 hover:to-[#AB4FF0]/5 transition-all duration-200 text-[#1B1464] text-base"
                  onClick={() => setOpen(false)}
                >
                  <IconByName name={link.icon} className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </aside>
      </div>
    </>
  );
} 