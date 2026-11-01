import * as THREE from 'three-studio';

export function addStudioContours(root, limit = 40) {
  const candidates = [];
  root.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material)) return;
    if (object.material.transparent || object.material.isMeshBasicMaterial) return;
    object.geometry.computeBoundingBox();
    const size = object.geometry.boundingBox.getSize(new THREE.Vector3());
    const volume = size.x * size.y * size.z;
    let furniture = false;
    for (let parent = object; parent; parent = parent.parent) {
      if (parent.name === 'studio-desk' || parent.name === 'gaming-chair') furniture = true;
    }
    if (volume > .0005 && Math.min(size.x, size.y, size.z) > .025) candidates.push({ object, volume, furniture });
  });
  // Outline the major forms, with a fixed draw-call budget per character.
  const makeInk = (width, opacity) => new THREE.ShaderMaterial({
    uniforms: { ink: { value: new THREE.Color('#28252a').convertSRGBToLinear() }, width: { value: width }, opacity: { value: opacity } },
    vertexShader: 'uniform float width; void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position+normal*width,1.0);}',
    fragmentShader: 'uniform vec3 ink; uniform float opacity; void main(){float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);gl_FragColor=vec4(ink,opacity*(0.82+grain*0.18));\n#include <encodings_fragment>\n}',
    side: THREE.BackSide, transparent: true, depthWrite: false,
  });
  const material = makeInk(.003, .88), furnitureMaterial = makeInk(.0045, .94);
  let ordinaryUsed = false, furnitureUsed = false;
  const priority = item => item.volume * (item.furniture ? 6 : 1);
  for (const { object, furniture } of candidates.sort((a, b) => priority(b) - priority(a)).slice(0, limit)) {
    const outline = new THREE.Mesh(object.geometry, furniture ? furnitureMaterial : material);
    if (furniture) furnitureUsed = true; else ordinaryUsed = true;
    outline.name = 'studio-form-contour';
    outline.userData.studioContour = true;
    object.add(outline);
  }
  if (!ordinaryUsed) material.dispose();
  if (!furnitureUsed) furnitureMaterial.dispose();
}
