import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

const MARKER_COUNT = 8;
const RADIUS = 2.05;
const STATIC_MARKERS = Array.from({ length: MARKER_COUNT }, () => {
  const phi = Math.random() * Math.PI;
  const theta = Math.random() * 2 * Math.PI;
  const x = RADIUS * Math.cos(theta) * Math.sin(phi);
  const y = RADIUS * Math.sin(theta) * Math.sin(phi);
  const z = RADIUS * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
});

const GlobeModel = () => {
  const globeRef = useRef<THREE.Group>(null);
  const dotsRef = useRef<THREE.Points>(null);

  // Create a spherical distribution of points for a "dot" globe effect
  const points = useMemo(() => {
    const positions = [];
    const count = 2000;
    const radius = 2;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  // Destination markers (static markers for demo)
  const markers = useMemo(() => STATIC_MARKERS, []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Globe Sphere (Subtle base) */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial color="#f8fafc" transparent opacity={0.4} emissive="#e2e8f0" />
      </mesh>

      {/* Dot Pattern Overlay */}
      <points ref={dotsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length / 3}
            array={points}
            itemSize={3}
            args={[points, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#4f46e5" transparent opacity={0.3} sizeAttenuation />
      </points>

      {/* Destination Markers */}
      {markers.map((pos, i) => (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} key={i}>
          <mesh position={pos}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
            <pointLight intensity={0.5} distance={1} color="#ef4444" />
          </mesh>
        </Float>
      ))}

      {/* Subtle atmosphere glow */}
      <mesh scale={1.05}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#4f46e5" wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

const Globe = () => {
  return (
    <div className="w-full h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <GlobeModel />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default Globe;
