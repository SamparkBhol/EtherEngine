import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useToast } from '@/components/ui/use-toast';
import { SceneToolbar } from '@/components/sceneEditor/SceneToolbar';
import { ObjectInfoPanel } from '@/components/sceneEditor/ObjectInfoPanel';
import { EditorInstructions } from '@/components/sceneEditor/EditorInstructions';
import { PerformanceMonitor } from '@/components/sceneEditor/PerformanceMonitor';
import { initializeScene, handleResize, addObjectToScene, removeObjectFromScene, resetThreeScene, attachScriptToSelectedObject, updateAIScripts } from '@/lib/three/sceneManager';
import { setupMouseControls } from '@/lib/three/mouseControls';
import { applyPhysics } from '@/lib/three/physics';

const SceneEditor = ({ isPlaying, onSceneChange, onApplyAISuggestion }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const selectedObjectRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  
  const [objects, setObjects] = useState([]);
  const [selectedObjectData, setSelectedObjectData] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const { toast } = useToast();

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, camera, renderer } = initializeScene(mountRef.current);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const onObjectSelect = (object) => {
      selectedObjectRef.current = object;
      if (object && object.userData) {
        setSelectedObjectData({
          type: object.userData.type || 'Unknown',
          position: object.position ? object.position.toArray() : [0,0,0],
          rotation: object.rotation ? object.rotation.toArray().slice(0,3) : [0,0,0],
          scale: object.scale ? object.scale.toArray() : [1,1,1],
          physics: object.userData.physics || { gravity: false }
        });
      } else {
        setSelectedObjectData(null);
      }
    };
    
    const controls = setupMouseControls(camera, renderer.domElement, scene, isPlaying, transformMode, selectedObjectRef, onObjectSelect);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const deltaTime = clockRef.current.getDelta();
      if (isPlaying) {
        applyPhysics(scene);
        updateAIScripts(scene, deltaTime, null); 
      }
      controls.update(); 
      renderer.render(scene, camera);
    };
    animate();

    const resizeListener = () => handleResize(camera, renderer, mountRef.current);
    window.addEventListener('resize', resizeListener);

    const handleTestAIBehavior = (event) => {
      if (!selectedObjectRef.current) {
        toast({
          title: "No Object Selected 😕",
          description: "Please select an object in the scene to attach the AI script.",
          variant: "destructive",
        });
        return;
      }
      if (!isPlaying) {
        toast({
          title: "Enable Play Mode 🎮",
          description: "AI behaviors run in Play mode. Please enable it first.",
          variant: "destructive",
        });
        return;
      }
      const { code, behaviorName } = event.detail;
      attachScriptToSelectedObject(selectedObjectRef.current, code, behaviorName, toast);
    };
    window.addEventListener('testAIBehavior', handleTestAIBehavior);


    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('testAIBehavior', handleTestAIBehavior);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [isPlaying, transformMode, toast]);

  useEffect(() => {
    if (sceneRef.current) {
      const sceneData = {
        objects: objects.map(obj => ({
          id: obj.userData.id,
          type: obj.userData.type,
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray().slice(0,3), 
          scale: obj.scale.toArray(),
          properties: obj.userData.properties || {},
          physics: obj.userData.physics || {}
        }))
      };
      onSceneChange(sceneData);
    }
  }, [objects, onSceneChange]);

  const addObject = (type) => {
    if (!sceneRef.current || isPlaying) return;
    const mesh = addObjectToScene(sceneRef.current, type);
    if (mesh) {
      setObjects(prev => [...prev, mesh]);
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Added! 🎮`,
        description: "Click and drag to move the object around.",
      });
    }
  };

  const deleteSelected = () => {
    if (selectedObjectRef.current && sceneRef.current && !isPlaying) {
      removeObjectFromScene(sceneRef.current, selectedObjectRef.current);
      setObjects(prev => prev.filter(obj => obj.uuid !== selectedObjectRef.current.uuid));
      selectedObjectRef.current = null;
      setSelectedObjectData(null);
      toast({
        title: "Object Deleted! 🗑️",
        description: "Selected object has been removed from the scene.",
      });
    }
  };

  const resetScene = () => {
    if (sceneRef.current && !isPlaying) {
      resetThreeScene(sceneRef.current);
      setObjects([]);
      selectedObjectRef.current = null;
      setSelectedObjectData(null);
      toast({
        title: "Scene Reset! 🔄",
        description: "All objects have been cleared from the scene.",
      });
    }
  };

  useEffect(() => {
    const handleAISuggestionEvent = (event) => {
      const suggestion = event.detail;
      if (suggestion && suggestion.actionDetails && suggestion.actionDetails.type === 'ADD_OBJECT') {
        const { objectType, position, scale, rotation } = suggestion.actionDetails;
        const newObj = addObjectToScene(sceneRef.current, objectType, position, scale, rotation);
        if (newObj) {
          setObjects(prev => [...prev, newObj]);
        }
      }
    };

    if (onApplyAISuggestion && typeof onApplyAISuggestion === 'function') {
      window.addEventListener('applyAISuggestion', handleAISuggestionEvent);
      return () => {
        window.removeEventListener('applyAISuggestion', handleAISuggestionEvent);
      };
    }
  }, [onApplyAISuggestion, setObjects]);


  return (
    <div className="relative h-full">
      <div ref={mountRef} className="w-full h-full" />
      <SceneToolbar
        onAddObject={addObject}
        onDeleteSelected={deleteSelected}
        onResetScene={resetScene}
        transformMode={transformMode}
        setTransformMode={setTransformMode}
        isPlaying={isPlaying}
        selectedObject={selectedObjectRef.current}
      />
      {selectedObjectData && <ObjectInfoPanel objectData={selectedObjectData} />}
      <EditorInstructions />
      <PerformanceMonitor objectCount={objects.length} isPlaying={isPlaying} />
    </div>
  );
};

export default SceneEditor;