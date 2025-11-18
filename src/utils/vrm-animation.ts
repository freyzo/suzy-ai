// VRM animation utilities (converted from Vue to React)
import { Object3D, Vector3 } from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';

import { useVRMLoader } from './vrm-loader';

export interface GLTFUserdata extends Record<string, any> {
  vrmAnimations: any[];
}

export async function loadVRMAnimation(url: string): Promise<any | undefined> {
  try {
    const loader = useVRMLoader();

    // Load VRM Animation .vrma file
    const gltf = await loader.loadAsync(url);

    const userData = gltf.userData as GLTFUserdata;
    if (!userData.vrmAnimations) {
      console.warn('No VRM animations found in the .vrma file');
      return;
    }
    if (userData.vrmAnimations.length === 0) {
      console.warn('No VRM animations found in the .vrma file');
      return;
    }

    return userData.vrmAnimations[0];
  } catch (error) {
    console.warn('Failed to load VRM animation:', error);
    return undefined;
  }
}

export async function clipFromVRMAnimation(
  vrm?: any,
  animation?: any
): Promise<any> {
  if (!vrm) {
    console.warn('No VRM found');
    return;
  }
  if (!animation) {
    return;
  }

  try {
    // Dynamically import VRM animation utilities
    const { createVRMAnimationClip } = require('@pixiv/three-vrm-animation');
    // Create animation clip
    return createVRMAnimationClip(animation, vrm);
  } catch (error) {
    console.warn('Failed to create VRM animation clip:', error);
    return undefined;
  }
}

export function useBlink() {
  /**
   * Eye blinking animation
   */
  let isBlinking = false;
  let blinkProgress = 0;
  let timeSinceLastBlink = 0;
  const BLINK_DURATION = 0.2; // Duration of a single blink in seconds
  const MIN_BLINK_INTERVAL = 1; // Minimum time between blinks
  const MAX_BLINK_INTERVAL = 6; // Maximum time between blinks
  let nextBlinkTime = Math.random() * (MAX_BLINK_INTERVAL - MIN_BLINK_INTERVAL) + MIN_BLINK_INTERVAL;

  // Function to handle blinking animation
  function update(vrm: any | undefined, delta: number) {
    if (!vrm?.expressionManager) return;

    timeSinceLastBlink += delta;

    // Check if it's time for next blink
    if (!isBlinking && timeSinceLastBlink >= nextBlinkTime) {
      isBlinking = true;
      blinkProgress = 0;
    }

    // Handle blinking animation
    if (isBlinking) {
      blinkProgress += delta / BLINK_DURATION;

      // Calculate blink value using sine curve for smooth animation
      const blinkValue = Math.sin(Math.PI * blinkProgress);

      // Apply blink expression
      vrm.expressionManager.setValue('blink', blinkValue);

      // Reset blink when animation is complete
      if (blinkProgress >= 1) {
        isBlinking = false;
        timeSinceLastBlink = 0;
        vrm.expressionManager.setValue('blink', 0); // Reset blink value to 0
        nextBlinkTime = Math.random() * (MAX_BLINK_INTERVAL - MIN_BLINK_INTERVAL) + MIN_BLINK_INTERVAL;
      }
    }
  }

  return { update };
}

/**
 * This is to simulate idle eye saccades in a *pretty* naive way.
 */
export function useIdleEyeSaccades() {
  let nextSaccadeAfter = -1;
  const fixationTarget = new Vector3();
  let timeSinceLastSaccade = 0;

  // Just a naive vector generator - Simulating random content on a 27in monitor at 65cm distance
  function updateFixationTarget(lookAtTarget: { x: number; y: number; z: number }) {
    fixationTarget.set(
      lookAtTarget.x + randFloat(-0.25, 0.25),
      lookAtTarget.y + randFloat(-0.25, 0.25),
      lookAtTarget.z,
    );
  }

  // Function to handle idle eye saccades
  function update(
    vrm: any | undefined,
    lookAtTarget: { x: number; y: number; z: number },
    delta: number
  ) {
    if (!vrm?.expressionManager || !vrm.lookAt) return;

    if (timeSinceLastSaccade >= nextSaccadeAfter) {
      updateFixationTarget(lookAtTarget);
      timeSinceLastSaccade = 0;
      nextSaccadeAfter = (Math.random() * 2000 + 1000) / 1000; // Random interval between 1-3 seconds
    } else if (!fixationTarget) {
      updateFixationTarget(lookAtTarget);
    }

    if (!vrm.lookAt.target) {
      vrm.lookAt.target = new Object3D();
    }

    vrm.lookAt.target.position.lerp(fixationTarget!, 1);
    vrm.lookAt?.update(delta);

    timeSinceLastSaccade += delta;
  }

  function instantUpdate(vrm: any | undefined, lookAtTarget: { x: number; y: number; z: number }) {
    fixationTarget.set(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
    if (!vrm?.expressionManager || !vrm.lookAt) return;
    if (!vrm.lookAt.target) {
      vrm.lookAt.target = new Object3D();
    }
    vrm.lookAt.target.position.lerp(fixationTarget!, 1);
    vrm.lookAt?.update(0.016);
  }

  return { update, instantUpdate };
}

