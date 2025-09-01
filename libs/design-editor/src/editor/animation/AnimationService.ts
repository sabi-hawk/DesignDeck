import { toPng } from 'html-to-image';
import { submitFrameToAPI, pollForResult } from './apiService';
import FrameVideoReplacer from './FrameVideoReplacer';
import { 
  AnimationSettings, 
  AnimationFrame, 
  AnimatedElement, 
  ElementCoordinates 
} from './types';
import { 
  findElementByLayerId, 
  getElementType, 
  findParentSimpleFrame,
  getChildElementIds,
  generateFrameColor
} from './utils';

class AnimationService {
  private static instance: AnimationService;
  private animatedElements: Map<string, AnimatedElement> = new Map();
  private animationFrames: Map<string, AnimationFrame> = new Map();
  private isCapturing = false;
  private pages: any[] = [];
  private onFrameCaptured?: (frame: AnimationFrame) => void;
  private onElementAnimationStarted?: (elementId: string, frameIndex: number) => void;
  private onElementAnimationStopped?: (elementId: string) => void;
  private nextFrameIndex = 0;
  private frameVideoReplacer: FrameVideoReplacer; // Instance of FrameVideoReplacer

  private constructor() {
    // Private constructor for singleton pattern
    this.frameVideoReplacer = FrameVideoReplacer.getInstance();
  }

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * Set the pages data for the service
   */
  setPages(pages: any[]): void {
    this.pages = pages;
  }

  /**
   * Update pages data (alias for setPages for compatibility)
   */
  updatePagesData(pages: any[]): void {
    this.setPages(pages);
    this.frameVideoReplacer.updatePagesData(pages);
  }

  /**
   * Set callback for when a frame is captured
   */
  setOnFrameCaptured(callback: (frame: AnimationFrame) => void): void {
    this.onFrameCaptured = callback;
  }

  /**
   * Set callback for when element animation starts
   */
  setOnElementAnimationStarted(callback: (elementId: string, frameIndex: number) => void): void {
    this.onElementAnimationStarted = callback;
  }

  /**
   * Set callback for when element animation stops
   */
  setOnElementAnimationStopped(callback: (elementId: string) => void): void {
    this.onElementAnimationStopped = callback;
  }

  /**
   * Start animation for an element
   */
  startAnimation(elementId: string, settings: AnimationSettings): boolean {
    // Check if element is already animated
    if (this.animatedElements.has(elementId)) {
      console.log(`Element ${elementId} is already being animated`);
      return false;
    }

    // Check if this is a SimpleFrame - if so, animate its children instead
    const elementType = getElementType(this.pages, elementId);
    if (elementType === 'SimpleFrame') {
      console.log(`🎬 SimpleFrame detected for ${elementId}, animating child elements instead`);
      return this.startAnimationForSimpleFrame(elementId, settings);
    }

    // Check if this element is inside a SimpleFrame - if so, animate the entire frame instead
    // const parentFrameId = findParentSimpleFrame(this.pages, elementId);
    // if (parentFrameId) {
    //   console.log(`🎬 Element ${elementId} is inside SimpleFrame ${parentFrameId}, animating entire frame instead`);
    //   return this.startAnimationForSimpleFrame(parentFrameId, settings);
    // }

    // Regular animation for non-SimpleFrame elements
    return this.startAnimationForElement(elementId, settings);
  }

  /**
   * Start animation for a SimpleFrame by animating its child elements
   */
  private startAnimationForSimpleFrame(frameId: string, settings: AnimationSettings): boolean {
    const childElementIds = getChildElementIds(this.pages, frameId);
    
    if (childElementIds.length === 0) {
      console.warn(`SimpleFrame ${frameId} has no child elements to animate`);
      return false;
    }

    console.log(`🎬 Starting animation for SimpleFrame ${frameId} with ${childElementIds.length} child elements:`, childElementIds);
    
    // Start animation for each child element
    let successCount = 0;
    for (const childId of childElementIds) {
      if (this.startAnimationForElement(childId, settings)) {
        successCount++;
      }
    }

    return successCount > 0;
  }

