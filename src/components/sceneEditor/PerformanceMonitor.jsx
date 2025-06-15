import React from 'react';

export const PerformanceMonitor = ({ objectCount, isPlaying }) => (
  <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 pixel-corners p-3 text-xs">
    <div className="text-green-400">⚡ 60 FPS (Simulated)</div>
    <div className="text-cyan-400">📦 Objects: {objectCount}</div>
    <div className="text-pink-400">🎮 Mode: {isPlaying ? 'Play' : 'Edit'}</div>
  </div>
);