import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// Indian Travel Hub Coordinates
const CITIES = [
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, color: '#00f0ff' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, color: '#3b82f6' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, color: '#8b5cf6' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, color: '#00f0ff' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, color: '#ec4899' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, color: '#38bdf8' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, color: '#a855f7' },
  { name: 'Goa', lat: 15.2993, lng: 74.1240, color: '#00f0ff' },
];

const FLIGHT_ROUTES = [
  { from: 'Bengaluru', to: 'Delhi', color: '#00f0ff' },
  { from: 'Bengaluru', to: 'Mumbai', color: '#3b82f6' },
  { from: 'Mumbai', to: 'Delhi', color: '#8b5cf6' },
  { from: 'Delhi', to: 'Kolkata', color: '#00f0ff' },
  { from: 'Bengaluru', to: 'Goa', color: '#38bdf8' },
  { from: 'Mumbai', to: 'Goa', color: '#ec4899' },
  { from: 'Hyderabad', to: 'Delhi', color: '#00f0ff' },
  { from: 'Chennai', to: 'Bengaluru', color: '#3b82f6' },
  { from: 'Kolkata', to: 'Mumbai', color: '#8b5cf6' },
];

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural high-resolution dark tech Earth texture
function createEarthCanvasTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep midnight ocean
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#030712');
  oceanGrad.addColorStop(0.5, '#050b18');
  oceanGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Subtle lat-long navigational grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Draw stylized continent outlines (South Asia & Indian subcontinent accentuated)
  ctx.fillStyle = 'rgba(20, 35, 65, 0.65)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;

  // India peninsula outline polygon
  // Mapping roughly: 68E-90E, 8N-35N -> canvas X: (lng+180)/360 * 2048, Y: (90-lat)/180 * 1024
  function toCanvas(lat, lng) {
    return [((lng + 180) / 360) * 2048, ((90 - lat) / 180) * 1024];
  }

  const indiaPoints = [
    toCanvas(35, 74), toCanvas(32, 78), toCanvas(28, 88), toCanvas(25, 94),
    toCanvas(22, 89), toCanvas(19, 85), toCanvas(15, 80), toCanvas(10, 79),
    toCanvas(8, 77.5), toCanvas(12, 75), toCanvas(15, 73.5), toCanvas(20, 72.8),
    toCanvas(24, 69), toCanvas(28, 70), toCanvas(32, 72), toCanvas(35, 74)
  ];

  ctx.beginPath();
  ctx.moveTo(indiaPoints[0][0], indiaPoints[0][1]);
  for (let i = 1; i < indiaPoints.length; i++) {
    ctx.lineTo(indiaPoints[i][0], indiaPoints[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle global land clusters for realism
  const landBlobs = [
    [toCanvas(45, 15), 180, 100], // Europe
    [toCanvas(30, 45), 140, 110], // Middle East
    [toCanvas(40, 105), 260, 160], // East Asia
    [toCanvas(10, 20), 220, 260], // Africa
    [toCanvas(-25, 135), 160, 120], // Australia
    [toCanvas(40, -100), 280, 180], // North America
    [toCanvas(-15, -60), 160, 240], // South America
  ];

  ctx.fillStyle = 'rgba(15, 28, 52, 0.5)';
  landBlobs.forEach(([pos, w, h]) => {
    ctx.beginPath();
    ctx.ellipse(pos[0], pos[1], w, h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Glowing city node dots on canvas
  CITIES.forEach((c) => {
    const [cx, cy] = toCanvas(c.lat, c.lng);
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.4)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Animated Curved Flight Arc between two points on the sphere
function FlightArc({ start, end, color }) {
  const pulseRef = useRef();

  const { curve, points } = useMemo(() => {
    const vStart = start.clone();
    const vEnd = end.clone();
    const dist = vStart.distanceTo(vEnd);
    
    // Midpoint elevated away from sphere center to create parabolic arc
    const mid = vStart.clone().add(vEnd).multiplyScalar(0.5);
    const altitude = 2.0 + dist * 0.45;
    mid.normalize().multiplyScalar(altitude);

    const curve = new THREE.QuadraticBezierCurve3(vStart, mid, vEnd);
    const points = curve.getPoints(50);
    return { curve, points };
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  // Traveling glowing photon along curve
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = (clock.getElapsedTime() * 0.35 + Math.random() * 0.001) % 1;
      const pos = curve.getPoint(t);
      pulseRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Flight Arc Line */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.55} linewidth={1.5} />
      </line>
      {/* Glowing Photon / Airplane Particle */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// Interactive Globe Mesh
function Globe({ isZooming }) {
  const globeGroupRef = useRef();
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  const cityPositions = useMemo(() => {
    const map = {};
    CITIES.forEach((c) => {
      map[c.name] = latLngToVector3(c.lat, c.lng, 2.0);
    });
    return map;
  }, []);

  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      if (!isZooming) {
        // Slow realistic rotation around India's axis
        globeGroupRef.current.rotation.y += delta * 0.08;
      } else {
        // Zoom transition acceleration
        globeGroupRef.current.rotation.y += delta * 0.4;
      }
    }
  });

  return (
    <group ref={globeGroupRef} rotation={[0.35, -1.2, 0]}>
      {/* Earth Sphere */}
      <mesh>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.2}
          emissive="#001830"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Atmospheric Glowing Outer Halo */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshStandardMaterial
          color="#00f0ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* City Marker Pins & Pulsing Rings */}
      {CITIES.map((c) => {
        const pos = cityPositions[c.name];
        return (
          <group key={c.name} position={pos}>
            <mesh>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color={c.color} />
            </mesh>
            <mesh scale={[1.8, 1.8, 1.8]}>
              <ringGeometry args={[0.03, 0.05, 16]} />
              <meshBasicMaterial color={c.color} side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* Animated Glowing Flight Routes */}
      {FLIGHT_ROUTES.map((r, i) => {
        const startPos = cityPositions[r.from];
        const endPos = cityPositions[r.to];
        if (!startPos || !endPos) return null;
        return (
          <FlightArc
            key={i}
            start={startPos}
            end={endPos}
            color={r.color}
          />
        );
      })}
    </group>
  );
}

export default function EarthGlobe({ isZooming }) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1.2, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 4, 3]} intensity={1.8} color="#e0f2fe" />
        <pointLight position={[-5, -2, -3]} intensity={0.5} color="#00f0ff" />
        <Stars radius={120} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1} />
        
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          <Globe isZooming={isZooming} />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={0.6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
