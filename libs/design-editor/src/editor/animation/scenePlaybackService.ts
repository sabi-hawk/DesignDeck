/**
 * Service to handle sequential playback of videos in a scene
 */

const CSS_ESCAPE = (typeof window !== 'undefined' && window.CSS && window.CSS.escape) ||
  ((ident: string) => ident.replace(/[^a-zA-Z0-9-_]/g, '\\$&'));

export class ScenePlaybackService {
  private static instance: ScenePlaybackService;
  private currentSceneId: string | null = null;
  private currentElementIndex: number = 0;
  private sceneElements: Array<{
    elementId: string;
    frame: any;
    sceneRelativeIndex: number;
  }> = [];
  private isPlaying: boolean = false;

  private constructor() {
    // Private constructor for singleton pattern
    // Make service available globally for video end events
    if (typeof window !== 'undefined') {
      (window as any).ScenePlaybackService = this;
    }
  }


  static getInstance(): ScenePlaybackService {
    if (!ScenePlaybackService.instance) {
      ScenePlaybackService.instance = new ScenePlaybackService();
    }
    return ScenePlaybackService.instance;
  }

  /**
   * Start playing all videos in a scene sequentially
   */
  startScenePlayback(sceneId: string, elements: Array<{
    elementId: string;
    frame: any;
    sceneRelativeIndex: number;
  }>): void {
    console.log(`🎬 Starting scene playback for scene ${sceneId}`, elements);
    
    // Sort elements by their sceneRelativeIndex to ensure correct order
    const sortedElements = elements.sort((a, b) => a.sceneRelativeIndex - b.sceneRelativeIndex);
    
    this.currentSceneId = sceneId;
    this.sceneElements = sortedElements;
    this.currentElementIndex = 0;
    this.isPlaying = true;

    // Hide all elements in the scene initially
    this.hideAllSceneElements();

    // Start playing the first element
    this.playCurrentElement();
  }

  /**
   * Play the current element in the sequence
   */
  private playCurrentElement(): void {
    if (!this.isPlaying || this.currentElementIndex >= this.sceneElements.length) {
      this.stopScenePlayback();
      return;
    }

    const currentElement = this.sceneElements[this.currentElementIndex];
    console.log(`🎬 Playing element ${currentElement.elementId} (${this.currentElementIndex + 1}/${this.sceneElements.length})`);

    // Show only the current element
    // this.showCurrentElement();

    // Find the play button for this element and click it
    this.clickElementPlayButton(currentElement.elementId);
  }

  /**
   * Click the play button for a specific element
   */
  private clickElementPlayButton(elementId: string): void {
    // Find the element in the DOM by its ID
    const element = document.querySelector(`.${CSS_ESCAPE(elementId)}`) as HTMLElement;
    
    if (element) {
      // Find the play button within this element
      const playButton = element.querySelector('.element-play-button') as HTMLElement;
      
      if (playButton) {
        console.log(`🎬 Clicking play button for element ${elementId}`);
        playButton.click();
      } else {
        console.warn(`⚠️ Play button not found for element ${elementId}`);
        // Move to next element if current one doesn't have a play button
        this.moveToNextElement();
      }
    } else {
      console.warn(`⚠️ Element not found: ${elementId}`);
      // Move to next element if current one doesn't exist
      this.moveToNextElement();
    }
  }

  /**
   * Move to the next element in the sequence
   */
  private moveToNextElement(): void {
    // Hide the current element before moving to the next one
    if (this.currentElementIndex < this.sceneElements.length) {
      const currentElement = this.sceneElements[this.currentElementIndex];
      const elementWrapper = document.querySelector(`.${CSS_ESCAPE(currentElement.elementId)}`) as HTMLElement;
      if (elementWrapper) {
        elementWrapper.style.display = 'none';
        console.log(`🎬 Hidden current element: ${currentElement.elementId}`);
      }
    }

    this.currentElementIndex++;
    console.log(`🎬 Moving to next element: ${this.currentElementIndex}/${this.sceneElements.length}`);
    
    if (this.currentElementIndex < this.sceneElements.length) {
      // Wait a bit before playing the next element to ensure the current one has started
      setTimeout(() => {
        this.playCurrentElement();
      }, 100);
    } else {
      this.stopScenePlayback();
    }
  }

  /**
   * Hide all elements in the current scene
   */
  private hideAllSceneElements(): void {
    console.log(`🎬 Hiding all elements in scene ${this.currentSceneId}`);
    
    this.sceneElements.forEach(element => {
      const elementWrapper = document.querySelector(`.${CSS_ESCAPE(element.elementId)}`) as HTMLElement;
      if (elementWrapper) {
        elementWrapper.style.display = 'none';
        console.log(`🎬 Hidden element: ${element.elementId}`);
      } else {
        console.warn(`⚠️ Could not find element wrapper for: ${element.elementId}`);
      }
    });
  }

  /**
   * Show all elements in the current scene
   */
  private showAllSceneElements(): void {
    console.log(`🎬 Showing all elements in scene ${this.currentSceneId}`);
    
    this.sceneElements.forEach(element => {
      const elementWrapper = document.querySelector(`.${CSS_ESCAPE(element.elementId)}`) as HTMLElement;
      if (elementWrapper) {
        elementWrapper.style.display = '';
        console.log(`🎬 Shown element: ${element.elementId}`);
      } else {
        console.warn(`⚠️ Could not find element wrapper for: ${element.elementId}`);
      }
    });
  }

  // /**
  //  * Show only the current element
  //  */
  // private showCurrentElement(): void {
  //   if (this.currentElementIndex < this.sceneElements.length) {
  //     const currentElement = this.sceneElements[this.currentElementIndex];
  //     const elementWrapper = document.querySelector(`.${CSS_ESCAPE(currentElement.elementId)}`) as HTMLElement;
  //     if (elementWrapper) {
  //       elementWrapper.style.display = '';
  //       console.log(`🎬 Showing current element: ${currentElement.elementId}`);
  //     }
  //   }
  // }

  /**
   * Stop the scene playback
   */
  stopScenePlayback(): void {
    console.log(`🎬 Stopping scene playback for scene ${this.currentSceneId}`);
    
    // Show all elements again
    this.showAllSceneElements();
    
    this.isPlaying = false;
    this.currentSceneId = null;
    this.currentElementIndex = 0;
    this.sceneElements = [];
  }

  /**
   * Handle video end event - move to next element
   */
  handleVideoEnd(elementId: string): void {
    if (!this.isPlaying || this.currentSceneId === null) {
      return;
    }

    const currentElement = this.sceneElements[this.currentElementIndex];
    if (currentElement && currentElement.elementId === elementId) {
      console.log(`🎬 Video ended for element ${elementId}, moving to next`);
      this.moveToNextElement();
    }
  }

  /**
   * Check if scene playback is currently active
   */
  isScenePlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current scene ID
   */
  getCurrentSceneId(): string | null {
    return this.currentSceneId;
  }
}
