import { DOMUtils } from './domUtils';
import { FrameManager } from './frameManager';
import { SceneManager } from './sceneManager';
import { StateManager } from './stateManager';
import { FrameData, DOMPosition } from './types';
import { VideoContainerBuilder } from './videoContainerBuilder';
import { VideoEventHandlers } from './videoEventHandlers';

/**
 * FrameVideoReplacer - Main service for replacing frames with video containers
 * Now much smaller and more maintainable using modular utilities
 */
class FrameVideoReplacer {
  private static instance: FrameVideoReplacer;
  private videoContainers: Map<string, HTMLDivElement> = new Map();
  private frameManager: FrameManager;
  private sceneManager: SceneManager;
  private videoContainerBuilder: VideoContainerBuilder;

  private constructor() {
    this.frameManager = new FrameManager();
    this.sceneManager = new SceneManager();
    this.videoContainerBuilder = new VideoContainerBuilder(this.sceneManager);
  }

  static getInstance(): FrameVideoReplacer {
    if (!FrameVideoReplacer.instance) {
      FrameVideoReplacer.instance = new FrameVideoReplacer();
    }
    return FrameVideoReplacer.instance;
  }

  /**
   * Update pages data from useEditor
   */
  updatePagesData(pages: any[]): void {
    this.frameManager.updatePagesData(pages);
    this.sceneManager.updatePagesData(pages);
    this.videoContainerBuilder.updatePagesData(pages);
  }

  /**
   * Replace the SimpleFrame div with a video element
   * This matches the old implementation behavior exactly
   */
  replaceFrameWithVideo(elementId: string, videoUrl: string): void {
    try {
      console.log(`🎬 Replacing frame ${elementId} with video: ${videoUrl}`);

      // Validate video URL
      if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
        console.error(`❌ Invalid video URL provided: ${videoUrl}`);
        return;
      }

      // Check if URL is accessible
      if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        console.error(`❌ Video URL is not a valid HTTP/HTTPS URL: ${videoUrl}`);
        return;
      }

      console.log(`✅ Video URL validation passed: ${videoUrl}`);

      // Store the original animated element ID (this is the picture/image element that was captured)
      const originalAnimatedElementId = elementId;

      // Check if this is a SimpleFrame or a child element
      const elementType = this.frameManager.getElementType(elementId);
      let targetElementId = elementId;

      // If this is a child element inside a SimpleFrame, find the parent frame
      if (elementType !== 'SimpleFrame') {
        const parentFrameId = this.frameManager.findParentSimpleFrame(elementId);
        if (parentFrameId) {
          console.log(`🎬 Child element ${elementId} is inside SimpleFrame ${parentFrameId}, replacing parent frame`);
          targetElementId = parentFrameId;
        }
      }

      // Get frame data from pages state
      const frameData = this.frameManager.getFrameDataFromPages(targetElementId);
      if (!frameData) {
        console.warn(`❌ Frame data not found for ${targetElementId}`);
        return;
      }

      console.log(`📍 Frame data from pages:`, frameData);

      // Find the frame element on the canvas to get its DOM position
      const frameElement = DOMUtils.findElementByLayerId(targetElementId);
      if (!frameElement) {
        console.warn(`❌ Frame element ${targetElementId} not found on canvas`);
        return;
      }

      // Get the DOM position and styling of the frame
      const domPosition = DOMUtils.getFrameDOMPosition(frameElement);
      if (!domPosition) {
        console.warn(`❌ Could not get DOM position for frame`);
        return;
      }

      console.log(`📍 Frame DOM position:`, domPosition);

      // Create a new video container with the same properties as the frame
      const videoContainer = this.videoContainerBuilder.createVideoContainerFromFrameData(
        frameData, 
        domPosition, 
        videoUrl, 
        targetElementId,
        this.frameManager['pages'], // Access private pages for now
        originalAnimatedElementId // Pass the original animated element ID
      );

      if (!videoContainer) {
        console.error(`❌ Failed to create video container for ${targetElementId}`);
        return;
      }

      // Store the container
      this.videoContainers.set(targetElementId, videoContainer);

      // Add a play button to the ORIGINAL animated element (not the frame)
      // This is the picture/image element that was captured in captureFrame
      const elementPlayButton = this.videoContainerBuilder.addPlayButtonToElement(
        originalAnimatedElementId, // Use the original animated element ID
        videoContainer,
        targetElementId // Pass frame ID for reference
      );

