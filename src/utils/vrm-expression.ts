// VRM expression/emotion system (extracted from airi)
// Source: airi/packages/stage-ui/src/composables/vrm/expression.ts

interface EmotionState {
  expression?: {
    name: string;
    value: number;
    duration?: number;
    curve?: (t: number) => number;
  }[];
  blendDuration?: number;
}

export function useVRMEmote(vrm: any) {
  let currentEmotion: string | null = null;
  let isTransitioning = false;
  let transitionProgress = 0;
  const currentExpressionValues = new Map<string, number>();
  const targetExpressionValues = new Map<string, number>();
  let resetTimeout: NodeJS.Timeout | null = null;

  // Utility functions
  const lerp = (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
  };

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  };

  // Emotion states definition
  const emotionStates = new Map<string, EmotionState>([
    ['happy', {
      expression: [
        { name: 'happy', value: 1.0, duration: 0.3 },
        { name: 'aa', value: 0.3 },
      ],
      blendDuration: 0.3,
    }],
    ['sad', {
      expression: [
        { name: 'sad', value: 1.0 },
        { name: 'oh', value: 0.2 },
      ],
      blendDuration: 0.3,
    }],
    ['angry', {
      expression: [
        { name: 'angry', value: 1.0 },
        { name: 'ee', value: 0.4 },
      ],
      blendDuration: 0.2,
    }],
    ['surprised', {
      expression: [
        { name: 'Surprised', value: 1.0 },
        { name: 'oh', value: 0.6 },
      ],
      blendDuration: 0.1,
    }],
    ['neutral', {
      expression: [
        { name: 'neutral', value: 1.0 },
      ],
      blendDuration: 0.5,
    }],
  ]);

  const clearResetTimeout = () => {
    if (resetTimeout) {
      clearTimeout(resetTimeout);
      resetTimeout = null;
    }
  };

  const setEmotion = (emotionName: string) => {
    clearResetTimeout();

    if (!emotionStates.has(emotionName)) {
      console.warn(`Emotion ${emotionName} not found`);
      return;
    }

    const emotionState = emotionStates.get(emotionName)!;
    currentEmotion = emotionName;
    isTransitioning = true;
    transitionProgress = 0;

    // Reset all existing expressions to 0 first
    if (vrm?.expressionManager) {
      // Get all expression names from the VRM model
      const expressionNames = Object.keys(vrm.expressionManager.expressionMap);
      for (const name of expressionNames) {
        vrm.expressionManager.setValue(name, 0);
      }
    }

    // Store current expression values as starting point
    currentExpressionValues.clear();
    targetExpressionValues.clear();

    // Store all current expression values
    for (const expr of emotionState.expression || []) {
      const currentValue = vrm?.expressionManager?.getValue(expr.name) || 0;
      currentExpressionValues.set(expr.name, currentValue);
      targetExpressionValues.set(expr.name, expr.value);
    }
  };

  const setEmotionWithResetAfter = (emotionName: string, ms: number) => {
    clearResetTimeout();
    setEmotion(emotionName);

    // Set timeout to reset to neutral
    resetTimeout = setTimeout(() => {
      setEmotion('neutral');
      resetTimeout = null;
    }, ms);
  };

  const update = (deltaTime: number) => {
    if (!isTransitioning || !currentEmotion) return;

    const emotionState = emotionStates.get(currentEmotion);
    if (!emotionState) return;

    const blendDuration = emotionState.blendDuration || 0.3;

    transitionProgress += deltaTime / blendDuration;
    if (transitionProgress >= 1.0) {
      transitionProgress = 1.0;
      isTransitioning = false;
    }

    // Update all expressions
    for (const [exprName, targetValue] of targetExpressionValues) {
      const startValue = currentExpressionValues.get(exprName) || 0;
      const currentValue = lerp(
        startValue,
        targetValue,
        easeInOutCubic(transitionProgress),
      );
      vrm?.expressionManager?.setValue(exprName, currentValue);
    }
  };

  const addEmotionState = (emotionName: string, state: EmotionState) => {
    emotionStates.set(emotionName, state);
  };

  const removeEmotionState = (emotionName: string) => {
    emotionStates.delete(emotionName);
  };

  // Cleanup function
  const dispose = () => {
    clearResetTimeout();
  };

  return {
    currentEmotion: () => currentEmotion,
    isTransitioning: () => isTransitioning,
    setEmotion,
    setEmotionWithResetAfter,
    update,
    addEmotionState,
    removeEmotionState,
    dispose,
  };
}


