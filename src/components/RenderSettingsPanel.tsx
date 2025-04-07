import React from 'react';

export interface RenderSettings {
  style: {
    architecturalStyle: string;
    buildingType: string;
    customStyleNotes: string;
  };
  materials: {
    primaryMaterial: string;
    secondaryMaterial: string;
    finishType: string;
  };
  lighting: {
    timeOfDay: number;
    weather: string;
    shadowIntensity: number;
  };
  technical: {
    controlNetMode: 'Balanced' | 'My prompt is more important' | 'ControlNet is more important';
    denoisingStrength: number;
    steps: number;
    cfgScale: number;
  };
}

export function RenderSettingsPanel({
  settings,
  onSettingsChange,
}: {
  settings: RenderSettings;
  onSettingsChange: (settings: RenderSettings) => void;
}) {
  const [activeTab, setActiveTab] = React.useState('style');

  return (
    <div className="w-[400px] bg-white rounded-xl shadow-lg p-6 h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Tabs Header */}
      <div className="flex space-x-2 mb-6">
        {['style', 'materials', 'lighting', 'technical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-[#844BDC] to-[#342A9C] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Style Tab Content */}
      {activeTab === 'style' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Architectural Style</label>
            <select
              value={settings.style.architecturalStyle}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  style: { ...settings.style, architecturalStyle: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="modern">Modern</option>
              <option value="minimalist">Minimalist</option>
              <option value="industrial">Industrial</option>
              <option value="traditional">Traditional</option>
              <option value="contemporary">Contemporary</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Building Type</label>
            <select
              value={settings.style.buildingType}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  style: { ...settings.style, buildingType: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed-use">Mixed Use</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Style Notes</label>
            <textarea
              value={settings.style.customStyleNotes}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  style: { ...settings.style, customStyleNotes: e.target.value },
                })
              }
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Add any specific style instructions..."
            />
          </div>
        </div>
      )}

      {/* Materials Tab Content */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Primary Material</label>
            <select
              value={settings.materials.primaryMaterial}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  materials: { ...settings.materials, primaryMaterial: e.target.value },
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="concrete">Concrete</option>
              <option value="glass">Glass</option>
              <option value="wood">Wood</option>
              <option value="stone">Stone</option>
              <option value="metal">Metal</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Finish Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['matte', 'glossy', 'textured'].map((finish) => (
                <button
                  key={finish}
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      materials: { ...settings.materials, finishType: finish },
                    })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.materials.finishType === finish
                      ? 'bg-gradient-to-r from-[#844BDC] to-[#342A9C] text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {finish}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lighting Tab Content */}
      {activeTab === 'lighting' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time of Day</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="24"
                value={settings.lighting.timeOfDay}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    lighting: { ...settings.lighting, timeOfDay: parseInt(e.target.value) },
                  })
                }
                className="w-full"
              />
              <div className="text-sm text-gray-600 text-right">
                {settings.lighting.timeOfDay}:00
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Weather</label>
            <div className="grid grid-cols-3 gap-2">
              {['clear', 'overcast', 'rainy'].map((weather) => (
                <button
                  key={weather}
                  onClick={() =>
                    onSettingsChange({
                      ...settings,
                      lighting: { ...settings.lighting, weather },
                    })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.lighting.weather === weather
                      ? 'bg-gradient-to-r from-[#844BDC] to-[#342A9C] text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {weather}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Shadow Intensity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.lighting.shadowIntensity}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  lighting: { ...settings.lighting, shadowIntensity: parseInt(e.target.value) },
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Technical Tab Content */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ControlNet Mode</label>
            <select
              value={settings.technical.controlNetMode}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  technical: {
                    ...settings.technical,
                    controlNetMode: e.target.value as RenderSettings['technical']['controlNetMode'],
                  },
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Balanced">Balanced</option>
              <option value="My prompt is more important">Prompt Focus</option>
              <option value="ControlNet is more important">Sketch Focus</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Denoising Strength: {settings.technical.denoisingStrength.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.4"
              max="0.8"
              step="0.05"
              value={settings.technical.denoisingStrength}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  technical: {
                    ...settings.technical,
                    denoisingStrength: parseFloat(e.target.value),
                  },
                })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Steps: {settings.technical.steps}
            </label>
            <input
              type="range"
              min="20"
              max="50"
              value={settings.technical.steps}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  technical: { ...settings.technical, steps: parseInt(e.target.value) },
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
} 