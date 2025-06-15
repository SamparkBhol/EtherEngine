import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export const setupMouseControls = (camera, domElement, scene, isPlaying, transformMode, selectedObjectRef, onObjectSelect) => {
  const orbitControls = new OrbitControls(camera, domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.1;
  orbitControls.screenSpacePanning = false; 
  orbitControls.minDistance = 1; // Adjusted minDistance
  orbitControls.maxDistance = 100; // Adjusted maxDistance
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.01; // Slightly less than PI/2

  const transformControls = new TransformControls(camera, domElement);
  scene.add(transformControls);

  transformControls.addEventListener('dragging-changed', (event) => {
    orbitControls.enabled = !event.value;
  });

  transformControls.addEventListener('objectChange', () => {
    if (selectedObjectRef.current) {
      // Update the object's userData or trigger a state update if needed
      // For now, onObjectSelect will re-fetch data from the object itself
      onObjectSelect(selectedObjectRef.current);
    }
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const onPointerDown = (event) => {
    if (isPlaying || event.button !== 0) return;

    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    // Ensure we only intersect with objects marked as game objects
    const gameObjects = scene.children.filter(obj => obj.userData.isGameObject);
    const intersects = raycaster.intersectObjects(gameObjects, false);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object !== selectedObjectRef.current) {
        selectedObjectRef.current = object;
        transformControls.attach(object);
        onObjectSelect(object); // This will update the panel
      }
    } else {
      if (!transformControls.dragging) { // Don't deselect if currently dragging a control
        selectedObjectRef.current = null;
        transformControls.detach();
        onObjectSelect(null); // Clear the panel
      }
    }
  };
  
  domElement.addEventListener('pointerdown', onPointerDown);
  
  // Initial setup for transform mode
  if (selectedObjectRef.current) {
    transformControls.setMode(transformMode);
    transformControls.attach(selectedObjectRef.current);
  } else {
    transformControls.detach();
  }

  return {
    update: () => {
      orbitControls.update();
      // Ensure transform controls mode is correctly set if it changed
      if (selectedObjectRef.current && transformControls.object) {
        if (transformControls.mode !== transformMode) {
          transformControls.setMode(transformMode);
        }
      }
    },
    dispose: () => {
      orbitControls.dispose();
      transformControls.dispose();
      domElement.removeEventListener('pointerdown', onPointerDown);
      if (transformControls.parent) { // Check if it's still in the scene
        transformControls.parent.remove(transformControls);
      }
    }
  };
};