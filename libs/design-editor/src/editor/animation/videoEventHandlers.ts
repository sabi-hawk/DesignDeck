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
    console.log(`🎬 Setting up video controls for frame ${originalFrameId}`);
    console.log(`🎬 Video element:`, videoElement);
    console.log(`🎬 Play button:`, playButton);
    console.log(`🎬 Pause button:`, pauseButton);
    console.log(`🎬 Video container:`, videoContainer);
    
    // Play button click handler
    playButton.addEventListener('click', (e) => {
      console.log(`▶️ Play button clicked for frame ${originalFrameId}`);
      e.stopPropagation();
      
      // Check video state before playing
      console.log(`🎬 Video state before play:`, {
        paused: videoElement.paused,
        ended: videoElement.ended,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        src: videoElement.src
      });
      
      // Check if video is ready to play
      if (videoElement.readyState < 2) { // HAVE_CURRENT_DATA
        console.log(`⏳ Video not ready to play, waiting for data...`);
        videoElement.addEventListener('canplay', () => {
          console.log(`✅ Video is now ready to play for frame ${originalFrameId}`);
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

      // Auto-hide pause button after 2 seconds
      setTimeout(() => {
        if (!videoElement.paused && !videoElement.ended) {
          pauseButton.style.opacity = '0';
          pauseButton.style.pointerEvents = 'none';
        }
      }, 2000);
    });

    // Pause button click handler
    pauseButton.addEventListener('click', (e) => {
      console.log(`⏸️ Pause button clicked for frame ${originalFrameId}`);
      e.stopPropagation();
      videoElement.pause();
      pauseButton.style.opacity = '0';
      pauseButton.style.pointerEvents = 'none';
      playButton.style.opacity = '1';
      playButton.style.pointerEvents = 'auto';
    });

    // Video event handlers
    videoElement.addEventListener('play', () => {
      console.log(`▶️ Video play event fired for frame ${originalFrameId}`);
      playButton.style.opacity = '0';
      playButton.style.pointerEvents = 'none';
      pauseButton.style.opacity = '1';
      pauseButton.style.pointerEvents = 'auto';

      // Auto-hide pause button after 2 seconds
      setTimeout(() => {
        if (!videoElement.paused && !videoElement.ended) {
          pauseButton.style.opacity = '0';
          pauseButton.style.pointerEvents = 'none';
        }
      }, 2000);
    });

    videoElement.addEventListener('pause', () => {
      console.log(`⏸️ Video pause event fired for frame ${originalFrameId}`);
      pauseButton.style.opacity = '0';
      pauseButton.style.pointerEvents = 'none';
      playButton.style.opacity = '1';
      playButton.style.pointerEvents = 'auto';
    });

    // Handle video end - show play button again
    videoElement.addEventListener('ended', () => {
      console.log(`🔚 Video ended for frame ${originalFrameId}`);
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

    console.log(`✅ Video controls set up for frame ${originalFrameId}`);
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
}
