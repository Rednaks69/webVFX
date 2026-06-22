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

  vec2 uv = vUv;
  uv.y = 1.0 - uv.y;

  float r = smoothstep(0.45, 0.55, uv.x);
  float g = smoothstep(0.45, 0.55, uv.y);

  vec3 color = vec3(r, g, 0.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderPlaneNode() {
  const tilingArray = [5.0, 1.0];
  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTiling: { value: tilingArray },
        }}
      />
    </mesh>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();
  //   console.log(size);

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;

    const zoom = 8;
    const halfW = size.width / 2 / zoom;
    const halfH = size.height / 2 / zoom;

    // console.log(halfW);

    // eslint-disable-next-line react-hooks/immutability
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
    <div className="w-50 h-50 ml-5 mt-10 mb-0 -z-50">
      <Canvas orthographic camera={{ position: [0, 0, 1] }}>
        <FixedCamera />
        <ShaderPlaneNode />
        <OrbitControls enableRotate={false} />
      </Canvas>
    </div>
  );
}
