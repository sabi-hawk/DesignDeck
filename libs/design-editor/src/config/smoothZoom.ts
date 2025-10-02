/**
 * Smooth Zoom Configuration
 *
 * This file controls the smooth zoom feature settings.
 * Modify these values to customize the zoom behavior.
 */

export interface SmoothZoomConfig {
  // Main feature toggle
  enabled: boolean;

  // Debug mode - shows console logs and debug info
  debugMode: boolean;

  // Show visual indicator when smooth zoom is active
  showIndicator: boolean;

  // Zoom behavior settings
  options: {
    minScale: number;
    maxScale: number;
    enableGPUAcceleration: boolean;
    smoothTransition: boolean;
    transitionDuration: number;
  };
}

/**
 * 🎯 MAIN SMOOTH ZOOM CONFIGURATION
 *
 * Change these settings to control the smooth zoom behavior:
 *
 * - enabled: Set to `true` to enable smooth zoom for Ctrl+wheel, `false` for original only
 * - debugMode: Set to `true` to see debug information in console
 * - showIndicator: Set to `true` to show "Smooth Zoom (Ctrl+Wheel)" indicator
 *
 * 🎮 GESTURE BEHAVIOR:
 * - Two-finger trackpad pan: Original system (always works)
 * - Regular mouse wheel: Original system (always works)
 * - Ctrl+wheel / Cmd+wheel: Figma-style cursor-centered zoom (when enabled)
 *
 * 🎯 FIGMA-STYLE VIEWPORT-BASED ZOOM:
 * - Uses the exact same algorithm as Figma for cursor-centered zoom
 * - Calculates cursor position in content space and maintains it during zoom
 * - Perfect for navigating large multi-screen canvases (10,000×10,000)
 * - Click on any element (even tiny ones) and zoom directly to it
 * - Zoom in: Element under cursor stays exactly centered
 * - Zoom out: Same element remains perfectly centered
 */
export const SMOOTH_ZOOM_CONFIG: SmoothZoomConfig = {
  // 🚀 MAIN TOGGLE - Change this to enable/disable smooth zoom
  enabled: true,

  // 🐛 DEBUG MODE - Enable for troubleshooting
  debugMode: false,

  // 👁️ VISUAL INDICATOR - Show when smooth zoom is active
  showIndicator: true,

  // ⚙️ ZOOM BEHAVIOR SETTINGS
  options: {
    minScale: 0.01, // Minimum zoom level (1% of original size)
    maxScale: 10, // Maximum zoom level (1000% of original size)
    enableGPUAcceleration: true, // Use GPU for smooth performance
    smoothTransition: true, // Enable smooth zoom transitions
    transitionDuration: 300, // Transition duration in milliseconds
  },
};

/**
 * Quick toggle functions for easy testing
 */
export const toggleSmoothZoom = () => {
  SMOOTH_ZOOM_CONFIG.enabled = !SMOOTH_ZOOM_CONFIG.enabled;
  console.log(
    `🎯 Smooth Zoom ${SMOOTH_ZOOM_CONFIG.enabled ? 'ENABLED' : 'DISABLED'}`
  );
};

export const toggleDebugMode = () => {
  SMOOTH_ZOOM_CONFIG.debugMode = !SMOOTH_ZOOM_CONFIG.debugMode;
  console.log(
    `🐛 Debug Mode ${SMOOTH_ZOOM_CONFIG.debugMode ? 'ENABLED' : 'DISABLED'}`
  );
};

export const PERFORMANCE_PRESETS = {
  HIGH_PERFORMANCE: {
    ...SMOOTH_ZOOM_CONFIG,
    options: {
      ...SMOOTH_ZOOM_CONFIG.options,
      enableGPUAcceleration: true,
      smoothTransition: false,
      transitionDuration: 0,
    },
  },

  BALANCED: {
    ...SMOOTH_ZOOM_CONFIG,
    options: {
      ...SMOOTH_ZOOM_CONFIG.options,
      enableGPUAcceleration: true,
      smoothTransition: true,
      transitionDuration: 200,
    },
  },

  MAXIMUM_SMOOTHNESS: {
    ...SMOOTH_ZOOM_CONFIG,
    options: {
      ...SMOOTH_ZOOM_CONFIG.options,
      enableGPUAcceleration: true,
      smoothTransition: true,
      transitionDuration: 500,
    },
  },
};
