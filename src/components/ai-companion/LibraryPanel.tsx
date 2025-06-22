'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { STUDIOSIX_LIBRARIES, LibraryCategory, LibraryAsset, LibraryGroup } from '@/lib/library-assets';

interface LibraryPanelProps {
  onAssetSelect?: (asset: LibraryAsset) => void;
  onClose?: () => void;
}

export default function LibraryPanel({ onAssetSelect, onClose }: LibraryPanelProps) {
  const [activeTab, setActiveTab] = useState('libraries');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLibraryClick = (category: LibraryCategory) => {
    if (category.assets && category.assets.length > 0) {
      setSelectedCategory(category);
    }
  };

  const handleAssetClick = (asset: LibraryAsset) => {
    if (onAssetSelect) {
      onAssetSelect(asset);
    }
  };

  const renderLibrariesList = () => (
    <div>
      {STUDIOSIX_LIBRARIES.filter(group => 
        searchQuery ? group.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())) : true
      ).map(group => (
        <div key={group.id} className="py-1">
          {/* Collapsible Group Header */}
          <div className="px-3 py-2 flex items-center justify-between cursor-pointer" onClick={() => toggleGroup(group.id)}>
            <div className="flex items-center gap-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${!expandedGroups[group.id] ? '-rotate-90' : ''}`} />
              <h3 className="text-sm font-semibold text-gray-800">{group.name} ({group.categories.reduce((acc, cat) => acc + cat.itemCount, 0)})</h3>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>

          {/* Categories List */}
          {expandedGroups[group.id] && (
            <ul className="pl-6 pr-2">
              {group.categories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                <li key={cat.id} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleLibraryClick(cat)}>
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0 p-1">
                    <img src={cat.icon} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.itemCount} blocks</p>
                  </div>
                  {cat.assets.length > 0 && (
                    <span className="text-purple-600 text-xs font-bold px-2 py-0.5 rounded ml-auto">
                      View
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
  
  const renderAssetDetails = () => {
    if (!selectedCategory) return null;

    const assets = selectedCategory.assets.filter(asset =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div>
        {/* Header */}
        <div className="p-2 flex items-center border-b border-gray-200">
          <button onClick={() => setSelectedCategory(null)} className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-semibold ml-2">{selectedCategory.name}</h3>
        </div>
        
        {/* Assets Grid */}
        <div className="p-2 grid grid-cols-2 gap-2">
          {assets.map(asset => (
            <div key={asset.id} 
                 className="p-2 rounded-md hover:bg-gray-100 cursor-pointer text-center"
                 onClick={() => handleAssetClick(asset)}
                 draggable
                 onDragStart={(e) => {
                   e.dataTransfer.setData('text/plain', JSON.stringify(asset));
                 }}>
              <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center p-2">
                <img src={asset.svgPath} alt={asset.name} className="max-w-full max-h-full object-contain" />
              </div>
              <p className="mt-2 text-xs font-medium truncate">{asset.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute left-[80px] top-4 bottom-4 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-2xl w-[320px] z-50 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('my-blocks'); setSelectedCategory(null); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-blocks' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          My blocks
        </button>
        <button
          onClick={() => { setActiveTab('libraries'); setSelectedCategory(null); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'libraries' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Libraries
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search (⌘F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'libraries' && (
          selectedCategory ? renderAssetDetails() : renderLibrariesList()
        )}
        {activeTab === 'my-blocks' && (
          <div className="p-8 text-center text-gray-400">
            <p>My Blocks section is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
} 