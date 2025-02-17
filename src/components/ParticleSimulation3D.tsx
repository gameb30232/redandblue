import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const ParticleSimulation3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    type: 'red' | 'blue';
  }>>([]);
  const [draggedParticle, setDraggedParticle] = useState<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const dragPlaneRef = useRef(new THREE.Plane());
  const intersectPointRef = useRef(new THREE.Vector3());
  const isDraggingParticleRef = useRef(false);

  // Camera control state
  const cameraStateRef = useRef({
    radius: 50,
    theta: Math.PI / 4,
    phi: Math.PI / 4,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Constants
  const PARTICLE_RADIUS = 1;
  const REPULSION_STRENGTH = 50;
  const ATTRACTION_STRENGTH = 30;
  const DRAG_COEFFICIENT = 0.95;
  const MIN_DISTANCE = PARTICLE_RADIUS * 2;
  const BOUNDS = 20;
  const ROTATION_SPEED = 0.005;

  // Camera position update function
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    
    const { radius, theta, phi } = cameraStateRef.current;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add bounds visualization
    const boxGeometry = new THREE.BoxGeometry(BOUNDS * 2, BOUNDS * 2, BOUNDS * 2);
    const boxMaterial = new THREE.LineBasicMaterial({ color: 0x404040 });
    const boxWireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeometry),
      boxMaterial
    );
    scene.add(boxWireframe);

    // Add grid
    const gridHelper = new THREE.GridHelper(BOUNDS * 2, 20, 0x404040, 0x404040);
    scene.add(gridHelper);

    // Initialize particles
    const initialParticles = [];
    const spheres = [];
    
    for (let i = 0; i < 20; i++) {
      const particle = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * BOUNDS,
          (Math.random() - 0.5) * BOUNDS,
          (Math.random() - 0.5) * BOUNDS
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        type: i < 10 ? 'red' : 'blue'
      };
      initialParticles.push(particle);

      const geometry = new THREE.SphereGeometry(PARTICLE_RADIUS, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: particle.type === 'red' ? 0xff0000 : 0x0000ff,
        shininess: 100
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(particle.position);
      sphere.userData.index = i;
      scene.add(sphere);
      spheres.push(sphere);
    }

    spheresRef.current = spheres;
    setParticles(initialParticles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    // Initial render
    renderer.render(scene, camera);

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer || !mountRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Mouse interaction for particles and camera
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y);

      if (e.button === 0) { // Left click - particle interaction
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
        const intersects = raycasterRef.current.intersectObjects(spheresRef.current);
        
        if (intersects.length > 0) {
          isDraggingParticleRef.current = true;
          setDraggedParticle(intersects[0].object.userData.index);
          
          // Set up drag plane
          const normal = new THREE.Vector3().subVectors(
            cameraRef.current!.position,
            intersects[0].point
          ).normalize();
          dragPlaneRef.current.setFromNormalAndCoplanarPoint(
            normal,
            intersects[0].point
          );
        }
      } else if (e.button === 2) { // Right click - camera rotation
        cameraStateRef.current.isDragging = true;
        cameraStateRef.current.lastMouseX = e.clientX;
        cameraStateRef.current.lastMouseY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y);

      if (isDraggingParticleRef.current && draggedParticle !== null) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
        if (raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersectPointRef.current)) {
          // Update particle position
          setParticles(prevParticles => {
            const newParticles = [...prevParticles];
            newParticles[draggedParticle].position.copy(intersectPointRef.current);
            newParticles[draggedParticle].velocity.set(0, 0, 0);
            spheresRef.current[draggedParticle].position.copy(intersectPointRef.current);
            return newParticles;
          });
        }
      } else if (cameraStateRef.current.isDragging) {
        const deltaX = e.clientX - cameraStateRef.current.lastMouseX;
        const deltaY = e.clientY - cameraStateRef.current.lastMouseY;

        cameraStateRef.current.theta -= deltaX * ROTATION_SPEED;
        cameraStateRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, cameraStateRef.current.phi + deltaY * ROTATION_SPEED)
        );

        updateCameraPosition();

        cameraStateRef.current.lastMouseX = e.clientX;
        cameraStateRef.current.lastMouseY = e.clientY;
      }
    };

    const handleMouseUp = () => {
      isDraggingParticleRef.current = false;
      setDraggedParticle(null);
      cameraStateRef.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraStateRef.current.radius = Math.max(
        10,
        Math.min(100, cameraStateRef.current.radius + e.deltaY * 0.1)
      );
      updateCameraPosition();
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [draggedParticle]);

  // Animation and physics
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      setParticles(prevParticles => {
        const newParticles = [...prevParticles];

        // Update particles
        for (let i = 0; i < newParticles.length; i++) {
          if (i === draggedParticle) continue;

          const particle = newParticles[i];
          
          // Calculate forces
          const force = new THREE.Vector3(0, 0, 0);
          
          for (let j = 0; j < newParticles.length; j++) {
            if (i === j) continue;
            
            const other = newParticles[j];
            const direction = new THREE.Vector3().subVectors(particle.position, other.position);
            const distance = direction.length();
            
            if (distance < MIN_DISTANCE) continue;
            
            const strength = particle.type === other.type
              ? REPULSION_STRENGTH
              : -ATTRACTION_STRENGTH;
            
            force.add(direction.normalize().multiplyScalar(strength / (distance * distance)));
          }

          // Update velocity
          particle.velocity.add(force.multiplyScalar(0.1));
          particle.velocity.multiplyScalar(DRAG_COEFFICIENT);

          // Update position
          particle.position.add(particle.velocity.multiplyScalar(0.1));

          // Boundary conditions
          for (const axis of ['x', 'y', 'z'] as const) {
            if (Math.abs(particle.position[axis]) > BOUNDS) {
              particle.position[axis] = Math.sign(particle.position[axis]) * BOUNDS;
              particle.velocity[axis] *= -0.5;
            }
          }

          // Update sphere positions
          if (spheresRef.current[i]) {
            spheresRef.current[i].position.copy(particle.position);
          }
        }

        return newParticles;
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [draggedParticle]);

  return (
    <div ref={mountRef} className="w-full h-screen" />
  );
};

export default ParticleSimulation3D;