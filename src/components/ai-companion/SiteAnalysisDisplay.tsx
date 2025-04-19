import React from 'react';

interface SiteAnalysisDisplayProps {
  content: {
    siteStatement: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    keyCharacteristics: string[];
  };
  onRegenerate?: () => void;
  onAddToCanvas?: () => void;
}

const SiteAnalysisDisplay: React.FC<SiteAnalysisDisplayProps> = ({
  content,
  onRegenerate,
  onAddToCanvas
}) => {
  return (
    <div className="w-full h-full bg-[#FAF9F6] p-6 font-['Inter'] relative">
      {/* Title and Key Characteristics */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {content.keyCharacteristics[0]}
        </h1>
        <div className="flex gap-2">
          {content.keyCharacteristics.slice(1, 4).map((char, index) => (
            <span
              key={index}
              className="px-4 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200"
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Site Statement */}
      <div className="mb-8">
        <p className="text-gray-700 leading-relaxed">
          {content.siteStatement}
        </p>
      </div>

      {/* SWOT Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">👁️</span>
            Strengths
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {content.swot.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            Weaknesses
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {content.swot.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Opportunities
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {content.swot.opportunities.map((opportunity, index) => (
              <li key={index}>{opportunity}</li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">🌪️</span>
            Threats
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {content.swot.threats.map((threat, index) => (
              <li key={index}>{threat}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="px-4 py-2 text-sm font-medium text-purple-600 bg-white
              border border-purple-600 rounded-lg hover:bg-purple-50
              transition-colors duration-200"
          >
            Regenerate
          </button>
        )}
        {onAddToCanvas && (
          <button
            onClick={onAddToCanvas}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600
              rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Add to Canvas
          </button>
        )}
      </div>
    </div>
  );
};

export default SiteAnalysisDisplay; 