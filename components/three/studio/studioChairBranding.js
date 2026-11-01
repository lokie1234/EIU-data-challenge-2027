import * as THREE from 'three-studio';

export const chairLogoPath = '/branding/eiu-logo-uploaded.png';

export function loadChairLogo() {
  const texture = new THREE.TextureLoader().load(chairLogoPath);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 2;
  texture.userData = { assetPath: chairLogoPath };
  return texture;
}

export function addChairLogo(chair, texture) {
  const back = chair.getObjectByName('chair-backrest');
  if (!back) return;
  const backing = new THREE.MeshStandardMaterial({ color: '#111419', metalness: .88, roughness: .28 });
  const ink = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  for (const side of [-1, 1]) {
    const badge = new THREE.Mesh(new THREE.BoxGeometry(.43, .145, .006), backing);
    badge.name = 'chair-logo-backing';
    badge.position.set(0, .66, side * .060);
    back.add(badge);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(.38, .38 * 206 / 738), ink);
    logo.name = 'companion-chair-eiu-logo';
    logo.userData.assetPath = chairLogoPath;
    logo.position.set(0, .66, side * .064);
    logo.rotation.y = side < 0 ? Math.PI : 0;
    back.add(logo);
  }
}

