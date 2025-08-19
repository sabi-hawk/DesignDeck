import { toPng } from 'html-to-image';

export interface AnimationFrame {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  elementId: string;
}

export class AnimationService {
  private static instance: AnimationService;
  private animationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private animatedElements: Set<string> = new Set();
  private frameHistory: Map<string, AnimationFrame[]> = new Map();
  private onFrameCaptured?: (frame: AnimationFrame) => void;

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // Start animating an element (only one at a time)
  startAnimation(elementId: string): boolean {
    // If another element is already animated, return false
    if (this.animatedElements.size > 0) {
      return false;
    }

    this.animatedElements.add(elementId);
    this.frameHistory.set(elementId, []);

    // Start capturing frames every 10 seconds
    const interval = setInterval(async () => {
      await this.captureFrame(elementId);
    }, 10000);

    this.animationIntervals.set(elementId, interval);

    // Capture first frame immediately
    this.captureFrame(elementId);

    return true;
  }

  // Stop animating an element
  stopAnimation(elementId: string): void {
    this.animatedElements.delete(elementId);
    
    const interval = this.animationIntervals.get(elementId);
    if (interval) {
      clearInterval(interval);
      this.animationIntervals.delete(elementId);
    }

    this.frameHistory.delete(elementId);
  }

  // Check if an element is currently animated
  isAnimated(elementId: string): boolean {
    return this.animatedElements.has(elementId);
  }

  // Check if any element is currently animated
  hasAnyAnimatedElement(): boolean {
    return this.animatedElements.size > 0;
  }

  // Get the currently animated element ID
  getCurrentAnimatedElement(): string | null {
    return this.animatedElements.size > 0 ? Array.from(this.animatedElements)[0] : null;
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

  // Set callback for when a frame is captured
  setOnFrameCaptured(callback: (frame: AnimationFrame) => void): void {
    this.onFrameCaptured = callback;
  }

  // Capture a single frame of an element
  private async captureFrame(elementId: string): Promise<void> {
    try {
      // Find the specific layer element to capture
      const element = this.findElementByLayerId(elementId);
      
      if (!element) {
        console.warn(`Element with ID ${elementId} not found for screenshot`);
        return;
      }

      // Capture the screenshot directly from the element
      const imageDataUrl = await toPng(element as HTMLElement, {
        style: {
          transform: 'none', // Ensure no transforms are applied during capture
        }
      });

      // Create frame data
      const frame: AnimationFrame = {
        id: `${elementId}-${Date.now()}`,
        timestamp: Date.now(),
        imageDataUrl,
        elementId,
      };

      // Store in history
      const history = this.frameHistory.get(elementId) || [];
      history.push(frame);
      this.frameHistory.set(elementId, history);

      // Log to console (as requested)
      console.log('Captured animation frame:', frame);

      // Call callback if set
      if (this.onFrameCaptured) {
        this.onFrameCaptured(frame);
      }

    } catch (error) {
      console.error('Error capturing animation frame:', error);
    }
  }

  // Find the actual DOM element by layer ID
  private findElementByLayerId(layerId: string): Element | null {
    // Look for elements with class css-19b3lhe that might contain our layer
    const elements = document.querySelectorAll('.css-19b3lhe');
    
    // First, try to find by data attributes or IDs
    for (const element of elements) {
      if (element.getAttribute('data-layer-id') === layerId || 
          element.id === layerId ||
          element.textContent?.includes(layerId)) {
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
    return document.querySelector('.css-19b3lhe');
  }

  // Clean up all animations
  cleanup(): void {
    this.animationIntervals.forEach(interval => clearInterval(interval));
    this.animationIntervals.clear();
    this.animatedElements.clear();
    this.frameHistory.clear();
  }
}

export default AnimationService; 