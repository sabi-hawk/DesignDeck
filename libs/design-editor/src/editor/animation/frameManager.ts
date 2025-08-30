import { FrameData } from './types';
import { generateFrameColor } from './utils';

/**
 * Frame management utilities extracted from FrameVideoReplacer
 */
export class FrameManager {
  private pages: any[] = [];

  constructor(pages: any[] = []) {
    this.pages = pages;
  }

  updatePagesData(pages: any[]): void {
    this.pages = pages;
  }

  /**
   * Get the type of an element from the pages data
   */
  getElementType(elementId: string): string | null {
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

  /**
   * Find the parent SimpleFrame that contains a given element
   */
  findParentSimpleFrame(elementId: string): string | null {
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

  /**
   * Get frame data from pages state
   */
  getFrameDataFromPages(frameId: string): FrameData | null {
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
        color: frameLayer.data.props.color || generateFrameColor(frameId)
      };

    } catch (error) {
      console.error(`❌ Error getting frame data from pages:`, error);
      return null;
    }
  }

  /**
   * Get child element IDs for a SimpleFrame based on spatial coordinates
   */
  getChildElementIds(frameId: string): string[] {
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
