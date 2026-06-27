// ============================================================================
// SHADER GRAPH COMPOSER
// ============================================================================
//
// This is the piece that makes wiring nodes together actually DO something.
// Given "this node is the one whose output I want to preview" (outputNodeId),
// it walks the React Flow edges BACKWARD from that node, collects every
// upstream "uv-op" node in the chain, and stitches their GLSL functions
// together into ONE fragment shader — instead of each node rendering its own
// shader in isolation.
//
// MENTAL MODEL: an edge `source -> target` means "source's output feeds
// target's input." So if Identity (target) has an incoming edge from
// Transform (source), Identity's UV argument becomes a call to Transform's
// function instead of the raw screen UV.
//
//   finalColor = uvIdentity( uvTransform( vUv, rot, scale ), edge0, edge1 )
//                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                            this nesting IS the chain
// ============================================================================

import type { Node, Edge } from "@xyflow/react";
import {
  getUVNodeKind,
  UVNodeKind,
  type UniformParam,
} from "./uv-shader-kinds";

// What ShaderPlane needs back: the finished shader source, plus the list of
// uniforms it should expect (so it knows which uniform names to set values
// on every frame/param change).
export type ComposedShader = {
  fragmentShader: string;
  // Each entry knows both its "logical" key (matches a UniformParam.key,
  // used to look up the slider value in the params store) and the actual
  // GLSL uniform name it was compiled with (key + nodeId, guaranteed unique).
  uniforms: { nodeId: string; key: string; uniformName: string }[];
};

