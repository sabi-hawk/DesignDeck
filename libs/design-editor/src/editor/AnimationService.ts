import { toPng } from 'html-to-image';

export interface AnimationSettings {
  sketchingDuration: number;
  colorFillDuration: number;
  handStyle: string;
}

export interface AnimationFrame {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  elementId: string;
  frameIndex: number; // Which timeline frame this belongs to
  settings: AnimationSettings; // Animation configuration settings
  isInsideFrame?: boolean; // Whether this element was animated as part of a SimpleFrame
  parentFrameId?: string; // The ID of the SimpleFrame that contains this element
  parentFrameBorderColor?: string; // The border color of the parent frame
}

export interface AnimatedElement {
  id: string;
  frameIndex: number; // Reserved timeline frame position
  startTime: number;
  lastCaptureTime: number;
  settings: AnimationSettings; // Animation configuration settings
  parentFrameId?: string; // The ID of the SimpleFrame that contains this element (if any)
}

export class AnimationService {
  private static instance: AnimationService;
  private animationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private animatedElements: Map<string, AnimatedElement> = new Map();
  private frameHistory: Map<string, AnimationFrame[]> = new Map();
  private onFrameCaptured?: (frame: AnimationFrame) => void;
  private onElementAnimationStarted?: (elementId: string, frameIndex: number) => void;
  private onElementAnimationStopped?: (elementId: string) => void;
  private nextFrameIndex = 0;
  private pages: any[] = []; // Store pages data from useEditor

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // Update pages data from useEditor
  updatePagesData(pages: any[]): void {
    this.pages = pages;
  }

  // Start animating an element (supports multiple elements)
  startAnimation(elementId: string, settings: AnimationSettings): boolean {
    // Check if element is already animated
    if (this.animatedElements.has(elementId)) {
      console.log(`Element ${elementId} is already being animated`);
      return false;
    }

    // Check if this is a SimpleFrame - if so, animate its children instead
    const elementType = this.getElementType(elementId);
    if (elementType === 'SimpleFrame') {
      console.log(`🎬 SimpleFrame detected for ${elementId}, animating child elements instead`);
      return this.startAnimationForSimpleFrame(elementId, settings);
    }

    // Regular animation for non-SimpleFrame elements
    return this.startAnimationForElement(elementId, settings);
  }

  // Start animation for a SimpleFrame by animating its child elements
  private startAnimationForSimpleFrame(frameId: string, settings: AnimationSettings): boolean {
    const childElementIds = this.getChildElementIds(frameId);
    
    if (childElementIds.length === 0) {
      console.warn(`SimpleFrame ${frameId} has no child elements to animate`);
      return false;
    }

    console.log(`🎬 Starting animation for SimpleFrame ${frameId} with ${childElementIds.length} child elements:`, childElementIds);
    
    // Dispatch custom event to auto-lock the frame
    const animationStartEvent = new CustomEvent('animationStart', {
      detail: {
        frameId: frameId,
        settings: settings
      }
    });
    document.dispatchEvent(animationStartEvent);
    console.log(`🔒 Dispatched animation start event for frame ${frameId}`);
    
    let successCount = 0;
    for (const childId of childElementIds) {
      const success = this.startAnimationForElement(childId, settings, frameId);
      if (success) {
        successCount++;
      }
    }

    console.log(`✅ Successfully started animation for ${successCount}/${childElementIds.length} child elements of SimpleFrame ${frameId}`);
    return successCount > 0;
  }

  // Start animation for a single element (original logic)
  private startAnimationForElement(elementId: string, settings: AnimationSettings, parentFrameId?: string): boolean {
    // Check if element is already animated
    if (this.animatedElements.has(elementId)) {
      console.log(`Element ${elementId} is already being animated`);
      return false;
    }

    // Reserve a frame index for this element
    const frameIndex = this.nextFrameIndex++;
    
    // Create animated element record
    const animatedElement: AnimatedElement = {
      id: elementId,
      frameIndex,
      startTime: Date.now(),
      lastCaptureTime: Date.now(),
      settings,
      parentFrameId,
    };

    this.animatedElements.set(elementId, animatedElement);
    this.frameHistory.set(elementId, []);

    console.log(`🎬 Starting animation for element ${elementId} at frame index ${frameIndex}`);
    console.log(`📊 Total animated elements: ${this.animatedElements.size}`);

    // Start capturing frames every 10 minutes
    const interval = setInterval(async () => {
      await this.captureFrame(elementId);
    }, 600000); // 600,000 ms = 10 minutes

    this.animationIntervals.set(elementId, interval);

    // Capture first frame immediately
    this.captureFrame(elementId);

    // Notify listeners
    if (this.onElementAnimationStarted) {
      this.onElementAnimationStarted(elementId, frameIndex);
    }

    return true;
  }

