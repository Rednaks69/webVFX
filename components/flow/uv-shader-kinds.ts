// ============================================================================
// SHADER KIND REGISTRY — now "composable" instead of "standalone"
// ============================================================================
//
// OLD MODEL: each kind was a complete fragment shader. Plugging one into
// another did nothing, because each one wrote directly to gl_FragColor.
//
// NEW MODEL: each kind is a GLSL *function*. A "uv-op" kind transforms a
// vec2 UV into another vec2 UV (e.g. rotate/scale). A "color" kind takes a
// vec2 UV and produces a vec3 color. The graph edges decide which function
// calls which — compose-shader.ts does that wiring and builds ONE final
// fragment shader out of however many node-functions are chained together.
//
// Nothing in the *params store* changes. Nothing in *ShaderNode.tsx*'s
// uniform-mutation logic changes either. What changes is: (1) what GLSL text
// a kind contributes, and (2) that uniform names must be unique PER NODE
// INSTANCE, not per kind — because you might drop two Transform nodes on the
// canvas and chain them, and they can't both declare `uniform float
// uRotation;` or GLSL will collide. We solve that by suffixing every uniform
// name with the node's id at composition time (see compose-shader.ts).
// ============================================================================

export type UniformParam = {
  key: string; // logical name, e.g. "uRotation" — NOT the final uniform name
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
};

// "uv-op": vec2 in, vec2 out. Can be chained in front of anything else.
// "color": vec2 in, vec3 out. Terminates a chain — this is what actually
//          gets assigned to gl_FragColor.
export type UVNodeCategory = "uv-op" | "color";

export type UVNodeKind = {
  id: string;
  label: string;
  category: UVNodeCategory;

  // The *name* of the GLSL function this kind defines, WITHOUT the node-id
  // suffix. compose-shader.ts appends `_<nodeId>` when it actually emits
  // the function, so two nodes of the same kind don't collide either.
  functionName: string;

  // A GLSL function body as a *template*. Notice it does NOT hardcode
  // uniform names — uniforms are passed in as ordinary function
  // parameters, in the same order as `params` below. This is what makes
  // the function reusable across multiple node instances.
  //
  // Placeholder `{{FN}}` gets replaced with the node-suffixed function
  // name at composition time (e.g. "uvTransform" -> "uvTransform_n5").
  glslFunctionTemplate: string;

  // Declares both (a) what sliders to render in ShaderControlsPanel, and
  // (b) the function's parameter list, in order. The order here MUST match
  // the order params appear in glslFunctionTemplate's signature.
  params: UniformParam[];
};

// ----------------------------------------------------------------------------
// UV IDENTITY — a "color" kind. Terminates a chain.
// Takes a UV (possibly already transformed by upstream uv-op nodes) and
// produces a final RGB color from it.
// ----------------------------------------------------------------------------
const identityFunctionTemplate = /* glsl */ `
vec3 {{FN}}(vec2 uv, float edge0, float edge1) {
  uv.y = 1.0 - uv.y;

  float r = smoothstep(edge0, edge1, uv.x);
  float g = smoothstep(0.45, 0.55, uv.y);

  return vec3(r, g, 0.0);
}
`;

export const UV_IDENTITY: UVNodeKind = {
  id: "uv-identity",
  label: "UV Identity",
  category: "color",
  functionName: "uvIdentity",
  glslFunctionTemplate: identityFunctionTemplate,
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

// ----------------------------------------------------------------------------
// UV TRANSFORM — a "uv-op" kind. Does NOT terminate a chain.
// Takes a UV and returns a *modified* UV. Whatever this node feeds into
// (via the React Flow edge) receives this UV instead of the raw vUv.
// ----------------------------------------------------------------------------
const transformFunctionTemplate = /* glsl */ `
vec2 {{FN}}(vec2 uv, float rotation, float scale) {
  uv -= 0.5;

  float s = sin(rotation);
  float c = cos(rotation);
  uv = mat2(c, -s, s, c) * uv;
  uv /= max(scale, 0.0001);

  uv += 0.5;
  return uv;
}
`;

export const UV_TRANSFORM: UVNodeKind = {
  id: "uv-transform",
  label: "UV Transform",
  category: "uv-op",
  functionName: "uvTransform",
  glslFunctionTemplate: transformFunctionTemplate,
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

// ----------------------------------------------------------------------------
// Registry lookup — unchanged from before.
// ----------------------------------------------------------------------------
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
