import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment } from '@react-three/drei';
import { useThemeStore } from '../stores/themeStore';
import * as THREE from 'three';

interface BlobProps {
  isAuth?: boolean;
}

const Blob: React.FC<BlobProps> = ({ isAuth }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useThemeStore((state) => state.theme);

  useFrame((state) => {
    if (meshRef.current) {
      const elapsedTime = performance.now() / 1000;
      meshRef.current.rotation.x = elapsedTime * (isAuth ? 0.05 : 0.2);
      meshRef.current.rotation.y = elapsedTime * (isAuth ? 0.08 : 0.3);
    }
  });

  const getThemeColors = () => {
    switch (theme) {
      case 'matrix': return { color: '#00ff41', bg: '#001a0f' };
      case 'light': return { color: '#ff00ff', bg: '#f4f5f7' };
      case 'vaporwave': return { color: '#00ffff', bg: '#ffb3ba' };
      case 'cartoon': return { color: '#ea1266', bg: '#698791' };
      case 'dark': 
      default: return { color: '#4a4a6a', bg: '#0f0f13' };
    }
  };

  const colors = getThemeColors();

  return (
    <>
      <color attach="background" args={[colors.bg]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={2.5} position={[0, 0, -2]}>
        <MeshDistortMaterial
          color={colors.color}
          attach="material"
          distort={isAuth ? 0.2 : 0.4} // Calmer shape distortion
          speed={isAuth ? 0.4 : 1.5}   // Slower animation speed
          roughness={theme === 'cartoon' ? 1 : 0.2}
          metalness={theme === 'cartoon' ? 0 : 0.8}
          wireframe={theme === 'matrix'}
          flatShading={theme === 'cartoon'}
        />
      </Sphere>
      {/* Second smaller blob for depth */}
      <Sphere args={[1, 64, 64]} scale={isAuth ? 1.2 : 1.5} position={isAuth ? [3, 1, -6] : [4, 2, -5]}>
        <MeshDistortMaterial
          color={colors.color}
          attach="material"
          distort={isAuth ? 0.15 : 0.6}
          speed={isAuth ? 0.3 : 2}
          roughness={theme === 'cartoon' ? 1 : 0.3}
          metalness={theme === 'cartoon' ? 0 : 0.9}
          wireframe={theme === 'matrix'}
          flatShading={theme === 'cartoon'}
        />
      </Sphere>
      <Environment preset="city" />
    </>
  );
};

export const Background: React.FC<{ isAuth?: boolean }> = ({ isAuth }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Blob isAuth={isAuth} />
      </Canvas>
    </div>
  );
};
