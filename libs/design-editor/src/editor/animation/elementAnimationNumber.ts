import { findElementByLayerId, getElementType } from './utils';

/**
 * Add an animation order number to an animated element to show its position in the animation sequence
 */
export const addAnimationNumberToElement = (elementId: string, animationNumber: number, pages: unknown[] = []): void => {
  try {
    // Find the element using the same logic as other animation functions
    const element = findElementByLayerId(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for animation number`);
      return;
    }

    // Check if animation number already exists
    const existingNumber = element.querySelector('.element-animation-number');
    if (existingNumber) {
      // Update existing number
      const numberText = existingNumber.querySelector('.animation-number-text');
      if (numberText) {
        numberText.textContent = animationNumber.toString();
        console.log(`🔢 Updated animation number for element ${elementId} to ${animationNumber}`);
      }
      return;
    }

    // Check if this element is an image type to determine positioning
    const elementType = getElementType(pages as unknown[], elementId);
    const isImageElement = elementType === 'ImageLayer' || 
                          elementType === 'Image' || 
                          elementType === 'image' ||
                          elementType === 'ImageElement' ||
                          (element.tagName === 'IMG') ||
                          (element.querySelector('img') !== null);
    
    console.log(`🔢 Element ${elementId} type: ${elementType}, isImageElement: ${isImageElement}`);
    
    // Get element dimensions for adaptive sizing
    const elementRect = element.getBoundingClientRect();
    const elementHeight = elementRect.height;
    const elementWidth = elementRect.width;
    
    console.log(`🔢 Element ${elementId} dimensions: ${elementWidth}x${elementHeight}`);
    
    // Determine sizing based on element type and dimensions - match lock icon sizing
    const isTextElement = !isImageElement;
    let iconSize: number;
    if (isTextElement) {
      const calculatedSize = elementHeight * 0.95;
      iconSize = Math.max(calculatedSize, 50); // Same as lock icon: 95% of height with 50px minimum
    } else {
      iconSize = 120; // Same as lock icon: 120px for image elements
    }
    
    const iconSVGSize = isTextElement ? Math.max(iconSize * 0.7, 35) : 80; // Same as lock icon
    
    // Create animation number container
    const numberContainer = document.createElement('div');
    numberContainer.className = 'element-animation-number';
    numberContainer.setAttribute('data-element-id', elementId);
    
    // Style the animation number based on element type - positioned on right middle side
    const numberStyles = isImageElement ? 
      // Right middle positioning for image elements (inside the element)
      `
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        cursor: default;
        z-index: 1002;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(102, 126, 234, 0.8);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        font-weight: bold;
        color: white;
        font-size: ${iconSVGSize}px;
      ` :
      // Right middle positioning for all other elements (inside the element)
      `
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        cursor: default;
        z-index: 1002;
        transition: all 0.2s ease;
        opacity: 1;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        width: ${iconSize}px;
        height: ${iconSize}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(102, 126, 234, 0.8);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        font-weight: bold;
        color: white;
        font-size: ${iconSVGSize}px;
      `;
    
    numberContainer.style.cssText = numberStyles;

    // Create animation number text
    const numberText = document.createElement('div');
    numberText.className = 'animation-number-text';
    numberText.textContent = animationNumber.toString();
    numberText.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    `;
    
    numberContainer.appendChild(numberText);

    // Add the animation number to the element
    element.appendChild(numberContainer);
    
    // Set z-index on the parent element to ensure number is above other elements
    (element as HTMLElement).style.zIndex = '1001';
    (element as HTMLElement).style.position = 'relative';
    (element as HTMLElement).style.overflow = 'visible';
    
    console.log(`✅ Added animation number ${animationNumber} to element ${elementId} on right middle side`);
    
  } catch (error) {
    console.error(`❌ Error adding animation number to element ${elementId}:`, error);
  }
};

/**
 * Remove animation number from an element
 */
export const removeAnimationNumberFromElement = (elementId: string): void => {
  try {
    const element = findElementByLayerId(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for animation number removal`);
      return;
    }

    const animationNumber = element.querySelector('.element-animation-number');
    if (animationNumber) {
      animationNumber.remove();
      console.log(`🗑️ Removed animation number from element ${elementId}`);
    }
  } catch (error) {
    console.error(`❌ Error removing animation number from element ${elementId}:`, error);
  }
};

/**
 * Update animation number for an element
 */
export const updateAnimationNumberForElement = (elementId: string, newNumber: number): void => {
  try {
    const element = findElementByLayerId(elementId);
    if (!element) {
      console.warn(`⚠️ Element ${elementId} not found for animation number update`);
      return;
    }

    const animationNumber = element.querySelector('.element-animation-number');
    if (animationNumber) {
      const numberText = animationNumber.querySelector('.animation-number-text');
      if (numberText) {
        numberText.textContent = newNumber.toString();
        console.log(`🔢 Updated animation number for element ${elementId} to ${newNumber}`);
      }
    } else {
      // If no animation number exists, add one
      addAnimationNumberToElement(elementId, newNumber);
    }
  } catch (error) {
    console.error(`❌ Error updating animation number for element ${elementId}:`, error);
  }
};