  /**
   * Start animation for a single element
   */
  private startAnimationForElement(elementId: string, settings: AnimationSettings): boolean {
    try {
      const frameIndex = this.nextFrameIndex++;
      
      console.log(`🎬 Starting animation for element ${elementId} at frame ${frameIndex}, isCapturing: ${this.isCapturing}`);
      
      // Create animated element entry
      const animatedElement: AnimatedElement = {
        id: elementId,
        frameIndex,
        startTime: Date.now(),
        lastCaptureTime: Date.now(),
        settings,
        parentFrameId: findParentSimpleFrame(this.pages, elementId)
      };

      this.animatedElements.set(elementId, animatedElement);
      
      // Start capturing frames
      this.startCapturing(elementId, frameIndex, settings);
      
      // Notify callback
      if (this.onElementAnimationStarted) {
        this.onElementAnimationStarted(elementId, frameIndex);
      }

      console.log(`✅ Animation started for element ${elementId} at frame ${frameIndex}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to start animation for element ${elementId}:`, error);
      return false;
    }
  }

  /**
   * Stop animation for an element
   */
  stopAnimation(elementId: string): boolean {
    try {
      if (this.animatedElements.has(elementId)) {
        this.animatedElements.delete(elementId);
        
        // Remove all frames for this element
        for (const [frameId, frame] of this.animationFrames.entries()) {
          if (frame.elementId === elementId) {
            this.animationFrames.delete(frameId);
          }
        }
        
        // Notify callback
        if (this.onElementAnimationStopped) {
          this.onElementAnimationStopped(elementId);
        }
        
        console.log(`🛑 Animation stopped for element ${elementId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error stopping animation for element ${elementId}:`, error);
      return false;
    }
  }

  /**
   * Get frames organized by frame index
   */
  getFramesByIndex(): Map<number, AnimationFrame[]> {
    const framesByIndex = new Map<number, AnimationFrame[]>();
    
    for (const frame of this.animationFrames.values()) {
      const frameIndex = frame.frameIndex;
      if (!framesByIndex.has(frameIndex)) {
        framesByIndex.set(frameIndex, []);
      }
      framesByIndex.get(frameIndex)!.push(frame);
    }
    
    return framesByIndex;
  }

  /**
   * Get all animated element IDs
   */
  getAnimatedElementIds(): string[] {
    return Array.from(this.animatedElements.keys());
  }

  /**
   * Get the currently animated element (for compatibility)
   */
  getCurrentAnimatedElement(): any {
    // Return the first animated element for compatibility
    const animatedElements = Array.from(this.animatedElements.values());
    return animatedElements.length > 0 ? animatedElements[0] : null;
  }

  /**
   * Check if an element is currently animated
   */
  isAnimated(elementId: string): boolean {
    return this.animatedElements.has(elementId);
  }

  /**
   * Get element type from pages data
   */
  getElementType(elementId: string): string | null {
    return getElementType(this.pages, elementId);
  }

  /**
   * Debug SimpleFrame colors
   */
  debugSimpleFrameColors(): void {
    console.log('🎨 Debugging SimpleFrame colors:');
    
    for (const [elementId] of this.animatedElements.entries()) {
      const elementType = getElementType(this.pages, elementId);
      if (elementType === 'SimpleFrame') {
        const color = generateFrameColor(elementId);
        console.log(`  SimpleFrame ${elementId}: ${color}`);
      }
    }
  }

  /**
   * Start capturing animation frames for an element
   */
  startCapturing(
    elementId: string, 
    frameIndex: number, 
    settings: AnimationSettings
  ): void {
    console.log(`🎬 Starting animation capture for element ${elementId} at frame ${frameIndex}`);

    // Find parent SimpleFrame if this element is inside one
    const parentFrameId = findParentSimpleFrame(this.pages, elementId);
    
    // Create animated element entry
    const animatedElement: AnimatedElement = {
      id: elementId,
      frameIndex,
      startTime: Date.now(),
      lastCaptureTime: Date.now(),
      settings,
      parentFrameId
    };

    this.animatedElements.set(elementId, animatedElement);
    
    // Set capturing flag for this specific element
    this.isCapturing = true;

    // IMPORTANT: Only capture one frame immediately, don't set up continuous interval
    // This matches the old implementation behavior
    this.captureFrame(elementId).finally(() => {
      // Reset capturing flag after frame capture is complete
      this.isCapturing = false;
      console.log(`✅ Frame capture completed for element ${elementId}, reset capturing flag`);
    });
    
    // Note: The old implementation had the interval commented out:
    // // Start capturing frames every 10 minutes
    // // const interval = setInterval(async () => {
    // //   await this.captureFrame(elementId);
    // // }, 600000); // 600,000 ms = 10 minutes
    // // this.animationIntervals.set(elementId, interval);
    
    console.log(`✅ Animation capture started for element ${elementId} - single frame captured`);
  }

  /**
   * Stop capturing animation frames
   */
  stopCapturing(): void {
    this.isCapturing = false;
    console.log('🛑 Animation capture stopped');
  }

  /**
   * Manually capture a frame for an element (can be called when additional frames are needed)
   */
  captureFrameManually(elementId: string): Promise<void> {
    return this.captureFrame(elementId);
  }

  /**
   * Check if we should capture additional frames based on time intervals
   * This can be called periodically from external sources if needed
   */
  checkAndCaptureAdditionalFrames(): void {
    const now = Date.now();
    const captureIntervalMs = 600000; // 10 minutes, matching old implementation
    
    for (const [elementId, animatedElement] of this.animatedElements.entries()) {
      const timeSinceLastCapture = now - animatedElement.lastCaptureTime;
      
      if (timeSinceLastCapture >= captureIntervalMs) {
        console.log(`⏰ Time to capture additional frame for ${elementId} (${Math.round(timeSinceLastCapture / 1000)}s since last capture)`);
        this.captureFrame(elementId);
      }
    }
  }

  /**
   * Notify that processing is complete
   */
  private notifyProcessingComplete(elementId: string, frame: AnimationFrame): void {
    // Dispatch custom event to notify timeline
    const processingCompleteEvent = new CustomEvent('processingComplete', {
      detail: {
        elementId: elementId,
        frameId: frame.id,
        resultUrl: frame.resultUrl
      }
    });
    document.dispatchEvent(processingCompleteEvent);
    console.log(`📢 Dispatched processing complete event for ${elementId}`);

    // Replace the frame with video on the canvas (matching old implementation)
    if (frame.resultUrl) {
      this.frameVideoReplacer.replaceFrameWithVideo(elementId, frame.resultUrl);
    }
  }

  /**
   * Notify progress update
   */
  private notifyProgressUpdate(elementId: string, frame: AnimationFrame): void {
    // Dispatch custom event to update progress
    const progressUpdateEvent = new CustomEvent('progressUpdate', {
      detail: {
        elementId: elementId,
        frameId: frame.id,
        progress: frame.progress
      }
    });
    document.dispatchEvent(progressUpdateEvent);
  }

  /**
   * Notify that processing failed
   */
  private notifyProcessingFailed(elementId: string, frame: AnimationFrame): void {
    // Dispatch custom event to notify failure
    const processingFailedEvent = new CustomEvent('processingFailed', {
      detail: {
        elementId: elementId,
        frameId: frame.id
      }
    });
    document.dispatchEvent(processingFailedEvent);
    console.log(`📢 Dispatched processing failed event for ${elementId}`);
  }

  /**
   * Capture a single frame for an element
   */
  private async captureFrame(elementId: string): Promise<void> {
    try {
      const animatedElement = this.animatedElements.get(elementId);
      if (!animatedElement) {
        console.warn(`⚠️ No animated element found for ${elementId}`);
        return;
      }

      const element = findElementByLayerId(elementId);
      if (!element) {
        console.warn(`⚠️ Element ${elementId} not found in DOM`);
        return;
      }

      // Capture the element as an image
      const imageDataUrl = await toPng(element as HTMLElement, {
        style: {
          transform: 'none',
        },
        // quality: 0.8,
        // width: 800,
        // height: 600,
      });

      if (!imageDataUrl || imageDataUrl.length < 100) {
        console.warn(`⚠️ Invalid image data captured for element ${elementId}`);
        return;
      }

      // Create animation frame
      const frame: AnimationFrame = {
        id: `${elementId}-${Date.now()}`,
        timestamp: Date.now(),
        imageDataUrl,
        elementId,
        frameIndex: animatedElement.frameIndex,
        settings: animatedElement.settings,
        isInsideFrame: !!animatedElement.parentFrameId,
        parentFrameId: animatedElement.parentFrameId,
        parentFrameBorderColor: animatedElement.parentFrameId ? 
          generateFrameColor(animatedElement.parentFrameId) : undefined
      };

      this.animationFrames.set(frame.id, frame);
      animatedElement.lastCaptureTime = Date.now();

      console.log(`📸 Frame captured for ${elementId}: ${frame.id}`);

      // Notify callback
      if (this.onFrameCaptured) {
        this.onFrameCaptured(frame);
      }

      // Submit to API for processing
      const elementData = this.getElementCoordinates(elementId, animatedElement.parentFrameId);
      if (elementData) {
        const fileId = await submitFrameToAPI(frame, elementId, elementData, animatedElement.settings);
        if (fileId) {
          frame.fileId = fileId;
          
          // Start polling for result
          pollForResult(
            fileId,
            (resultUrl) => {
              frame.resultUrl = resultUrl;
              frame.progress = 100;
              console.log(`🎉 Video ready for frame ${frame.id}: ${resultUrl}`);
              this.notifyProcessingComplete(elementId, frame);
            },
            (progress) => {
              frame.progress = progress;
              console.log(`📊 Progress for frame ${frame.id}: ${progress}%`);
              this.notifyProgressUpdate(elementId, frame);
            },
            () => {
              console.error(`❌ Failed to get result for frame ${frame.id}`);
              this.notifyProcessingFailed(elementId, frame);
            }
          );
        }
      }

    } catch (error) {
      console.error(`❌ Error capturing frame for ${elementId}:`, error);
    } finally {
      console.log(`🏁 Frame capture process completed for ${elementId}`);
    }
  }

  /**
   * Get element coordinates for API submission
   */
  private getElementCoordinates(elementId: string, parentFrameId?: string): ElementCoordinates | null {
    try {
      const element = findElementByLayerId(elementId);
      if (!element) {
        return null;
      }

      const rect = element.getBoundingClientRect();

      let centerX: number;
      let centerY: number;

      if (parentFrameId) {
        // Get the parent frame element using its ID
        const parentFrame = document.querySelector(`.${CSS.escape(parentFrameId)}`);
        if (parentFrame) {
          const parentRect = parentFrame.getBoundingClientRect();

          // Calculate element center relative to the parent frame
          const elementCenterX = rect.left + rect.width / 2;
          const elementCenterY = rect.top + rect.height / 2;

          // Convert to coordinates relative to the parent frame
          centerX = ((elementCenterX - parentRect.left) / parentRect.width) * 1920;
          centerY = ((elementCenterY - parentRect.top) / parentRect.height) * 1080;
        } else {
          // Fallback to window-based calculation if parent frame not found
          centerX = (rect.left + rect.width / 2) / window.innerWidth * 1920;
          centerY = (rect.top + rect.height / 2) / window.innerHeight * 1080;
        }
      } else {
        // No parent frame, use window-based calculation
        centerX = (rect.left + rect.width / 2) / window.innerWidth * 1920;
        centerY = (rect.top + rect.height / 2) / window.innerHeight * 1080;
      }

      // Get unscaled dimensions from computed styles
      const computedStyle = window.getComputedStyle(element);
      const width = parseFloat(computedStyle.width);
      const height = parseFloat(computedStyle.height);

      console.log(`📍 Element coordinates: center(${Math.round(centerX)}, ${Math.round(centerY)}), size(${Math.round(width)}x${Math.round(height)})`);

      // IMPORTANT: Round all values to integers as the API expects them
      // This matches the old implementation behavior exactly
      return {
        centerX: Math.round(Math.max(0, Math.min(1920, centerX))),
        centerY: Math.round(Math.max(0, Math.min(1080, centerY))),
        width: Math.round(Math.max(1, Math.min(1920, width))),
        height: Math.round(Math.max(1, Math.min(1080, height))),
      };
    } catch (error) {
      console.error(`❌ Error getting coordinates for ${elementId}:`, error);
      // Return default values if we can't get coordinates (matching old implementation)
      return {
        centerX: 960, // Center of 1920
        centerY: 540, // Center of 1080
        width: 200,
        height: 200,
      };
    }
  }



  /**
   * Get all animation frames for an element
   */
  getFramesForElement(elementId: string): AnimationFrame[] {
    return Array.from(this.animationFrames.values())
      .filter(frame => frame.elementId === elementId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get all animation frames
   */
  getAllFrames(): AnimationFrame[] {
    return Array.from(this.animationFrames.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get animated element info
   */
  getAnimatedElement(elementId: string): AnimatedElement | undefined {
    return this.animatedElements.get(elementId);
  }

  /**
   * Get all animated elements
   */
  getAllAnimatedElements(): AnimatedElement[] {
    return Array.from(this.animatedElements.values());
  }

  /**
   * Clear all animation data
   */
  clearAllData(): void {
    this.animatedElements.clear();
    this.animationFrames.clear();
    this.stopCapturing();
    console.log('🧹 All animation data cleared');
  }

  /**
   * Remove animation data for a specific element
   */
  removeElementData(elementId: string): void {
    this.animatedElements.delete(elementId);
    
    // Remove all frames for this element
    for (const [frameId, frame] of this.animationFrames.entries()) {
      if (frame.elementId === elementId) {
        this.animationFrames.delete(frameId);
      }
    }
    
    console.log(`🗑️ Animation data removed for element ${elementId}`);
  }
}

export default AnimationService;
export type { AnimationSettings, AnimationFrame, AnimatedElement, ElementCoordinates };
