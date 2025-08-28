export interface FrameData {
  id: string;
  name: string;
  type: string;
  props: any;
  position: any;
  boxSize: any;
  color: string;
}

export interface DOMPosition {
  frameRect: DOMRect;
  css19b3lheRect: DOMRect;
  containerRect: DOMRect;
  relativeLeft: number;
  relativeTop: number;
  borderColor: string;
  parentContainer: Element;
  frameElement: Element;
  css19b3lheDiv: Element;
}

export class FrameVideoReplacer {
  private pages: any[] = [];

  constructor(pages: any[] = []) {
    this.pages = pages;
  }

  // Update pages data from useEditor
  updatePagesData(pages: any[]): void {
    this.pages = pages;
  }

  // Replace the SimpleFrame div with a video element
  replaceFrameWithVideo(elementId: string, videoUrl: string): void {
    try {
      console.log(`🎬 Replacing frame ${elementId} with video: ${videoUrl}`);

      // Check if this is a SimpleFrame or a child element
      const elementType = this.getElementType(elementId);
      let targetElementId = elementId;

      // If this is a child element inside a SimpleFrame, find the parent frame
      if (elementType !== 'SimpleFrame') {
        const parentFrameId = this.findParentSimpleFrame(elementId);
        if (parentFrameId) {
          console.log(`🎬 Child element ${elementId} is inside SimpleFrame ${parentFrameId}, replacing parent frame`);
          targetElementId = parentFrameId;
        }
      }

      // Get frame data from pages state
      const frameData = this.getFrameDataFromPages(targetElementId);
      if (!frameData) {
        console.warn(`❌ Frame data not found for ${targetElementId}`);
        return;
      }

      console.log(`📍 Frame data from pages:`, frameData);

      // Find the frame element on the canvas to get its DOM position
      const frameElement = this.findElementByLayerId(targetElementId);
      if (!frameElement) {
        console.warn(`❌ Frame element ${targetElementId} not found on canvas`);
        return;
      }

      // Get the DOM position and styling of the frame
      const domPosition = this.getFrameDOMPosition(frameElement);
      if (!domPosition) {
        console.warn(`❌ Could not get DOM position for frame`);
        return;
      }

      console.log(`📍 Frame DOM position:`, domPosition);

             // Create a new video container with the same properties as the frame
       this.createVideoContainerFromFrameData(frameData, domPosition, videoUrl, targetElementId);

       // Remove all child elements from the editor state
       this.removeChildElementsFromState(targetElementId);

      console.log(`🎬 Successfully replaced frame ${targetElementId} with video container`);

      // Dispatch a custom event to notify other components
      const videoReplacedEvent = new CustomEvent('videoReplaced', {
        detail: {
          elementId: targetElementId,
          videoUrl: videoUrl,
          originalElementId: elementId,
          frameData: frameData,
          domPosition: domPosition
        }
      });
      document.dispatchEvent(videoReplacedEvent);

    } catch (error) {
      console.error(`❌ Error replacing frame ${elementId} with video:`, error);
    }
  }

  // Get frame data from pages state
  private getFrameDataFromPages(frameId: string): FrameData | null {
    try {
      if (!this.pages || this.pages.length === 0) {
        console.warn(`❌ No pages data available`);
        return null;
      }

      const page = this.pages[0];
      if (!page.layers || !page.layers[frameId]) {
        console.warn(`❌ Frame ${frameId} not found in pages data`);
        return null;
      }

      const frameLayer = page.layers[frameId];
      console.log(`✅ Found frame data for ${frameId}:`, frameLayer);

      return {
        id: frameId,
        name: frameLayer.name,
        type: frameLayer.data.type,
        props: frameLayer.data.props,
        position: frameLayer.data.props.position,
        boxSize: frameLayer.data.props.boxSize,
        color: frameLayer.data.props.color || this.generateFrameColor(frameId)
      };

    } catch (error) {
      console.error(`❌ Error getting frame data from pages:`, error);
      return null;
    }
  }

