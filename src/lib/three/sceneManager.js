import * as THREE from 'three';

export const initializeScene = (mountElement) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  
  const camera = new THREE.PerspectiveCamera(75, mountElement.clientWidth / mountElement.clientHeight, 0.1, 1000);
  camera.position.set(5, 5, 10);
  camera.lookAt(0, 0, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mountElement.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(10, 15, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  scene.add(directionalLight);

  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
  scene.add(gridHelper);

  return { scene, camera, renderer };
};

export const handleResize = (camera, renderer, mountElement) => {
  if (mountElement) {
    camera.aspect = mountElement.clientWidth / mountElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
  }
};

export const addObjectToScene = (scene, type, position, scale, rotation) => {
  let geometry, material;
  const defaultPosition = position || { 
    x: (Math.random() - 0.5) * 8, 
    y: type === 'plane' ? 0 : Math.random() * 2 + 0.5, 
    z: (Math.random() - 0.5) * 8 
  };
  const defaultScale = scale || { x: 1, y: 1, z: 1 };
  const defaultRotation = rotation || { x: 0, y: 0, z: 0 };


  switch (type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(1, 1, 1);
      material = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0x110011 });
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(0.5, 32, 16);
      material = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x001111 });
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      material = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x001100 });
      break;
    case 'plane':
      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0x111100, side: THREE.DoubleSide });
      defaultPosition.y = 0;
      defaultRotation.x = -Math.PI / 2;
      break;
    default:
      console.warn(`Unknown object type: ${type}`);
      return null;
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(defaultPosition.x, defaultPosition.y, defaultPosition.z);
  mesh.scale.set(defaultScale.x, defaultScale.y, defaultScale.z);
  mesh.rotation.set(defaultRotation.x, defaultRotation.y, defaultRotation.z);
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = {
    isGameObject: true,
    type: type,
    id: THREE.MathUtils.generateUUID(),
    physics: {
      gravity: type !== 'plane',
      velocity: new THREE.Vector3(),
      mass: 1,
    },
    properties: {},
    aiScript: null, 
    aiInstance: null,
  };

  scene.add(mesh);
  return mesh;
};

export const removeObjectFromScene = (scene, object) => {
  if (object && object.isMesh) {
    scene.remove(object);
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(mat => mat.dispose());
      } else {
        object.material.dispose();
      }
    }
  }
};

export const resetThreeScene = (scene) => {
  const objectsToRemove = scene.children.filter(child => child.userData.isGameObject);
  objectsToRemove.forEach(obj => removeObjectFromScene(scene, obj));
};

export const attachScriptToSelectedObject = (selectedObject, scriptCode, behaviorName, toast) => {
  if (!selectedObject) {
    toast({ title: "Error", description: "No object selected to attach script.", variant: "destructive" });
    return;
  }

  try {
    const scriptFunction = new Function('THREE', `return (function() { ${scriptCode} return ${behaviorName}; })()`)(THREE);
    
    if (typeof scriptFunction !== 'function') {
      throw new Error("Generated code does not define a class/function correctly.");
    }

    selectedObject.userData.aiScript = scriptFunction;
    selectedObject.userData.aiInstance = new scriptFunction(selectedObject);
    
    toast({
      title: "Script Attached! 🤖",
      description: `${behaviorName} attached to ${selectedObject.userData.type}.`,
    });
  } catch (error) {
    console.error("Error attaching AI script:", error);
    toast({
      title: "Script Error 😵",
      description: `Failed to attach script: ${error.message}`,
      variant: "destructive",
    });
  }
};

export const updateAIScripts = (scene, deltaTime, playerObject) => {
  scene.children.forEach(child => {
    if (child.userData.isGameObject && child.userData.aiInstance && typeof child.userData.aiInstance.update === 'function') {
      try {
        child.userData.aiInstance.update(deltaTime, playerObject);
      } catch (error) {
        console.error(`Error updating AI for ${child.userData.id}:`, error);
        child.userData.aiInstance = null; 
      }
    }
  });
};