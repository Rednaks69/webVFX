// Shared types for any "UV node" flavor (identity, transform, ...).
// Adding a new kind = adding one entry here. Nothing else needs to change.

export type UniformParam = {
  key: string; // must match the uniform name in the fragment shader
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
};

export type UVNodeKind = {
  id: string;
  label: string;
  fragmentShader: string;
  params: UniformParam[];
};

const identityFragmentShader = /* glsl */ `
  uniform float uEdge0;
  uniform float uEdge1;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    float r = smoothstep(uEdge0, uEdge1, uv.x);
    float g = smoothstep(0.45, 0.55, uv.y);

    vec3 color = vec3(r, g, 0.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const transformFragmentShader = /* glsl */ `
  uniform float uRotation; // radians
  uniform float uScale;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;

    float s = sin(uRotation);
    float c = cos(uRotation);
    uv = mat2(c, -s, s, c) * uv;
    uv /= max(uScale, 0.0001);

    uv += 0.5;
    vec3 color = vec3(uv, 0.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const UV_IDENTITY: UVNodeKind = {
  id: "uv-identity",
  label: "UV Identity",
  fragmentShader: identityFragmentShader,
  params: [
    {
      key: "uEdge0",
      label: "Edge 0 (r start)",
      defaultValue: 0.45,
      min: 0,
      max: 1,
      step: 0.001,
    },
    {
      key: "uEdge1",
      label: "Edge 1 (r end)",
      defaultValue: 0.55,
      min: 0,
      max: 1,
      step: 0.001,
    },
  ],
};

export const UV_TRANSFORM: UVNodeKind = {
  id: "uv-transform",
  label: "UV Transform",
  fragmentShader: transformFragmentShader,
  params: [
    {
      key: "uRotation",
      label: "Rotation",
      defaultValue: 0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    {
      key: "uScale",
      label: "Scale",
      defaultValue: 1,
      min: 0.1,
      max: 4,
      step: 0.01,
    },
  ],
};

/**
 * This turns your list of kinds into a lookup table keyed by id,
 * instead of an array you'd have to .find() through. Whenever you have
 * "a small fixed set of named things I'll look up by name often,"
 * reach for an object/Record instead of an array — O(1) lookup by key
 * versus scanning. The [UV_IDENTITY.id]: UV_IDENTITY syntax is a computed
 * property name — it means "use the value of UV_IDENTITY.id
 * (the string "uv-identity") as the key," not the literal text UV_IDENTITY.id.
 * This way the key and the id field can never drift apart, since one is derived
 * from the other.
 * */

export const UV_NODE_KINDS: Record<string, UVNodeKind> = {
  [UV_IDENTITY.id]: UV_IDENTITY,
  [UV_TRANSFORM.id]: UV_TRANSFORM,
};

export const DEFAULT_UV_KIND_ID = UV_IDENTITY.id;

export function getUVNodeKind(kindId: string | undefined): UVNodeKind {
  return UV_NODE_KINDS[kindId ?? DEFAULT_UV_KIND_ID] ?? UV_IDENTITY;
}

export function getDefaultParams(kind: UVNodeKind): Record<string, number> {
  return Object.fromEntries(kind.params.map((p) => [p.key, p.defaultValue]));
}
