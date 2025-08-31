import { DOMUtils } from './domUtils';
import { SceneManager } from './sceneManager';
import { FrameData, DOMPosition } from './types';
import { VideoEventHandlers } from './videoEventHandlers';

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

      // Wait for video to be ready before setting up controls
      const setupControlsWhenReady = () => {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
          // Set up video controls and event handlers
          VideoEventHandlers.setupVideoControls(
            videoElement,
            playButton,
            pauseButton,
            videoContainer,
            originalFrameId
          );
        } else {
          setTimeout(setupControlsWhenReady, 100);
        }
      };

      // Set a timeout to ensure controls are set up even if video fails to load
      setTimeout(() => {
        if (videoElement.readyState < 2) {
          console.log(`⚠️ Video loading timeout for frame ${originalFrameId}, setting up controls anyway`);
          VideoEventHandlers.setupVideoControls(
            videoElement,
            playButton,
            pauseButton,
            videoContainer,
            originalFrameId
          );
        }
      }, 5000); // 5 second timeout

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

      // Create simple play button overlay - centered
      const playButton = document.createElement('div');
      playButton.className = `video-play-button ${originalFrameId}-play-button`;
      playButton.setAttribute('data-original-frame-id', originalFrameId);
      playButton.innerHTML = `
        <div class="play-button-inner">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" fill="white"/>
          </svg>
        </div>
      `;
      playButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 1001;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Create pause button overlay - centered
      const pauseButton = document.createElement('div');
      pauseButton.className = `video-pause-button ${originalFrameId}-pause-button`;
      pauseButton.setAttribute('data-original-frame-id', originalFrameId);
      pauseButton.innerHTML = `
        <div class="pause-button-inner">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H10V20H6V4Z" fill="white"/>
            <path d="M14 4H18V20H14V4Z" fill="white"/>
          </svg>
        </div>
      `;
      pauseButton.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 1001;
        transition: all 0.2s ease;
        opacity: 0;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Create cross button overlay - top right corner (to stop video)
      const crossButton = document.createElement('div');
      crossButton.className = `video-cross-button ${originalFrameId}-cross-button`;
      crossButton.setAttribute('data-original-frame-id', originalFrameId);
      crossButton.innerHTML = `
        <div class="cross-button-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      `;
      crossButton.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        cursor: pointer;
        z-index: 1001;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255, 255, 255, 0.3);
      `;

      // Add hover effects for cross button
      crossButton.addEventListener('mouseenter', () => {
        crossButton.style.background = 'rgba(0, 0, 0, 0.9)';
        crossButton.style.transform = 'scale(1.1)';
        crossButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
      });

      crossButton.addEventListener('mouseleave', () => {
        crossButton.style.background = 'rgba(0, 0, 0, 0.7)';
        crossButton.style.transform = 'scale(1)';
        crossButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      });

      // Add hover effect for play button
      playButton.addEventListener('mouseenter', () => {
        playButton.style.background = 'rgba(0, 0, 0, 0.8)';
        playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
      });

      playButton.addEventListener('mouseleave', () => {
        playButton.style.background = 'rgba(0, 0, 0, 0.6)';
        playButton.style.transform = 'translate(-50%, -50%) scale(1)';
      });

      // Add hover effect for pause button
      pauseButton.addEventListener('mouseenter', () => {
        pauseButton.style.background = 'rgba(0, 0, 0, 0.8)';
        pauseButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
      });

      pauseButton.addEventListener('mouseleave', () => {
        pauseButton.style.background = 'rgba(0, 0, 0, 0.6)';
        pauseButton.style.transform = 'translate(-50%, -50%) scale(1)';
      });

      // Add video and buttons to container
      videoContainer.appendChild(videoElement);
      videoContainer.appendChild(playButton);
      videoContainer.appendChild(pauseButton);
      videoContainer.appendChild(crossButton);

      // Add container to the same parent as the original frame
      parentContainer.appendChild(videoContainer);
      
      // Set up video controls and event handlers
      setupControlsWhenReady();
      
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
      
      // Style the play button - top left corner, much larger
      elementPlayButton.style.cssText = `
        position: absolute;
        top: 16px;
        left: 16px;
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
        elementPlayButton.style.transform = 'scale(1.1)';
        elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
      });

      elementPlayButton.addEventListener('mouseleave', () => {
        elementPlayButton.style.background = 'rgba(0, 0, 0, 0.7)';
        elementPlayButton.style.transform = 'scale(1)';
        elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      });

      // Add click handler to show video and hide play button
      elementPlayButton.addEventListener('click', () => {
        // Show the video container
        this.showVideoContainer(videoContainer);
        
        // Hide the element play button
        elementPlayButton.style.display = 'none';
        
        // Hide the animated element from the canvas
        originalElement.style.display = 'none';
        console.log(`🎬 Hidden animated element from canvas:`, originalElement);
        
        // Store reference to the animated element in the video container for later restoration
        // Use dataset to store the element reference directly
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
        }

        // Set up cross button functionality
        const crossButton = videoContainer.querySelector('.video-cross-button') as HTMLDivElement;
        if (crossButton) {
          crossButton.addEventListener('click', () => {
            if (videoElement) {
              // Stop video and return to element
              VideoEventHandlers.stopVideoAndReturnToElement(
                videoElement,
                videoContainer,
                elementPlayButton
              );
            }
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