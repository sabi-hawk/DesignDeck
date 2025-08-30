/**
 * State removal and event dispatching utilities extracted from FrameVideoReplacer
 */
export class StateManager {
  /**
   * Remove all child elements from the editor state
   */
  static removeChildElementsFromState(frameId: string, childElementIds: string[]): void {
    try {
      console.log(`🗑️ Removing child elements from state for frame ${frameId}`);

      console.log(`🗑️ Found ${childElementIds.length} child elements to remove:`, childElementIds);

      // Dispatch custom event to remove elements from editor state
      const removeElementsEvent = new CustomEvent('removeElementsFromState', {
        detail: {
          elementIds: childElementIds,
          frameId: frameId
        }
      });
      document.dispatchEvent(removeElementsEvent);

      console.log(`🗑️ Dispatched removeElementsFromState event for ${childElementIds.length} elements`);

    } catch (error) {
      console.error(`❌ Error removing child elements from state for frame ${frameId}:`, error);
    }
  }

  /**
   * Remove the frame itself from the editor state
   */
  static removeFrameFromState(frameId: string): void {
    try {
      console.log(`🗑️ Removing frame ${frameId} from editor state`);

      // Dispatch custom event to remove the frame from editor state
      const removeFrameEvent = new CustomEvent('removeFrameFromState', {
        detail: {
          frameId: frameId
        }
      });
      document.dispatchEvent(removeFrameEvent);

      console.log(`🗑️ Dispatched removeFrameFromState event for frame ${frameId}`);

    } catch (error) {
      console.error(`❌ Error removing frame from state for ${frameId}:`, error);
    }
  }

  /**
   * Dispatch video replaced event
   */
  static dispatchVideoReplacedEvent(elementId: string, videoUrl: string, originalElementId: string, frameData: any, domPosition: any): void {
    const videoReplacedEvent = new CustomEvent('videoReplaced', {
      detail: {
        elementId: elementId,
        videoUrl: videoUrl,
        originalElementId: originalElementId,
        frameData: frameData,
        domPosition: domPosition
      }
    });
    document.dispatchEvent(videoReplacedEvent);
  }
}
