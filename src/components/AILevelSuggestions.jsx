import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, ThumbsUp, ThumbsDown, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { analyzeSceneForSuggestions } from '@/lib/ai/levelSuggestionsHelper';

const AILevelSuggestions = ({ currentScene, onApplySuggestion }) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    if (currentScene) {
      const newSuggestions = analyzeSceneForSuggestions(currentScene.objects || []);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [currentScene]);

  const handleFeedback = (suggestionId, isPositive) => {
    const newFeedback = { ...feedback, [suggestionId]: isPositive };
    setFeedback(newFeedback);
    
    const storedFeedback = JSON.parse(localStorage.getItem('etherengine_ai_feedback') || '{}');
    storedFeedback[suggestionId] = {
      positive: isPositive,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('etherengine_ai_feedback', JSON.stringify(storedFeedback));

    toast({
      title: isPositive ? "Thanks for the feedback! 👍" : "Feedback noted! 👎",
      description: "This helps improve future AI suggestions.",
    });
  };

  const applySuggestion = (suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
      toast({
        title: "Suggestion Applied! ✨",
        description: `Applied: ${suggestion.title}`,
      });
    } else {
      toast({
        title: "🚧 Apply feature not fully connected!",
        description: "Please ensure onApplySuggestion prop is passed.",
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-500/50';
      case 'medium': return 'text-yellow-400 border-yellow-500/50';
      case 'low': return 'text-green-400 border-green-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gameplay': return '🎮';
      case 'design': return '🎨';
      case 'visual': return '✨';
      case 'spacing': return '📐';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-yellow-500 neon-text">AI Level Suggestions</h2>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">
            Add objects to your scene to get AI-powered suggestions for better level design!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`bg-gray-800/50 border ${getPriorityColor(suggestion.priority)} pixel-corners p-4`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {suggestion.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback(suggestion.id, true)}
                    className={`w-6 h-6 p-0 ${feedback[suggestion.id] === true ? 'text-green-400' : 'text-gray-500'}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback(suggestion.id, false)}
                    className={`w-6 h-6 p-0 ${feedback[suggestion.id] === false ? 'text-red-400' : 'text-gray-500'}`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-3">
                {suggestion.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>
                    X: {suggestion.position.x.toFixed(1)}, Z: {suggestion.position.z.toFixed(1)}
                  </span>
                </div>

                <Button
                  size="sm"
                  onClick={() => applySuggestion(suggestion)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 pixel-corners text-xs"
                >
                  Apply
                </Button>
              </div>

              <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 pixel-corners p-2">
                💡 {suggestion.action}
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-600 pixel-corners p-3 mt-4">
          <h4 className="text-xs font-medium text-cyan-400 mb-2">Analysis Summary</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-red-400 font-bold">
                {suggestions.filter(s => s.priority === 'high').length}
              </div>
              <div className="text-gray-400">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 font-bold">
                {suggestions.filter(s => s.priority === 'medium').length}
              </div>
              <div className="text-gray-400">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">
                {suggestions.filter(s => s.priority === 'low').length}
              </div>
              <div className="text-gray-400">Low Priority</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILevelSuggestions;