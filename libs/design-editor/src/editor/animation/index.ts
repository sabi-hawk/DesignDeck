// Animation Service
export { default as AnimationService } from './AnimationService';
export type { AnimationSettings, AnimationFrame, AnimatedElement, ElementCoordinates } from './AnimationService';

// Frame Video Replacer
export { default as FrameVideoReplacer } from './FrameVideoReplacer';

// Frame Management
export { FrameManager } from './frameManager';

// DOM Utilities
export { DOMUtils } from './domUtils';

// Scene Management
export { SceneManager } from './sceneManager';

// State Management
export { StateManager } from './stateManager';

// Video Container Builder
export { VideoContainerBuilder } from './videoContainerBuilder';

// Video Event Handlers
export { VideoEventHandlers } from './videoEventHandlers';

// API Service
export { submitFrameToAPI, pollForResult } from './apiService';

// Types
export * from './types';

// Utilities
export * from './utils';
