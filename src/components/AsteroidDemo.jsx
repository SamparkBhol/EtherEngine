import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const AsteroidDemo = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const playerRef = useRef(null);
  const asteroidsRef = useRef([]);
  const keysRef = useRef({});
  const gameStateRef = useRef({ score: 0, gameOver: false, animationFrameId: null });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
    gameStateRef.current = { score: 0, gameOver: false, animationFrameId: gameStateRef.current.animationFrameId };
    setScore(0);
    setGameOver(false);
    
    if (asteroidsRef.current && sceneRef.current) {
      asteroidsRef.current.forEach(asteroid => {
        if (asteroid && sceneRef.current) {
          sceneRef.current.remove(asteroid);
        }
      });
    }
    asteroidsRef.current = [];
    
    if (playerRef.current) {
      playerRef.current.position.set(0, -3, 0);
    }
    
    if (gameStateRef.current.animationFrameId) {
      cancelAnimationFrame(gameStateRef.current.animationFrameId);
    }
    startGameLoop();
  };

  const startGameLoop = () => {
    let lastAsteroidTime = 0;
    const animate = (time) => {
      if (gameStateRef.current.gameOver) {
        if (gameStateRef.current.animationFrameId) {
          cancelAnimationFrame(gameStateRef.current.animationFrameId);
        }
        return;
      }

      gameStateRef.current.animationFrameId = requestAnimationFrame(animate);

      if (!playerRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      if (keysRef.current['ArrowLeft'] && playerRef.current.position.x > -3.5) {
        playerRef.current.position.x -= 0.1;
      }
      if (keysRef.current['ArrowRight'] && playerRef.current.position.x < 3.5) {
        playerRef.current.position.x += 0.1;
      }
      if (keysRef.current['ArrowUp'] && playerRef.current.position.y < 3) {
        playerRef.current.position.y += 0.1;
      }
      if (keysRef.current['ArrowDown'] && playerRef.current.position.y > -3.5) {
        playerRef.current.position.y -= 0.1;
      }

      playerRef.current.rotation.x += 0.02;
      playerRef.current.rotation.y += 0.02;

      if (time - lastAsteroidTime > 1000) {
        createAsteroid();
        lastAsteroidTime = time;
      }

      asteroidsRef.current = asteroidsRef.current.filter(asteroid => {
        if (!asteroid) return false;
        asteroid.position.y -= asteroid.userData.speed;
        asteroid.rotation.x += asteroid.userData.rotationSpeed;
        asteroid.rotation.y += asteroid.userData.rotationSpeed;

        if (asteroid.position.y < -6) {
          sceneRef.current.remove(asteroid);
          gameStateRef.current.score += 10;
          setScore(s => s + 10);
          return false;
        }

        const distance = playerRef.current.position.distanceTo(asteroid.position);
        if (distance < 0.6) {
          gameStateRef.current.gameOver = true;
          setGameOver(true);
          return true; 
        }
        return true;
      });
      
      const stars = sceneRef.current.getObjectByName("starsBackground");
      if (stars) {
        stars.rotation.z += 0.001;
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    gameStateRef.current.animationFrameId = requestAnimationFrame(animate);
  };

  const createAsteroid = () => {
    if (!sceneRef.current) return;
    const geometry = new THREE.OctahedronGeometry(0.3 + Math.random() * 0.3);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x004444,
      emissiveIntensity: 0.2
    });
    const asteroid = new THREE.Mesh(geometry, material);
    
    asteroid.position.set(
      (Math.random() - 0.5) * 8,
      5,
      0
    );
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.userData = {
      speed: 0.02 + Math.random() * 0.03,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
    
    sceneRef.current.add(asteroid);
    asteroidsRef.current.push(asteroid);
  };


  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    
    renderer.setSize(400, 300);
    renderer.setClearColor(0x000000, 0.8);
    
    const currentMount = mountRef.current;
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.3
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, -3, 0);
    scene.add(player);
    playerRef.current = player;

    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for (let i = 0; i < 200; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.name = "starsBackground";
    scene.add(stars);

    camera.position.z = 8;

    startGameLoop();

    const handleKeyDown = (event) => { keysRef.current[event.code] = true; };
    const handleKeyUp = (event) => { keysRef.current[event.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      if (gameStateRef.current.animationFrameId) {
        cancelAnimationFrame(gameStateRef.current.animationFrameId);
      }
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
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
  }, []);


  return (
    <div className="relative">
      <div ref={mountRef} className="border border-cyan-500/50 pixel-corners" />
      
      <div className="absolute top-2 left-2 text-cyan-400 font-bold">
        SCORE: {score}
      </div>
      
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500 neon-text mb-2">
              GAME OVER
            </div>
            <div className="text-cyan-400 mb-4">
              Final Score: {score}
            </div>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-4 py-2 pixel-corners neon-border hover:from-pink-600 hover:to-cyan-600 transition-all"
            >
              RESTART
            </button>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2 text-center">
        Use arrow keys to move • Dodge the asteroids!
      </div>
    </div>
  );
};

export default AsteroidDemo;