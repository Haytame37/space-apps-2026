import * as THREE from 'three'

export interface ModelBounds {
  size: THREE.Vector3
  center: THREE.Vector3
}

const cache = new WeakMap<THREE.Object3D, ModelBounds>()
const corner = new THREE.Vector3()

function expand(box: THREE.Box3, node: THREE.Object3D, toRoot: THREE.Matrix4) {
  const mesh = node as THREE.Mesh
  if (mesh.isMesh && mesh.geometry) {
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
    const { min, max } = mesh.geometry.boundingBox!
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).applyMatrix4(toRoot)
      box.expandByPoint(corner)
    }
  }
  for (const child of node.children) {
    child.updateMatrix()
    expand(box, child, new THREE.Matrix4().multiplyMatrices(toRoot, child.matrix))
  }
}

/**
 * Size and centre of a loaded model in its own space.
 *
 * Loaded models are cached and reused each time the 3D view comes back, still
 * carrying the scale and position (and the parents) of their last use. Measuring
 * them with Box3.setFromObject would therefore give a different answer every
 * time, down to zero for a body that had been shrunk away. This measurement
 * ignores the model's own transform and everything above it, and is kept.
 */
export function modelBounds(root: THREE.Object3D): ModelBounds {
  const known = cache.get(root)
  if (known) return known
  const box = new THREE.Box3()
  expand(box, root, new THREE.Matrix4())
  const bounds = { size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()) }
  cache.set(root, bounds)
  return bounds
}
