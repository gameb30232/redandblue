import React from 'react';
import { Github } from 'lucide-react';
import ParticleSimulation3D from './components/ParticleSimulation3D';

function App() {
  return (
    <div className="relative min-h-screen bg-gray-900">
      <ParticleSimulation3D />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Interactive Particle Simulation</h1>
          <p className="text-gray-200">
            Explore the fascinating behavior of particles with different attraction and repulsion properties.
          </p>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute top-4 right-4 bg-black/70 p-4 rounded-lg text-white text-sm space-y-2">
        <h3 className="font-semibold mb-2">Controls</h3>
        <p>🖱️ Right-click + drag: Rotate view</p>
        <p>⚪ Left-click + drag: Move particles</p>
        <p>🔍 Scroll: Zoom in/out</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-gray-300 text-sm">
            Red particles repel red, blue repel blue, but red and blue attract each other
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <Github size={20} />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;