  // Stop animating an element
  stopAnimation(elementId: string): void {
    // Check if this is a SimpleFrame - if so, stop animation for all its children
    const elementType = this.getElementType(elementId);
    if (elementType === 'SimpleFrame') {
      console.log(`⏹️ SimpleFrame detected for ${elementId}, stopping animation for all child elements`);
      this.stopAnimationForSimpleFrame(elementId);
      return;
    }

    // Regular stop animation for non-SimpleFrame elements
    this.stopAnimationForElement(elementId);
  }

  // Stop animation for a SimpleFrame by stopping all its child elements
  private stopAnimationForSimpleFrame(frameId: string): void {
    const childElementIds = this.getChildElementIds(frameId);
    
    if (childElementIds.length === 0) {
      console.warn(`SimpleFrame ${frameId} has no child elements to stop animation for`);
      return;
    }

    console.log(`⏹️ Stopping animation for SimpleFrame ${frameId} with ${childElementIds.length} child elements:`, childElementIds);
    
    let stoppedCount = 0;
    for (const childId of childElementIds) {
      this.stopAnimationForElement(childId);
      stoppedCount++;
    }

    // Dispatch custom event to auto-unlock the frame
    const animationStopEvent = new CustomEvent('animationStop', {
      detail: {
        frameId: frameId
      }
    });
    document.dispatchEvent(animationStopEvent);
    console.log(`🔓 Dispatched animation stop event for frame ${frameId}`);

    console.log(`✅ Successfully stopped animation for ${stoppedCount}/${childElementIds.length} child elements of SimpleFrame ${frameId}`);
  }

  // Stop animation for a single element (original logic)
  private stopAnimationForElement(elementId: string): void {
    const animatedElement = this.animatedElements.get(elementId);
    if (!animatedElement) {
      console.log(`Element ${elementId} is not currently animated`);
      return;
    }

    console.log(`⏹️ Stopping animation for element ${elementId} at frame index ${animatedElement.frameIndex}`);
    
    this.animatedElements.delete(elementId);
    
    const interval = this.animationIntervals.get(elementId);
    if (interval) {
      clearInterval(interval);
      this.animationIntervals.delete(elementId);
    }

    this.frameHistory.delete(elementId);

    // Notify listeners
    if (this.onElementAnimationStopped) {
      this.onElementAnimationStopped(elementId);
    }

    console.log(`📊 Remaining animated elements: ${this.animatedElements.size}`);
  }

  // Check if an element is currently animated
  isAnimated(elementId: string): boolean {
    // Check if this is a SimpleFrame - if so, check if any of its children are animated
    const elementType = this.getElementType(elementId);
    if (elementType === 'SimpleFrame') {
      const childElementIds = this.getChildElementIds(elementId);
      return childElementIds.some(childId => this.animatedElements.has(childId));
    }

    // Regular check for non-SimpleFrame elements
    return this.animatedElements.has(elementId);
  }

  // Check if any element is currently animated
  hasAnyAnimatedElement(): boolean {
    return this.animatedElements.size > 0;
  }

  // Get all currently animated element IDs
  getAnimatedElementIds(): string[] {
    return Array.from(this.animatedElements.keys());
  }

  // Get the currently animated element ID (for backward compatibility)
  // Returns the first animated element or null if none
  getCurrentAnimatedElement(): string | null {
    return this.animatedElements.size > 0 ? Array.from(this.animatedElements.keys())[0] : null;
  }

  // Get animated element info
  getAnimatedElement(elementId: string): AnimatedElement | undefined {
    return this.animatedElements.get(elementId);
  }

  // Get frame history for an element
  getFrameHistory(elementId: string): AnimationFrame[] {
    return this.frameHistory.get(elementId) || [];
  }