  // Get the DOM position and styling of the frame element
  private getFrameDOMPosition(frameElement: Element): DOMPosition | null {
    try {
      // Get the bounding rect of the frame element
      const frameRect = frameElement.getBoundingClientRect();
      
      // Find the parent container (canvas or main container)
      const parentContainer = this.findCanvasContainer(frameElement);
      if (!parentContainer) {
        console.warn(`❌ Canvas container not found`);
        return null;
      }

      // Get the css-19b3lhe div (the red-highlighted div in your screenshot)
      const css19b3lheDiv = frameElement.parentElement?.parentElement;
      if (!css19b3lheDiv) {
        console.warn(`❌ css-19b3lhe div not found`);
        return null;
      }

      const css19b3lheRect = css19b3lheDiv.getBoundingClientRect();
      const containerRect = parentContainer.getBoundingClientRect();

      // Calculate position relative to the container (same level as css-19b3lhe div)
      const relativeLeft = css19b3lheRect.left - containerRect.left;
      const relativeTop = css19b3lheRect.top - containerRect.top;

      // Get the frame's border color from the element
      const borderColor = this.getFrameBorderColorFromElement(frameElement);

      console.log(`📍 Frame rect: ${frameRect.left}, ${frameRect.top}, ${frameRect.width}x${frameRect.height}`);
      console.log(`📍 css-19b3lhe rect: ${css19b3lheRect.left}, ${css19b3lheRect.top}, ${css19b3lheRect.width}x${css19b3lheRect.height}`);
      console.log(`📍 Container rect: ${containerRect.left}, ${containerRect.top}, ${containerRect.width}x${containerRect.height}`);
      console.log(`📍 Relative position: ${relativeLeft}, ${relativeTop}`);

      return {
        frameRect,
        css19b3lheRect,
        containerRect,
        relativeLeft,
        relativeTop,
        borderColor,
        parentContainer,
        frameElement,
        css19b3lheDiv
      };

    } catch (error) {
      console.error(`❌ Error getting frame DOM position:`, error);
      return null;
    }
  }

  // Find the canvas container
  private findCanvasContainer(frameElement: Element): Element | null {
    try {
      // Navigate up the DOM tree to find the parent of the css-19b3lhe div
      // The frameElement is the SimpleFrameContent div, we need to go up 3 levels
      // to find the parent container where both css-19b3lhe and our video div will be siblings
      
      let currentElement = frameElement;
      
      // Go up to the generic div (first level up)
      if (currentElement.parentElement) {
        currentElement = currentElement.parentElement;
        console.log(`📍 Level 1 parent (generic div):`, currentElement);
      }
      
      // Go up to the css-19b3lhe div (second level up)
      if (currentElement.parentElement) {
        currentElement = currentElement.parentElement;
        console.log(`📍 Level 2 parent (css-19b3lhe div):`, currentElement);
      }
      
      // Go up to the parent container (third level up) - this is where we want to place our video div
      if (currentElement.parentElement) {
        currentElement = currentElement.parentElement;
        console.log(`📍 Level 3 parent (target container):`, currentElement);
        
        // This should be the container where we want to place our video div
        // It should be at the same level as the css-19b3lhe div
        return currentElement;
      }

      // Fallback: look for specific canvas container selectors
      const selectors = [
        '[data-testid="canvas-container"]',
        '.canvas-container',
        '[class*="canvas"]',
        '[class*="Canvas"]',
        '.main-canvas',
        '#canvas'
      ];

      for (const selector of selectors) {
        const container = document.querySelector(selector);
        if (container) {
          console.log(`✅ Found canvas container with selector: ${selector}`);
          return container;
        }
      }

      // If no specific canvas container found, use the body
      console.log(`⚠️ No specific canvas container found, using body`);
      return document.body;

    } catch (error) {
      console.error(`❌ Error finding canvas container:`, error);
      return document.body;
    }
  }

