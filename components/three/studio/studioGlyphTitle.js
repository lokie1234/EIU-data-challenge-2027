import * as THREE from 'three-studio';
import glyphData from './titleGlyphs.json';
import { titlePrintPlane } from './studioRoomProjection';
import { applyPencilMaterial } from './studioPencil';

export const GLYPH_TITLE_TEXT = 'EIU Data Challenge 2027';
export function titleWordStops() {
  let width = 0;
  const stops = [];
  for (const character of GLYPH_TITLE_TEXT) {
    const advance = glyphData.glyphs[character].advance - 10;
    if (character === ' ') stops.push(width + advance / 2);
    width += advance;
  }
  return stops.map(stop => stop / width);
}

// Real, separately extruded glyphs derived from the project's licensed font.
// There is no rectangular text plane, bitmap title, plaque or backing frame.
export function createGlyphTitle(root, { deferGeometry = false } = {}) {
  const group = new THREE.Group(); group.name = 'room-title-extruded-letters'; group.matrixAutoUpdate = false; root.add(group);
  const titleTime = { value: 0 }, entries = [], sourceGeometry = new Map(), shadowSources = new Map();
  const contactShadows = new THREE.Group(); contactShadows.name = 'title-letter-contact-shadows'; group.add(contactShadows);
  let lastTime = -1;
  let cursor = 0, word = 0;
  const layout = Array.from(GLYPH_TITLE_TEXT).map(character => {
    const glyph = glyphData.glyphs[character], left = cursor;
    cursor += glyph.advance - 10;
    const item = { character, left, word, glyph };
    if (character === ' ') word++;
    return item;
  });
  const width = cursor;
  const decorate = (material, outline = false) => {
    material.userData.architecture = true;
    if (!outline) applyPencilMaterial(material, { strength: 2.2 });
    const pencil = material.onBeforeCompile;
    material.customProgramCacheKey = () => `studio-glyph-pencil-${outline}-2.2`;
    material.onBeforeCompile = shader => {
      pencil?.(shader);
      shader.uniforms.titleTime = titleTime;
      shader.vertexShader = 'attribute float titleProgress; varying float vTitleProgress;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvTitleProgress = titleProgress;');
      shader.fragmentShader = 'uniform float titleTime; varying float vTitleProgress;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', `
        #include <clipping_planes_fragment>
        float titleReveal = clamp(${outline ? 'titleTime / 1.3' : '(titleTime - 1.45) / .65'}, 0.0, 1.0);
        if (titleReveal <= 0.0 || vTitleProgress > titleReveal) discard;
      `);
    };
    return material;
  };
  const front = decorate(new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
  const side = decorate(new THREE.MeshStandardMaterial({ color: '#f1f3f5' }));
  const outlineMaterial = decorate(new THREE.LineBasicMaterial({ color: '#000000', toneMapped: false }), true);
  const shadowMaterial = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: .18, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  shadowMaterial.userData.architecture = true;
  const bounds = new THREE.Box3();
  function* build() {
  try { for (const item of layout) {
    if (item.character === ' ') continue;
    if (!sourceGeometry.has(item.character)) {
      const path = new THREE.ShapePath();
      for (const [command, ...p] of item.glyph.commands) {
        if (command === 'm') path.moveTo(...p);
        else if (command === 'l') path.lineTo(...p);
        else if (command === 'q') path.quadraticCurveTo(...p);
        else if (command === 'c') path.bezierCurveTo(...p);
        else if (command === 'z') path.currentPath.closePath();
      }
      const shapes = path.toShapes();
      sourceGeometry.set(item.character, new THREE.ExtrudeGeometry(shapes, { depth: 100, steps: 1, curveSegments: 8, bevelEnabled: true, bevelSize: 1.5, bevelThickness: 2, bevelSegments: 1 }));
      shadowSources.set(item.character, new THREE.ShapeGeometry(shapes, 8));
    }
    const geometry = sourceGeometry.get(item.character).clone();
    geometry.translate(item.left, 0, 0); geometry.computeBoundingBox(); bounds.union(geometry.boundingBox);
    const addProgress = target => {
      const positions = target.attributes.position, progress = new Float32Array(positions.count);
      for (let i = 0; i < progress.length; i++) progress[i] = positions.getX(i) / width;
      target.setAttribute('titleProgress', new THREE.BufferAttribute(progress, 1));
    };
    addProgress(geometry);
    const mesh = new THREE.Mesh(geometry, [front, side]);
    mesh.name = `title-glyph-${entries.length}-${item.character}`;
    mesh.userData.character = item.character; mesh.receiveShadow = true; mesh.visible = false;
    // Tight wall contact silhouettes replace the old long, floating floor shadows.
    const shadowGeometry = shadowSources.get(item.character).clone();
    shadowGeometry.translate(item.left + 5, -5, 104);
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial); shadow.visible = false;
    shadow.name = `title-contact-shadow-${entries.length}`; contactShadows.add(shadow);
    const edgeGeometry = new THREE.EdgesGeometry(geometry, 40); addProgress(edgeGeometry);
    const contour = new THREE.LineSegments(edgeGeometry, outlineMaterial);
    contour.name = `title-pencil-contour-${entries.length}`;
    group.add(mesh, contour); entries.push({ mesh, shadow, start: geometry.boundingBox.min.x / width });
    yield;
  } } finally {
    sourceGeometry.forEach(geometry => geometry.dispose()); sourceGeometry.clear();
    shadowSources.forEach(geometry => geometry.dispose()); shadowSources.clear();
  }
  }
  const stages = build();
  if (!deferGeometry) { for (const _stage of stages) void _stage; }
  return {
    group,
    buildStages: deferGeometry ? stages : [],
    updateProjection({ aspect, viewportWidth }) {
      group.visible = viewportWidth > 1024;
      const plane = titlePrintPlane(aspect), height = -plane.vertical[1], scaleY = height / (bounds.max.y - bounds.min.y);
      group.matrix.set(
        0, 0, -.008 / 102, plane.origin[0],
        0, scaleY, 0, plane.origin[1] - height - bounds.min.y * scaleY,
        plane.horizontal[2] / width, 0, 0, plane.origin[2],
        0, 0, 0, 1,
      );
      group.matrixWorldNeedsUpdate = true;
    },
    update(time) {
      titleTime.value = Math.min(2.75, Math.max(0, time - .25));
      if (lastTime === titleTime.value) return;
      lastTime = titleTime.value;
      for (const { mesh, shadow, start } of entries) mesh.visible = shadow.visible = titleTime.value > 1.45 + .65 * start;
    },
  };
}
