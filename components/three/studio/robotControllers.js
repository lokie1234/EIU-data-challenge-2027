import * as THREE from 'three-studio';
import { drawRobotFace } from './robotExpressions';
import { getConversationCue, presentationYaw } from './studioConversation';

/**
 * Creates an independent controller for a single robot character.
 * Guarantees zero cross-robot state leakage.
 */
export function createRobotController({
  id,
  root,
  head,
  torso,
  leftShoulder,
  leftElbow,
  leftWrist,
  rightShoulder,
  rightElbow,
  rightWrist,
  face,
  baseRotation = { x: 0, y: 0, z: 0 },
  actionDuration = 2.4,
}) {
  let state = 'idle'; // 'idle' | 'hover' | 'action'
  let isHovered = false;
  let hoverFactor = 0;
  let actionTimer = 0;
  let lastEmotion = '';
  let lastGaze = 0;
  let clock = 0;
  let lastUserTime = -Infinity;
  const autonomousPhase = { blue: 0, coral: 3.5, mint: 7, orchid: 9.5 }[id] ?? 0;
  let nextAutonomousAt = autonomousPhase;

  function beginAction(source) {
    state = 'action';
    actionTimer = 0;
    root.userData.interactionSource = source;
  }

  function onHover(hovered, { interrupt = false } = {}) {
    if (!!hovered !== isHovered || hovered) lastUserTime = clock;
    isHovered = !!hovered;
    if (interrupt && isHovered) { state = 'hover'; actionTimer = 0; }
    if (state !== 'action') {
      state = isHovered ? 'hover' : 'idle';
    }
  }

  function onClick() {
    lastUserTime = clock;
    nextAutonomousAt = clock + 16;
    beginAction('user');
  }

  function update(time, delta, pointer = { x: 0, y: 0 }, customUpdate = null, samplePose = false) {
    clock = time;
    // Coordinated recurring cues keep the group alive without pointer input.
    // User interactions take priority, followed by a quiet six-second interval.
    if (!isHovered && state !== 'action' && time - lastUserTime >= 6 && time >= nextAutonomousAt) {
      beginAction('autonomous');
      nextAutonomousAt = time + 16;
    }
    const px = Math.max(-1, Math.min(1, pointer?.x || 0));
    const py = Math.max(-1, Math.min(1, pointer?.y || 0));

    // Smooth hover factor lerping
    const targetHover = (state === 'hover' || isHovered) ? 1.0 : 0.0;
    hoverFactor += (targetHover - hoverFactor) * Math.min(1, delta * 9);

    // Update Action State Machine
    if (state === 'action') {
      actionTimer += delta;
      if (actionTimer >= actionDuration) {
        state = isHovered ? 'hover' : 'idle';
        actionTimer = 0;
      }
    }

    const actionProgress = state === 'action' ? Math.min(1, actionTimer / actionDuration) : 0;
    let emotion = 'focused';
    let gaze = 0;

    // Call individual personality logic:
    if (id === 'blue') {
      // BLUE ROBOT — THE CODER
      // Base orientation facing curved monitor screen
      const baseHeadYaw = 0.52;
      const baseHeadPitch = -0.08;

      if (state === 'action') {
        const u = actionProgress;
        if (u < 0.35) {
          // Greet user
          const p = u / 0.35;
          const ease = p * p * (3 - 2 * p);
          head.rotation.set(
            baseHeadPitch + ease * 0.08,
            baseHeadYaw + ease * 0.32,
            ease * 0.04
          );
          emotion = 'happy';
          gaze = 0.1;
        } else if (u < 0.85) {
          // Intense coding flurry
          head.rotation.set(
            baseHeadPitch + Math.sin(time * 16) * 0.04,
            baseHeadYaw + Math.sin(time * 8) * 0.03,
            0
          );
          emotion = 'focused';
          gaze = Math.sin(time * 12) * 0.15;
        } else {
          // Settle back to idle
          const p = (u - 0.85) / 0.15;
          head.rotation.set(
            baseHeadPitch,
            baseHeadYaw,
            0
          );
          emotion = 'attentive';
        }
      } else if (hoverFactor > 0.01) {
        // Hover: slowly turns head toward pointer
        head.rotation.set(
          baseHeadPitch * (1 - hoverFactor) + (-0.02 - py * 0.05) * hoverFactor,
          baseHeadYaw * (1 - hoverFactor) + (0.75 + px * 0.15) * hoverFactor,
          0.05 * hoverFactor
        );
        torso.rotation.set(0.02, 0.02 * hoverFactor, 0);
        emotion = 'curious';
        gaze = px * 0.25;
      } else {
        // Idle: natural typing glance between keyboard and monitor
        head.rotation.set(
          baseHeadPitch + Math.sin(time * 2.1) * 0.025 - py * 0.03,
          baseHeadYaw + Math.sin(time * 0.7) * 0.05 + px * 0.04,
          Math.sin(time * 0.85) * 0.02
        );
        torso.rotation.set(Math.sin(time * 2.2) * 0.01 + 0.02, 0, 0);
        emotion = 'focused';
        gaze = 0;
      }
    } else if (id === 'coral' || id === 'orange') {
      // ORANGE ROBOT — THE ANALYST
      // Base orientation standing rear-left, looking at monitor charts
      const baseYaw = baseRotation.y || -2.80;
      const basePitch = 0.18;

      if (state === 'action') {
        const u = actionProgress;
        if (u < 0.25) {
          // Pointing toward monitor charts
          const p = u / 0.25;
          const ease = p * p * (3 - 2 * p);
          head.rotation.set(basePitch - ease * 0.06, -0.15 * ease, 0);
          torso.rotation.set(0.06 * ease, 0.12 * ease, 0);
          rightShoulder.rotation.set(0.68 * ease, 0.38 * ease, 0.38 * ease);
          rightElbow.rotation.set(-0.25 * ease, 0, 0);
          leftShoulder.rotation.set(0.12, 0, -0.16);
          emotion = 'happy';
          gaze = 0.3;
        } else if (u < 0.75) {
          // Emphatic chart presentation
          head.rotation.set(basePitch - 0.06 + Math.sin(time * 4) * 0.02, -0.15, 0);
          torso.rotation.set(0.06, 0.12, 0);
          rightShoulder.rotation.set(0.68 + Math.sin(time * 5) * 0.03, 0.38, 0.38);
          emotion = 'happy';
          gaze = 0.35;
        } else {
          // Return to stance
          const p = (u - 0.75) / 0.25;
          const ease = 1 - p * p * (3 - 2 * p);
          head.rotation.set(basePitch, -0.15 * ease, 0);
          torso.rotation.set(0.06 * ease, 0.12 * ease, 0);
          rightShoulder.rotation.set(0.18 + 0.50 * ease, 0, 0.18 + 0.20 * ease);
          emotion = 'attentive';
          gaze = 0;
        }
      } else if (hoverFactor > 0.01) {
        // Hover: Inquisitive head tilt toward pointer, raising hand slightly
        head.rotation.set(
          basePitch - py * 0.12 * hoverFactor,
          (0.28 + px * 0.22) * hoverFactor,
          0.08 * hoverFactor
        );
        torso.rotation.set(0.04, 0.05 * hoverFactor, 0);
        rightShoulder.rotation.set(
          0.18 + 0.20 * hoverFactor,
          0.1 * hoverFactor,
          0.18 + 0.15 * hoverFactor
        );
        leftShoulder.rotation.set(0.12, 0, -0.16);
        emotion = 'curious';
        gaze = px * 0.3;
      } else {
        // Idle: observing charts on monitor with slight thoughtful sway
        head.rotation.set(
          basePitch + Math.sin(time * 1.1) * 0.025,
          Math.sin(time * 0.6) * 0.03,
          0.04 + Math.sin(time * 0.8) * 0.02
        );
        torso.rotation.set(0.04 + Math.sin(time * 0.9) * 0.01, 0, 0);
        rightShoulder.rotation.set(0.18, 0, 0.18 + Math.sin(time * 1.2) * 0.02);
        leftShoulder.rotation.set(0.12, 0, -0.16 + Math.sin(time * 0.8) * 0.015);
        emotion = 'attentive';
        gaze = 0.1;
      }
    } else if (id === 'orchid' || id === 'pink') {
      // PINK ROBOT — THE CREATIVE
      const basePitch = 0.18;

      if (state === 'action') {
        const u = actionProgress;
        if (u < 0.80) {
          // Playful two-part waving & bounce
          const wavePhase = Math.sin(time * 12);
          rightShoulder.rotation.set(0.15, 0, 1.75 + wavePhase * 0.15);
          rightElbow.rotation.set(-0.35 + wavePhase * 0.20, 0, 0);
          leftShoulder.rotation.set(0.12, 0, -0.16);
          head.rotation.set(basePitch - 0.04, Math.sin(time * 6) * 0.08, -0.08 + wavePhase * 0.05);

          // Cheerful bounce:
          const bounce = Math.sin(u * Math.PI * 4) * 0.035 * Math.exp(-u * 2);
          root.position.y = Math.max(0, bounce);
          emotion = 'happy';
          gaze = wavePhase * 0.2;
        } else {
          // Lower arm and settle
          const p = (u - 0.80) / 0.20;
          const ease = 1 - p * p * (3 - 2 * p);
          rightShoulder.rotation.set(0.14 + 1.61 * ease, 0, 0.18 + 1.57 * ease);
          rightElbow.rotation.set(-0.35 * ease, 0, 0);
          head.rotation.set(basePitch, 0, 0);
          root.position.y = 0;
          emotion = 'happy';
          gaze = 0;
        }
      } else if (hoverFactor > 0.01) {
        // Hover: Playful head tilt, mini-wave with left hand
        head.rotation.set(
          basePitch - py * 0.10 * hoverFactor,
          (0.20 + px * 0.20) * hoverFactor,
          -0.12 * hoverFactor
        );
        torso.rotation.set(0.03, -0.04 * hoverFactor, 0);
        leftShoulder.rotation.set(
          0.12 + 0.20 * hoverFactor,
          0,
          -0.16 - 0.35 * hoverFactor
        );
        rightShoulder.rotation.set(0.14, 0, 0.18);
        root.position.y = 0;
        emotion = 'happy';
        gaze = px * 0.25;
      } else {
        // Idle: gentle cheerful side-to-side head sway
        head.rotation.set(
          basePitch + Math.sin(time * 0.8) * 0.02,
          Math.sin(time * 0.45) * 0.04,
          -0.04 + Math.sin(time * 0.9) * 0.025
        );
        torso.rotation.set(0.03 + Math.sin(time * 0.7) * 0.01, 0, 0);
        leftShoulder.rotation.set(0.12, 0, -0.16 + Math.sin(time * 0.7) * 0.015);
        rightShoulder.rotation.set(0.14, 0, 0.18 + Math.cos(time * 0.7) * 0.015);
        root.position.y = 0;
        emotion = 'attentive';
        gaze = 0;
      }
    } else if (id === 'mint' || id === 'green') {
      // GREEN ROBOT — THE TECHNICIAN
      const basePitch = -0.15;

      if (state === 'action') {
        const u = actionProgress;
        if (u < 0.25) {
          // Turn toward PC case for diagnostic inspection
          const p = u / 0.25;
          const ease = p * p * (3 - 2 * p);
          head.rotation.set(0.05 * ease, 0.65 * ease, 0);
          torso.rotation.set(0.04, 0.45 * ease, 0);
          rightShoulder.rotation.set(0.40 * ease, 0.25 * ease, 0.28 * ease);
          leftShoulder.rotation.set(0.40 * ease, -0.20 * ease, -0.25 * ease);
          emotion = 'focused';
          gaze = 0;
        } else if (u < 0.75) {
          // Diagnostic scanning of PC components
          const scanTime = (u - 0.25) / 0.50;
          head.rotation.set(0.05 + Math.sin(scanTime * Math.PI * 4) * 0.03, 0.65, 0);
          torso.rotation.set(0.04, 0.45, 0);
          rightShoulder.rotation.set(0.42 + Math.sin(time * 6) * 0.04, 0.25, 0.28);
          leftShoulder.rotation.set(0.42 - Math.sin(time * 6) * 0.04, -0.20, -0.25);
          emotion = 'focused';
          gaze = Math.sin(time * 7) * 0.35; // horizontal scanning visor eyes
        } else {
          // Nod of approval and turn back to monitor
          const p = (u - 0.75) / 0.25;
          const ease = 1 - p * p * (3 - 2 * p);
          head.rotation.set(basePitch * (1 - ease) + 0.08 * ease, 0.65 * ease, 0);
          torso.rotation.set(0.04, 0.45 * ease, 0);
          rightShoulder.rotation.set(0.10 + 0.32 * ease, 0, 0.12 + 0.16 * ease);
          leftShoulder.rotation.set(0.08 + 0.34 * ease, 0, -0.12 - 0.13 * ease);
          emotion = 'happy';
          gaze = 0;
        }
      } else if (hoverFactor > 0.01) {
        // Hover: Technical salute acknowledgment toward pointer
        head.rotation.set(
          basePitch - py * 0.12 * hoverFactor,
          (0.20 + px * 0.18) * hoverFactor,
          0
        );
        torso.rotation.set(0.04, 0.05 * hoverFactor, 0);
        rightShoulder.rotation.set(
          0.10 + 0.35 * hoverFactor,
          0,
          0.12 + 0.25 * hoverFactor
        );
        leftShoulder.rotation.set(0.08, 0, -0.12);
        emotion = 'attentive';
        gaze = px * 0.25;
      } else {
        // Idle: alternating observant gaze between monitor and PC case
        const pcGlance = Math.sin(time * 0.35);
        const glanceYaw = pcGlance > 0.65 ? (pcGlance - 0.65) * 0.8 : 0;
        head.rotation.set(
          basePitch + Math.sin(time * 0.8) * 0.02,
          glanceYaw + Math.sin(time * 0.6) * 0.03,
          -0.03
        );
        torso.rotation.set(0.04, glanceYaw * 0.3, 0);
        rightShoulder.rotation.set(0.10, 0, 0.12 + Math.sin(time * 0.85) * 0.015);
        leftShoulder.rotation.set(0.08, 0, -0.12 + Math.sin(time * 0.85) * 0.015);
        emotion = glanceYaw > 0.1 ? 'attentive' : 'focused';
        gaze = 0;
      }
    }

    if (customUpdate) {
      customUpdate({ state, hoverFactor, actionProgress, time, delta });
    }

    // Keep the original companion headings; BLUE turns away from the monitor
    // only during a conversation, revealing the display naturally in profile.
    const cue = getConversationCue(time);
    if (id !== 'blue') {
      // Rest the hands forward of the seat, inside the chair armrests.
      leftShoulder.rotation.set(1.1, 0, .22);
      leftElbow.rotation.set(-.5, 0, 0);
      leftWrist.rotation.set(0, 0, 0);
      rightShoulder.rotation.set(1.1, 0, -.22);
      rightElbow.rotation.set(-.5, 0, 0);
      rightWrist.rotation.set(0, 0, 0);
      if (id === 'mint' || id === 'orchid') torso.rotation.set(.025, 0, 0);
    }
    if (!isHovered && time - lastUserTime >= 6) {
      root.userData.conversation = cue.pairShake > .1 ? 'pair-reply' : cue.orangePoint > .1 ? 'orange-reply' : 'listening';
      if (id === 'blue') {
        head.rotation.y = presentationYaw.blue - 1.72 * cue.pairLook - .67 * cue.orangeLook;
        head.rotation.x = -.06 + Math.sin(time * 2) * .015;
        emotion = cue.pairLook > .2 ? 'curious' : cue.orangeLook > .2 ? 'attentive' : 'focused';
        gaze = -.22 * cue.pairLook + .25 * cue.orangeLook;
      } else if (id === 'mint' || id === 'orchid') {
        const phase = id === 'mint' ? 0 : .35;
        head.rotation.y = presentationYaw[id] + Math.sin(time * 7 + phase) * .22 * cue.pairShake;
        head.rotation.z = Math.sin(time * 7 + phase) * .045 * cue.pairShake;
        head.rotation.x = .06;
        if (cue.pairShake > .1) { emotion = 'happy'; gaze = id === 'mint' ? .16 : -.16; }
      } else if (id === 'coral' && cue.orangePoint > 0) {
        const u = cue.orangePoint;
        rightShoulder.rotation.set(1.1 - .75 * u, .12 * u, -.22 + 2.3 * u);
        rightElbow.rotation.set(-.5 + .22 * u, 0, .65 * u);
        rightWrist.rotation.set(.7 * u, 0, -.2 * u);
        head.rotation.y = presentationYaw.coral + 1.15 * u;
        emotion = 'happy'; gaze = -.18;
      }
    }
    root.userData.emotion = emotion;

    // Update visor display if emotion or gaze changed or periodic refresh
    if (!samplePose && face && (!face.lastPaint || time - face.lastPaint > 0.08 || emotion !== lastEmotion || Math.abs(gaze - lastGaze) > 0.05)) {
      drawRobotFace(face.ctx, time, emotion, gaze);
      if (face.texture) face.texture.needsUpdate = true;
      face.lastPaint = time;
      lastEmotion = emotion;
      lastGaze = gaze;
    }
  }

  return {
    id,
    root,
    head,
    torso,
    leftShoulder,
    rightShoulder,
    onHover,
    onClick,
    update,
    reset() {
      state = 'idle'; isHovered = false; hoverFactor = 0; actionTimer = 0;
      clock = 0; lastUserTime = -Infinity; nextAutonomousAt = autonomousPhase;
      root.userData.interactionSource = null;
    },
    getState: () => state,
    isHovered: () => isHovered,
  };
}

