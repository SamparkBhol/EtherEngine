import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AsteroidDemo from '@/components/AsteroidDemo';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const DemoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-cyan-400 hover:text-cyan-300 pixel-corners"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-900/50 border-2 border-pink-500/50 pixel-corners neon-border p-6 shadow-2xl shadow-pink-500/30"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 neon-text mb-2">
            LIVE DEMO: ASTEROID DODGER
          </h1>
          <p className="text-md text-gray-300">
            Use <span className="text-pink-400">arrow keys</span> to move your ship and dodge the incoming asteroids!
          </p>
        </div>
        <AsteroidDemo />
      </motion.div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-gray-400 text-sm"
      >
        This demo showcases the basic rendering and interaction capabilities of EtherEngine.
      </motion.p>
    </div>
  );
};

export default DemoPage;