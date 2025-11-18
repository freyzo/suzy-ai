// VRM loader utilities (converted from Vue to React)
let loader: any = null;

export function useVRMLoader(): any {
  if (loader) {
    return loader;
  }

  try {
    // Dynamically import VRM dependencies to prevent breaking if not available
    const { VRMLoaderPlugin } = require('@pixiv/three-vrm');
    const { VRMAnimationLoaderPlugin } = require('@pixiv/three-vrm-animation');
    const { GLTFLoader } = require('three/addons/loaders/GLTFLoader.js');

    loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';
    loader.register((parser: any) => new VRMLoaderPlugin(parser));
    loader.register((parser: any) => new VRMAnimationLoaderPlugin(parser));

    return loader;
  } catch (error) {
    console.error('Failed to initialize VRM loader:', error);
    throw new Error('VRM dependencies not available');
  }
}

