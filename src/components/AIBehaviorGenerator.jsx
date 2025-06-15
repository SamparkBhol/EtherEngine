import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Download, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';

const behaviorTemplates = {
  patrol: {
    name: 'Patrol Behavior',
    description: 'NPC moves between waypoints in a loop',
    states: ['idle', 'moving', 'turning'],
    parameters: ['speed', 'range']
  },
  guard: {
    name: 'Guard Behavior',
    description: 'NPC guards an area and chases intruders',
    states: ['idle', 'alert', 'chase', 'return'],
    parameters: ['speed', 'detectionRadius', 'aggressiveness']
  },
  wander: {
    name: 'Wander Behavior',
    description: 'NPC moves randomly within an area',
    states: ['idle', 'moving', 'paused'],
    parameters: ['speed', 'range']
  },
  follow: {
    name: 'Follow Behavior',
    description: 'NPC follows a target at a distance',
    states: ['idle', 'following', 'waiting'],
    parameters: ['speed', 'detectionRadius']
  }
};

const AIBehaviorGenerator = () => {
  const { toast } = useToast();
  const [behaviorType, setBehaviorType] = useState('patrol');
  const [parameters, setParameters] = useState({
    speed: 1.0,
    range: 5.0,
    detectionRadius: 3.0,
    aggressiveness: 0.5
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const generateBehaviorCode = () => {
    const template = behaviorTemplates[behaviorType];
    
    const code = `
class ${template.name.replace(/\s/g, '')}AI {
  constructor(npc, parameters = {}) {
    this.npc = npc;
    this.state = 'idle';
    this.parameters = {
      speed: ${parameters.speed},
      range: ${parameters.range},
      detectionRadius: ${parameters.detectionRadius},
      aggressiveness: ${parameters.aggressiveness},
      ...parameters
    };
    
    this.stateTimer = 0;
    this.waypoints = [];
    this.currentWaypoint = 0;
    this.target = null;
    this.originalPosition = this.npc.position.clone();
    
    if (typeof THREE === 'undefined') {
      console.error("THREE.js is not loaded. This AI script requires THREE.js.");
      return;
    }
    if (!this.npc || !this.npc.position) {
      console.error("NPC object or its position is undefined.");
      return;
    }
  }

  update(deltaTime, player) {
    if (!this.npc || !this.npc.position) return;
    this.stateTimer += deltaTime;
    
    switch(this.state) {
      case 'idle':
        this.handleIdleState(player);
        break;
      case 'moving':
        this.handleMovingState(deltaTime);
        break;
      case 'chase':
        this.handleChaseState(deltaTime, player);
        break;
      case 'alert':
        this.handleAlertState(player);
        break;
      case 'return':
        this.handleReturnState(deltaTime);
        break;
    }
  }

  handleIdleState(player) {
    ${behaviorType === 'guard' ? `
    if (player && player.position && this.npc.position.distanceTo(player.position) < this.parameters.detectionRadius) {
      this.setState('alert');
      this.target = player;
      return;
    }` : ''}
    
    ${behaviorType === 'patrol' ? `
    if (this.stateTimer > 2.0) {
      this.generateWaypoints();
      this.setState('moving');
    }` : ''}
    
    ${behaviorType === 'wander' ? `
    if (this.stateTimer > Math.random() * 3 + 1) {
      this.generateRandomTarget();
      this.setState('moving');
    }` : ''}
  }

  handleMovingState(deltaTime) {
    if (this.waypoints.length === 0 || !this.waypoints[this.currentWaypoint]) {
      this.setState('idle');
      return;
    }
    
    const targetPosition = this.waypoints[this.currentWaypoint];
    const direction = new THREE.Vector3().subVectors(targetPosition, this.npc.position).normalize();
    const distance = this.npc.position.distanceTo(targetPosition);
    
    if (distance < 0.5) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
      if (this.currentWaypoint === 0 && (behaviorType === 'patrol' || behaviorType === 'wander')) {
        this.setState('idle');
      }
    } else {
      this.npc.position.add(direction.multiplyScalar(this.parameters.speed * deltaTime));
    }
  }

  ${behaviorType === 'guard' ? `
  handleChaseState(deltaTime, player) {
    if (!player || !player.position) {
      this.setState('return');
      return;
    }
    
    const distance = this.npc.position.distanceTo(player.position);
    
    if (distance > this.parameters.detectionRadius * 2) {
      this.setState('return');
      return;
    }
    
    const direction = new THREE.Vector3().subVectors(player.position, this.npc.position).normalize();
    this.npc.position.add(direction.multiplyScalar(this.parameters.speed * this.parameters.aggressiveness * deltaTime));
  }

  handleAlertState(player) {
    if (this.stateTimer > 1.0) {
      this.setState('chase');
    }
  }

  handleReturnState(deltaTime) {
    const direction = new THREE.Vector3().subVectors(this.originalPosition, this.npc.position).normalize();
    const distance = this.npc.position.distanceTo(this.originalPosition);
    
    if (distance < 0.5) {
      this.setState('idle');
    } else {
      this.npc.position.add(direction.multiplyScalar(this.parameters.speed * deltaTime));
    }
  }` : ''}

  generateWaypoints() {
    this.waypoints = [];
    const numPoints = 4;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = this.originalPosition.x + Math.cos(angle) * this.parameters.range;
      const z = this.originalPosition.z + Math.sin(angle) * this.parameters.range;
      this.waypoints.push(new THREE.Vector3(x, this.originalPosition.y, z));
    }
  }

  ${behaviorType === 'wander' ? `
  generateRandomTarget() {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * this.parameters.range;
    const x = this.originalPosition.x + Math.cos(angle) * distance;
    const z = this.originalPosition.z + Math.sin(angle) * distance;
    this.waypoints = [new THREE.Vector3(x, this.originalPosition.y, z)];
    this.currentWaypoint = 0;
  }` : ''}

  setState(newState) {
    this.state = newState;
    this.stateTimer = 0;
  }

  getCurrentState() {
    return this.state;
  }
}
`;

    setGeneratedCode(code);
    
    toast({
      title: "AI Behavior Generated! 🧠",
      description: `${template.name} code is ready for use.`,
    });
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${behaviorType}_behavior.js`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code Downloaded! 📁",
      description: "Behavior script saved as JavaScript file.",
    });
  };

  const testBehavior = () => {
    if (!generatedCode) {
      toast({
        title: "No Code Generated 😕",
        description: "Please generate behavior code first.",
        variant: "destructive",
      });
      return;
    }
    
    const event = new CustomEvent('testAIBehavior', { 
      detail: { 
        code: generatedCode, 
        behaviorName: `${behaviorTemplates[behaviorType].name.replace(/\s/g, '')}AI` 
      } 
    });
    window.dispatchEvent(event);

    toast({
      title: "Testing Behavior... 🧪",
      description: "Select an object in the scene to apply the AI script. Ensure the scene is in Play mode.",
    });
  };

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-pink-500" />
        <h2 className="text-lg font-bold text-pink-500 neon-text">AI Behavior Generator</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-400 mb-2">
          Behavior Type
        </label>
        <select
          value={behaviorType}
          onChange={(e) => setBehaviorType(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white pixel-corners"
        >
          {Object.entries(behaviorTemplates).map(([key, template]) => (
            <option key={key} value={key}>
              {template.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          {behaviorTemplates[behaviorType].description}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-cyan-400">Parameters</h3>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Speed: {parameters.speed.toFixed(1)}</label>
          <Slider
            defaultValue={[parameters.speed]}
            min={0.1}
            max={5.0}
            step={0.1}
            onValueChange={(value) => handleParameterChange('speed', value[0])}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Range: {parameters.range.toFixed(1)}</label>
          <Slider
            defaultValue={[parameters.range]}
            min={1.0}
            max={10.0}
            step={0.5}
            onValueChange={(value) => handleParameterChange('range', value[0])}
          />
        </div>

        {(behaviorType === 'guard' || behaviorType === 'follow') && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Detection Radius: {parameters.detectionRadius.toFixed(1)}</label>
            <Slider
              defaultValue={[parameters.detectionRadius]}
              min={1.0}
              max={8.0}
              step={0.5}
              onValueChange={(value) => handleParameterChange('detectionRadius', value[0])}
            />
          </div>
        )}

        {behaviorType === 'guard' && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Aggressiveness: {parameters.aggressiveness.toFixed(1)}</label>
            <Slider
              defaultValue={[parameters.aggressiveness]}
              min={0.1}
              max={2.0}
              step={0.1}
              onValueChange={(value) => handleParameterChange('aggressiveness', value[0])}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 border border-gray-600 pixel-corners p-3">
        <h4 className="text-xs font-medium text-cyan-400 mb-2">State Machine</h4>
        <div className="flex flex-wrap gap-1">
          {behaviorTemplates[behaviorType].states.map((state) => (
            <span
              key={state}
              className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded border border-pink-500/30"
            >
              {state}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={generateBehaviorCode}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 pixel-corners"
        >
          <Brain className="w-4 h-4 mr-2" />
          Generate Code
        </Button>

        {generatedCode && (
          <>
            <Button
              onClick={downloadCode}
              variant="outline"
              className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 pixel-corners"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Script
            </Button>

            <Button
              onClick={testBehavior}
              variant="outline"
              className="w-full border-green-500 text-green-400 hover:bg-green-500/10 pixel-corners"
            >
              <Play className="w-4 h-4 mr-2" />
              Test in Scene
            </Button>
          </>
        )}
      </div>

      {generatedCode && (
        <div className="bg-gray-900 border border-gray-600 pixel-corners p-3 max-h-40 overflow-y-auto">
          <h4 className="text-xs font-medium text-cyan-400 mb-2">Generated Code Preview</h4>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {generatedCode.substring(0, 300)}...
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIBehaviorGenerator;