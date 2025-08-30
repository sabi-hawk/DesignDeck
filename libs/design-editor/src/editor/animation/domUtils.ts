import { DOMPosition } from './types';
import { generateFrameColor } from './utils';

/**
 * DOM manipulation and positioning utilities extracted from FrameVideoReplacer
 */
export class DOMUtils {
  /**
   * Find the actual DOM element by layer ID
   */
  static findElementByLayerId(layerId: string): Element | null {
    // First, try to find by the new class-based approach (element ID as class)
    const elementByClass = document.querySelector(`.${CSS.escape(layerId)}`)
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
    for (const element of elements) {
      const textContent = element.textContent || '';
      const hasText = textContent.trim().length > 0;
      const rect = element.getBoundingClientRect();
      const hasSize = rect.width > 50 && rect.height > 50;

      if (hasText && hasSize) {
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

  /**
   * Get the DOM position and styling of the frame element
   */
  static getFrameDOMPosition(frameElement: Element): DOMPosition | null {
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

  /**
   * Find the canvas container
   */
  static findCanvasContainer(frameElement: Element): Element | null {
    try {
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

  /**
   * Get frame border color from any element
   */
  static getFrameBorderColorFromElement(element: Element): string {
    try {
      // First, try to get from the frame element's data-frame-color attribute
      const frameColor = element.getAttribute('data-frame-color');
      if (frameColor) {
        console.log(`✅ Found frame color from data-frame-color attribute: ${frameColor}`);
        return frameColor;
      }

      // If not found on this element, try to find the parent frame element
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
        const generatedColor = generateFrameColor(elementId);
        console.log(`🎨 Generated frame color from element ID ${elementId}: ${generatedColor}`);
        return generatedColor;
      }

      // Last fallback: generate a color based on the element's class
      const generatedColor = generateFrameColor('frame');
      console.log(`🎨 Generated fallback frame color: ${generatedColor}`);
      return generatedColor;

    } catch (error) {
      console.warn(`Error getting frame border color from element:`, error);
      return generateFrameColor('frame');
    }
  }

  /**
   * Get the frame's border color (matching old implementation)
   */
  static getFrameBorderColor(frameId: string, pages: any[]): string {
    try {
      // First try to get from pages data
      if (pages && pages.length > 0) {
        const page = pages[0];
        if (page.layers && page.layers[frameId]) {
          const frameLayer = page.layers[frameId];
          if (frameLayer && frameLayer.data && frameLayer.data.props) {
            // Generate the same color that would be used in SimpleFrameContent
            const frameColor = generateFrameColor(frameId);
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
      const generatedColor = generateFrameColor(frameId);
      console.log(`🎨 Generated frame color for ${frameId}: ${generatedColor}`);
      return generatedColor;

    } catch (error) {
      console.warn(`Error getting frame border color for ${frameId}:`, error);
      return generateFrameColor(frameId);
    }
  }
}
