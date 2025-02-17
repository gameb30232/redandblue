# Red and Blue Particle Simulation

An interactive 3D particle simulation demonstrating attraction and repulsion forces between different particle types. Red particles repel other red particles, blue particles repel other blue particles, but red and blue particles attract each other.

## [Try the Live Demo](https://redandblue-particles.netlify.app)

![Particle Simulation](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop)

## Features

- Interactive 3D environment built with Three.js
- Physics-based particle simulation
- Two particle types with different interaction rules:
  - Red particles repel red particles
  - Blue particles repel blue particles
  - Red and blue particles attract each other
- Full camera control:
  - Right-click + drag to rotate view
  - Scroll to zoom in/out
  - Left-click + drag to move particles
- Boundary constraints to keep particles within visible space
- Real-time force calculations and particle updates

## Controls

- 🖱️ **Right-click + drag**: Rotate camera view
- ⚪ **Left-click + drag**: Move particles
- 🔍 **Scroll**: Zoom in/out

## Technical Details

The simulation uses:
- React for UI components
- Three.js for 3D rendering
- Custom physics calculations for particle interactions
- Raycasting for particle manipulation
- Dynamic force calculations based on particle types and distances

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/gameb30232/redandblue.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local server URL

## How It Works

The simulation implements a simple physics model where:
- Particles of the same type create repulsion forces
- Particles of different types create attraction forces
- Force strength is inversely proportional to the square of the distance between particles
- Velocity damping prevents infinite acceleration
- Boundary conditions keep particles within the visible space

## License

MIT License