  // Create video container using frame data and DOM position
  private createVideoContainerFromFrameData(frameData: FrameData, domPosition: DOMPosition, videoUrl: string, originalFrameId: string): void {
    try {
      const { parentContainer, css19b3lheDiv } = domPosition;
      const { boxSize } = frameData;

      // Get the correct frame border color using the frame ID
      const frameBorderColor = this.getFrameBorderColor(originalFrameId);
      console.log(`🎨 Using frame border color for ${originalFrameId}: ${frameBorderColor}`);

      // Get the transform property from the original css-19b3lhe div
      const originalTransform = css19b3lheDiv.style.transform || '';
      console.log(`🎬 Original transform from css-19b3lhe div: ${originalTransform}`);

      console.log(`🎬 Creating video container with frame data:`, {
        size: boxSize,
        transform: originalTransform,
        borderColor: frameBorderColor
      });

      // Create a new video container div
      const videoContainer = document.createElement('div');
      videoContainer.className = `animation-video-standalone-container ${originalFrameId}-video`;
      videoContainer.setAttribute('data-original-frame-id', originalFrameId);
      videoContainer.setAttribute('data-video-url', videoUrl);
      videoContainer.setAttribute('data-frame-data', JSON.stringify(frameData));

             // Apply modern, aesthetic styling to the video container
       videoContainer.style.cssText = `
         position: absolute;
         width: ${boxSize.width}px;
         height: ${boxSize.height}px;
         border: 3px solid ${frameBorderColor};
         border-radius: 16px;
         overflow: hidden;
         z-index: 1000;
         background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
         pointer-events: auto;
         transform: ${originalTransform};
         box-shadow: 
           0 8px 32px rgba(0,0,0,0.3),
           0 4px 16px rgba(0,0,0,0.2),
           inset 0 1px 0 rgba(255,255,255,0.2);
         backdrop-filter: blur(10px);
         transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
       `;

       // Add hover effects
       videoContainer.addEventListener('mouseenter', () => {
         videoContainer.style.transform = `${originalTransform} scale(1.02)`;
         videoContainer.style.boxShadow = `
           0 12px 40px rgba(0,0,0,0.4),
           0 6px 20px rgba(0,0,0,0.3),
           inset 0 1px 0 rgba(255,255,255,0.3)
         `;
       });

       videoContainer.addEventListener('mouseleave', () => {
         videoContainer.style.transform = originalTransform;
         videoContainer.style.boxShadow = `
           0 8px 32px rgba(0,0,0,0.3),
           0 4px 16px rgba(0,0,0,0.2),
           inset 0 1px 0 rgba(255,255,255,0.2)
         `;
       });

             // Create the video element with enhanced styling
       const videoElement = document.createElement('video');
       videoElement.src = videoUrl;
       videoElement.autoplay = false; // Don't autoplay, let user control
       videoElement.loop = false; // Don't loop, stop at the end
       videoElement.muted = true;
       videoElement.controls = false;
       videoElement.style.cssText = `
         width: 100%;
         height: 100%;
         object-fit: cover;
         display: block;
         border: none;
         outline: none;
         background: transparent;
         border-radius: 13px;
         transition: all 0.3s ease;
       `;

       // Add a subtle overlay for better text readability
       const videoOverlay = document.createElement('div');
       videoOverlay.style.cssText = `
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%);
         pointer-events: none;
         border-radius: 13px;
         z-index: 1;
       `;

       // Set video attributes
       videoElement.setAttribute('data-animation-video', 'true');
       videoElement.setAttribute('data-original-frame-id', originalFrameId);

       // Handle video loading
       videoElement.addEventListener('loadeddata', () => {
         console.log(`✅ Video loaded successfully for frame ${originalFrameId}`);
       });

       videoElement.addEventListener('error', (e) => {
         console.error(`❌ Video loading error for frame ${originalFrameId}:`, e);
       });

       // Create modern, aesthetic play button overlay
       const playButton = document.createElement('div');
       playButton.className = `video-play-button ${originalFrameId}-play-button`;
       playButton.setAttribute('data-original-frame-id', originalFrameId);
                playButton.innerHTML = `
           <div class="play-button-inner">
             <div class="play-icon">
                               <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                </svg>
             </div>
             <div class="pulse-ring"></div>
             <div class="pulse-ring delay-1"></div>
             <div class="pulse-ring delay-2"></div>
           </div>
         `;
       playButton.style.cssText = `
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         cursor: pointer;
         z-index: 1001;
         transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
         opacity: 1;
         filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
       `;

       // Add CSS for the play button styling
       const playButtonStyle = document.createElement('style');
       playButtonStyle.textContent = `
         .play-button-inner {
           position: relative;
           width: 240px;
           height: 240px;
           display: flex;
           align-items: center;
           justify-content: center;
         }
         
         .play-icon {
           width: 220px;
           height: 220px;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           box-shadow: 0 12px 48px rgba(102, 126, 234, 0.5);
           transition: all 0.3s ease;
           z-index: 2;
           position: relative;
           border: 4px solid rgba(255, 255, 255, 0.3);
         }
         
         .play-icon:hover {
           transform: scale(1.1);
           box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
         }
         
         .pulse-ring {
           position: absolute;
           top: 50%;
           left: 50%;
           transform: translate(-50%, -50%);
           width: 220px;
           height: 220px;
           border: 3px solid rgba(102, 126, 234, 0.4);
           border-radius: 50%;
           animation: pulse 2s infinite;
           z-index: 1;
         }
         
         .pulse-ring.delay-1 {
           animation-delay: 0.5s;
         }
         
         .pulse-ring.delay-2 {
           animation-delay: 1s;
         }
         
         @keyframes pulse {
           0% {
             transform: translate(-50%, -50%) scale(1);
             opacity: 1;
           }
           100% {
             transform: translate(-50%, -50%) scale(1.5);
             opacity: 0;
           }
         }
       `;
       document.head.appendChild(playButtonStyle);

       // Create modern pause button (initially hidden)
       const pauseButton = document.createElement('div');
       pauseButton.className = `video-pause-button ${originalFrameId}-pause-button`;
       pauseButton.setAttribute('data-original-frame-id', originalFrameId);
                pauseButton.innerHTML = `
           <div class="pause-button-inner">
             <div class="pause-icon">
                               <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                  <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                </svg>
             </div>
           </div>
         `;
       pauseButton.style.cssText = `
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         cursor: pointer;
         z-index: 1001;
         transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
         opacity: 0;
         pointer-events: none;
         filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
       `;

       // Add CSS for the pause button styling
       const pauseButtonStyle = document.createElement('style');
       pauseButtonStyle.textContent = `
         .pause-button-inner {
           position: relative;
           width: 240px;
           height: 240px;
           display: flex;
           align-items: center;
           justify-content: center;
         }
         
         .pause-icon {
           width: 220px;
           height: 220px;
           background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           box-shadow: 0 12px 48px rgba(255, 107, 107, 0.5);
           transition: all 0.3s ease;
           z-index: 2;
           position: relative;
           border: 4px solid rgba(255, 255, 255, 0.3);
         }
         
         .pause-icon:hover {
           transform: scale(1.1);
           box-shadow: 0 12px 40px rgba(255, 107, 107, 0.6);
         }
       `;
       document.head.appendChild(pauseButtonStyle);

       // Play button click handler
       playButton.addEventListener('click', (e) => {
         e.stopPropagation();
         videoElement.play();
         playButton.style.opacity = '0';
         playButton.style.pointerEvents = 'none';
         pauseButton.style.opacity = '1';
         pauseButton.style.pointerEvents = 'auto';
       });

       // Pause button click handler
       pauseButton.addEventListener('click', (e) => {
         e.stopPropagation();
         videoElement.pause();
         pauseButton.style.opacity = '0';
         pauseButton.style.pointerEvents = 'none';
         playButton.style.opacity = '1';
         playButton.style.pointerEvents = 'auto';
       });

       // Video event handlers
       videoElement.addEventListener('play', () => {
         playButton.style.opacity = '0';
         playButton.style.pointerEvents = 'none';
         pauseButton.style.opacity = '1';
         pauseButton.style.pointerEvents = 'auto';
         
         // Auto-hide pause button after 3 seconds
         setTimeout(() => {
           if (!videoElement.paused) {
             pauseButton.style.opacity = '0';
             pauseButton.style.pointerEvents = 'none';
           }
         }, 3000);
       });

       videoElement.addEventListener('pause', () => {
         pauseButton.style.opacity = '0';
         pauseButton.style.pointerEvents = 'none';
         playButton.style.opacity = '1';
         playButton.style.pointerEvents = 'auto';
       });

       // Handle video end - show play button again
       videoElement.addEventListener('ended', () => {
         pauseButton.style.opacity = '0';
         pauseButton.style.pointerEvents = 'none';
         playButton.style.opacity = '1';
         playButton.style.pointerEvents = 'auto';
       });

       // Show pause button on hover when video is playing
       videoContainer.addEventListener('mouseenter', () => {
         if (!videoElement.paused && !videoElement.ended) {
           pauseButton.style.opacity = '1';
           pauseButton.style.pointerEvents = 'auto';
         }
       });

       // Hide pause button on mouse leave (with delay)
       videoContainer.addEventListener('mouseleave', () => {
         if (!videoElement.paused && !videoElement.ended) {
           setTimeout(() => {
             if (!videoContainer.matches(':hover')) {
               pauseButton.style.opacity = '0';
               pauseButton.style.pointerEvents = 'none';
             }
           }, 1000);
         }
       });

       // Add video, overlay, and buttons to container
       videoContainer.appendChild(videoElement);
       videoContainer.appendChild(videoOverlay);
       videoContainer.appendChild(playButton);
       videoContainer.appendChild(pauseButton);

       // Add a subtle entrance animation
       videoContainer.style.opacity = '0';
       videoContainer.style.transform = `${originalTransform} scale(0.9)`;
       
       // Trigger entrance animation after a brief delay
       setTimeout(() => {
         videoContainer.style.opacity = '1';
         videoContainer.style.transform = originalTransform;
       }, 100);

             // Add container to the same parent as the original frame
       parentContainer.appendChild(videoContainer);

       // Remove the frame itself from the editor state after video container is added
       this.removeFrameFromState(originalFrameId);

       console.log(`🎬 Created video container with transform: ${originalTransform}`);
       console.log(`🎬 Video container size: ${boxSize.width}x${boxSize.height}`);
       console.log(`🎬 Video container added to parent:`, parentContainer);

    } catch (error) {
      console.error(`❌ Error creating video container from frame data:`, error);
    }
  }

  // Remove all child elements from the editor state
  private removeChildElementsFromState(frameId: string): void {
    try {
      console.log(`🗑️ Removing child elements from state for frame ${frameId}`);

      // Get child element IDs
      const childElementIds = this.getChildElementIds(frameId);
      console.log(`🗑️ Found ${childElementIds.length} child elements to remove:`, childElementIds);

      // Dispatch custom event to remove elements from editor state
      const removeElementsEvent = new CustomEvent('removeElementsFromState', {
        detail: {
          elementIds: childElementIds,
          frameId: frameId
        }
      });
      document.dispatchEvent(removeElementsEvent);

      console.log(`🗑️ Dispatched removeElementsFromState event for ${childElementIds.length} elements`);

    } catch (error) {
      console.error(`❌ Error removing child elements from state for frame ${frameId}:`, error);
    }
  }

  // Remove the frame itself from the editor state
  private removeFrameFromState(frameId: string): void {
    try {
      console.log(`🗑️ Removing frame ${frameId} from editor state`);

      // Dispatch custom event to remove the frame from editor state
      const removeFrameEvent = new CustomEvent('removeFrameFromState', {
        detail: {
          frameId: frameId
        }
      });
      document.dispatchEvent(removeFrameEvent);

      console.log(`🗑️ Dispatched removeFrameFromState event for frame ${frameId}`);

    } catch (error) {
      console.error(`❌ Error removing frame from state for ${frameId}:`, error);
    }
  }

  // Get the frame's border color
  private getFrameBorderColor(frameId: string): string {
    try {
      // First try to get from pages data
      if (this.pages && this.pages.length > 0) {
        const page = this.pages[0];
        if (page.layers && page.layers[frameId]) {
          const frameLayer = page.layers[frameId];
          if (frameLayer && frameLayer.data && frameLayer.data.props) {
            // Generate the same color that would be used in SimpleFrameContent
            const frameColor = this.generateFrameColor(frameId);
            console.log(`✅ Found frame color from pages data for ${frameId}: ${frameColor}`);
            return frameColor;
          }
        }
      }

      // Fallback: try to get from DOM data attribute
      const frameElement = document.querySelector(`.${CSS.escape(frameId)}`);
      if (frameElement) {
        const frameColor = frameElement.getAttribute('data-frame-color');
        if (frameColor) {
          console.log(`✅ Found frame color from DOM data attribute for ${frameId}: ${frameColor}`);
          return frameColor;
        }
      }

      // If we can't find the color, generate it using the same algorithm
      const generatedColor = this.generateFrameColor(frameId);
      console.log(`🎨 Generated frame color for ${frameId}: ${generatedColor}`);
      return generatedColor;

    } catch (error) {
      console.warn(`Error getting frame border color for ${frameId}:`, error);
      return this.generateFrameColor(frameId);
    }
  }

  // Get frame border color from any element
  private getFrameBorderColorFromElement(element: Element): string {
    try {
      // First, try to get from the frame element's data-frame-color attribute
      const frameColor = element.getAttribute('data-frame-color');
      if (frameColor) {
        console.log(`✅ Found frame color from data-frame-color attribute: ${frameColor}`);
        return frameColor;
      }

      // If not found on this element, try to find the parent frame element
      // Navigate up to find the SimpleFrameContent element that has the data-frame-color
      let currentElement = element;
      while (currentElement && currentElement.parentElement) {
        currentElement = currentElement.parentElement;
        const parentFrameColor = currentElement.getAttribute('data-frame-color');
        if (parentFrameColor) {
          console.log(`✅ Found frame color from parent element data-frame-color: ${parentFrameColor}`);
          return parentFrameColor;
        }
      }

      // If still not found, try to get from the element's ID to generate the color
      const elementId = element.id || element.className || 'frame';
      if (elementId && elementId !== 'frame') {
        const generatedColor = this.generateFrameColor(elementId);
        console.log(`🎨 Generated frame color from element ID ${elementId}: ${generatedColor}`);
        return generatedColor;
      }

      // Last fallback: generate a color based on the element's class
      const generatedColor = this.generateFrameColor('frame');
      console.log(`🎨 Generated fallback frame color: ${generatedColor}`);
      return generatedColor;

    } catch (error) {
      console.warn(`Error getting frame border color from element:`, error);
      return this.generateFrameColor('frame');
    }
  }

