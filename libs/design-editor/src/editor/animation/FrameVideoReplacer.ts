import { DOMUtils } from './domUtils';
import { FrameManager } from './frameManager';
import { SceneManager } from './sceneManager';
import { StateManager } from './stateManager';
import { FrameData, DOMPosition } from './types';
import { VideoContainerBuilder } from './videoContainerBuilder';

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
        this.frameManager['pages'] // Access private pages for now
      );

      if (!videoContainer) {
        console.error(`❌ Failed to create video container for ${targetElementId}`);
        return;
      }

      // Store the container
      this.videoContainers.set(targetElementId, videoContainer);

      // Remove all child elements from the editor state
      const childElementIds = this.frameManager.getChildElementIds(targetElementId);
      StateManager.removeChildElementsFromState(targetElementId, childElementIds);

      // IMPORTANT: Remove the frame itself from the editor state AFTER adding video container
      // This order prevents crashes by ensuring the video is visible before removing the frame
      StateManager.removeFrameFromState(targetElementId);

      console.log(`🎬 Successfully replaced frame ${targetElementId} with video container`);

      // Dispatch a custom event to notify other components
      StateManager.dispatchVideoReplacedEvent(
        targetElementId, 
        videoUrl, 
        elementId, 
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
