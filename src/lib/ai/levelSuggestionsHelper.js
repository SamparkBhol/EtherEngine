export const analyzeSceneForSuggestions = (objects) => {
  if (!objects) return [];

  const suggestions = [];

  const objectCounts = objects.reduce((acc, obj) => {
    acc[obj.type] = (acc[obj.type] || 0) + 1;
    return acc;
  }, {});

  const positions = objects.map(obj => ({ x: obj.position[0], y: obj.position[1], z: obj.position[2] }));
  
  const clusters = findClusters(positions.map(p => ({x: p.x, z: p.z})), 3.0);
  clusters.forEach((cluster, index) => {
    if (cluster.points.length > 5) {
      suggestions.push({
        id: `cluster_${index}`,
        type: 'spacing',
        priority: 'medium',
        title: 'Objects Too Clustered',
        description: `${cluster.points.length} objects are clustered. Consider spreading them out.`,
        position: cluster.center,
        action: 'Redistribute objects for better spacing',
        actionDetails: { type: 'ADJUST_SPACING', objects: cluster.points.map(p => p.id) } 
      });
    }
  });

  const hasElevatedObjects = objects.some(obj => obj.position[1] > 2);
  const hasPlatforms = (objectCounts.plane || 0) > 0;
  if (hasElevatedObjects && !hasPlatforms) {
    suggestions.push({
      id: 'missing_platforms',
      type: 'gameplay',
      priority: 'high',
      title: 'Add Platforms',
      description: 'Elevated objects exist but no platforms. Add planes for jumping paths.',
      position: { x: 0, z: 0 },
      action: 'Add platform objects (planes) between elevated areas',
      actionDetails: { type: 'ADD_OBJECT', objectType: 'plane', position: { x: 0, y: 1.5, z: 0 } }
    });
  }

  if (Object.keys(objectCounts).length === 1 && objects.length > 3) {
    suggestions.push({
      id: 'lack_variety',
      type: 'design',
      priority: 'low',
      title: 'Add Object Variety',
      description: 'Scene uses only one object type. Mix shapes for visual interest.',
      position: { x: 5, z: 5 },
      action: 'Add different object types (spheres, cylinders)',
      actionDetails: { type: 'ADD_OBJECT', objectType: 'sphere', position: { x: 5, y: 0.5, z: 5 } }
    });
  }

  const sceneSize = getSceneSize(objects);
  if (sceneSize.width > 15 || sceneSize.depth > 15) {
    suggestions.push({
      id: 'scene_boundaries',
      type: 'gameplay',
      priority: 'medium',
      title: 'Add Scene Boundaries',
      description: 'Large scene. Consider adding walls or boundaries.',
      position: { x: sceneSize.width / 2, z: sceneSize.depth / 2 },
      action: 'Add boundary walls (cubes) around the play area',
      actionDetails: { type: 'ADD_OBJECT', objectType: 'cube', position: { x: sceneSize.width / 2, y: 0.5, z: 0 }, scale: {x: 0.2, y:1, z: sceneSize.depth} }
    });
  }

  const enemies = objects.filter(obj => obj.type === 'sphere'); 
  const cover = objects.filter(obj => obj.type === 'cube'); 
  if (enemies.length > 0 && cover.length === 0) {
    const optimalPos = findOptimalCoverPosition(enemies);
    suggestions.push({
      id: 'add_cover',
      type: 'gameplay',
      priority: 'high',
      title: 'Add Cover Objects',
      description: 'Enemies detected without cover. Add cubes for tactical gameplay.',
      position: optimalPos,
      action: 'Place cover objects (cubes) near enemies',
      actionDetails: { type: 'ADD_OBJECT', objectType: 'cube', position: { x: optimalPos.x, y: 0.5, z: optimalPos.z } }
    });
  }

  if (objects.length > 5) {
    suggestions.push({
      id: 'lighting_variety',
      type: 'visual',
      priority: 'low',
      title: 'Enhance Lighting',
      description: 'Complex scene. Consider adding point lights for dramatic effect.',
      position: { x: 0, z: 0 },
      action: 'Add colored point lights to highlight key areas',
      actionDetails: { type: 'ADD_LIGHT', lightType: 'point', color: '0xffcc00', position: { x: 0, y: 3, z: 0 } }
    });
  }

  return suggestions;
};

const findClusters = (positions, radius) => {
  const clusters = [];
  const visited = new Array(positions.length).fill(false);

  for (let i = 0; i < positions.length; i++) {
    if (visited[i]) continue;
    
    const currentClusterPoints = [];
    const queue = [i];
    visited[i] = true;
    
    let head = 0;
    while(head < queue.length) {
      const currentIndex = queue[head++];
      currentClusterPoints.push({ ...positions[currentIndex], id: currentIndex }); // Store original index or ID if available

      for (let j = 0; j < positions.length; j++) {
        if (visited[j] || i === j) continue;
        
        const dist = Math.sqrt(
          Math.pow(positions[currentIndex].x - positions[j].x, 2) +
          Math.pow(positions[currentIndex].z - positions[j].z, 2)
        );
        
        if (dist <= radius) {
          visited[j] = true;
          queue.push(j);
        }
      }
    }
    
    if (currentClusterPoints.length > 1) {
      clusters.push({
        points: currentClusterPoints,
        center: getClusterCenter(currentClusterPoints)
      });
    }
  }
  return clusters;
};

const getClusterCenter = (clusterPoints) => {
  const center = clusterPoints.reduce(
    (acc, pos) => ({ x: acc.x + pos.x, z: acc.z + pos.z }),
    { x: 0, z: 0 }
  );
  return {
    x: center.x / clusterPoints.length,
    z: center.z / clusterPoints.length
  };
};

const getSceneSize = (objects) => {
  if (objects.length === 0) return { width: 0, depth: 0 };
  const xPositions = objects.map(obj => obj.position[0]);
  const zPositions = objects.map(obj => obj.position[2]);
  return {
    width: Math.max(...xPositions) - Math.min(...xPositions),
    depth: Math.max(...zPositions) - Math.min(...zPositions)
  };
};

const findOptimalCoverPosition = (enemies) => {
  if (enemies.length === 0) return { x: 0, z: 0 };
  const center = enemies.reduce(
    (acc, enemy) => ({
      x: acc.x + enemy.position[0],
      z: acc.z + enemy.position[2]
    }),
    { x: 0, z: 0 }
  );
  return {
    x: center.x / enemies.length,
    z: center.z / enemies.length
  };
};