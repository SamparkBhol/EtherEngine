import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RotateCcw, Move, RotateCw, PieChart as ScaleIcon } from 'lucide-react'; // Renamed Scale to ScaleIcon

export const SceneToolbar = ({ onAddObject, onDeleteSelected, onResetScene, transformMode, setTransformMode, isPlaying, selectedObject }) => {
  return (
    <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 pixel-corners p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">Add Objects</h3>
        <div className="grid grid-cols-2 gap-2">
          {['cube', 'sphere', 'cylinder', 'plane'].map(type => (
            <Button
              key={type}
              size="sm"
              onClick={() => onAddObject(type)}
              className={`bg-${type === 'cube' ? 'pink' : type === 'sphere' ? 'cyan' : type === 'cylinder' ? 'green' : 'yellow'}-500/20 border border-${type === 'cube' ? 'pink' : type === 'sphere' ? 'cyan' : type === 'cylinder' ? 'green' : 'yellow'}-500/50 text-${type === 'cube' ? 'pink' : type === 'sphere' ? 'cyan' : type === 'cylinder' ? 'green' : 'yellow'}-400 hover:bg-${type === 'cube' ? 'pink' : type === 'sphere' ? 'cyan' : type === 'cylinder' ? 'green' : 'yellow'}-500/30 pixel-corners`}
              disabled={isPlaying}
            >
              <Plus className="w-3 h-3 mr-1" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">Transform</h3>
        <div className="flex gap-1">
          {[
            { mode: 'translate', Icon: Move },
            { mode: 'rotate', Icon: RotateCw },
            { mode: 'scale', Icon: ScaleIcon },
          ].map(({ mode, Icon }) => (
            <Button
              key={mode}
              size="sm"
              variant={transformMode === mode ? 'default' : 'outline'}
              onClick={() => setTransformMode(mode)}
              className="pixel-corners"
              disabled={isPlaying}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              <Icon className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-cyan-400 mb-2">Actions</h3>
        <div className="space-y-2">
          <Button
            size="sm"
            onClick={onDeleteSelected}
            variant="destructive"
            className="w-full pixel-corners"
            disabled={!selectedObject || isPlaying}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
          </Button>
          <Button
            size="sm"
            onClick={onResetScene}
            variant="outline"
            className="w-full border-orange-500 text-orange-400 hover:bg-orange-500/10 pixel-corners"
            disabled={isPlaying}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
};