export function applyPencilMaterial(material, { monochrome = false, detail = false, strength = 1 } = {}) {
  if (!material.isMeshStandardMaterial && !material.isMeshBasicMaterial) return;
  material.userData.pencilStyle = true;
  material.userData.pencilMonochrome = monochrome;
  if (material.isMeshStandardMaterial) {
    material.metalness = 0; material.roughness = .97; material.envMapIntensity = .025;
    if (material.isMeshPhysicalMaterial) {
      material.clearcoat = 0; material.reflectivity = 0; material.transmission = 0;
    }
  }
  material.customProgramCacheKey = () => `studio-pencil-4-${monochrome}-${detail}-${strength}`;
  material.onBeforeCompile = shader => {
    const grain = detail ? '' : `
      float paperGrain = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898,78.233))) * 43758.5453);
      float hatchA = 1.0-smoothstep(0.35,1.0,abs(mod(gl_FragCoord.x+gl_FragCoord.y*0.65,7.0)-3.5));
      float hatchB = 1.0-smoothstep(0.3,0.9,abs(mod(gl_FragCoord.x-gl_FragCoord.y*0.85,9.0)-4.5));
      float pencilTone = dot(pencilPigment,vec3(0.2126,0.7152,0.0722));
      float pencilPressure = clamp(0.82-pencilTone,0.06,0.7);
      pencilPigment = mix(pencilPigment,vec3(1.0),0.045*sqrt(max(pencilTone,0.0)));
      pencilPigment *= 1.0-paperGrain*${0.045 * strength}-hatchA*pencilPressure*${0.20 * strength}-hatchB*pencilPressure*pencilPressure*${0.15 * strength};
    `;
    shader.fragmentShader = shader.fragmentShader.replace('#include <tonemapping_fragment>', `
      vec3 pencilPigment = gl_FragColor.rgb;
      ${monochrome ? 'pencilPigment = vec3(dot(pencilPigment,vec3(0.2126,0.7152,0.0722)));' : ''}
      float pigmentChroma = max(pencilPigment.r,max(pencilPigment.g,pencilPigment.b))-min(pencilPigment.r,min(pencilPigment.g,pencilPigment.b));
      float vividMask = smoothstep(0.035,0.22,pigmentChroma);
      vec3 vividGray = vec3(dot(pencilPigment,vec3(0.2126,0.7152,0.0722)));
      pencilPigment = mix(pencilPigment,max(vec3(0.0),vividGray+(pencilPigment-vividGray)*1.45),vividMask);
      pencilPigment = mix(pencilPigment,vec3(1.0),vividMask*0.045);
      ${grain}
      gl_FragColor.rgb = pencilPigment;
      #include <tonemapping_fragment>
    `);
  };
  material.needsUpdate = true;
}

