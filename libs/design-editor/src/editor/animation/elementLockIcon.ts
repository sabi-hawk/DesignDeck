import { findElementByLayerId, getElementType } from './utils';

/**
 * Add a lock icon to an animated element to indicate it's locked to the frame
 */
export const addLockIconToElement = (elementId: string, pages: unknown[] = []): void => {
  try {
    // Find the element using the same logic as other animation functions
    const element = findElementByLayerId(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for lock icon`);
      return;
    }

    // Check if lock icon already exists
    const existingLockIcon = element.querySelector('.element-lock-icon');
    if (existingLockIcon) {
      console.log(`🔒 Lock icon already exists for element ${elementId}`);
      return;
    }

    // Check if this element is an image type to determine positioning
    const elementType = getElementType(pages as unknown[], elementId);
    // Check for various image-related types
    const isImageElement = elementType === 'ImageLayer' || 
                          elementType === 'Image' || 
                          elementType === 'image' ||
                          elementType === 'ImageElement' ||
                          (element.tagName === 'IMG') ||
                          (element.querySelector('img') !== null);
    
    console.log(`🔒 Element ${elementId} type: ${elementType}, isImageElement: ${isImageElement}`);
    console.log(`🔒 Element tag: ${element.tagName}, has img child: ${element.querySelector('img') !== null}`);
    console.log(`🔒 Available element types in pages:`, pages.length > 0 ? 'Pages data available' : 'No pages data');
    
    // Get element dimensions for adaptive sizing
    const elementRect = element.getBoundingClientRect();
    const elementHeight = elementRect.height;
    const elementWidth = elementRect.width;
    
    console.log(`🔒 Element ${elementId} dimensions: ${elementWidth}x${elementHeight}`);
    
    // Determine sizing based on element type and dimensions
    const isTextElement = !isImageElement; // If not an image, treat as text
    
    // For text elements, use 95% of height with a reasonable minimum
    // For very small text, ensure minimum readable size
    let iconSize: number;
    if (isTextElement) {
      const calculatedSize = elementHeight * 0.95;
      iconSize = Math.max(calculatedSize, 50); // Increased minimum to 50px for better visibility
      console.log(`🔒 Text element: calculated size = ${calculatedSize}px, using ${iconSize}px`);
    } else {
      iconSize = 120; // Keep 120px for image elements
    }
    
    const iconSVGSize = isTextElement ? Math.max(iconSize * 0.7, 35) : 80; // Increased SVG ratio to 70% for text
    
    console.log(`🔒 Final sizing - Icon: ${iconSize}px, SVG: ${iconSVGSize}px, isTextElement: ${isTextElement}`);

    // Create lock icon container with play button styling
    const lockIconContainer = document.createElement('div');
    lockIconContainer.className = 'element-lock-icon';
    lockIconContainer.setAttribute('data-element-id', elementId);
    
    // Style the lock icon based on element type - matching play button design
    const lockIconStyles = isImageElement ? 
      // Bottom-left positioning for image elements (inside the element)
      `
        position: absolute;
        bottom: 20px;
        left: 20px;
        cursor: pointer;
        z-index: 1002;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(255, 107, 107, 0.3);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        pointer-events: none;
      ` :
      // Middle-left positioning for all other elements (inside the element)
      `
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        cursor: pointer;
        z-index: 1002;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(255, 107, 107, 0.3);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        pointer-events: none;
      `;
    
    lockIconContainer.style.cssText = lockIconStyles;

    // Create lock icon SVG with adaptive size
    const lockIcon = document.createElement('div');
    lockIcon.innerHTML = `
      <svg width="${iconSVGSize}" height="${iconSVGSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill="#ff6b6b"/>
      </svg>
    `;

    lockIconContainer.appendChild(lockIcon);

    // Add hover effects - adjust transform based on element type
    lockIconContainer.addEventListener('mouseenter', () => {
      lockIconContainer.style.background = 'rgba(0, 0, 0, 0.9)';
      if (isImageElement) {
        lockIconContainer.style.transform = 'scale(1.1)';
      } else {
        lockIconContainer.style.transform = 'translateY(-50%) scale(1.1)';
      }
      lockIconContainer.style.borderColor = 'rgba(255, 107, 107, 0.6)';
    });

    lockIconContainer.addEventListener('mouseleave', () => {
      lockIconContainer.style.background = 'rgba(0, 0, 0, 0.7)';
      if (isImageElement) {
        lockIconContainer.style.transform = 'scale(1)';
      } else {
        lockIconContainer.style.transform = 'translateY(-50%) scale(1)';
      }
      lockIconContainer.style.borderColor = 'rgba(255, 107, 107, 0.3)';
    });

    // Make sure the parent element has relative positioning
    const elementStyle = window.getComputedStyle(element);
    if (elementStyle.position === 'static') {
      (element as HTMLElement).style.position = 'relative';
    }

    // Append the lock icon to the element
    element.appendChild(lockIconContainer);

    console.log(`🔒 Added lock icon to element ${elementId}`);
  } catch (error) {
    console.error(`❌ Error adding lock icon to element ${elementId}:`, error);
  }
};

/**
 * Remove lock icon from an element
 */
export const removeLockIconFromElement = (elementId: string, pages: unknown[] = []): void => {
  try {
    const element = findElementByLayerId(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for lock icon removal`);
      return;
    }

    const lockIcon = element.querySelector('.element-lock-icon');
    if (lockIcon) {
      lockIcon.remove();
      console.log(`🔓 Removed lock icon from element ${elementId}`);
    }
  } catch (error) {
    console.error(`❌ Error removing lock icon from element ${elementId}:`, error);
  }
};

/**
 * Check if an element has a lock icon
 */
export const hasLockIcon = (elementId: string, pages: unknown[] = []): boolean => {
  try {
    const element = findElementByLayerId(elementId);
    if (!element) return false;
    
    return element.querySelector('.element-lock-icon') !== null;
  } catch (error) {
    console.error(`❌ Error checking lock icon for element ${elementId}:`, error);
    return false;
  }
};
