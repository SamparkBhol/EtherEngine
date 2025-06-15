import React from 'react';

export const ObjectInfoPanel = ({ objectData }) => {
  if (!objectData) return null;

  const formatArray = (arr) => {
    if (!Array.isArray(arr)) {
      return 'N/A';
    }
    return arr.map(n => (typeof n === 'number' ? n.toFixed(2) : 'N/A')).join(', ');
  };
  
  const physicsStatus = () => {
    if (objectData.physics && typeof objectData.physics.gravity === 'boolean') {
      return objectData.physics.gravity ? 'Gravity On' : 'Static';
    }
    return 'N/A';
  };

  return (
    <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-gray-700 pixel-corners p-4 w-64">
      <h3 className="text-sm font-bold text-cyan-400 mb-2">Object Properties</h3>
      <div className="space-y-1 text-xs">
        <Property label="Type" value={objectData.type || 'N/A'} />
        <Property label="Position" value={formatArray(objectData.position || [])} />
        <Property label="Rotation" value={formatArray(objectData.rotation || [])} />
        <Property label="Scale" value={formatArray(objectData.scale || [])} />
        <Property label="Physics" value={physicsStatus()} />
      </div>
    </div>
  );
};

const Property = ({ label, value }) => (
  <div>
    <span className="text-gray-400">{label}:</span>
    <span className="text-white ml-2">{value}</span>
  </div>
);