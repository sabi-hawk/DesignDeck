import { css } from '@emotion/react';
import React from 'react';
import { SceneLabel } from './SceneLabel';
import { TimelineThumbnail } from './TimelineThumbnail';

interface SceneWrapperProps {
  parentFrameId: string;
  sceneNumber: number;
  segments: Array<{
    segmentIndex: number;
    frame: any;
    sceneRelativeIndex: number;
  }>;
  segmentWidth: number;
  timelineScale: number;
  borderColor: string;
  hasCompletedAnimation: boolean;
  getSceneNumber: (parentFrameId: string) => number;
  hasCompletedAnimationFn: (parentFrameId: string) => boolean;
  pages: any[];
}

const sceneWrapperStyles = (borderColor: string, totalWidth: number) => css({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginRight: '20px',
  marginTop: '15px', // Add space from timeline header
  border: `2px solid ${borderColor}`,
  borderRadius: '8px',
  padding: '8px',
  paddingTop: '12px', // Space for scene label
  // paddingBottom: '30px', // More space for duration display
  background: 'rgba(0, 0, 0, 0.1)',
  minWidth: totalWidth + 16, // Add padding width
  overflow: 'visible', // Allow duration to be visible outside
  '&:last-child': {
    marginRight: 0,
  },
});

const sceneContentStyles = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '4px',
  width: '100%',
  paddingBottom: '30px', // More space for duration display outside thumbnail
  overflow: 'visible', // Allow duration to be visible outside
});

export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  parentFrameId,
  sceneNumber,
  segments,
  segmentWidth,
  timelineScale,
  borderColor,
  hasCompletedAnimation,
  getSceneNumber,
  hasCompletedAnimationFn,
  pages
}) => {
  // Calculate dynamic widths based on duration (1-10 seconds range)
  const calculateSegmentWidth = (duration: number): number => {
    const minWidth = 60; // Minimum visible width
    const maxWidth = 200; // Maximum width for 10 seconds
    
    // Scale from 1-10 seconds to minWidth-maxWidth
    const scale = (duration - 1) / (10 - 1); // 0 to 1 scale
    const dynamicWidth = minWidth + (scale * (maxWidth - minWidth));
    
    return Math.max(dynamicWidth, minWidth); // Ensure minimum width
  };

  // Calculate total width based on dynamic segment widths
  const totalWidth = segments.reduce((total, segment) => {
    const duration = segment.frame?.settings?.sketchingDuration || 5; // Default to 5 seconds
    return total + calculateSegmentWidth(duration) + 4; // Include gap
  }, 0);

  return (
    <div css={sceneWrapperStyles(borderColor, totalWidth)}>
      {/* Scene Label - Positioned at top */}
      <SceneLabel
        frame={segments[0]?.frame}
        getSceneNumber={getSceneNumber}
        hasCompletedAnimation={hasCompletedAnimationFn}
        parentFrameId={parentFrameId}
      />

      {/* Scene Content - Timeline segments */}
      <div css={sceneContentStyles}>
        {segments.map(({ segmentIndex, frame, sceneRelativeIndex }) => {
          const duration = frame?.settings?.sketchingDuration || 5; // Default to 5 seconds
          const dynamicWidth = calculateSegmentWidth(duration);
          
          return (
            <div
              key={segmentIndex}
              css={{
                position: 'relative',
                width: `${dynamicWidth}px`,
                height: '80px',
                background: 'rgba(64, 87, 109, 0.1)',
                border: `2px solid ${borderColor}`,
                borderRadius: '6px',
                // overflow: 'hidden',
              }}
            >

              {/* Thumbnail Content */}
              {frame && (
                <TimelineThumbnail
                  frame={frame}
                  sceneRelativeIndex={sceneRelativeIndex}
                  startTime={segmentIndex * timelineScale}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
