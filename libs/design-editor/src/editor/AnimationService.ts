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
}

export interface AnimatedElement {
  id: string;
  frameIndex: number; // Reserved timeline frame position
  startTime: number;
  lastCaptureTime: number;
  settings: AnimationSettings; // Animation configuration settings
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

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // Start animating an element (supports multiple elements)
  startAnimation(elementId: string, settings: AnimationSettings): boolean {
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
    };

    this.animatedElements.set(elementId, animatedElement);
    this.frameHistory.set(elementId, []);

    console.log(`🎬 Starting animation for element ${elementId} at frame index ${frameIndex}`);
    console.log(`📊 Total animated elements: ${this.animatedElements.size}`);

    // Start capturing frames every 10 seconds
    const interval = setInterval(async () => {
      await this.captureFrame(elementId);
    }, 10000);

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
       };

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
}

export default AnimationService; 