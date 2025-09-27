import React from 'react';
import { ScenePlaybackService } from '../../animation/scenePlaybackService';
import { sceneLabelContainerStyles, sceneTextStyles, scenePlayButtonStyles } from '../styles/timelineStyles';

interface SceneLabelProps {
  parentFrameId: string;
  frame: any;
  getSceneNumber: (parentFrameId: string) => number;
  hasCompletedAnimation: (parentFrameId: string) => boolean;
  segments?: Array<{
    segmentIndex: number;
    frame: any;
    sceneRelativeIndex: number;
  }>;
}

export const SceneLabel: React.FC<SceneLabelProps> = ({
  parentFrameId,
  frame,
  getSceneNumber,
  hasCompletedAnimation,
  segments = []
}) => {
  const borderColor = frame?.parentFrameBorderColor || '#ff0000';

  const handleScenePlay = () => {
    // Clear selection when scene play button is clicked
    const clearSelectionEvent = new CustomEvent('clearSelectionOnPlay');
    document.dispatchEvent(clearSelectionEvent);
    
    // Get the scene playback service
    const scenePlaybackService = ScenePlaybackService.getInstance();
    
    // Prepare elements for sequential playback
    const elements = segments
      .filter(segment => segment.frame?.resultUrl) // Only include elements with videos
      .map(segment => ({
        elementId: segment.frame.elementId,
        frame: segment.frame,
        sceneRelativeIndex: segment.sceneRelativeIndex
      }));
    
    if (elements.length === 0) {
      console.warn(`⚠️ No video elements found in scene ${getSceneNumber(parentFrameId)}`);
      return;
    }
    
    console.log(`🎬 Starting scene playback for scene ${getSceneNumber(parentFrameId)} with ${elements.length} elements`);
    
    // Start sequential playback
    scenePlaybackService.startScenePlayback(parentFrameId, elements);
  };

  return (
    <div css={sceneLabelContainerStyles}>
      {/* Scene Text */}
      <div css={sceneTextStyles(borderColor)}>
        Scene {getSceneNumber(parentFrameId)}
      </div>
      
      {/* Play Button - Only show if scene has completed animation */}
      {hasCompletedAnimation(parentFrameId) && (
        <button
          css={scenePlayButtonStyles(borderColor)}
          onClick={handleScenePlay}
        >
          <span role="img" aria-label="Play">▶️</span> Play
        </button>
      )}
    </div>
  );
};
