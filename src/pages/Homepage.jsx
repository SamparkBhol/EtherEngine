import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Zap, Brain, Gamepad2, Rocket } from 'lucide-react';
import * as THREE from 'three';

const Homepage = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const particlesRef = useRef(null);

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Drag & Drop Editor",
      description: "Build 2D/3D games with intuitive visual tools"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Behavior Generator",
      description: "Create smart NPCs with AI-powered state machines"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Optimized",
      description: "Web Workers, instanced rendering, 60 FPS guaranteed"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "No Backend Required",
      description: "Everything runs in your browser with localStorage"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particleMesh;
    scene.add(particleMesh);
    
    const ambientLight = new THREE.AmbientLight(0xff00ff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(0,0,2);
    scene.add(pointLight);


    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
      }
      if (cameraRef.current) {
        cameraRef.current.position.x += (mouseX * 0.5 - cameraRef.current.position.x) * 0.05;
        cameraRef.current.position.y += (-mouseY * 0.5 - cameraRef.current.position.y) * 0.05;
        cameraRef.current.lookAt(scene.position);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if (currentMount && rendererRef.current && rendererRef.current.domElement) {
         currentMount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);


  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-50" />
      <div className="absolute inset-0 scanlines opacity-30" />
      
      <header className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="text-2xl font-bold text-pink-500 neon-text">
            ETHER<span className="text-cyan-400">ENGINE</span>
          </div>
          <Button
            onClick={() => navigate('/engine')}
            className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 pixel-corners neon-border"
          >
            <Play className="w-4 h-4 mr-2" />
            Launch Engine
          </Button>
        </motion.div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 glitch"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                ETHER
                <br />
                ENGINE
              </motion.h1>
              
              <motion.p
                className="text-xl text-gray-300 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                The ultimate browser-based game engine with AI-powered development tools. 
                Build, test, and deploy games without any backend setup.
              </motion.p>
            </div>

            <div className="overflow-hidden bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-500/30 pixel-corners">
              <div className="marquee text-green-400 py-2 px-4 whitespace-nowrap">
                ⚡ THREE.JS POWERED • 🧠 AI BEHAVIOR SYSTEM • 🎮 DRAG & DROP EDITOR • 🚀 WEB WORKER PHYSICS • 💾 LOCAL STORAGE • ⚡
              </div>
            </div>

            <motion.div
              className="bg-gray-900/50 border border-cyan-500/30 pixel-corners p-6 neon-border"
              key={currentFeature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-4">
                <div className="text-cyan-400">
                  {features[currentFeature].icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-pink-500 neon-text">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-gray-300">
                    {features[currentFeature].description}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/engine')}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 pixel-corners neon-border text-lg font-bold pulse-neon"
              >
                <Rocket className="w-5 h-5 mr-2" />
                START BUILDING
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 pixel-corners neon-border"
                onClick={() => navigate('/demo')}
              >
                <Play className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative hidden lg:block" 
          >
            <div className="bg-gray-900/50 border-2 border-pink-500/50 pixel-corners neon-border p-4 aspect-square flex items-center justify-center">
               <img  alt="Abstract 3D geometric shapes glowing with neon colors" class="w-full h-full object-contain" src="https://images.unsplash.com/photo-1694848162927-433c9d2f8b03" />
            </div>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/30 border border-gray-700 pixel-corners p-6 hover:border-pink-500/50 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-cyan-400 mb-4 group-hover:text-pink-500 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:neon-text group-hover:text-pink-500 transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-24"
        >
          <div className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/30 pixel-corners p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-4">
              Ready to Build the Future?
            </h2>
            <p className="text-gray-300 mb-6">
              Join the revolution of browser-based game development with AI-powered tools.
            </p>
            <Button
              onClick={() => navigate('/engine')}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 pixel-corners neon-border text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              ENTER THE ENGINE
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Homepage;