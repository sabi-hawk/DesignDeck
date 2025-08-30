/**
 * Scene numbering and management utilities extracted from FrameVideoReplacer
 */
export class SceneManager {
  private sceneCounter: Map<string, number> = new Map();
  private pages: any[] = [];

  constructor(pages: any[] = []) {
    this.pages = pages;
  }

  updatePagesData(pages: any[]): void {
    this.pages = pages;
  }

  /**
   * Get the next scene number for a frame
   */
  getNextSceneNumber(frameId: string): number {
    const currentCount = this.sceneCounter.get(frameId) || 0;
    this.sceneCounter.set(frameId, currentCount + 1);
    return currentCount + 1;
  }

  /**
   * Get the scene number for a given frame
   */
  getSceneNumberForFrame(frameId: string): number {
    try {
      if (!this.pages || this.pages.length === 0) {
        console.warn(`❌ No pages data available to determine scene number for frame ${frameId}`);
        return 0;
      }

      const page = this.pages[0];
      if (!page.layers) {
        console.warn(`❌ Page layers not found for frame ${frameId}`);
        return 0;
      }

      // Find all SimpleFrames and sort them by their position to determine scene order
      const simpleFrames: { frameId: string; position: { x: number; y: number } }[] = [];

      for (const [layerId, layer] of Object.entries(page.layers)) {
        // Skip if not a SimpleFrame
        if (!layer || !(layer as any).data || (layer as any).data.type !== 'SimpleFrame') {
          continue;
        }

        // Skip if not a valid layer with position data
        if (!(layer as any).data.props || !(layer as any).data.props.position) {
          continue;
        }

        const frameProps = (layer as any).data.props;
        const framePosition = frameProps.position;

        simpleFrames.push({
          frameId: layerId,
          position: framePosition
        });
      }

      // Sort frames by their position (top to bottom, left to right)
      simpleFrames.sort((a, b) => {
        // First sort by Y position (top to bottom)
        if (Math.abs(a.position.y - b.position.y) > 50) {
          return a.position.y - b.position.y;
        }
        // If Y positions are close, sort by X position (left to right)
        return a.position.x - b.position.x;
      });

      // Find the index of our frame in the sorted list
      const frameIndex = simpleFrames.findIndex(frame => frame.frameId === frameId);

      if (frameIndex === -1) {
        console.warn(`❌ Frame ${frameId} not found in SimpleFrames list`);
        return 0;
      }

      // Scene number is 1-based index
      const sceneNumber = frameIndex + 1;
      console.log(`🎬 Frame ${frameId} is scene ${sceneNumber} (${simpleFrames.length} total scenes)`);

      return sceneNumber;

    } catch (error) {
      console.error(`❌ Error getting scene number for frame ${frameId}:`, error);
      return 0;
    }
  }

  /**
   * Clear scene counter for a specific frame
   */
  resetSceneCounter(frameId: string): void {
    this.sceneCounter.delete(frameId);
    console.log(`🔄 Scene counter reset for frame ${frameId}`);
  }

  /**
   * Clear all scene counters
   */
  resetAllSceneCounters(): void {
    this.sceneCounter.clear();
    console.log('🔄 All scene counters reset');
  }
}
