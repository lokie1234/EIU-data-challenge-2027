import { expect, it, vi } from 'vitest';
import * as THREE from 'three-studio';
import { worldBounds, penetrates, surfacesIntersect } from '../components/three/studio/studioPlacement';
vi.unmock('../components/three/studio/createRobotStudio');
vi.mock('three-studio', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual,
    WebGLRenderer: class {
      domElement = document.createElement('canvas'); shadowMap = {}; renderLists = { dispose() {} };
      setClearColor = vi.fn();
      setSize() {} setPixelRatio() {} render() {} dispose() {} forceContextLoss() {}
    },
    PMREMGenerator: class { fromScene() { return { texture: new actual.Texture(), dispose() {} }; } dispose() {} }
  };
});
import { createRobotStudio } from '../components/three/studio/createRobotStudio';
import { mainRobotPalette, companionSpecs } from '../components/three/studio/studioPalette';

it('checks four chair entrances, geometric clearance, synchronized replies, pencil materials and final seat/key contact without a GPU', async () => {
  let initFillRects=0;
  const boundsSpy=vi.spyOn(THREE.Box3.prototype,'setFromObject');
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({}, { get(target, key) { return target[key] ?? (key === 'fillRect' ? ()=>{initFillRects++;} : key === 'createLinearGradient' || key === 'createRadialGradient' ? () => gradient : () => {}); }, set(target,key,value) { target[key]=value;return true; } });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  let tick;
  vi.stubGlobal('requestAnimationFrame', fn => { tick=fn; return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const container = document.createElement('div');
  Object.defineProperties(container, { clientWidth: { value: 1200, configurable: true }, clientHeight: { value: 800, configurable: true } });
  container.getBoundingClientRect=()=>({left:0,top:0,width:container.clientWidth,height:container.clientHeight});
  const initStart=performance.now();
  const onVisible=vi.fn();
  const studio = createRobotStudio(container,{onVisible});
  if(process.env.STUDIO_PROFILE==='1')console.log('STUDIO_INIT_PROFILE',JSON.stringify({cpuMs:Math.round(performance.now()-initStart),canvasFillRects:initFillRects,boundsCalls:boundsSpy.mock.calls.length,stages:studio.startupMetrics}));
  expect(initFillRects).toBeLessThan(50000);
  expect(boundsSpy.mock.calls.length).toBeLessThan(50);
  expect(onVisible).not.toHaveBeenCalled();
  const { scene, camera } = studio;
  expect(scene.getObjectByName('room-bookcase-left')).toBeUndefined();
  expect(scene.getObjectByName('room-bookcase-right')).toBeUndefined();
  expect(scene.getObjectByName('room-storage-console')).toBeUndefined();
  expect(scene.getObjectByName('room-furniture-screen')).toBeUndefined();
  expect(scene.getObjectByName('floor-command-bodies').count).toBe(8);
  const projectionSpy = vi.spyOn(camera, 'updateProjectionMatrix');
  studio.resize(); studio.resize();
  expect(projectionSpy).not.toHaveBeenCalled();
  projectionSpy.mockRestore();
  expect(studio.renderer.setClearColor).toHaveBeenCalledWith(0x000000, 0);
  const shadowFloor = scene.getObjectByName('studio-shadow-floor');
  expect(shadowFloor.material.isShadowMaterial).toBe(true);
  expect(shadowFloor.material.transparent).toBe(true);
  expect(shadowFloor.material.depthWrite).toBe(false);
  expect(shadowFloor.material.opacity).toBe(.28);
  expect(shadowFloor.material.color.getHex()).toBe(0x000000);

  const ids=['blue','mint','orchid','coral'];
  const robots=ids.map(id=>scene.getObjectByName(id==='blue'?'studio-seated-robot':'companion-robot-'+id));
  const chairs=ids.map(id=>scene.getObjectByName(id==='blue'?'gaming-chair':'companion-chair-'+id));
  const furniture=['studio-desk','right-desktop-pc','typing-keyboard','studio-monitor','studio-mouse'].map(name=>scene.getObjectByName(name));
  const visible=object=>{for(let parent=object;parent;parent=parent.parent)if(!parent.visible)return false;return true;};
  const meshes=root=>{const list=[];root.traverse(object=>{if(object.isMesh&&!object.userData.studioContour&&visible(object))list.push(object);});return list;};
  const cache=new Map();
  const exact=(a,b)=>{const key=a.uuid+b.uuid+a.matrixWorld.elements.join(',')+b.matrixWorld.elements.join(',');if(!cache.has(key))cache.set(key,surfacesIntersect(a,b));return cache.get(key);};
  let sampleTime=0;
  const check=(a,b)=>{
    if(!visible(a)||!visible(b)||!penetrates(worldBounds(a),worldBounds(b),.0002))return;
    const left=meshes(a).map(mesh=>({mesh,box:worldBounds(mesh)})),right=meshes(b).map(mesh=>({mesh,box:worldBounds(mesh)}));
    for(const x of left)for(const y of right)if(penetrates(x.box,y.box,.0002))expect(exact(x.mesh,y.mesh),sampleTime+' '+a.name+' / '+b.name+' '+x.mesh.name+' '+x.mesh.geometry.type+' '+x.mesh.position.toArray()+' / '+y.mesh.name+' '+y.mesh.geometry.type+' '+y.mesh.position.toArray()).toBe(false);
  };
  expect(scene.getObjectByName('studio-desk').visible).toBe(false);

  studio.setRunning(true);
  const selected=new Set([...Array.from({length:95},(_,i)=>i*5),450,520,610,730,1000]);
  let blueLooksAtPair=false,pairReplies=false,orangeReplies=false;
  const auto=new Set();
  const start=performance.now();
  for(let frame=0;frame<=1100;frame++){
    tick(start+frame*50);scene.updateMatrixWorld(true);
    if(frame===1)expect(chairs[0].rotation.y).toBeCloseTo(-Math.PI/2);
    if(frame===6)expect(onVisible).toHaveBeenCalledTimes(1);
    if(frame===35){expect(chairs.every(visible)).toBe(true);expect(robots.every(root=>!visible(root))).toBe(true);}
    if(frame===50){expect(robots.every(visible)).toBe(true);robots.forEach(root=>expect(root.parent.name).toMatch(/^entrance-/));}
    if(frame===60) {
      const helmet = robots[0].getObjectByName('studio-robot-head').children.find(object => object.isMesh && object.material.isMeshStandardMaterial);
      expect(helmet.material.transparent).toBe(false);
    }
    if(frame===145)robots.forEach(root=>expect(root.parent.position.length()).toBeLessThan(.00001));
    if(frame>480){
      robots.forEach(root=>{if(root.userData.interactionSource==='autonomous')auto.add(root.userData.robotId);});
      blueLooksAtPair ||= robots[0].getObjectByName('studio-robot-head').rotation.y<-.9;
      pairReplies ||= robots[1].userData.conversation==='pair-reply';
      orangeReplies ||= robots[3].userData.conversation==='orange-reply';
    }
    if(!selected.has(frame))continue;
    sampleTime=frame*.05;
    for(const root of robots){
      if(visible(root))expect(Math.min(...meshes(root).map(mesh=>worldBounds(mesh).min.y))).toBeGreaterThan(-.001);
      for(const object of [...furniture,...chairs])check(root,object);
      for(const other of robots)if(other!==root)check(root,other);
    }
  }
  expect(auto.size).toBe(4);expect(blueLooksAtPair&&pairReplies&&orangeReplies).toBe(true);
  for(const [index,root]of robots.entries()){
    const cushion=worldBounds(chairs[index].getObjectByName('chair-seat-cushion'));
    expect(worldBounds(chairs[index]).min.y).toBeCloseTo(0,5);
    for(const side of [-1,1]){
      expect(worldBounds(root.getObjectByName('seated-sole-'+side)).min.y).toBeGreaterThan(.1);
      expect(worldBounds(root.getObjectByName('seated-thigh-'+side)).min.y).toBeCloseTo(cushion.max.y,3);
    }
  }
  for(const [index,seat]of chairs.entries()){
    const cap=seat.getObjectByName('chair-color-headrest');cap.updateMatrix();cap.geometry.computeBoundingBox();
    const capBox=cap.geometry.boundingBox.clone().applyMatrix4(cap.matrix);
    for(const name of ['chair-back-panel','chair-black-shoulder--1','chair-black-shoulder-1']){
      const panel=seat.getObjectByName(name);panel.updateMatrix();panel.geometry.computeBoundingBox();
      expect(penetrates(capBox,panel.geometry.boundingBox.clone().applyMatrix4(panel.matrix)),name+' overlaps colored headrest').toBe(false);
    }
    const logos=[];seat.traverse(object=>{if(object.name==='companion-chair-eiu-logo')logos.push(object);});
    for(let leg=0;leg<5;leg++){const c=seat.getObjectByName('chair-star-leg-'+leg).material.color;expect(Math.max(c.r,c.g,c.b)).toBeLessThan(.03);}
    expect(logos.length).toBe(index===0?0:2);
    logos.forEach(logo=>expect(logo.material.map.userData.assetPath).toBe('/branding/eiu-logo-uploaded.png'));
    const cushion=seat.getObjectByName('chair-seat-cushion').material;
    const palette=index===0?mainRobotPalette:companionSpecs.find(spec=>spec.id===ids[index]);
    const accent=new THREE.Color(palette.accent).convertSRGBToLinear();
    for(const axis of ['r','g','b'])expect(cushion.color[axis]).toBeCloseTo(accent[axis],8);
    for(const mesh of meshes(seat))if(mesh.material.isMeshStandardMaterial&&mesh.material!==cushion){const c=mesh.material.color;expect(Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b)).toBeLessThan(.09);}
  }
  const keys=scene.getObjectByName('typing-keyboard');
  for(const side of [-1,1]){
    const finger=robots[0].getObjectByName('typing-finger-'+side+'-0');
    const local=keys.worldToLocal(finger.localToWorld(new THREE.Vector3(0,-.0105,-.056)));
    const key=keys.getObjectByName('typing-key-4-'+(side<0?'2':'8'));
    expect(local.y-key.position.y-.008).toBeGreaterThan(.0005);expect(local.y-key.position.y-.008).toBeLessThan(.002);
  }
  for(const width of [390,768,1440]){
    Object.defineProperty(container,'clientWidth',{value:width,configurable:true});studio.resize();
    for(const root of [...robots,...chairs])for(const mesh of meshes(root)){
      mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;
      for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){
        const point=new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(camera);
        expect(Math.abs(point.x),root.name+' '+mesh.name).toBeLessThan(1);expect(Math.abs(point.y),root.name+' '+mesh.name).toBeLessThan(1);
      }
    }
  }

  scene.getObjectByName('studio-composition').traverse(object=>{
    if(!object.isMesh||object.userData.studioContour)return;
    for(const material of Array.isArray(object.material)?object.material:[object.material])if(material.isMeshStandardMaterial&&!material.transparent){expect(material.metalness).toBe(0);expect(material.roughness).toBeGreaterThan(.9);}
  });
  expect(scene.getObjectByName('studio-composition').scale.x).toBe(2);
  const mouse=scene.getObjectByName('studio-mouse');expect(mouse.position.x-keys.position.x).toBeCloseTo(.39);
  studio.setModuleInteraction({id:'about',mode:'hover'});
  tick(start+55050);
  expect(robots[0].userData.moduleId).toBe('about');
  expect(robots[0].userData.emotion).toBe('curious');
  expect(robots.slice(1).every(root=>!root.userData.moduleId)).toBe(true);
  studio.setModuleInteraction({id:'register',mode:'active'});
  tick(start+55100);
  expect(robots[2].userData.moduleId).toBe('register');
  expect(robots[2].userData.interactionSource).toBe('module');
  expect(robots[0].userData.moduleId).toBeNull();
  studio.setModuleInteraction(null);
  expect(robots.every(root=>!root.userData.moduleId)).toBe(true);
  const raycasts = vi.spyOn(THREE.Raycaster.prototype,'intersectObjects');
  for(let event=0;event<40;event++)window.dispatchEvent(new MouseEvent('pointermove',{clientX:130+event,clientY:310}));
  expect(raycasts).not.toHaveBeenCalled();
  tick(start+55150);
  expect(raycasts).toHaveBeenCalledTimes(1);
  raycasts.mockRestore();
  const reference=createRobotStudio(container,{useBakedBounds:false});
  for(const root of robots.slice(1)){
    const baked=root.userData.poseBounds;
    const full=reference.scene.getObjectByName(root.name).userData.poseBounds;
    expect(baked.baked).toBe(true);expect(full.baked).toBe(false);expect(full.signature).toBe(baked.signature);
    for(const side of ['min','max'])full[side].forEach((value,index)=>expect(value).toBeCloseTo(baked[side][index],9));
  }
  reference.dispose();
  let staged, setupError;
  const stagedStart = performance.now();
  const pending = createRobotStudio(container, { incremental: true }).then(engine => { staged = engine; }, error => { setupError = error; });
  for (let i = 0; i < 80 && !staged && !setupError; i++) {
    tick(performance.now());
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  await pending;
  if (setupError) throw setupError;
  expect(staged.scene.getObjectByName('floor-command-bodies').count).toBe(8);
  expect(staged.startupMetrics.longestSetupStageMs).toBeGreaterThan(0);
  if (process.env.STUDIO_PROFILE === '1') console.log('STUDIO_STAGED_PROFILE', JSON.stringify({ wallMs: Math.round(performance.now() - stagedStart), longestCpuStageMs: Math.round(staged.startupMetrics.longestSetupStageMs), stages: staged.startupMetrics }));
  staged.dispose();
  studio.dispose();vi.restoreAllMocks();vi.unstubAllGlobals();
},60000);
