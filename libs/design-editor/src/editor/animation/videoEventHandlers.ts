/**
 * Video playback controls and event handlers extracted from FrameVideoReplacer
 */
export class VideoEventHandlers {
  /**
   * Set up video controls and event handlers for a video container
   */
  static setupVideoControls(
    videoElement: HTMLVideoElement,
    playButton: HTMLDivElement,
    pauseButton: HTMLDivElement,
    videoContainer: HTMLDivElement,
    originalFrameId: string
  ): void {
    
    // Play button click handler
    playButton.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Clear selection when play button is clicked
      const clearSelectionEvent = new CustomEvent('clearSelectionOnPlay');
      document.dispatchEvent(clearSelectionEvent);
      
      // Check if video is ready to play
      if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        videoElement.addEventListener('canplay', () => {
          videoElement.play().then(() => {
            console.log(`✅ Video started playing for frame ${originalFrameId}`);
          }).catch((error) => {
            console.error(`❌ Error playing video for frame ${originalFrameId}:`, error);
          });
        }, { once: true });
      } else {
        videoElement.play().then(() => {
          console.log(`✅ Video started playing for frame ${originalFrameId}`);
        }).catch((error) => {
          console.error(`❌ Error playing video for frame ${originalFrameId}:`, error);
        });
      }
      
      playButton.style.opacity = '0';
      playButton.style.pointerEvents = 'none';
      pauseButton.style.opacity = '1';
      pauseButton.style.pointerEvents = 'auto';

      // Auto-hide pause button after 4 seconds
      setTimeout(() => {
        if (!videoElement.paused && !videoElement.ended) {
          pauseButton.style.opacity = '0';
          pauseButton.style.pointerEvents = 'none';
        }
      }, 4000);
    });

    // Pause button click handler
    pauseButton.addEventListener('click', (e) => {
      e.stopPropagation();
      videoElement.pause();
      pauseButton.style.opacity = '0';
      pauseButton.style.pointerEvents = 'none';
      playButton.style.opacity = '1';
      playButton.style.pointerEvents = 'auto';
    });

    // Video event handlers
    videoElement.addEventListener('play', () => {
      playButton.style.opacity = '0';
      playButton.style.pointerEvents = 'none';
      pauseButton.style.opacity = '1';
      pauseButton.style.pointerEvents = 'auto';

      // Auto-hide pause button after 4 seconds
      setTimeout(() => {
        if (!videoElement.paused && !videoElement.ended) {
          pauseButton.style.opacity = '0';
          pauseButton.style.pointerEvents = 'none';
        }
      }, 4000);
    });

    videoElement.addEventListener('pause', () => {
      pauseButton.style.opacity = '0';
      pauseButton.style.pointerEvents = 'none';
      playButton.style.opacity = '1';
      playButton.style.pointerEvents = 'auto';
    });

    // Handle video end - show play button again
    videoElement.addEventListener('ended', () => {
      pauseButton.style.opacity = '0';
      pauseButton.style.pointerEvents = 'none';
      playButton.style.opacity = '1';
      playButton.style.pointerEvents = 'auto';
    });

    // Show pause button on hover when video is playing
    videoContainer.addEventListener('mouseenter', () => {
      if (!videoElement.paused && !videoElement.ended) {
        pauseButton.style.opacity = '1';
        pauseButton.style.pointerEvents = 'auto';
      }
    });

    // Hide pause button on mouse leave (with delay)
    videoContainer.addEventListener('mouseleave', () => {
      if (!videoElement.paused && !videoElement.ended) {
        setTimeout(() => {
          if (!videoContainer.matches(':hover')) {
            pauseButton.style.opacity = '0';
            pauseButton.style.pointerEvents = 'none';
          }
        }, 1000);
      }
    });
  }

  /**
   * Set up container hover effects
   */
  static setupContainerHoverEffects(
    videoContainer: HTMLDivElement,
    videoElement: HTMLVideoElement,
    pauseButton: HTMLDivElement,
    originalTransform: string
  ): void {
    // Add hover effects (matching old implementation for stability)
    videoContainer.addEventListener('mouseenter', () => {
      videoContainer.style.transform = `${originalTransform} scale(1.02)`;
      videoContainer.style.boxShadow = `
        0 12px 40px rgba(0,0,0,0.4),
        0 6px 20px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.3)
      `;
    });

    videoContainer.addEventListener('mouseleave', () => {
      videoContainer.style.transform = originalTransform;
      videoContainer.style.boxShadow = `
        0 8px 32px rgba(0,0,0,0.3),
        0 4px 16px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.2)
      `;
    });
  }

  /**
   * Set up video ended handler to hide video and show element play button
   */
  static setupVideoEndedHandler(
    videoElement: HTMLVideoElement,
    videoContainer: HTMLDivElement,
    elementPlayButton: HTMLDivElement | null
  ): void {
    videoElement.addEventListener('ended', () => {
      // Hide the video container
      videoContainer.style.display = 'none';
      
      // Get the animated element reference directly from the video container
      const animatedElement = (videoContainer as any).animatedElement as HTMLElement;
      console.log(`🎬 Looking for animated element in video container:`, animatedElement);
      if (animatedElement) {
        // Show the animated element again
        animatedElement.style.display = '';
        console.log(`🎬 Video ended, restored animated element to canvas:`, animatedElement);
      } else {
        console.warn(`⚠️ No animated element reference found in video container`);
      }
      
      // Show the play button on the element again (if it exists)
      if (elementPlayButton) {
        elementPlayButton.style.display = 'flex';
        console.log(`🎬 Video ended for frame, hiding video and showing play button`);
      } else {
        console.log(`🎬 Video ended for frame, hiding video (no element play button found)`);
      }
    });
  }

  /**
   * Stop video and return to element play button
   */
  static stopVideoAndReturnToElement(
    videoElement: HTMLVideoElement,
    videoContainer: HTMLDivElement,
    elementPlayButton: HTMLDivElement | null
  ): void {
    // Pause the video
    videoElement.pause();
    
    // Reset video to beginning
    videoElement.currentTime = 0;
    
    // Hide the video container
    videoContainer.style.display = 'none';
    
    // Get the animated element reference directly from the video container
    const animatedElement = (videoContainer as any).animatedElement as HTMLElement;
    console.log(`⏹️ Looking for animated element in video container:`, animatedElement);
    if (animatedElement) {
      // Show the animated element again
      animatedElement.style.display = '';
      console.log(`🎬 Restored animated element to canvas:`, animatedElement);
    } else {
      console.warn(`⚠️ No animated element reference found in video container`);
    }
    
    // Show the play button on the element again (if it exists)
    if (elementPlayButton) {
      elementPlayButton.style.display = 'flex';
      console.log(`⏹️ Video stopped, hiding video and showing element play button`);
    } else {
      console.log(`⏹️ Video stopped, hiding video (no element play button found)`);
    }
  }
}
