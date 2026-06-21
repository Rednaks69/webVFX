"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`;

function CameraPosition() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;

    cam.position.set(0, 0, 1);

    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function ShaderPlane() {
  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export default function ShaderCanvas() {
  return (
    <div className="w-full h-[50vh]">
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 3]} zoom={30} />
        <CameraPosition />
        <ShaderPlane />
        <OrbitControls enableRotate={false} />
      </Canvas>
    </div>
  );
}
