// app/shaders/ShaderPlane.tsx
"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  Grid,
} from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useRenderMode } from "@/components/renders/render-mode-store";

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

function ShaderPlane() {
  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

function FlatOrthoCamera({ active }: { active: boolean }) {
  return (
    <OrthographicCamera
      makeDefault={active}
      position={[0, 0, 10]}
      zoom={30}
      up={[0, 0, 1]}
    />
  );
}

// Elevated 3/4 view, looking down at the plane.
// `cameraRef` is passed in from the parent so OrbitControls' onEnd handler
// (also in the parent) can snap this camera back without us re-checking
// distance every single frame, which is what caused both previous bugs.
function AngledPerspectiveCamera({
  active,
  animateIn,
  cameraRef,
  restingPosition,
}: {
  active: boolean;
  animateIn: boolean;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  restingPosition: THREE.Vector3;
}) {
  // Latches to true once the "auto" flythrough finishes. After that,
  // useFrame below NEVER touches position again — no matter how far
  // OrbitControls drags the camera. This is what fixes the "auto" snap-back:
  // before, we re-checked distance every frame and re-engaged the lerp
  // any time you dragged away from the target.
  const introDoneRef = useRef(false);

  useEffect(() => {
    if (!active || !cameraRef.current) return;

    if (animateIn) {
      // "auto" mode: start the flythrough from a flat top-down position
      // each time this camera (re)activates.
      cameraRef.current.position.set(0, 0, 10);
      introDoneRef.current = false;
    } else {
      // "3d" mode: snap straight to the resting position on activation,
      // then OrbitControls owns it. No per-frame enforcement here anymore —
      // that's now handled by onEnd in the parent (see ShaderCanvas).
      cameraRef.current.position.copy(restingPosition);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [active, animateIn, cameraRef, restingPosition]);

  useFrame(() => {
    if (!active || !cameraRef.current) return;
    if (!animateIn) return; // "3d" mode: nothing to do here at all now.
    if (introDoneRef.current) return; // "auto" mode, but already arrived.

    cameraRef.current.position.lerp(restingPosition, 0.04);
    cameraRef.current.lookAt(0, 0, 0);

    if (cameraRef.current.position.distanceTo(restingPosition) < 0.01) {
      introDoneRef.current = true; // arrived — latch permanently, never re-check.
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault={active}
      position={[6, -6, 5]}
      up={[0, 0, 1]}
      fov={40}
    />
  );
}

export default function ShaderCanvas() {
  const { mode } = useRenderMode();

  const isOrtho = mode === "2d" || mode === "2d-to-3d";
  const isPerspective = mode === "3d" || mode === "auto";

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const restingPosition = useRef(new THREE.Vector3(10, -10, 8)).current;

  // Fires when the user releases the mouse/finger after dragging OrbitControls.
  // Only snap back in "3d" mode — this is the actual "rotates freely while
  // dragging, then springs back on release" behavior you wanted, instead of
  // the old every-frame force that blocked rotation entirely.
  const handleControlsEnd = () => {
    if (mode !== "3d" || !cameraRef.current || !controlsRef.current) return;

    cameraRef.current.position.copy(restingPosition);
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="w-full h-[50vh]">
      <Canvas>
        <FlatOrthoCamera active={isOrtho} />
        <AngledPerspectiveCamera
          active={isPerspective}
          animateIn={mode === "auto"}
          cameraRef={cameraRef}
          restingPosition={restingPosition}
        />
        <ShaderPlane />
        {isPerspective && (
          <Grid
            args={[20, 20]}
            cellColor="#fff"
            sectionColor="#666"
            // fadeFrom={5}
            // fadeDistance={30}
            fadeStrength={15}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}
        <OrbitControls
          ref={controlsRef}
          enableRotate={isPerspective}
          target={[0, 0, 0]}
          onEnd={handleControlsEnd}
        />
      </Canvas>
    </div>
  );
}