  // Generate the same unique color as SimpleFrameContent
  private generateFrameColor(layerId: string): string {
    // Use the same algorithm as in SimpleFrameContent
    let hash = 0;
    for (let i = 0; i < layerId.length; i++) {
      const char = layerId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate hue, saturation, and lightness values
    const hue = Math.abs(hash) % 360; // 0-359 degrees
    const saturation = 60 + (Math.abs(hash) % 40); // 60-99%
    const lightness = 45 + (Math.abs(hash) % 20); // 45-64%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Get the type of an element from the pages data
  private getElementType(elementId: string): string | null {
    try {
      if (!this.pages || this.pages.length === 0) {
        return null;
      }

      const page = this.pages[0];
      if (!page.layers) {
        return null;
      }

      const layer = page.layers[elementId];
      if (layer && layer.data && layer.data.type) {
        return layer.data.type;
      }

      return null;
    } catch (error) {
      console.warn(`Error getting element type for ${elementId}:`, error);
      return null;
    }
  }

  // Find the parent SimpleFrame that contains a given element
  private findParentSimpleFrame(elementId: string): string | null {
    try {
      if (!this.pages || this.pages.length === 0) {
        return null;
      }

      const page = this.pages[0];
      if (!page.layers) {
        return null;
      }

      // Get the element's position and size
      const elementLayer = page.layers[elementId];
      if (!elementLayer || !(elementLayer as any).data || !(elementLayer as any).data.props || !(elementLayer as any).data.props.position || !(elementLayer as any).data.props.boxSize) {
        return null;
      }

      const elementProps = (elementLayer as any).data.props;
      const elementPosition = elementProps.position;
      const elementSize = elementProps.boxSize;

      const elementLeft = elementPosition.x;
      const elementTop = elementPosition.y;
      const elementRight = elementLeft + elementSize.width;
      const elementBottom = elementTop + elementSize.height;

      // Iterate through all layers to find SimpleFrames that contain this element
      for (const [frameId, layer] of Object.entries(page.layers)) {
        // Skip the element itself and root layer
        if (frameId === elementId || frameId === 'ROOT') {
          continue;
        }

        // Check if this is a SimpleFrame
        if (!layer || !(layer as any).data || (layer as any).data.type !== 'SimpleFrame') {
          continue;
        }

        // Skip if not a valid layer with position data
        if (!(layer as any).data.props || !(layer as any).data.props.position || !(layer as any).data.props.boxSize) {
          continue;
        }

        const frameProps = (layer as any).data.props;
        const framePosition = frameProps.position;
        const frameSize = frameProps.boxSize;

        const frameLeft = framePosition.x;
        const frameTop = framePosition.y;
        const frameRight = frameLeft + frameSize.width;
        const frameBottom = frameTop + frameSize.height;

        // Check if element is completely contained within the frame's boundaries
        if (
          elementLeft >= frameLeft &&
          elementRight <= frameRight &&
          elementTop >= frameTop &&
          elementBottom <= frameBottom
        ) {
          console.log(`🔍 Found parent SimpleFrame ${frameId} for element ${elementId}`);
          return frameId;
        }
      }

      return null;

    } catch (error) {
      console.warn(`Error finding parent SimpleFrame for element ${elementId}:`, error);
      return null;
    }
  }

  // Get child element IDs for a SimpleFrame based on spatial coordinates
  private getChildElementIds(frameId: string): string[] {
    try {
      if (!this.pages || this.pages.length === 0) {
        return [];
      }

      const page = this.pages[0];
      if (!page.layers) {
        return [];
      }

      // Get the frame layer and its properties
      const frameLayer = page.layers[frameId];
      if (!frameLayer || !frameLayer.data || !frameLayer.data.props) {
        console.warn(`Frame layer ${frameId} not found or missing data`);
        return [];
      }

      const frameProps = frameLayer.data.props;
      const framePosition = frameProps.position || { x: 0, y: 0 };
      const frameSize = frameProps.boxSize || { width: 0, height: 0 };

      // Calculate frame boundaries
      const frameLeft = framePosition.x;
      const frameTop = framePosition.y;
      const frameRight = frameLeft + frameSize.width;
      const frameBottom = frameTop + frameSize.height;

      console.log(`🔍 Frame ${frameId} boundaries:`, {
        left: frameLeft,
        top: frameTop,
        right: frameRight,
        bottom: frameBottom,
        width: frameSize.width,
        height: frameSize.height
      });

      const childElementIds: string[] = [];

      // Iterate through all layers to find elements within the frame boundaries
      for (const [elementId, layer] of Object.entries(page.layers)) {
        // Skip the frame itself
        if (elementId === frameId) {
          continue;
        }

        // Skip if not a valid layer with position data
        if (!layer || !(layer as any).data || !(layer as any).data.props || !(layer as any).data.props.position) {
          continue;
        }

        const elementProps = (layer as any).data.props;
        const elementPosition = elementProps.position;
        const elementSize = elementProps.boxSize || { width: 0, height: 0 };

        // Calculate element boundaries
        const elementLeft = elementPosition.x;
        const elementTop = elementPosition.y;
        const elementRight = elementLeft + elementSize.width;
        const elementBottom = elementTop + elementSize.height;

        // Check if element is completely within the frame boundaries
        const isInsideFrame = 
          elementLeft >= frameLeft &&
          elementTop >= frameTop &&
          elementRight <= frameRight &&
          elementBottom <= frameBottom;

        if (isInsideFrame) {
          childElementIds.push(elementId);
          console.log(`✅ Element ${elementId} (${(layer as any).data.type}) is inside frame ${frameId}:`, {
            elementLeft,
            elementTop,
            elementRight,
            elementBottom,
            elementWidth: elementSize.width,
            elementHeight: elementSize.height
          });
        }
      }

      console.log(`🔍 Found ${childElementIds.length} child elements for SimpleFrame ${frameId}:`, childElementIds);
      return childElementIds;
      
    } catch (error) {
      console.warn(`Error getting child elements for frame ${frameId}:`, error);
      return [];
    }
  }

  // Find the actual DOM element by layer ID
  private findElementByLayerId(layerId: string): Element | null {
    // First, try to find by the new class-based approach (element ID as class)
    const elementByClass = document.querySelector(`.${CSS.escape(layerId)}`)
    // const elementByClass = document.querySelector(`.${layerId}`);
    if (elementByClass) {
      console.log(`✅ Found element ${layerId} by class name`);
      return elementByClass;
    }
    
    // Fallback: Look for elements with class css-19b3lhe that might contain our layer
    const elements = document.querySelectorAll('.css-19b3lhe');
    console.log(`🔍 Fallback: Found ${elements.length} elements with css-19b3lhe class`);
    
    // First, try to find by data attributes or IDs
    for (const element of elements) {
      if (element.getAttribute('data-layer-id') === layerId || 
          element.id === layerId ||
          element.textContent?.includes(layerId)) {
        console.log(`✅ Found element ${layerId} by fallback method`);
        return element;
      }
    }

    // If no direct match, try to find by looking at the element's position and content
    // This is a fallback approach for when elements don't have explicit IDs
    for (const element of elements) {
      // Check if this element contains text that might indicate it's our target
      const textContent = element.textContent || '';
      const hasText = textContent.trim().length > 0;
      
      // Check if element has reasonable dimensions (not too small)
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 50 && rect.height > 50;
      
      // If element has content and size, it might be our target
      if (hasText && hasSize) {
        // For now, return the first suitable element as a fallback
        // In a real implementation, you'd want more sophisticated matching
        return element;
      }
    }

    // Last resort: return the first css-19b3lhe element
    const fallbackElement = document.querySelector('.css-19b3lhe');
    if (fallbackElement) {
      console.log(`⚠️ Using fallback element for ${layerId}`);
    }
    return fallbackElement;
  }
}

export default FrameVideoReplacer;
