import { toPng } from 'html-to-image';

export interface ElementCaptureOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Captures an element by its layer ID and returns the image data URL
 * @param elementId - The layer ID of the element to capture
 * @param options - Optional capture settings
 * @returns Promise<string> - The image data URL
 */
export const captureElement = async (
  elementId: string,
  options: ElementCaptureOptions = {}
): Promise<string | null> => {
  try {
    // Find the specific layer element to capture
    const element = findElementByLayerId(elementId);
    
    if (!element) {
      console.warn(`Element with ID ${elementId} not found for capture`);
      return null;
    }

    // Check if element is visible and has dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn(`Element ${elementId} has no dimensions, skipping capture`);
      return null;
    }

    // Capture the screenshot directly from the element
    const imageDataUrl = await toPng(element as HTMLElement, {
      style: {
        transform: 'none', // Ensure no transforms are applied during capture
      },
      // quality: options.quality || 0.8,
      // width: options.maxWidth ? Math.min(rect.width, options.maxWidth) : rect.width,
      // height: options.maxHeight ? Math.min(rect.height, options.maxHeight) : rect.height,
    });

    // Validate the captured image data
    if (!imageDataUrl || imageDataUrl.length < 100) {
      console.warn(`Invalid image data captured for element ${elementId}`);
      return null;
    }

    return imageDataUrl;

  } catch (error) {
    console.error(`Error capturing element ${elementId}:`, error);
    return null;
  }
};

/**
 * Find the actual DOM element by layer ID
 * @param layerId - The layer ID to search for
 * @returns Element | null - The found element or null
 */
const findElementByLayerId = (layerId: string): Element | null => {
  // First, try to find by the new class-based approach (element ID as class)
  const elementByClass = document.querySelector(`.${CSS.escape(layerId)}`);
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
};
