// app/shaders/ShaderPlane.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  Grid,
} from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useRenderMode } from "@/components/renders/render-mode-store";

import {
  useUVParamsStore,
  type ParamsMap,
} from "@/components/flow/uv-params-store";
import {
  getUVNodeKind,
  getDefaultParams,
} from "@/components/flow/uv-shader-kinds";
// NEW: the graph walker. This is what turns "Transform feeds Identity"
// into one real fragment shader instead of two independent ones.
import { composeShader } from "@/components/flow/compose-shader";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// UNCHANGED: ShaderPlane itself doesn't need to know anything changed.
// It still just receives a fragmentShader string and a flat params map,
// and mutates uniforms by key — exactly like before. All the new logic is
// upstream of this component, in how those two props get computed.
function ShaderPlane({
  fragmentShader,
  params,
}: {
  fragmentShader: string;
  params: ParamsMap;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

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
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        key={fragmentShader}
        ref={materialRef}
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// UNCHANGED — camera components stay exactly as they were.
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
  const introDoneRef = useRef(false);

  useEffect(() => {
    if (!active || !cameraRef.current) return;

    if (animateIn) {
      cameraRef.current.position.set(0, 0, 10);
      introDoneRef.current = false;
    } else {
      cameraRef.current.position.copy(restingPosition);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [active, animateIn, cameraRef, restingPosition]);

  useFrame(() => {
    if (!active || !cameraRef.current) return;
    if (!animateIn) return;
    if (introDoneRef.current) return;

    cameraRef.current.position.lerp(restingPosition, 0.04);
    cameraRef.current.lookAt(0, 0, 0);

    if (cameraRef.current.position.distanceTo(restingPosition) < 0.01) {
      introDoneRef.current = true;
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

  // CHANGED: we now also pull `nodes` and `edges` out of the store — these
  // are the same arrays Flow.tsx reads and writes. We need them here
  // because composeShader() has to walk the actual graph topology to know
  // which nodes feed which.
  const { outputNodeId, nodes, edges, getParams } = useUVParamsStore();

  // ---------------------------------------------------------------------
  // CHANGED: this whole block replaces the old
  //   const activeKind = outputKindId ? getUVNodeKind(outputKindId) : null;
  //   const activeFragmentShader = activeKind ? activeKind.fragmentShader : fragmentShader;
  //   const activeParams = activeKind ? getParams(outputNodeId!, getDefaultParams(activeKind)) : {};
  //
  // Instead of looking at ONLY the output node's kind/params, we ask
  // composeShader to walk backward from outputNodeId through `edges`,
  // collecting every upstream "uv-op" node along the way, and return:
  //   - fragmentShader: one shader with all the chained functions spliced in
  //   - uniforms: a flat list describing every uniform that shader expects,
  //     each tagged with which node it belongs to (uniforms[i].nodeId) and
  //     which logical param key it corresponds to (uniforms[i].key) — this
  //     is what lets us go back to the params store and pull the right
  //     slider value for each one.
  //
  // useMemo here matters for the same reason it mattered in ShaderPlane:
  // we don't want to re-walk the graph and rebuild the shader string on
  // every single render — only when the graph shape OR which node is
  // selected as output actually changes. We deliberately do NOT include
  // `getParams` results in this dependency array, because changing a
  // slider should update *values*, not rebuild the *shader text* — that
  // distinction is exactly why composeShader and the params-merging step
  // below are two separate things.
  // ---------------------------------------------------------------------
  const composed = useMemo(
    () => composeShader(outputNodeId, nodes, edges),
    [outputNodeId, nodes, edges],
  );

  // ---------------------------------------------------------------------
  // NEW: build the flat, namespaced params map that ShaderPlane expects.
  //
  // `composed.uniforms` tells us exactly which (nodeId, key) pairs the
  // shader needs values for. For each one, we:
  //   1. find that node's kind (to get its default values)
  //   2. ask the params store for that node's CURRENT params (defaults
  //      merged with whatever the user has dragged in ShaderControlsPanel)
  //   3. write the value under the FINAL uniform name (key + nodeId), which
  //      is what the composed shader's `uniform float uRotation_n5;`
  //      declarations actually expect.
  //
  // This intentionally re-runs on every render (no useMemo) because it's
  // cheap — it's just object lookups over a short list — and it MUST stay
  // fresh every time any node's params change, which happens far more
  // often than the graph shape itself changes.
  // ---------------------------------------------------------------------
  const activeParams: ParamsMap = {};
  for (const uniform of composed.uniforms) {
    const node = nodes.find((n) => n.id === uniform.nodeId);
    if (!node) continue; // node got deleted mid-frame — skip it gracefully

    const kind = getUVNodeKind((node.data as { kind?: string }).kind);
    const defaults = getDefaultParams(kind);
    const nodeParams = getParams(uniform.nodeId, defaults);

    activeParams[uniform.uniformName] = nodeParams[uniform.key];
  }

  const isOrtho = mode === "2d" || mode === "2d-to-3d";
  const isPerspective = mode === "3d" || mode === "auto";

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const restingPosition = useRef(new THREE.Vector3(10, -10, 8));
  // eslint-disable-next-line react-hooks/refs
  const restingPositionCurrent = useMemo(() => restingPosition.current, []);

  const handleControlsEnd = () => {
    if (mode !== "3d" || !cameraRef.current || !controlsRef.current) return;

    cameraRef.current.position.copy(restingPositionCurrent);
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
          restingPosition={restingPositionCurrent}
        />
        {/* CHANGED: feed the composed shader + flat params instead of a
            single node's kind/params. */}
        <ShaderPlane
          fragmentShader={composed.fragmentShader}
          params={activeParams}
        />
        {isPerspective && (
          <Grid
            args={[20, 20]}
            cellColor="#fff"
            sectionColor="#666"
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
