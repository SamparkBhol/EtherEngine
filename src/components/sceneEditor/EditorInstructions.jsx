import React from 'react';

export const EditorInstructions = () => (
  <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 pixel-corners p-3">
    <div className="text-xs text-gray-400 space-y-1">
      <div>🖱️ Click objects to select • Drag to transform</div>
      <div>🎯 Mouse wheel to zoom • Drag empty space to orbit camera</div>
      <div>🎮 Press Play to test physics simulation</div>
    </div>
  </div>
);