      if (!elementPlayButton) {
        console.warn(`⚠️ Could not add play button to animated element ${originalAnimatedElementId}`);
      }

      // Set up video ended event to hide video and show play button again
      const videoElement = videoContainer.querySelector('video') as HTMLVideoElement;
      if (videoElement) {
        VideoEventHandlers.setupVideoEndedHandler(
          videoElement,
          videoContainer,
          elementPlayButton
        );
      }

      // Remove all child elements from the editor state
      // const childElementIds = this.frameManager.getChildElementIds(targetElementId);
      // StateManager.removeChildElementsFromState(targetElementId, childElementIds);

      // IMPORTANT: Remove the frame itself from the editor state AFTER adding video container
      // This order prevents crashes by ensuring the video is visible before removing the frame
      // StateManager.removeFrameFromState(targetElementId);

      console.log(`🎬 Successfully replaced frame ${targetElementId} with hidden video container and play button on element ${originalAnimatedElementId}`);

      // Dispatch a custom event to notify other components
      StateManager.dispatchVideoReplacedEvent(
        targetElementId, 
        videoUrl, 
        originalAnimatedElementId, // Pass the original animated element ID
        frameData, 
        domPosition
      );

    } catch (error) {
      console.error(`❌ Error replacing frame ${elementId} with video:`, error);
    }
  }

  /**
   * Remove a video container
   */
  removeVideoContainer(frameId: string): boolean {
    const container = this.videoContainers.get(frameId);
    if (container) {
      container.remove();
      this.videoContainers.delete(frameId);
      this.sceneManager.resetSceneCounter(frameId);
      console.log(`🗑️ Video container removed for frame ${frameId}`);
      return true;
    }
    return false;
  }

  /**
   * Remove video container by element ID
   */
  removeVideoContainerByElementId(elementId: string): boolean {
    let removed = false;
    
    // Method 1: Find and remove video containers from stored map
    for (const [frameId, container] of this.videoContainers.entries()) {
      const containerElementId = container.getAttribute('data-animated-element-id');
      if (containerElementId === elementId) {
        container.remove();
        this.videoContainers.delete(frameId);
        this.sceneManager.resetSceneCounter(frameId);
        console.log(`🗑️ Video container removed for element ${elementId} (frame ${frameId})`);
        removed = true;
      }
    }
    
    // Method 2: Search DOM directly for containers with this element ID
    const containers = document.querySelectorAll('.animation-video-standalone-container');
    containers.forEach(container => {
      const containerElementId = container.getAttribute('data-animated-element-id');
      if (containerElementId === elementId) {
        container.remove();
        console.log(`🗑️ Video container removed from DOM for element ${elementId}`);
        removed = true;
      }
    });
    
    // Method 3: Search by element ID in class name (with proper CSS escaping)
    const escapedElementId = CSS.escape(elementId);
    const containersByClass = document.querySelectorAll(`.${escapedElementId}-video-container`);
    containersByClass.forEach(container => {
      container.remove();
      console.log(`🗑️ Video container removed by class for element ${elementId}`);
      removed = true;
    });
    
    return removed;
  }

  /**
   * Remove all video containers
   */
  removeAllVideoContainers(): void {
    for (const [frameId, container] of this.videoContainers.entries()) {
      container.remove();
    }
    this.videoContainers.clear();
    this.sceneManager.resetAllSceneCounters();
    console.log('🧹 All video containers removed');
  }

  /**
   * Get a video container by frame ID
   */
  getVideoContainer(frameId: string): HTMLDivElement | undefined {
    return this.videoContainers.get(frameId);
  }

  /**
   * Get all video containers
   */
  getAllVideoContainers(): HTMLDivElement[] {
    return Array.from(this.videoContainers.values());
  }

  /**
   * Check if a video container exists for a frame
   */
  hasVideoContainer(frameId: string): boolean {
    return this.videoContainers.has(frameId);
  }

  /**
   * Update video URL for an existing container
   */
  updateVideoUrl(frameId: string, newVideoUrl: string): boolean {
    const container = this.videoContainers.get(frameId);
    if (container) {
      const videoElement = container.querySelector('video') as HTMLVideoElement;
      if (videoElement) {
        videoElement.src = newVideoUrl;
        console.log(`🔄 Video URL updated for frame ${frameId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Get the count of video containers
   */
  getVideoContainerCount(): number {
    return this.videoContainers.size;
  }
}

export default FrameVideoReplacer;
export type { FrameData, DOMPosition };
