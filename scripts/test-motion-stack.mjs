import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const packages = ["@remotion/lottie", "@remotion/three", "@react-three/fiber", "lottie-web", "gsap"];
for (const name of packages) {
  const resolved = require.resolve(name);
  assert.ok(resolved, name + " must resolve");
  console.log("PACKAGE_RESOLVE_PASS", name);
}
const THREE = await import("three");
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x1677d2});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.rotation.y = 0.5;
assert.equal(scene.children.length, 1);
assert.ok(Number.isFinite(cube.rotation.y));
console.log("THREE_SCENE_SMOKE_PASS", {children: scene.children.length, rotationY: cube.rotation.y});
const { gsap } = await import("gsap");
const state = { x: 0 };
const timeline = gsap.timeline({ paused: true });
timeline.to(state, { x: 100, duration: 1, ease: "power2.out" });
timeline.progress(0.5);
const midpoint = state.x;
timeline.progress(0.5);
assert.equal(state.x, midpoint, "GSAP seek at the same progress must be deterministic");
timeline.kill();
console.log("GSAP_SEEK_SMOKE_PASS", { midpoint });
console.log("LOTTIE_RUNTIME_RESOLVE_PASS");
console.log("MOTION_STACK_PACKAGE_TEST_PASS");
// Keep this smoke script deterministic and independent from the production scene timeline.
// TypeScript and frame-render validation run in the companion CI job.
// MP4 metadata validation uses the system FFmpeg tools installed by CI.
