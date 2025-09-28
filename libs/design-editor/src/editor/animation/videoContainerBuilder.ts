import { DOMUtils } from './domUtils';
import { SceneManager } from './sceneManager';
import { FrameData, DOMPosition } from './types';
import { getElementType } from './utils';

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
  private pages: unknown[] = [];

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /**
   * Update pages data for element type checking
   */
  updatePagesData(pages: unknown[]): void {
    this.pages = pages;
  }

  /**
   * Create a video container from frame data
   */
  createVideoContainerFromFrameData(
    frameData: FrameData,
    domPosition: DOMPosition,
    videoUrl: string,
    originalFrameId: string,
    pages: unknown[],
    elementId?: string
  ): HTMLDivElement | null {
    try {
      // Store pages data for element type checking
      this.pages = pages;
      
      const { parentContainer, css19b3lheDiv } = domPosition;
      const { boxSize } = frameData;

      // Get the correct frame border color using the frame ID (for potential future use)
      const frameBorderColor = DOMUtils.getFrameBorderColorFromElement(domPosition.frameElement);

      // Get the scene number for this frame (for potential future use)  
      const sceneNumber = this.sceneManager.getSceneNumberForFrame(originalFrameId);
      
      // These variables are kept for potential future use
      console.log(`🎬 Frame border color: ${frameBorderColor}, Scene number: ${sceneNumber}`);

      // Get the transform property from the original css-19b3lhe div
      const originalTransform = (css19b3lheDiv as HTMLElement).style.transform || '';

      // Create a new video container div - simplified styling
      const videoContainer = document.createElement('div');
      videoContainer.className = `animation-video-standalone-container ${originalFrameId}-video`;
      videoContainer.setAttribute('data-original-frame-id', originalFrameId);
      videoContainer.setAttribute('data-video-url', videoUrl);
      videoContainer.setAttribute('data-frame-data', JSON.stringify(frameData));
      
      // Add element ID to distinguish between different animated elements in the same frame
      if (elementId) {
        videoContainer.setAttribute('data-animated-element-id', elementId);
        videoContainer.className += ` ${elementId}-video-container`;
      }

      // Apply minimal styling - just positioning and size
      videoContainer.style.cssText = `
        position: absolute;
        width: ${boxSize.width}px;
        height: ${boxSize.height}px;
        transform: ${originalTransform};
        pointer-events: none;
        z-index: 999;
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
        pointer-events: none;
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
   * Set up video progress tracking for timeline thumbnails
   */
  private setupVideoProgressTracking(videoElement: HTMLVideoElement, elementId: string): void {
    // Track video progress
    videoElement.addEventListener('timeupdate', () => {
      if (videoElement.duration > 0) {
        const progress = videoElement.currentTime / videoElement.duration;
        const isPlaying = !videoElement.paused && !videoElement.ended;
        
        // Dispatch video progress event
        const videoProgressEvent = new CustomEvent('videoProgress', {
          detail: {
            elementId: elementId,
            progress: progress,
            isPlaying: isPlaying,
            currentTime: videoElement.currentTime,
            duration: videoElement.duration
          }
        });
        document.dispatchEvent(videoProgressEvent);
      }
    });

    // Dispatch video play event
    videoElement.addEventListener('play', () => {
      const videoPlayEvent = new CustomEvent('videoPlay', {
        detail: {
          elementId: elementId,
          videoElement: videoElement
        }
      });
      document.dispatchEvent(videoPlayEvent);
    });

    // Dispatch video pause event
    videoElement.addEventListener('pause', () => {
      const videoPauseEvent = new CustomEvent('videoPause', {
        detail: {
          elementId: elementId,
          videoElement: videoElement
        }
      });
      document.dispatchEvent(videoPauseEvent);
    });

    // Dispatch video end event
    videoElement.addEventListener('ended', () => {
      const videoEndEvent = new CustomEvent('videoEnd', {
        detail: {
          elementId: elementId,
          videoElement: videoElement
        }
      });
      document.dispatchEvent(videoEndEvent);
    });
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

      // Check if this element is an image type to determine positioning
      const elementType = getElementType(this.pages, elementId);
      // Enhanced image detection
      const isImageElement = elementType === 'ImageLayer' || 
                            elementType === 'Image' || 
                            elementType === 'image' ||
                            elementType === 'ImageElement' ||
                            (originalElement.tagName === 'IMG') ||
                            (originalElement.querySelector('img') !== null);
      
      console.log(`🎬 Element ${elementId} type: ${elementType}, isImageElement: ${isImageElement}`);
      
      // Get element dimensions for adaptive sizing
      const elementRect = originalElement.getBoundingClientRect();
      const elementHeight = elementRect.height;
      const elementWidth = elementRect.width;
      
      console.log(`🎬 Element ${elementId} dimensions: ${elementWidth}x${elementHeight}`);
      
      // Determine sizing based on element type and dimensions
      const isTextElement = !isImageElement; // If not an image, treat as text
      
      // For text elements, use 95% of height with a reasonable minimum
      // For very small text, ensure minimum readable size
      let buttonSize: number;
      if (isTextElement) {
        const calculatedSize = elementHeight * 0.95;
        buttonSize = Math.max(calculatedSize, 50); // Increased minimum to 50px for better visibility
        console.log(`🎬 Text element: calculated size = ${calculatedSize}px, using ${buttonSize}px`);
      } else {
        buttonSize = 120; // Keep 120px for image elements
      }
      
      const buttonSVGSize = isTextElement ? Math.max(buttonSize * 0.7, 35) : 80; // Increased SVG ratio to 70% for text
      
      console.log(`🎬 Final sizing - Button: ${buttonSize}px, SVG: ${buttonSVGSize}px, isTextElement: ${isTextElement}`);

      // Create play button for the element
      const elementPlayButton = document.createElement('div');
      elementPlayButton.className = `element-play-button ${originalFrameId}-element-play`;
      elementPlayButton.setAttribute('data-original-frame-id', originalFrameId);
      elementPlayButton.setAttribute('data-video-container-id', videoContainer.className);
      elementPlayButton.setAttribute('data-element-id', elementId);
      elementPlayButton.innerHTML = `
        <svg width="${buttonSVGSize}" height="${buttonSVGSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5V19L19 12L8 5Z" fill="white"/>
        </svg>
      `;
      
      // Style the play button - position based on element type
      const playButtonStyles = isImageElement ? 
        // Top-left positioning for image elements
        `
          position: absolute;
          top: 20px;
          left: 20px;
          cursor: pointer;
          z-index: 1002;
          transition: all 0.2s ease;
          opacity: 1;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          width: ${buttonSize}px;
          height: ${buttonSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          pointer-events: auto;
        ` :
        // Center positioning for all other elements
        `
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
          width: ${buttonSize}px;
          height: ${buttonSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          pointer-events: auto;
        `;
      
      elementPlayButton.style.cssText = playButtonStyles;

             // Add hover effects - adjust transform based on element type
       elementPlayButton.addEventListener('mouseenter', () => {
         elementPlayButton.style.background = 'rgba(0, 0, 0, 0.9)';
         if (isImageElement) {
           elementPlayButton.style.transform = 'scale(1.1)';
         } else {
           elementPlayButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
         }
         elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.6)';
       });

       elementPlayButton.addEventListener('mouseleave', () => {
         elementPlayButton.style.background = 'rgba(0, 0, 0, 0.7)';
         if (isImageElement) {
           elementPlayButton.style.transform = 'scale(1)';
         } else {
           elementPlayButton.style.transform = 'translate(-50%, -50%) scale(1)';
         }
         elementPlayButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
       });

             // Add click handler to show video and hide play button
       elementPlayButton.addEventListener('click', (e) => {
         console.log(`🎬 Play button clicked for frame ${originalFrameId}`);
         e.preventDefault();
         e.stopPropagation();
         
         // Clear selection when play button is clicked
         const clearSelectionEvent = new CustomEvent('clearSelectionOnPlay');
         document.dispatchEvent(clearSelectionEvent);
         
         // Show the video container
         this.showVideoContainer(videoContainer);
         
         // Hide the original content (first child) of the element
         const firstChild = originalElement.firstElementChild as HTMLElement;
         if (firstChild) {
           firstChild.style.display = 'none';
           console.log(`🎬 Hidden original content (first child) of element ${elementId}`);
         } else {
           console.warn(`⚠️ No first child found in element ${elementId} to hide`);
         }
         
                   // Create a pause button positioned at top center, outside element boundary
          const pauseButtonContainer = document.createElement('div');
          pauseButtonContainer.className = `pause-button-container ${originalFrameId}-pause-container`;
          pauseButtonContainer.style.cssText = `
            position: absolute;
            top: -85px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1003;
            pointer-events: none;
            display: block;
            visibility: visible;
          `;
          
          const pauseButton = document.createElement('div');
          pauseButton.className = `element-pause-button ${originalFrameId}-element-pause`;
          pauseButton.setAttribute('data-original-frame-id', originalFrameId);
          pauseButton.setAttribute('data-element-id', elementId);
          pauseButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4H10V20H6V4Z" fill="white"/>
              <path d="M14 4H18V20H14V4Z" fill="white"/>
            </svg>
          `;
          
          // Style the pause button as a visible rectangular button for top positioning
          pauseButton.style.cssText = `
            position: relative;
            cursor: pointer;
            z-index: 1004;
            transition: all 0.2s ease;
            opacity: 1;
            background: rgba(0, 0, 0, 0.95);
            border-radius: 12px;
            width: 120px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.9);
            pointer-events: auto;
            visibility: visible;
          `;
          
          // Add the pause button to the container
          pauseButtonContainer.appendChild(pauseButton);
          
          // Hide the play button and show the pause button container
          elementPlayButton.style.display = 'none';
          pauseButtonContainer.style.display = 'block';
          
          // Hide the lock icon while video is playing
          const lockIcon = originalElement.querySelector('.element-lock-icon') as HTMLElement;
          if (lockIcon) {
            lockIcon.style.display = 'none';
            console.log(`🔒 Hidden lock icon while video plays for element ${elementId}`);
          }

         // Hide the element-animation-number icon while video is playing
         const animationNumber = originalElement.querySelector('.element-animation-number') as HTMLElement;
         if (animationNumber) {
           animationNumber.style.display = 'none';
           console.log(`🔒 Hidden element-animation-number while video plays for element ${elementId}`);
         }
          
          // Set z-index on the parent element to ensure buttons are above video container
          originalElement.style.zIndex = '1001'; // Higher than video container (999)
          originalElement.style.position = 'relative'; // Ensure z-index takes effect
          originalElement.style.overflow = 'visible'; // Allow button to appear outside element boundaries
          
          // Add hover effects for the rectangular pause button
          pauseButton.addEventListener('mouseenter', () => {
            pauseButton.style.background = 'rgba(0, 0, 0, 0.95)';
            pauseButton.style.transform = 'scale(1.05)';
            pauseButton.style.borderColor = 'rgba(255, 255, 255, 1)';
            pauseButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.9)';
          });

          pauseButton.addEventListener('mouseleave', () => {
            pauseButton.style.background = 'rgba(0, 0, 0, 0.9)';
            pauseButton.style.transform = 'scale(1)';
            pauseButton.style.borderColor = 'rgba(255, 255, 255, 0.9)';
            pauseButton.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.8)';
          });

          // Prevent mouse events from bubbling up on the pause button
          pauseButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          pauseButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          });
          
          // Add event handling to prevent container clicks from bubbling
          pauseButtonContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          // Prevent mouse events from bubbling up
          pauseButtonContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          pauseButtonContainer.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          // Add the pause button container to the original element
          originalElement.appendChild(pauseButtonContainer);
          
          // Set up pause button click handler
          pauseButton.addEventListener('click', (e) => {
            console.log(`🎬 Pause button clicked for frame ${originalFrameId}`);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Pause the video
            const videoElement = videoContainer.querySelector('video') as HTMLVideoElement;
            if (videoElement) {
              videoElement.pause();
              console.log(`🎬 Video paused successfully`);
              
              // Dispatch video pause event for progress tracking
              const videoPauseEvent = new CustomEvent('videoPause', {
                detail: {
                  elementId: elementId,
                  videoElement: videoElement
                }
              });
              document.dispatchEvent(videoPauseEvent);
            }
            
            // Hide the video container
            videoContainer.style.display = 'none';
            
            // Show the original content (first child) of the element again
            const firstChild = originalElement.firstElementChild as HTMLElement;
            if (firstChild) {
              firstChild.style.display = '';
              console.log(`🎬 Restored original content (first child) of element ${elementId}`);
            } else {
              console.warn(`⚠️ No first child found in element ${elementId} to restore`);
            }
            
            // Reset the parent element's properties to original values
            originalElement.style.zIndex = '';
            originalElement.style.position = '';
            originalElement.style.overflow = '';
            
            // Hide pause button container and show play button again
            pauseButtonContainer.style.display = 'none';
            elementPlayButton.style.display = 'flex';
            
             // Show the lock icon again when video is paused
             const lockIcon = originalElement.querySelector('.element-lock-icon') as HTMLElement;
             if (lockIcon) {
               lockIcon.style.display = 'flex';
               console.log(`🔒 Shown lock icon again after video paused for element ${elementId}`);
             }

            // Show the element-animation-number again when video ends
            const animationNumber = originalElement.querySelector('.element-animation-number') as HTMLElement;
            if (animationNumber) {
              animationNumber.style.display = 'flex';
              console.log(`🔒 Shown element-animation-number again after video ended for element ${elementId}`);
            }
            
            // Remove the pause button container from DOM
            pauseButtonContainer.remove();
            
            console.log(`🎬 Video paused, hidden video container and restored play button`);
          });
          
          // Store reference to the animated element in the video container for later restoration
          (videoContainer as HTMLDivElement & { animatedElement: HTMLElement }).animatedElement = originalElement;
          videoContainer.setAttribute('data-animated-element-id', elementId);
          console.log(`🎬 Stored animated element reference in video container:`, originalElement);
         
                   // Start playing the video
          const videoElement = videoContainer.querySelector('video') as HTMLVideoElement;
          if (videoElement) {
            // Set up video progress tracking
            this.setupVideoProgressTracking(videoElement, elementId);
            
            // Ensure video is ready to play
            if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
              videoElement.play().then(() => {
                // Dispatch video play event for progress tracking
                const videoPlayEvent = new CustomEvent('videoPlay', {
                  detail: {
                    elementId: elementId,
                    videoElement: videoElement
                  }
                });
                document.dispatchEvent(videoPlayEvent);
              }).catch(error => {
                console.error(`❌ Error playing video:`, error);
              });
            } else {
              // Wait for video to be ready, then play
              videoElement.addEventListener('canplay', () => {
                videoElement.play().then(() => {
                  // Dispatch video play event for progress tracking
                  const videoPlayEvent = new CustomEvent('videoPlay', {
                    detail: {
                      elementId: elementId,
                      videoElement: videoElement
                    }
                  });
                  document.dispatchEvent(videoPlayEvent);
                }).catch(error => {
                  console.error(`❌ Error playing video:`, error);
                });
              }, { once: true });
            }
            
            // Set up video ended event to show play button again
            videoElement.addEventListener('ended', () => {
              // Dispatch video end event for progress tracking
              const videoEndEvent = new CustomEvent('videoEnd', {
                detail: {
                  elementId: elementId,
                  videoElement: videoElement
                }
              });
              document.dispatchEvent(videoEndEvent);
              
              // Notify scene playback service about video end
              const scenePlaybackService = (window as any).ScenePlaybackService;
              if (scenePlaybackService) {
                scenePlaybackService.handleVideoEnd(elementId);
              }
              
              // Show the original content (first child) of the element again
              const firstChild = originalElement.firstElementChild as HTMLElement;
              if (firstChild) {
                firstChild.style.display = '';
                console.log(`🎬 Restored original content (first child) after video ended`);
              }
              
              // Reset the parent element's properties to original values
              originalElement.style.zIndex = '';
              originalElement.style.position = '';
              originalElement.style.overflow = '';
              
              // Hide pause button container and show play button again
              pauseButtonContainer.style.display = 'none';
              elementPlayButton.style.display = 'flex';
              
               // Show the lock icon again when video ends
               const lockIcon = originalElement.querySelector('.element-lock-icon') as HTMLElement;
               if (lockIcon) {
                 lockIcon.style.display = 'flex';
                 console.log(`🔒 Shown lock icon again after video ended for element ${elementId}`);
               }

              // Show the element-animation-number again when video ends
              const animationNumber = originalElement.querySelector('.element-animation-number') as HTMLElement;
              if (animationNumber) {
                animationNumber.style.display = 'flex';
                console.log(`🔒 Shown element-animation-number again after video ended for element ${elementId}`);
              }
              
              // Remove the pause button container from DOM
              pauseButtonContainer.remove();
              
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

  /**
   * Remove play button and related elements by element ID
   */
  removePlayButtonByElementId(elementId: string): boolean {
    try {
      let removed = false;

      console.log(`🗑️ Removing play buttons for element ${elementId}`);

      // Method 1: Remove play buttons by data-element-id attribute
      const playButtons = document.querySelectorAll(`[data-element-id="${elementId}"].element-play-button`);
      playButtons.forEach(button => {
        button.remove();
        console.log(`🗑️ Removed play button for element ${elementId}`);
        removed = true;
      });

      // Method 2: Remove pause buttons by data-element-id attribute
      const pauseButtons = document.querySelectorAll(`[data-element-id="${elementId}"].element-pause-button`);
      pauseButtons.forEach(button => {
        button.remove();
        console.log(`🗑️ Removed pause button for element ${elementId}`);
        removed = true;
      });

      // Method 3: Remove pause button containers (they don't have data-element-id, so search within elements)
      const pauseButtonContainers = document.querySelectorAll('.pause-button-container');
      pauseButtonContainers.forEach(container => {
        const pauseButton = container.querySelector(`[data-element-id="${elementId}"]`);
        if (pauseButton) {
          container.remove();
          console.log(`🗑️ Removed pause button container for element ${elementId}`);
          removed = true;
        }
      });

      // Method 4: Fallback - search within the original element if it exists
      let originalElement = document.querySelector(`.${CSS_ESCAPE(elementId)}`) as HTMLElement;
      if (!originalElement) {
        originalElement = document.querySelector(`[data-layer-id="${elementId}"]`) as HTMLElement;
      }
      if (!originalElement) {
        const textElements = document.querySelectorAll('.lidojs-text');
        for (const element of textElements) {
          if (element.classList.contains(elementId)) {
            originalElement = element as HTMLElement;
            break;
          }
        }
      }

      if (originalElement) {
        // Remove any remaining play buttons within the element
        const elementPlayButtons = originalElement.querySelectorAll('.element-play-button');
        elementPlayButtons.forEach(button => {
          button.remove();
          console.log(`🗑️ Removed play button from element for ${elementId}`);
          removed = true;
        });

        // Remove any remaining pause button containers within the element
        const elementPauseContainers = originalElement.querySelectorAll('.pause-button-container');
        elementPauseContainers.forEach(container => {
          container.remove();
          console.log(`🗑️ Removed pause button container from element for ${elementId}`);
          removed = true;
        });
      }

      console.log(`✅ Play button removal completed for element ${elementId}, removed: ${removed}`);
      return removed;

    } catch (error) {
      console.error(`❌ Error removing play button for element ${elementId}:`, error);
      return false;
    }
  }
}