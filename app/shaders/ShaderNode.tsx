"use client";
"use no memo";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ParamsMap } from "@/components/flow/uv-params-store";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

type ShaderPlaneNodeProps = {
  fragmentShader: string;
  params: ParamsMap;
};

function ShaderPlaneNode({ fragmentShader, params }: ShaderPlaneNodeProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Uniforms object only needs to be (re)built when the shader itself
  // changes (i.e. switching node kind) - the `key` below forces a remount
  // in that case. Per-frame param edits just mutate existing uniforms.
  const uniforms = useMemo(() => {
    const u: Record<string, { value: number }> = {};
    for (const [key, value] of Object.entries(params)) {
      u[key] = { value };
    }
    return u;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragmentShader]);

  useEffect(() => {
    if (!materialRef.current) return;
    for (const [key, value] of Object.entries(params)) {
      if (materialRef.current.uniforms[key]) {
        materialRef.current.uniforms[key].value = value;
      }
    }
  }, [params]);

  return (
    <mesh>
      <planeGeometry args={[20, 20]} />
      <shaderMaterial
        key={fragmentShader}
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

function FixedCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;

    const zoom = 8;
    const halfW = size.width / 2 / zoom;
    const halfH = size.height / 2 / zoom;

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

type ShaderCanvasProps = {
  fragmentShader: string;
  params: ParamsMap;
};

export default function ShaderCanvas({
  fragmentShader,
  params,
}: ShaderCanvasProps) {
  return (
    <div className="w-40 h-40 md:w-60 md:h-60 sm:w-40 sm:h-40 lg:w-52 lg:h-52 -z-50">
      <Canvas orthographic camera={{ position: [0, 0, 1] }}>
        <FixedCamera />
        <ShaderPlaneNode fragmentShader={fragmentShader} params={params} />
        <OrbitControls enableRotate={false} />
      </Canvas>
    </div>
  );
}
