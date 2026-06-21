"use client";
"use no memo";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

function ShaderPlaneNode() {
  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();
  //   console.log(size);

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.manual = true; // tell R3F not to auto-update this camera

    const zoom = 8;
    const halfW = size.width / 2 / zoom;
    const halfH = size.height / 2 / zoom;

    // console.log(halfW);

    cam.left = -halfW;
    cam.right = halfW;
    cam.top = halfH;
    cam.bottom = -halfH;
    cam.position.set(0, 0, 1);
    cam.near = 0.1;
    cam.far = 1000;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function ShaderNode() {
  return (
    <div className="w-50 h-50">
      <Canvas orthographic camera={{ position: [0, 0, 1] }}>
        <FixedCamera />
        <ShaderPlaneNode />
        <OrbitControls enableRotate={false} />
      </Canvas>
    </div>
  );
}
