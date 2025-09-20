import { css } from '@emotion/react';
import React from 'react';
import { sceneLabelContainerStyles, sceneTextStyles, scenePlayButtonStyles } from '../styles/timelineStyles';

interface SceneLabelProps {
  parentFrameId: string;
  frame: any;
  getSceneNumber: (parentFrameId: string) => number;
  hasCompletedAnimation: (parentFrameId: string) => boolean;
}

export const SceneLabel: React.FC<SceneLabelProps> = ({
  parentFrameId,
  frame,
  getSceneNumber,
  hasCompletedAnimation
}) => {
  const borderColor = frame?.parentFrameBorderColor || '#ff0000';

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
          onClick={() => {
            // Clear selection when scene play button is clicked
            const clearSelectionEvent = new CustomEvent('clearSelectionOnPlay');
            document.dispatchEvent(clearSelectionEvent);
            
            // TODO: Implement scene play functionality
            console.log(`Playing scene ${getSceneNumber(parentFrameId)}`);
          }}
        >
          ▶️ Play
        </button>
      )}
    </div>
  );
};