  // Get all frames from all elements (for timeline display)
  getAllFrames(): AnimationFrame[] {
    const allFrames: AnimationFrame[] = [];
    for (const frames of this.frameHistory.values()) {
      allFrames.push(...frames);
    }
    // Sort by timestamp to maintain chronological order
    return allFrames.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Get frames organized by frame index for timeline display
  getFramesByIndex(): Map<number, AnimationFrame[]> {
    const framesByIndex = new Map<number, AnimationFrame[]>();
    
    for (const [elementId, frames] of this.frameHistory.entries()) {
      const animatedElement = this.animatedElements.get(elementId);
      if (animatedElement && frames.length > 0) {
        // Get the latest frame for this element
        const latestFrame = frames[frames.length - 1];
        framesByIndex.set(animatedElement.frameIndex, [latestFrame]);
        
      }
    }
    return framesByIndex;
  }

  // Set callback for when a frame is captured
  setOnFrameCaptured(callback: (frame: AnimationFrame) => void): void {
    this.onFrameCaptured = callback;
  }

  // Set callback for when animation starts
  setOnElementAnimationStarted(callback: (elementId: string, frameIndex: number) => void): void {
    this.onElementAnimationStarted = callback;
  }

  // Set callback for when animation stops
  setOnElementAnimationStopped(callback: (elementId: string) => void): void {
    this.onElementAnimationStopped = callback;
  }

  // Get the border color of a parent frame
  private getParentFrameBorderColor(parentFrameId: string): string | undefined {
    try {
      console.log(`🔍 Looking for parent frame color for: ${parentFrameId}`);
      
      // First, try to get the color from the pages data (most reliable)
      if (this.pages && this.pages.length > 0) {
        const page = this.pages[0];
        if (page.layers && page.layers[parentFrameId]) {
          const frameLayer = page.layers[parentFrameId];
          if (frameLayer && frameLayer.data && frameLayer.data.props) {
            // Generate the same color that would be used in SimpleFrameContent
            const frameColor = this.generateFrameColor(parentFrameId);
            console.log(`✅ Found frame color from pages data for ${parentFrameId}: ${frameColor}`);
            return frameColor;
          }
        }
      }
      
      // Fallback: try to get from DOM data attribute
      const parentFrameElement = document.querySelector(`.${CSS.escape(parentFrameId)}`);
      if (parentFrameElement) {
        const frameColor = parentFrameElement.getAttribute('data-frame-color');
        if (frameColor) {
          console.log(`✅ Found frame color from DOM data attribute for ${parentFrameId}: ${frameColor}`);
          return frameColor;
        }
      }
      
      // If we can't find the color, generate it using the same algorithm
      const generatedColor = this.generateFrameColor(parentFrameId);
      console.log(`🎨 Generated frame color for ${parentFrameId}: ${generatedColor}`);
      return generatedColor;
      
    } catch (error) {
      console.warn(`Error getting parent frame border color for ${parentFrameId}:`, error);
      return this.generateFrameColor(parentFrameId);
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

  // Capture a single frame of an element
  private async captureFrame(elementId: string): Promise<void> {
    try {
      const animatedElement = this.animatedElements.get(elementId);
      if (!animatedElement) {
        console.warn(`Element ${elementId} is no longer animated, skipping capture`);
        return;
      }



      // Find the specific layer element to capture
      const element = this.findElementByLayerId(elementId);
      
      if (!element) {
        console.warn(`Element with ID ${elementId} not found for screenshot`);
        return;
      }

      // Check if element is visible and has dimensions
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn(`Element ${elementId} has no dimensions, skipping capture`);
        return;
      }

      // Capture the screenshot directly from the element
      const imageDataUrl = await toPng(element as HTMLElement, {
        style: {
          transform: 'none', // Ensure no transforms are applied during capture
        },
        // quality: 0.8, // Reduce quality to prevent memory issues
        // width: Math.min(rect.width, 800), // Limit width
        // height: Math.min(rect.height, 600), // Limit height
      });

      // Validate the captured image data
      if (!imageDataUrl || imageDataUrl.length < 100) {
        console.warn(`Invalid image data captured for element ${elementId}`);
        return;
      }

             // Create frame data
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
           this.getParentFrameBorderColor(animatedElement.parentFrameId) : undefined,
       };

      // If we couldn't get the parent frame color initially, try again after a short delay
      if (animatedElement.parentFrameId && !frame.parentFrameBorderColor) {
        setTimeout(() => {
          const retryColor = this.getParentFrameBorderColor(animatedElement.parentFrameId!);
          if (retryColor && retryColor !== '#ff0000') {
            frame.parentFrameBorderColor = retryColor;
            console.log(`🔄 Updated frame color for ${elementId} to ${retryColor}`);
          }
        }, 100);
      }

      // Store in history (replace previous frame for this element)
      const history = this.frameHistory.get(elementId) || [];
      history.push(frame);
      this.frameHistory.set(elementId, history);

      // Update last capture time
      animatedElement.lastCaptureTime = Date.now();



      // Call callback if set
      if (this.onFrameCaptured) {
        this.onFrameCaptured(frame);
      }

    } catch (error) {
      console.error(`❌ Error capturing animation frame for element ${elementId}:`, error);
      // Don't re-throw the error to prevent breaking the animation loop
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

  // Clean up all animations
  cleanup(): void {
    console.log(`🧹 Cleaning up all animations (${this.animatedElements.size} elements)`);
    
    this.animationIntervals.forEach(interval => clearInterval(interval));
    this.animationIntervals.clear();
    this.animatedElements.clear();
    this.frameHistory.clear();
    this.nextFrameIndex = 0;
    
    console.log('✅ All animations cleaned up');
  }

  // Debug method to inspect all SimpleFrame elements and their colors
  debugSimpleFrameColors(): void {
    console.log('🔍 Debugging SimpleFrame Colors:');
    
    // Find all elements that might be SimpleFrames
    const allElements = document.querySelectorAll('*');
    const simpleFrameElements = Array.from(allElements).filter(el => {
      const className = el.className || '';
      const style = el.getAttribute('style') || '';
      return className.includes('css-') || style.includes('border') || el.getAttribute('data-frame-color');
    });
    
    console.log(`Found ${simpleFrameElements.length} potential SimpleFrame elements`);
    
    simpleFrameElements.forEach((element, index) => {
      const className = element.className || '';
      const dataFrameColor = element.getAttribute('data-frame-color');
      const computedStyle = window.getComputedStyle(element);
      
      console.log(`Element ${index}:`, {
        tagName: element.tagName,
        className: className,
        id: element.id,
        dataFrameColor: dataFrameColor,
        computedBorderColor: computedStyle.borderColor,
        computedBorderTopColor: computedStyle.borderTopColor,
        computedBorderLeftColor: computedStyle.borderLeftColor,
        computedBorderRightColor: computedStyle.borderRightColor,
        computedBorderBottomColor: computedStyle.borderBottomColor,
        element: element
      });
    });
  }

  // Debug method to show current state
  debugState(): void {
    console.log('🔍 AnimationService State:');
    console.log(`📊 ${this.animatedElements.size} animated elements, next index: ${this.nextFrameIndex}`);
    
    for (const [elementId, animatedElement] of this.animatedElements.entries()) {
      const frames = this.frameHistory.get(elementId) || [];
      console.log(`  ${elementId}: frame ${animatedElement.frameIndex}, ${frames.length} captures`);
      
      // Show detailed frame info
      if (frames.length > 0) {
        const latestFrame = frames[frames.length - 1];
        console.log(`    Latest frame: ID=${latestFrame.id}, Size=${Math.round(latestFrame.imageDataUrl.length / 1024)}KB`);
        console.log(`    Frame timestamp: ${new Date(latestFrame.timestamp).toLocaleTimeString()}`);
      }
    }
    
    // Show frames by index
    const framesByIndex = this.getFramesByIndex();
    console.log('🎯 Timeline frames:', Array.from(framesByIndex.entries()).map(([index, frames]) => 
      `${index}:${frames[0]?.elementId}`
    ).join(', '));
    
    // Debug element finding with new class-based approach
    console.log('🔍 Element finding debug (new class-based approach):');
    for (const [elementId, animatedElement] of this.animatedElements.entries()) {
      // Try to find by new class-based approach
      const elementByClass = document.querySelector(`.${elementId}`);
      if (elementByClass) {
        const rect = elementByClass.getBoundingClientRect();
        const textContent = elementByClass.textContent || '';
        console.log(`  Element ${elementId}:`);
        console.log(`    Found by class: ${elementByClass.tagName} (${elementByClass.className})`);
        console.log(`    Dimensions: ${rect.width}x${rect.height}`);
        console.log(`    Text content: "${textContent.substring(0, 50)}${textContent.length > 50 ? '...' : ''}"`);
        console.log(`    Element ID: ${elementByClass.id}`);
        console.log(`    Data attributes:`, elementByClass.getAttributeNames().map(name => `${name}="${elementByClass.getAttribute(name)}"`).join(', '));
      } else {
        console.log(`  Element ${elementId}: NOT FOUND by class`);
      }
    }
    
    // Also show all elements with css-19b3lhe class for comparison
    const cssElements = document.querySelectorAll('.css-19b3lhe');
    console.log(`🔍 Found ${cssElements.length} elements with css-19b3lhe class:`);
    cssElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const textContent = element.textContent || '';
      console.log(`  ${index}: ${element.tagName} (${element.className}) - ${rect.width}x${rect.height} - "${textContent.substring(0, 30)}${textContent.length > 30 ? '...' : ''}"`);
    });
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
}

export default AnimationService; 