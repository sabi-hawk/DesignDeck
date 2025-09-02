import { DOMUtils } from './domUtils';
import { SceneManager } from './sceneManager';
import { FrameData, DOMPosition } from './types';

// Add CSS.escape polyfill if not available
declare global {
  interface Window {
    CSS: {
      escape: (ident: string) => string;
    };
  }
}

const CSS_ESCAPE = (typeof window !== 'undefined' && window.CSS && window.CSS.escape) || 
  ((ident: string) => ident.replace(/[^a-zA-Z0-9-_]/g, '\\$&'));

/**
 * Video container creation and styling utilities extracted from FrameVideoReplacer
 */
export class VideoContainerBuilder {
  private sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /**
   * Create a video container from frame data
   */
  createVideoContainerFromFrameData(
    frameData: FrameData,
    domPosition: DOMPosition,
    videoUrl: string,
    originalFrameId: string,
    pages: any[]
  ): HTMLDivElement | null {
    try {
      const { parentContainer, css19b3lheDiv, relativeLeft, relativeTop } = domPosition;
      const { boxSize } = frameData;

      // Get the correct frame border color using the frame ID
      const frameBorderColor = DOMUtils.getFrameBorderColorFromElement(domPosition.frameElement);

      // Get the scene number for this frame
      const sceneNumber = this.sceneManager.getSceneNumberForFrame(originalFrameId);

      // Get the transform property from the original css-19b3lhe div
      const originalTransform = (css19b3lheDiv as HTMLElement).style.transform || '';

      // Create a new video container div - simplified styling
      const videoContainer = document.createElement('div');
      videoContainer.className = `animation-video-standalone-container ${originalFrameId}-video`;
      videoContainer.setAttribute('data-original-frame-id', originalFrameId);
      videoContainer.setAttribute('data-video-url', videoUrl);
      videoContainer.setAttribute('data-frame-data', JSON.stringify(frameData));

      // Apply minimal styling - just positioning and size
      videoContainer.style.cssText = `
        position: absolute;
        width: ${boxSize.width}px;
        height: ${boxSize.height}px;
        transform: ${originalTransform};
        pointer-events: auto;
        z-index: 1000;
        display: none;
      `;

      // Create the video element with minimal styling
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.autoplay = false;
      videoElement.loop = false;
      videoElement.muted = true;
      videoElement.controls = false;
      
      // Add error handling for video loading
      videoElement.addEventListener('error', (e) => {
        console.error(`❌ Video loading error for frame ${originalFrameId}:`, e);
        console.error(`❌ Video error details:`, videoElement.error);
        console.error(`❌ Video network state:`, videoElement.networkState);
        console.error(`❌ Video ready state:`, videoElement.readyState);
      });

      // No need to set up video controls since we're using element buttons
      console.log(`🎬 Video container created without built-in controls - using element buttons instead`);

      // Set video attributes
      videoElement.setAttribute('data-animation-video', 'true');
      videoElement.setAttribute('data-original-frame-id', originalFrameId);

      // Minimal video styling
      videoElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border: none;
        outline: none;
        background: transparent;
      `;

      // No need for video container buttons - we'll use the element's own buttons
      
      // Add only the video element to container
      videoContainer.appendChild(videoElement);

      // Add container to the same parent as the original frame
      parentContainer.appendChild(videoContainer);
      
      return videoContainer;

    } catch (error) {
      console.error(`❌ Error creating video container for ${originalFrameId}:`, error);
      return null;
    }
  }

  /**
   * Show the video container
   */
  showVideoContainer(videoContainer: HTMLDivElement): void {
    videoContainer.style.display = 'block';
  }

  /**
   * Hide the video container
   */
  hideVideoContainer(videoContainer: HTMLDivElement): void {
    videoContainer.style.display = 'none';
  }

  /**
   * Add a play button to the original element
   */
  addPlayButtonToElement(
    elementId: string,
    videoContainer: HTMLDivElement,
    originalFrameId: string
  ): HTMLDivElement | null {
    try {
      // Find the original element by its ID using the same logic as findElementByLayerId
      let originalElement: HTMLElement | null = null;
      
      // First, try to find by the new class-based approach (element ID as class)
      const elementByClass = document.querySelector(`.${CSS_ESCAPE(elementId)}`) as HTMLElement;
      if (elementByClass) {
        console.log(`✅ Found animated element ${elementId} by class name`);
        originalElement = elementByClass;
      } else {
        // Fallback: Look for elements with class css-19b3lhe that might contain our layer
        const elements = document.querySelectorAll('.css-19b3lhe');
        console.log(`🔍 Fallback: Found ${elements.length} elements with css-19b3lhe class`);
        
        // First, try to find by data attributes or IDs
        for (const element of elements) {
          if (element.getAttribute('data-layer-id') === elementId || 
              element.id === elementId ||
              element.textContent?.includes(elementId)) {
            console.log(`✅ Found animated element ${elementId} by fallback method`);
            originalElement = element as HTMLElement;
            break;
          }
        }
        
        // If no direct match, try to find by looking at the element's position and content
        if (!originalElement) {
          for (const element of elements) {
            // Check if this element contains text that might indicate it's our target
            const textContent = element.textContent || '';
            const hasText = textContent.trim().length > 0;
            
            // Check if element has reasonable dimensions (not too small)
            const rect = element.getBoundingClientRect();
            const hasSize = rect.width > 50 && rect.height > 50;
            
            // If element has content and size, it might be our target
            if (hasText && hasSize) {
              console.log(`✅ Found animated element ${elementId} by content/size fallback`);
              originalElement = element as HTMLElement;
              break;
            }
          }
        }
        
        // Last resort: return the first css-19b3lhe element
        if (!originalElement) {
          const fallbackElement = document.querySelector('.css-19b3lhe') as HTMLElement;
          if (fallbackElement) {
            console.log(`⚠️ Using fallback element for animated element ${elementId}`);
            originalElement = fallbackElement;
          }
        }
      }

      if (!originalElement) {
        console.error(`❌ Could not find animated element with ID: ${elementId}`);
        return null;
      }

      // Create play button for the element
      const elementPlayButton = document.createElement('div');
      elementPlayButton.className = `element-play-button ${originalFrameId}-element-play`;
      elementPlayButton.setAttribute('data-original-frame-id', originalFrameId);
      elementPlayButton.setAttribute('data-video-container-id', videoContainer.className);
      elementPlayButton.innerHTML = `
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5V19L19 12L8 5Z" fill="white"/>
        </svg>
      `;
      
      // Style the play button - centered on the element
      elementPlayButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 1002;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      `;

             // Add hover effects
       elementPlayButton.addEventListener('mouseenter', () => {
         elementPlayButton.style.background = 'rgba(0, 0, 0, 0.9)';
         elementPlayButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
         elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
       });

       elementPlayButton.addEventListener('mouseleave', () => {
         elementPlayButton.style.background = 'rgba(0, 0, 0, 0.7)';
         elementPlayButton.style.transform = 'translate(-50%, -50%) scale(1)';
         elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
       });

             // Add click handler to show video and hide play button
       elementPlayButton.addEventListener('click', () => {
         // Show the video container
         this.showVideoContainer(videoContainer);
         
                   // Create a pause button in the same position as the play button
          const pauseButton = document.createElement('div');
          pauseButton.className = `element-pause-button ${originalFrameId}-element-pause`;
          pauseButton.setAttribute('data-original-frame-id', originalFrameId);
          pauseButton.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4H10V20H6V4Z" fill="white"/>
              <path d="M14 4H18V20H14V4Z" fill="white"/>
            </svg>
          `;
          
          // Style the pause button exactly like the play button, but with higher z-index
          pauseButton.style.cssText = elementPlayButton.style.cssText;
          pauseButton.style.zIndex = '1003'; // Higher than video container (1000) and play button (1002)
          
          // Hide the play button and show the pause button
          elementPlayButton.style.display = 'none';
          pauseButton.style.display = 'flex';
          
          // Add the pause button to the original element
          originalElement.appendChild(pauseButton);
          
          // Set up pause button click handler
          pauseButton.addEventListener('click', () => {
            // Pause the video
            const videoElement = videoContainer.querySelector('video') as HTMLVideoElement;
            if (videoElement) {
              videoElement.pause();
            }
            
            // Hide the video container
            videoContainer.style.display = 'none';
            
            // Hide pause button and show play button again
            pauseButton.style.display = 'none';
            elementPlayButton.style.display = 'flex';
            
            // Remove the pause button from DOM
            pauseButton.remove();
            
            console.log(`🎬 Video paused, hidden video container and restored play button`);
          });
          
          // Store reference to the animated element in the video container for later restoration
          (videoContainer as any).animatedElement = originalElement;
          videoContainer.setAttribute('data-animated-element-id', elementId);
          console.log(`🎬 Stored animated element reference in video container:`, originalElement);
         
                   // Start playing the video
          const videoElement = videoContainer.querySelector('video') as HTMLVideoElement;
          if (videoElement) {
            // Ensure video is ready to play
            if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
              videoElement.play().catch(error => {
                console.error(`❌ Error playing video:`, error);
              });
            } else {
              // Wait for video to be ready, then play
              videoElement.addEventListener('canplay', () => {
                videoElement.play().catch(error => {
                  console.error(`❌ Error playing video:`, error);
                });
              }, { once: true });
            }
            
            // Set up video ended event to show play button again
            videoElement.addEventListener('ended', () => {
              // Hide pause button and show play button again
              pauseButton.style.display = 'none';
              elementPlayButton.style.display = 'flex';
              
              // Remove the pause button from DOM
              pauseButton.remove();
              
              // Hide the video container
              videoContainer.style.display = 'none';
              
              console.log(`🎬 Video ended, restored play button`);
            });
          }
       });

      // Add the play button to the original element
      originalElement.appendChild(elementPlayButton);
      
      console.log(`✅ Successfully added play button to animated element ${elementId}`);
      return elementPlayButton;

    } catch (error) {
      console.error(`❌ Error adding play button to animated element ${elementId}:`, error);
      return null;
    }
  }
}