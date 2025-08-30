import { FrameData, DOMPosition } from './types';
import { DOMUtils } from './domUtils';
import { SceneManager } from './sceneManager';
import { VideoEventHandlers } from './videoEventHandlers';

/**
 * Video container creation and styling utilities extracted from FrameVideoReplacer
 */
export class VideoContainerBuilder {
  private sceneManager: SceneManager;

  constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  /**
   * Create a video container from frame data
   */
  createVideoContainerFromFrameData(
    frameData: FrameData,
    domPosition: DOMPosition,
    videoUrl: string,
    originalFrameId: string,
    pages: any[]
  ): HTMLDivElement | null {
    try {
      console.log(`🎬 Creating video container for frame ${originalFrameId}`);

      const { parentContainer, css19b3lheDiv, relativeLeft, relativeTop } = domPosition;
      const { boxSize } = frameData;

      // Get the correct frame border color using the frame ID
      const frameBorderColor = DOMUtils.getFrameBorderColorFromElement(domPosition.frameElement);
      console.log(`🎨 Using frame border color for ${originalFrameId}: ${frameBorderColor}`);

      // Get the scene number for this frame
      const sceneNumber = this.sceneManager.getSceneNumberForFrame(originalFrameId);
      console.log(`🎬 Scene number for frame ${originalFrameId}: ${sceneNumber}`);

      // Get the transform property from the original css-19b3lhe div
      const originalTransform = (css19b3lheDiv as HTMLElement).style.transform || '';
      console.log(`🎬 Original transform from css-19b3lhe div: ${originalTransform}`);

      console.log(`🎬 Creating video container with frame data:`, {
        size: boxSize,
        transform: originalTransform,
        borderColor: frameBorderColor,
        sceneNumber: sceneNumber
      });

      // Create a new video container div
      const videoContainer = document.createElement('div');
      videoContainer.className = `animation-video-standalone-container ${originalFrameId}-video`;
      videoContainer.setAttribute('data-original-frame-id', originalFrameId);
      videoContainer.setAttribute('data-video-url', videoUrl);
      videoContainer.setAttribute('data-frame-data', JSON.stringify(frameData));

      // Apply modern, aesthetic styling to the video container
      videoContainer.style.cssText = `
        position: absolute;
        width: ${boxSize.width}px;
        height: ${boxSize.height}px;
        border: 3px solid ${frameBorderColor};
        border-radius: 16px;
        overflow: hidden;
        z-index: 1000;
        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        pointer-events: auto;
        transform: ${originalTransform};
        box-shadow: 
          0 8px 32px rgba(0,0,0,0.3),
          0 4px 16px rgba(0,0,0,0.2),
          inset 0 1px 0 rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      // Hover effects will be set up by VideoEventHandlers.setupContainerHoverEffects()

      // Create the video element with enhanced styling
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.autoplay = false;
      videoElement.loop = false;
      videoElement.muted = true;
      videoElement.controls = false;
      
      // Add debugging for video loading
      console.log(`🎬 Creating video element with URL: ${videoUrl}`);
      
      // Add error handling for video loading
      videoElement.addEventListener('error', (e) => {
        console.error(`❌ Video loading error for frame ${originalFrameId}:`, e);
        console.error(`❌ Video error details:`, videoElement.error);
        console.error(`❌ Video network state:`, videoElement.networkState);
        console.error(`❌ Video ready state:`, videoElement.readyState);
      });

      videoElement.addEventListener('loadstart', () => {
        console.log(`🔄 Video loading started for frame ${originalFrameId}`);
      });

      videoElement.addEventListener('loadeddata', () => {
        console.log(`✅ Video data loaded successfully for frame ${originalFrameId}`);
      });

      videoElement.addEventListener('canplay', () => {
        console.log(`▶️ Video can play for frame ${originalFrameId}`);
      });

      // Wait for video to be ready before setting up controls
      const setupControlsWhenReady = () => {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
          console.log(`🎬 Video is ready, setting up controls for frame ${originalFrameId}`);
          
          // Set up video controls and event handlers
          VideoEventHandlers.setupVideoControls(
            videoElement,
            playButton,
            pauseButton,
            videoContainer,
            originalFrameId
          );
          
          console.log(`🎬 Setting up container hover effects for frame ${originalFrameId}...`);
          
          // Set up container hover effects
          VideoEventHandlers.setupContainerHoverEffects(
            videoContainer,
            videoElement,
            pauseButton,
            originalTransform
          );
        } else {
          console.log(`⏳ Video not ready yet for frame ${originalFrameId}, waiting...`);
          setTimeout(setupControlsWhenReady, 100);
        }
      };

      // Set a timeout to ensure controls are set up even if video fails to load
      setTimeout(() => {
        if (videoElement.readyState < 2) {
          console.log(`⚠️ Video loading timeout for frame ${originalFrameId}, setting up controls anyway`);
          VideoEventHandlers.setupVideoControls(
            videoElement,
            playButton,
            pauseButton,
            videoContainer,
            originalFrameId
          );
          
          VideoEventHandlers.setupContainerHoverEffects(
            videoContainer,
            videoElement,
            pauseButton,
            originalTransform
          );
        }
      }, 5000); // 5 second timeout

      // Set video attributes (matching old implementation for stability)
      videoElement.setAttribute('data-animation-video', 'true');
      videoElement.setAttribute('data-original-frame-id', originalFrameId);

      videoElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        border: none;
        outline: none;
        background: transparent;
        border-radius: 13px;
        transition: all 0.3s ease;
      `;

      // Add a subtle overlay for better text readability
      const videoOverlay = document.createElement('div');
      videoOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%);
        pointer-events: none;
        border-radius: 13px;
        z-index: 1;
      `;

      // Create modern, aesthetic play button overlay
      const playButton = document.createElement('div');
      playButton.className = `video-play-button ${originalFrameId}-play-button`;
      playButton.setAttribute('data-original-frame-id', originalFrameId);
      playButton.innerHTML = `
        <div class="play-button-inner">
          <div class="play-icon">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      `;
      playButton.style.cssText = `
        position: absolute;
        top: 12px;
        left: 12px;
        cursor: pointer;
        z-index: 1001;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 1;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
      `;

      // Create pause button overlay
      const pauseButton = document.createElement('div');
      pauseButton.className = `video-pause-button ${originalFrameId}-pause-button`;
      pauseButton.setAttribute('data-original-frame-id', originalFrameId);
      pauseButton.innerHTML = `
        <div class="pause-button-inner">
          <div class="pause-button-inner">
            <div class="pause-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V20H6V4Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>
      `;
      pauseButton.style.cssText = `
        position: absolute;
        top: 12px;
        left: 12px;
        cursor: pointer;
        z-index: 1001;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        pointer-events: none;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
      `;

      // Create lock icon in bottom-left corner
      const lockIcon = document.createElement('div');
      lockIcon.className = `video-lock-icon ${originalFrameId}-lock-icon`;
      lockIcon.setAttribute('data-original-frame-id', originalFrameId);
      lockIcon.innerHTML = `
        <div class="lock-icon-inner">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      `;
      lockIcon.style.cssText = `
        position: absolute;
        bottom: 12px;
        left: 12px;
        z-index: 1001;
        transition: all 0.3s ease;
        opacity: 0.8;
        filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
      `;

      // Add CSS for the play button styling
      const playButtonStyle = document.createElement('style');
      playButtonStyle.textContent = `
        .play-button-inner {
          position: relative;
          width: 248px;
          height: 248px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .play-icon {
          width: 248px;
          height: 248px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          z-index: 2;
          position: relative;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }
        
        .play-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
        }
      `;
      document.head.appendChild(playButtonStyle);

      // Add CSS for the pause button styling
      const pauseButtonStyle = document.createElement('style');
      pauseButtonStyle.textContent = `
        .pause-button-inner {
          position: relative;
          width: 248px;
          height: 248px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pause-icon {
          width: 248px;
          height: 248px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          z-index: 2;
          position: relative;
          border: 4px solid rgba(255, 255, 255, 0.3);
        }
        
        .pause-icon:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
        }
      `;
      document.head.appendChild(pauseButtonStyle);

      // Add CSS for the lock icon styling
      const lockIconStyle = document.createElement('style');
      lockIconStyle.textContent = `
        .lock-icon-inner {
          position: relative;
          width: 248px;
          height: 248px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .lock-icon-inner svg {
          width: 248px;
          height: 248px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 16px;
          padding: 40px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          border: 4px solid rgba(255, 255, 255, 0.2);
        }
        
        .lock-icon-inner:hover svg {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }
      `;
      document.head.appendChild(lockIconStyle);

      // Add video, overlay, and buttons to container
      videoContainer.appendChild(videoElement);
      videoContainer.appendChild(videoOverlay);
      videoContainer.appendChild(playButton);
      videoContainer.appendChild(pauseButton);
      videoContainer.appendChild(lockIcon);

      // Add scene label to the video container
      if (sceneNumber > 0) {
        const sceneLabel = document.createElement('div');
        sceneLabel.className = `video-scene-label ${originalFrameId}-scene-label`;
        sceneLabel.setAttribute('data-original-frame-id', originalFrameId);
        sceneLabel.textContent = `Scene ${sceneNumber}`;
        sceneLabel.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 70px;
          font-weight: bold;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 1002;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 2px solid ${frameBorderColor};
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        `;

        // Scene label hover effects
        sceneLabel.addEventListener('mouseenter', () => {
          sceneLabel.style.background = 'rgba(0, 0, 0, 0.9)';
          sceneLabel.style.transform = 'scale(1.05)';
        });

        sceneLabel.addEventListener('mouseleave', () => {
          sceneLabel.style.background = 'rgba(0, 0, 0, 0.8)';
          sceneLabel.style.transform = 'scale(1)';
        });

        videoContainer.appendChild(sceneLabel);
      }

      // Add a subtle entrance animation
      videoContainer.style.opacity = '0';
      videoContainer.style.transform = `${originalTransform} scale(0.9)`;

      // Trigger entrance animation after a brief delay
      setTimeout(() => {
        videoContainer.style.opacity = '1';
        videoContainer.style.transform = originalTransform;
      }, 100);

      // IMPORTANT: Add container to the same parent as the original frame
      // This is the key step that was missing - positioning the video container
      parentContainer.appendChild(videoContainer);
      
      console.log(`🎬 Setting up video controls for frame ${originalFrameId}...`);
      
      // Set up video controls and event handlers
      setupControlsWhenReady();
      
      console.log(`✅ Video container created and positioned successfully for ${originalFrameId}`);
      console.log(`🎬 Video container size: ${boxSize.width}x${boxSize.height}`);
      console.log(`🎬 Video container added to parent:`, parentContainer);
      console.log(`🎬 Play button element:`, playButton);
      console.log(`🎬 Video element:`, videoElement);
      return videoContainer;

    } catch (error) {
      console.error(`❌ Error creating video container for ${originalFrameId}:`, error);
      return null;
    }
  }
}


