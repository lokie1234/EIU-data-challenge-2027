import * as THREE from 'three-studio';
import gsap from 'gsap';
import { createWalkingRig } from './studioLocomotion';
import { poseTypingArm } from './studioRig';

export const STUDIO_ENTRANCE_DURATION = 7.4;
export const BLUE_SEATED_AT = 7;
const ease = value => { const u=Math.max(0,Math.min(1,value));return u*u*(3-2*u); };

export function createStudioEntrance({primary,blue,chair,companions,shoulders,elbows,wrists,legs,fingers,keys,keyboard}) {
  const timeline=gsap.timeline({paused:true}), actors=[], clones=new Set(), sequences=[];
  let restored=false, complete=false;
  const fade=(root,start,duration)=>{
    const actor={root,reveal:0,meshes:[],materials:[]},cache=new Map();
    root.traverse(mesh=>{
      if(!mesh.isMesh)return;
      const original=mesh.material;
      const convert=source=>{
        if(cache.has(source))return cache.get(source);
        const material=source.clone();material.transparent=true;
        material.onBeforeCompile=source.onBeforeCompile;
        material.customProgramCacheKey=source.customProgramCacheKey;
        cache.set(source,material);clones.add(material);actor.materials.push({material,source});return material;
      };
      mesh.material=Array.isArray(original)?original.map(convert):convert(original);
      actor.meshes.push({mesh,original});
    });
    timeline.to(actor,{reveal:1,duration,ease:'power2.out'},start);actors.push(actor);
  };
  primary.children.filter(object=>object!==blue&&object!==chair).forEach((object,index)=>fade(object,Math.min(index*.15,.7),1.1));
  const seatedPieces=parent=>parent.children.filter(object=>object.name.startsWith('seated-')||object.name.startsWith('dangling-leg')||(object.isMesh&&object.position.y===.025&&object.position.z===-.34));
  const makeSequence=({root,seat,body,arms,joints,hands,seatedLegs,materials,yaw,scale,start,id})=>{
    const wrapper=new THREE.Group();wrapper.name='entrance-'+id;
    root.parent.add(wrapper);wrapper.add(root);
    const walkingRig=createWalkingRig(body,materials,id), walk=walkingRig.group;
    const seated=seatedPieces(body);
    fade(root,start,.28);fade(seat,.2+sequences.length*.12,.9);
    const rotate=(x,z)=>new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),yaw).multiplyScalar(scale);
    const direction=id==='mint'?-1:1;
    const outside=rotate(direction*1.2,5.5),approach=rotate(direction*.88,.16),onSeat=rotate(direction*.16,.16);
    const walkY=.426*root.scale.y-root.position.y;
    timeline.set(wrapper.position,{x:outside.x,y:walkY,z:outside.z},0);
    timeline.set(seat.rotation,{y:yaw-direction*Math.PI/2},0);
    timeline.to(wrapper.position,{x:approach.x,z:approach.z,duration:2.2,ease:'power1.inOut'},start);
    timeline.to(wrapper.position,{y:.16*scale,duration:.8,ease:'power2.out'},start+2.2);
    timeline.to(wrapper.position,{x:onSeat.x,z:onSeat.z,duration:.6,ease:'power2.inOut'},start+3);
    timeline.to(wrapper.position,{y:0,duration:.5,ease:'power2.in'},start+3.6);
    const swivel={angle:-direction*Math.PI/2};
    timeline.to(swivel,{angle:0,duration:.9,ease:'power2.inOut'},start+4.1);
    timeline.to(seat.rotation,{y:yaw,duration:.9,ease:'power2.inOut'},start+4.1);
    sequences.push({root,wrapper,walk,walkingRig,seated,arms,joints,hands,seatedLegs,swivel,rotate,yaw,start,id,direction,arrived:start+5});
  };
  makeSequence({root:blue,seat:chair,body:blue,arms:shoulders,joints:elbows,hands:wrists,seatedLegs:legs,materials:{whitePlastic:blue.getObjectByName('seated-shin--1').material,orangePlastic:blue.getObjectByName('seated-boot--1').material,greyAlloy:blue.getObjectByName('seated-shin--1').material,darkMetal:blue.getObjectByName('seated-sole--1').material},yaw:0,scale:1,start:2,id:'blue'});
  const starts={mint:2,orchid:2,coral:2};
  for(const rig of companions.rigs)makeSequence({root:rig.root,seat:rig.chair,body:rig.masterBody.torso.parent,arms:rig.arms,joints:[rig.masterBody.leftElbow,rig.masterBody.rightElbow],hands:[rig.masterBody.leftWrist,rig.masterBody.rightWrist],seatedLegs:rig.masterBody.legs,materials:rig.materials,yaw:rig.root.rotation.y,scale:rig.chairScale,start:starts[rig.id],id:rig.id});
  timeline.to({},{duration:.4},7);
  const restore=()=>{
    if(restored)return;
    actors.forEach(actor=>actor.meshes.forEach(({mesh,original})=>{mesh.material=original;}));
    clones.forEach(material=>material.dispose());clones.clear();
    sequences.forEach(sequence=>{
      sequence.walkingRig.dispose();
    });
    restored=true;
  };
  return {
    update(time){
      if(complete)return;
      timeline.time(Math.min(time,STUDIO_ENTRANCE_DURATION),false);
      actors.forEach(actor=>{
        if(actor.completed)return;
        actor.root.visible=actor.reveal>.001;
        if(actor.reveal>=1){
          actor.meshes.forEach(({mesh,original})=>{mesh.material=original;});
          actor.materials.forEach(({material})=>{clones.delete(material);material.dispose();});
          actor.materials.length=0;actor.completed=true;return;
        }
        if(actor.lastReveal===actor.reveal)return;
        actor.lastReveal=actor.reveal;
        actor.materials.forEach(({material,source})=>{
            material.color?.copy(source.color);material.opacity=source.opacity*actor.reveal;
            if(material.uniforms?.opacity)material.uniforms.opacity.value=source.uniforms.opacity.value*actor.reveal;
        });
      });
      for(const sequence of sequences){
        const {root,walk,walkingRig,seated,arms,joints,hands,seatedLegs,yaw,start,id,direction,arrived,swivel,wrapper,rotate}=sequence;
        const walking=time<start+2.2;
        const onFeet=time<start+3;
        walk.visible=onFeet;seated.forEach(object=>{object.visible=!onFeet;});
        if(time>=arrived){root.rotation.y=yaw;wrapper.position.set(0,0,0);continue;}
        seatedLegs.forEach(leg=>leg.rotation.set(0,0,0));
        if(walking){root.rotation.y=yaw+direction*.06;walkingRig.update(time);}
        else if(time<start+4.1){
          root.rotation.y=yaw+direction*.06+ease((time-start-2.2)/.8)*(-direction*Math.PI/2-direction*.06);
          if(onFeet)walkingRig.update(time,(time-start-2.2)/.8);
        }
        else{
          root.rotation.y=yaw+swivel.angle;
          const offset=rotate(-Math.sin(swivel.angle)*.16,.16*(1-Math.cos(swivel.angle)));
          wrapper.position.x=offset.x;wrapper.position.z=offset.z;
        }
        const head=root.getObjectByName(id==='blue'?'studio-robot-head':'companion-head-'+id);
        if(head){head.rotation.set(-.04+Math.sin(time*4)*.012,0,Math.sin(time*3)*.008);}
        arms.forEach((arm,index)=>arm.rotation.set(walking?Math.sin(time*8+index*Math.PI)*.35:1.15,0,walking?(index?.15:-.15):(index?-.20:.20)));
        joints.forEach(joint=>joint.rotation.set(walking?-.5:-.30,0,0));hands.forEach(hand=>hand.rotation.set(0,0,0));
        if(root===blue&&time>=start+4.1){
          poseTypingArm(blue,arms[0],joints[0],hands[0],fingers[0],-1,time,keys,keyboard);
          poseTypingArm(blue,arms[1],joints[1],hands[1],fingers[1],1,time,keys,keyboard);
        }
      }
      if(time>=STUDIO_ENTRANCE_DURATION){restore();complete=true;}
    },
    dispose(){timeline.kill();restore();},
  };
}