const PASSTHROUGH_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`;

/**
 * Builds the uniform's final GLSL name. Suffixing by nodeId is what lets two
 * different node instances of the SAME kind (e.g. two Transform nodes
 * chained back to back) each get their own `uRotation_n4` / `uRotation_n5`
 * instead of colliding on a single `uRotation`.
 *
 * NOTE: GLSL identifiers can't contain hyphens, and React Flow ids are
 * usually safe (like "n4"), but if you ever generate ids with characters
 * GLSL disallows, sanitize here.
 */
export function uniformName(key: string, nodeId: string): string {
  const safeId = nodeId.replace(/[^a-zA-Z0-9_]/g, "_");
  return `${key}_${safeId}`;
}

export function functionInstanceName(
  functionName: string,
  nodeId: string,
): string {
  const safeId = nodeId.replace(/[^a-zA-Z0-9_]/g, "_");
  return `${functionName}_${safeId}`;
}

/**
 * Finds the single upstream node feeding INTO `nodeId`, if any.
 *
 * Assumption baked in here: each node has at most ONE incoming "uv" edge.
 * That matches your current UVNode, which exposes one target handle
 * ("target-UV-1"). If you later add nodes that blend two UVs together
 * (e.g. a "mix" node with two inputs), this function needs to return an
 * array instead of a single edge, and buildUvExpression below needs an
 * arm for "this kind takes multiple upstream expressions."
 */
function findUpstreamEdge(nodeId: string, edges: Edge[]): Edge | undefined {
  return edges.find((edge) => edge.target === nodeId);
}

/**
 * Recursively builds the GLSL *expression string* for "the UV value that
 * should be fed into `nodeId`."
 *
 * - If `nodeId` has no incoming edge, the UV is just the raw screen UV
 *   (`vUv`), which is the base case of the recursion.
 * - If it DOES have an incoming edge, and the upstream node is a "uv-op"
 *   kind, we recurse: the UV fed into `nodeId` is "the upstream node's
 *   function applied to the upstream node's own input UV."
 * - If the upstream node is a "color" kind, that's a malformed graph for
 *   our purposes (a color can't be consumed as a UV) — we just fall back
 *   to the raw UV rather than crashing, but you could throw/validate
 *   instead once you add UI for invalid-connection feedback.
 *
 * `visitedNodeIds` is filled in as a side effect — every node whose
 * function actually ends up GLSL-emitted gets added to it, so the caller
 * knows exactly which function definitions to splice into the final shader
 * (and which uniforms to declare/expect).
 */
function buildUvExpression(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  visitedNodeIds: Set<string>,
  uniformsOut: { nodeId: string; key: string; uniformName: string }[],
): string {
  const upstreamEdge = findUpstreamEdge(nodeId, edges);

  // Base case: nothing feeds this node, so it consumes the raw screen UV.
  if (!upstreamEdge) {
    return "vUv";
  }

  const upstreamNode = nodes.find((n) => n.id === upstreamEdge.source);
  if (!upstreamNode) {
    // Edge points at a node that no longer exists (e.g. mid-delete frame).
    // Fail soft to the raw UV instead of throwing during render.
    return "vUv";
  }

  const upstreamKind = getUVNodeKind(
    (upstreamNode.data as { kind?: string }).kind,
  );

  // Only "uv-op" kinds can sit in the middle of a chain. A "color" kind
  // upstream of a uv-consumer doesn't make sense (you can't rotate a UV by
  // a color), so we just ignore it and use the raw UV — same fail-soft
  // policy as the missing-node case above.
  if (upstreamKind.category !== "uv-op") {
    return "vUv";
  }

  // Recurse FIRST: find out what UV the upstream node itself consumes
  // (it might have its own upstream node feeding it, e.g. two chained
  // Transform nodes).
  const upstreamInputExpr = buildUvExpression(
    upstreamNode.id,
    nodes,
    edges,
    visitedNodeIds,
    uniformsOut,
  );

  visitedNodeIds.add(upstreamNode.id);

  // Register this node's uniforms (one entry per param) so the caller can
  // declare them in the shader header and ShaderPlane knows what to feed
  // values into.
  for (const param of upstreamKind.params) {
    uniformsOut.push({
      nodeId: upstreamNode.id,
      key: param.key,
      uniformName: uniformName(param.key, upstreamNode.id),
    });
  }

  const fnName = functionInstanceName(
    upstreamKind.functionName,
    upstreamNode.id,
  );
  const argList = upstreamKind.params
    .map((p) => uniformName(p.key, upstreamNode.id))
    .join(", ");

  // e.g. "uvTransform_n5(vUv, uRotation_n5, uScale_n5)"
  return `${fnName}(${upstreamInputExpr}${argList ? ", " + argList : ""})`;
}

/**
 * Emits the actual GLSL function definition text for one node, with its
 * function name suffixed by node id, ready to be pasted into the shader.
 */
function emitFunctionDefinition(node: Node, nodes: Node[]): string {
  const kind = getUVNodeKind((node.data as { kind?: string }).kind);
  const fnName = functionInstanceName(kind.functionName, node.id);

  // Swap the {{FN}} placeholder in the template for this node's unique
  // function name. This is the only templating step — everything else in
  // the template (the function body) is copied verbatim.
  return kind.glslFunctionTemplate.replace(/\{\{FN\}\}/g, fnName);
}

/**
 * Main entry point. Call this with the id of whichever node currently has
 * "Out UV" active.
 *
 * Returns a complete fragment shader string plus the flat list of uniforms
 * it expects — ShaderPlane uses that list to build/update Three.js uniforms
 * each frame, the same way it already does today, just with namespaced
 * names instead of the kind's raw param keys.
 */

export function composeShader(
  outputNodeId: string | null,
  nodes: Node[],
  edges: Edge[],
): ComposedShader {
  if (!outputNodeId) {
    return { fragmentShader: PASSTHROUGH_SHADER, uniforms: [] };
  }

  const outputNode = nodes.find((n) => n.id === outputNodeId);
  if (!outputNode) {
    return { fragmentShader: PASSTHROUGH_SHADER, uniforms: [] };
  }

  const outputKind = getUVNodeKind((outputNode.data as { kind?: string }).kind);

  const visitedNodeIds = new Set<string>([outputNodeId]);
  const uniforms: { nodeId: string; key: string; uniformName: string }[] = [];

  // This walks upstream from the output node and gives us the UV
  // expression that the output node itself consumes as input. It does NOT
  // care what category outputNode is — it's just "what's the UV right
  // before we reach outputNode."
  const inputUvExpr = buildUvExpression(
    outputNodeId,
    nodes,
    edges,
    visitedNodeIds,
    uniforms,
  );

  // Register the output node's own uniforms.
  for (const param of outputKind.params) {
    uniforms.push({
      nodeId: outputNodeId,
      key: param.key,
      uniformName: uniformName(param.key, outputNodeId),
    });
  }

  const outputFnName = functionInstanceName(
    outputKind.functionName,
    outputNodeId,
  );
  const outputArgList = outputKind.params
    .map((p) => uniformName(p.key, outputNodeId))
    .join(", ");

  // ---------------------------------------------------------------------
  // FIXED: branch on what the output node's function actually RETURNS.
  //
  // - "color" kinds return vec3 already — gl_FragColor just needs the
  //   alpha channel appended, same as before.
  // - "uv-op" kinds return vec2 (a UV, not a color). There's no
  //   "correct" color for a bare UV — we make the same choice the old
  //   default passthrough shader made: visualize the UV's x/y directly
  //   as red/green, blue = 0. This means selecting a Transform node as
  //   "Out UV" with nothing past it shows you a rotated/scaled version
  //   of that same red/green UV gradient, which is exactly the right
  //   debugging visual — "here's what UV space looks like after this
  //   node's done with it."
  // ---------------------------------------------------------------------
  let colorExpr: string;

  if (outputKind.category === "color") {
    // e.g. uvIdentity_n4(uvTransform_n5(vUv, ...), uEdge0_n4, uEdge1_n4)
    // already returns vec3 — use it as-is.
    colorExpr = `${outputFnName}(${inputUvExpr}${outputArgList ? ", " + outputArgList : ""})`;
  } else {
    // outputKind.category === "uv-op" — the call returns vec2, so we wrap
    // it ourselves into a vec3 before it ever reaches gl_FragColor.
    const uvExpr = `${outputFnName}(${inputUvExpr}${outputArgList ? ", " + outputArgList : ""})`;
    colorExpr = `vec3(${uvExpr}, 0.0)`;
  }

  const functionDefinitions = [...visitedNodeIds]
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is Node => Boolean(n))
    .map((n) => emitFunctionDefinition(n, nodes));

  const uniformDeclarations = uniforms
    .map((u) => `uniform float ${u.uniformName};`)
    .join("\n");

  const fragmentShader = /* glsl */ `
    varying vec2 vUv;

    ${uniformDeclarations}

    ${functionDefinitions.join("\n")}

    void main() {
      gl_FragColor = vec4(${colorExpr}, 1.0);
    }
  `;

  return { fragmentShader, uniforms };
}

/**
 * Builds a fragment shader for exactly ONE node in isolation — ignoring
 * the graph entirely. This is what powers the small preview canvas inside
 * each UVNode (ShaderNode.tsx), which is meant to answer "what does this
 * node do to a raw screen UV on its own," not "what does this node look
 * like once wired into the full graph." That's a deliberate simplification:
 * a Transform node sitting downstream of three other nodes would otherwise
 * need its tiny thumbnail to re-run the whole upstream chain on every
 * keystroke, which is unnecessary for a glance-preview.
 *
 * Reuses the SAME category-branching logic as composeShader's tail end
 * (color kinds return vec3 as-is; uv-op kinds get wrapped into
 * vec3(uv, 0.0)) so the two previews never visually disagree about what
 * a "bare" node looks like.
 */
export function composeStandaloneShader(
  kind: UVNodeKind,
  nodeId: string,
): ComposedShader {
  const fnName = functionInstanceName(kind.functionName, nodeId);
  const argList = kind.params.map((p) => uniformName(p.key, nodeId)).join(", ");

  // Standalone preview always feeds the raw screen UV in — there's no
  // upstream node to consult, by definition.
  const callExpr = `${fnName}(vUv${argList ? ", " + argList : ""})`;

  const colorExpr =
    kind.category === "color" ? callExpr : `vec3(${callExpr}, 0.0)`;

  const uniforms = kind.params.map((p) => ({
    nodeId,
    key: p.key,
    uniformName: uniformName(p.key, nodeId),
  }));

  const uniformDeclarations = uniforms
    .map((u) => `uniform float ${u.uniformName};`)
    .join("\n");

  const functionDefinition = kind.glslFunctionTemplate.replace(
    /\{\{FN\}\}/g,
    fnName,
  );

  const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    ${uniformDeclarations}
    ${functionDefinition}
    void main() {
      gl_FragColor = vec4(${colorExpr}, 1.0);
    }
  `;

  return { fragmentShader, uniforms };
}
