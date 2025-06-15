import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Save, Download, Brain, Lightbulb, BarChart3, Gamepad } from 'lucide-react';
import SceneEditor from '@/components/SceneEditor';
import AIBehaviorGenerator from '@/components/AIBehaviorGenerator';
import AILevelSuggestions from '@/components/AILevelSuggestions';
import AITaskInsights from '@/components/AITaskInsights';
import AsteroidDemo from '@/components/AsteroidDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const GameEngine = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState({ objects: [] });

  const handleSaveScene = () => {
    if (currentScene) {
      const scenes = JSON.parse(localStorage.getItem('etherengine_scenes') || '[]');
      const sceneData = {
        id: Date.now(),
        name: `Scene_${Date.now()}`,
        data: currentScene,
        timestamp: new Date().toISOString()
      };
      scenes.push(sceneData);
      localStorage.setItem('etherengine_scenes', JSON.stringify(scenes));
      
      toast({
        title: "Scene Saved! 🎮",
        description: "Your scene has been saved to local storage.",
      });
    }
  };

  const handleExportScene = () => {
    if (currentScene) {
      const dataStr = JSON.stringify(currentScene, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scene_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Scene Exported! 📁",
        description: "Scene data downloaded as JSON file.",
      });
    }
  };

  const togglePlayMode = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Edit Mode 🛠️" : "Play Mode 🎮",
      description: isPlaying ? "Back to editing your scene." : "Testing your game scene.",
    });
  };

  const handleApplyAISuggestion = useCallback((suggestion) => {
    if (suggestion.actionDetails && suggestion.actionDetails.type === 'ADD_OBJECT') {
      const event = new CustomEvent('applyAISuggestion', { detail: suggestion });
      window.dispatchEvent(event);
    } else {
       toast({
        title: "🚧 Suggestion Type Not Handled",
        description: `Cannot automatically apply suggestion: ${suggestion.title}`,
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="text-xl font-bold text-pink-500 neon-text">
              ETHER<span className="text-cyan-400">ENGINE</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={togglePlayMode}
              variant={isPlaying ? "destructive" : "default"}
              className="pixel-corners"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
            
            <Button
              onClick={handleSaveScene}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 pixel-corners"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              onClick={handleExportScene}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10 pixel-corners"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-117px)]"> {/* Adjusted height for footer */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-80 bg-gray-900/30 border-r border-gray-800 overflow-y-auto"
        >
          <Tabs defaultValue="behavior" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 shrink-0">
              <TabsTrigger value="behavior" className="text-xs">
                <Brain className="w-4 h-4 mr-1" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-xs">
                <Lightbulb className="w-4 h-4 mr-1" />
                Suggest
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-xs">
                <BarChart3 className="w-4 h-4 mr-1" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="demo" className="text-xs">
                <Gamepad className="w-4 h-4 mr-1" />
                Demo
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="behavior" className="p-4 flex-grow overflow-y-auto">
              <AIBehaviorGenerator />
            </TabsContent>
            
            <TabsContent value="suggestions" className="p-4 flex-grow overflow-y-auto">
              <AILevelSuggestions currentScene={currentScene} onApplySuggestion={handleApplyAISuggestion} />
            </TabsContent>
            
            <TabsContent value="insights" className="p-4 flex-grow overflow-y-auto">
              <AITaskInsights />
            </TabsContent>
            <TabsContent value="demo" className="p-4 flex-grow overflow-y-auto flex items-center justify-center">
              <AsteroidDemo />
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 relative"
        >
          <SceneEditor 
            isPlaying={isPlaying}
            onSceneChange={setCurrentScene}
            onApplyAISuggestion={handleApplyAISuggestion}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default GameEngine;