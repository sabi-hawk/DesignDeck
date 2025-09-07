import { findElementByLayerId } from './utils';

/**
 * Add a lock icon to an animated element to indicate it's locked to the frame
 */
export const addLockIconToElement = (elementId: string): void => {
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

    // Create lock icon container
    const lockIconContainer = document.createElement('div');
    lockIconContainer.className = 'element-lock-icon';
    lockIconContainer.setAttribute('data-element-id', elementId);
    lockIconContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: -20px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #ff6b6b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;

    // Create lock icon SVG
    const lockIcon = document.createElement('div');
    lockIcon.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill="#ff6b6b"/>
      </svg>
    `;

    lockIconContainer.appendChild(lockIcon);

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
export const removeLockIconFromElement = (elementId: string): void => {
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
export const hasLockIcon = (elementId: string): boolean => {
  try {
    const element = findElementByLayerId(elementId);
    if (!element) return false;
    
    return element.querySelector('.element-lock-icon') !== null;
  } catch (error) {
    console.error(`❌ Error checking lock icon for element ${elementId}:`, error);
    return false;
  }
};
