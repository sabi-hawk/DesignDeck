import { useCallback, useEffect, useRef } from 'react';
import { useZoomPage } from './useZoomPage';

/**
 * Fixed Smooth Zoom Integration
 *
 * This version properly preserves the original panning behavior while adding
 * smooth zoom only for Ctrl/Cmd + wheel events.
 */
export const useFixedSmoothZoom = (
  frameRef: React.RefObject<HTMLDivElement | null>,
  pageListRef: React.RefObject<HTMLDivElement[]>,
  pageContainerRef: React.RefObject<HTMLDivElement | null>,
  options: {
    enableSmoothZoom?: boolean;
    debugMode?: boolean;
  } = {}
) => {
  const { enableSmoothZoom = false, debugMode = false } = options;

  // Get original zoom functionality (this handles all the panning)
  const originalZoom = useZoomPage(frameRef, pageListRef, pageContainerRef);

  // Smooth zoom state for Ctrl+wheel only
  const smoothZoomRef = useRef<{
    isActive: boolean;
    lastScale: number;
  }>({ isActive: false, lastScale: 1 });

  // Enhanced wheel handler that ONLY handles Ctrl+wheel for zoom
  const handleEnhancedWheel = useCallback(
    (event: WheelEvent) => {
      if (!enableSmoothZoom || !frameRef.current || !pageListRef.current)
        return;

      // 🎯 CRITICAL: Only handle zoom when Ctrl/Cmd is pressed
      // All other gestures (regular scroll, two-finger pan) go to original system
      const isZoomGesture = event.ctrlKey || event.metaKey;

      if (!isZoomGesture) {
        // Let original system handle panning - DO NOT PREVENT DEFAULT
        return;
      }

      // Only prevent default for actual zoom gestures
      event.preventDefault();
      event.stopPropagation();

      const pageElement = pageListRef.current[0];
      if (!pageElement) return;

      smoothZoomRef.current.isActive = true;

      // Calculate zoom factor
      const zoomIntensity = 0.001;
      const zoomFactor = 1 - event.deltaY * zoomIntensity;
      const newScale = Math.max(
        0.01,
        Math.min(10, smoothZoomRef.current.lastScale * zoomFactor)
      );

      // Get current transform values from the element
      const currentTransform = pageElement.style.transform;
      let currentTranslateX = 0;
      let currentTranslateY = 0;
      let currentScale = smoothZoomRef.current.lastScale;

      // Parse existing transform
      const translateMatch = currentTransform.match(
        /translate3d\(([^,]+),\s*([^,]+),\s*[^)]+\)/
      );
      if (translateMatch) {
        currentTranslateX = parseFloat(translateMatch[1]) || 0;
        currentTranslateY = parseFloat(translateMatch[2]) || 0;
      }

      // 🎯 SIMPLE CURSOR-CENTERED ZOOM
      // Get cursor position relative to container
      const containerRect = frameRef.current.getBoundingClientRect();
      const cursorX = event.clientX - containerRect.left;
      const cursorY = event.clientY - containerRect.top;

      // Calculate what content point is under the cursor
      const contentUnderCursorX = (cursorX - currentTranslateX) / currentScale;
      const contentUnderCursorY = (cursorY - currentTranslateY) / currentScale;

      // Keep that content point under the cursor after zoom
      const newTranslateX = cursorX - contentUnderCursorX * newScale;
      const newTranslateY = cursorY - contentUnderCursorY * newScale;

      // Apply GPU-accelerated transform
      const transform = `translate3d(${newTranslateX}px, ${newTranslateY}px, 0) scale(${newScale})`;
      pageElement.style.transform = transform;
      pageElement.style.transformOrigin = '0 0';
      pageElement.style.willChange = 'transform';
      pageElement.style.backfaceVisibility = 'hidden';

      // Update scale reference to the actual applied scale
      smoothZoomRef.current.lastScale = newScale;

      if (debugMode) {
        console.log('🎯 Simple Cursor-Centered Zoom:', {
          cursorX,
          cursorY,
          contentUnderCursorX,
          contentUnderCursorY,
          currentScale,
          newScale,
          currentTranslateX,
          currentTranslateY,
          newTranslateX,
          newTranslateY,
        });
      }

      // Debounce end of zoom
      clearTimeout(handleEnhancedWheel.timeoutId);
      handleEnhancedWheel.timeoutId = setTimeout(() => {
        smoothZoomRef.current.isActive = false;

        // Clean up GPU acceleration hints after zoom ends
        if (pageElement) {
          pageElement.style.willChange = '';
          pageElement.style.backfaceVisibility = '';
        }
      }, 200);
    },
    [enableSmoothZoom, frameRef, pageListRef, debugMode]
  ) as any;

  // Setup event listeners and disable original system when enabled
  useEffect(() => {
    if (!enableSmoothZoom || !frameRef.current) return;

    const container = frameRef.current;

    // Add wheel listener with passive: false only for our handler
    container.addEventListener('wheel', handleEnhancedWheel, {
      passive: false,
      capture: true, // Capture phase to handle before other listeners
    });

    // 🚨 CRITICAL: Clear any existing transforms from original system
    if (pageListRef.current && pageListRef.current[0]) {
      const pageElement = pageListRef.current[0];
      // Only clear if it has transforms from the original system
      const currentTransform = pageElement.style.transform;
      if (currentTransform && !currentTransform.includes('translate3d')) {
        pageElement.style.transform = '';
      }
    }

    return () => {
      container.removeEventListener('wheel', handleEnhancedWheel, {
        capture: true,
      });
      if (handleEnhancedWheel.timeoutId) {
        clearTimeout(handleEnhancedWheel.timeoutId);
      }
    };
  }, [enableSmoothZoom, frameRef, handleEnhancedWheel, pageListRef]);

  // Reset smooth zoom state when disabled
  useEffect(() => {
    if (!enableSmoothZoom && pageListRef.current) {
      pageListRef.current.forEach((pageElement) => {
        if (pageElement) {
          // Reset any smooth zoom transforms
          const currentTransform = pageElement.style.transform;
          if (currentTransform.includes('translate3d')) {
            // Remove smooth zoom transform, keep original
            pageElement.style.transform = '';
          }
          pageElement.style.willChange = '';
          pageElement.style.backfaceVisibility = '';
        }
      });
      smoothZoomRef.current = { isActive: false, lastScale: 1 };
    }
  }, [enableSmoothZoom, pageListRef]);

  // API for smooth zoom status
  const smoothZoomAPI = {
    enabled: enableSmoothZoom,
    active: smoothZoomRef.current.isActive,
    scale: smoothZoomRef.current.lastScale,
    reset: () => {
      if (pageListRef.current && pageListRef.current[0]) {
        const pageElement = pageListRef.current[0];
        pageElement.style.transform = '';
        pageElement.style.willChange = '';
        pageElement.style.backfaceVisibility = '';
      }
      smoothZoomRef.current = { isActive: false, lastScale: 1 };
    },
    // Emergency reset if canvas disappears
    emergencyReset: () => {
      if (pageListRef.current && pageListRef.current[0]) {
        const pageElement = pageListRef.current[0];
        pageElement.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
        pageElement.style.willChange = '';
        pageElement.style.backfaceVisibility = '';
      }
      smoothZoomRef.current = { isActive: false, lastScale: 1 };
      console.log('🚨 Emergency reset applied - canvas should be visible now');
    },
  };

  return {
    // Original zoom functionality (handles all panning and original zoom)
    ...originalZoom,

    // 🚨 CRITICAL FIX: Disable original pageTransform when smooth zoom is enabled
    // This prevents the DesignPage component from applying conflicting transforms
    pageTransform: enableSmoothZoom
      ? { x: 0, y: 0, scale: 1 } // Always neutral when smooth zoom is enabled
      : originalZoom.pageTransform,

    // Enhanced smooth zoom API
    smoothZoom: smoothZoomAPI,
  };
};
