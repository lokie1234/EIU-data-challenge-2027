import * as THREE from 'three-studio';
import { IRIDESCENCE_FRAGMENT } from '../../iridescenceShader';

export const IRIDESCENCE_WALL_SETTINGS = Object.freeze({
  color: '#8099cc', hueShift: 0, saturation: 1, brightness: 1.5, contrast: 1,
  speed: 1, scale: 1, detail: 8, warp: 1, rotation: -12,
  mouseReact: true, amplitude: .1, stir: .5, sheen: .3, clickSwirl: true, grain: 0, fade: 0,
});

// Adapt the installed React Bits shader to the existing room material. UVs
// follow the actual wall; opaque glyphs and their contact shadows stay in front.
export function createWallIridescence(material) {
  const settings = IRIDESCENCE_WALL_SETTINGS;
  const cols = 48, rows = 24, field = new Float32Array(cols * rows * 2), scratch = new Float32Array(field.length);
  const bytes = new Uint8Array(cols * rows * 4);
  for (let i = 0; i < bytes.length; i += 4) { bytes[i] = bytes[i + 1] = 128; bytes[i + 3] = 255; }
  const fieldTexture = new THREE.DataTexture(bytes, cols, rows, THREE.RGBAFormat, THREE.UnsignedByteType);
  fieldTexture.minFilter = fieldTexture.magFilter = THREE.LinearFilter;
  fieldTexture.generateMipmaps = false; fieldTexture.needsUpdate = true;
  // Keep the extra sampler visible to the engine's normal texture disposal pass.
  material.iridescenceField = fieldTexture;
  const color = new THREE.Color(settings.color);
  const uniforms = {
    uResolution: { value: new THREE.Vector2(1024, 512) }, uTime: { value: 0 },
    uColor: { value: new THREE.Vector3(color.r, color.g, color.b) },
    uMouse: { value: new THREE.Vector2(.5, .5) }, uPointer: { value: new THREE.Vector3(.5, .5, 0) },
    uAmplitude: { value: settings.amplitude }, uScale: { value: settings.scale },
    uRotation: { value: settings.rotation * Math.PI / 180 }, uDetail: { value: settings.detail },
    uWarp: { value: settings.warp }, uHue: { value: settings.hueShift },
    uSaturation: { value: settings.saturation }, uBrightness: { value: settings.brightness },
    uContrast: { value: settings.contrast }, uGrain: { value: 0 }, uSeed: { value: 0 },
    uFade: { value: 0 }, uOpacity: { value: 1 }, uField: { value: fieldTexture },
    uStir: { value: settings.stir }, uSheen: { value: settings.sheen },
    uSwirls: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
  };
  const adapted = IRIDESCENCE_FRAGMENT
    .replace('#version 300 es', '')
    .replace('precision highp float;', '')
    .replace('in vec2 vUv;', '')
    .replace('out vec4 outColor;', '')
    .replace('void main() {', 'vec4 studioIridescence(vec2 vUv) {')
    .replace('texture(uField, vUv).rg', '((texture2D(uField, vUv).rg * 255.0 - 128.0) / 127.0 * 0.4)')
    .replace('outColor = vec4(col * alpha, alpha);', 'return vec4(col * alpha, alpha);')
    .replaceAll('hash(', 'iridescenceHash(');
  material.userData.iridescence = true;
  material.customProgramCacheKey = () => 'studio-react-bits-iridescence-wall-v1';
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec2 vIridescenceWallUv;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvIridescenceWallUv = vec2(1.0 - uv.x, uv.y);');
    shader.fragmentShader = 'varying vec2 vIridescenceWallUv;\n' + adapted + '\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      vec3 wallIridescence = studioIridescence(vIridescenceWallUv).rgb;
      diffuseColor.rgb *= mix(vec3(1.0), wallIridescence, .88);
    `);
  };
  const pointer = { x: .5, y: .5, active: false };
  let activeField = false, dirtyField = false, time = 0, disposed = false;
  const swirls = [];
  const stamp = (x, y, dx, dy) => {
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const ox = ((col + .5) / cols - x) * 2, oy = (row + .5) / rows - y;
      const t = 1 - (ox * ox + oy * oy) / (.22 * .22);
      if (t <= 0) continue;
      const i = (row * cols + col) * 2, px = field[i] + dx * t * t * 3.2, py = field[i + 1] + dy * t * t * 3.2;
      const length = Math.hypot(px, py), limit = length ? .4 * Math.tanh(length / .4) / length : 0;
      field[i] = px * limit; field[i + 1] = py * limit;
    }
    activeField = dirtyField = true;
  };
  return {
    uniforms,
    setPointer(uv) {
      if (disposed) return;
      if (!uv) { pointer.active = false; return; }
      const x = 1 - uv.x, y = uv.y;
      if (pointer.active) stamp(x, y, x - pointer.x, y - pointer.y);
      pointer.x = x; pointer.y = y; pointer.active = true;
    },
    click(uv) {
      if (!uv || disposed) return;
      if (swirls.length >= 6) { if (time - swirls[0].start < 2.8) return; swirls.shift(); }
      swirls.push({ x: 1 - uv.x, y: uv.y, start: time });
    },
    update(nextTime, delta) {
      if (disposed) return;
      time = nextTime; uniforms.uTime.value = time * settings.speed;
      const follow = 1 - Math.exp(-delta * 5);
      uniforms.uMouse.value.x += ((pointer.active ? pointer.x : .5) - uniforms.uMouse.value.x) * follow;
      uniforms.uMouse.value.y += ((pointer.active ? pointer.y : .5) - uniforms.uMouse.value.y) * follow;
      uniforms.uPointer.value.x = pointer.x; uniforms.uPointer.value.y = pointer.y;
      uniforms.uPointer.value.z += ((pointer.active ? 1 : 0) - uniforms.uPointer.value.z) * (1 - Math.exp(-delta * 4));
      if (activeField) {
        let peak = 0;
        const decay = Math.exp(-delta * 1.4);
        for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 2;
          const left = (row * cols + Math.max(0, col - 1)) * 2, right = (row * cols + Math.min(cols - 1, col + 1)) * 2;
          const up = (Math.max(0, row - 1) * cols + col) * 2, down = (Math.min(rows - 1, row + 1) * cols + col) * 2;
          for (let c = 0; c < 2; c++) {
            scratch[i + c] = (field[i + c] * 12 + field[left + c] + field[right + c] + field[up + c] + field[down + c]) / 16 * decay;
            peak = Math.max(peak, Math.abs(scratch[i + c]));
          }
        }
        field.set(scratch); activeField = peak >= .0004;
        if (!activeField) field.fill(0);
        dirtyField = true;
      }
      if (dirtyField) {
        for (let i = 0; i < cols * rows; i++) { bytes[i * 4] = Math.round(128 + field[i * 2] / .4 * 127); bytes[i * 4 + 1] = Math.round(128 + field[i * 2 + 1] / .4 * 127); }
        fieldTexture.needsUpdate = true; dirtyField = false;
      }
      while (swirls.length && time - swirls[0].start >= 3.2) swirls.shift();
      uniforms.uSwirls.value.forEach((value, index) => {
        const swirl = swirls[index];
        if (!swirl) { value.set(0, 0, 0, 0); return; }
        const age = time - swirl.start, radius = .21 * (1 + .4 * age);
        const ease = Math.exp(-age * 1.35) - Math.exp(-age * 10), fade = Math.min(1, (3.2 - age) / .8);
        value.set(swirl.x, swirl.y, radius, 3 * ease * fade * (.21 / radius) ** 2);
      });
    },
    dispose() { disposed = true; },
  };
}
