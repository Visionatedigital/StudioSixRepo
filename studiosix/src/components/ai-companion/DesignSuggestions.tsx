export interface DesignSuggestion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface DesignSuggestionsProps {
  suggestions: DesignSuggestion[];
  onSelectDesign: (suggestion: DesignSuggestion) => void;
}

export function DesignSuggestions({ suggestions, onSelectDesign }: DesignSuggestionsProps) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Design Suggestions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelectDesign(suggestion)}
            className="flex flex-col items-start p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <img
              src={suggestion.imageUrl}
              alt={suggestion.title}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
} 