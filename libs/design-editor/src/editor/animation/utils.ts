/**
 * Generate a unique color based on a layer ID
 * Uses the same algorithm as SimpleFrameContent
 */
export const generateFrameColor = (layerId: string): string => {
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
};

/**
 * Find the actual DOM element by layer ID
 */
export const findElementByLayerId = (layerId: string): Element | null => {
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

/**
 * Get the type of an element from the pages data
 */
export const getElementType = (pages: any[], elementId: string): string | null => {
  try {
    if (!pages || pages.length === 0) {
      return null;
    }

    const page = pages[0];
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
};

/**
 * Find the parent SimpleFrame that contains a given element
 */
export const findParentSimpleFrame = (pages: any[], elementId: string): string | null => {
  try {
    if (!pages || pages.length === 0) {
      return null;
    }

    const page = pages[0];
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
};

/**
 * Get child element IDs for a SimpleFrame based on spatial coordinates
 */
export const getChildElementIds = (pages: any[], frameId: string): string[] => {
  try {
    if (!pages || pages.length === 0) {
      return [];
    }

    const page = pages[0];
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
};

/**
 * Convert data URL to File object
 */
export const dataURLToFile = (dataURL: string, filename: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const file = new File([u8arr], filename, { type: mime });
      resolve(file);
    } catch (error) {
      reject(error);
    }
  });
};
