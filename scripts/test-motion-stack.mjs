import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const packages = ["@remotion/lottie", "@remotion/three", "@react-three/fiber", "lottie-web", "three"];
for (const name of packages) {
  const resolved = require.resolve(name);
  assert.ok(resolved, name + " must resolve");
  console.log("PACKAGE_RESOLVE_PASS", name, resolved);
}
const THREE = require("three");
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x1677d2});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.rotation.y = 0.5;
assert.equal(scene.children.length, 1);
assert.ok(Number.isFinite(cube.rotation.y));
console.log("THREE_SCENE_SMOKE_PASS", {children: scene.children.length, rotationY: cube.rotation.y});
const lottie = require("lottie-web");
assert.equal(typeof lottie.loadAnimation, "function");
console.log("LOTTIE_RUNTIME_API_PASS");
console.log("MOTION_STACK_PACKAGE_TEST_PASS");
