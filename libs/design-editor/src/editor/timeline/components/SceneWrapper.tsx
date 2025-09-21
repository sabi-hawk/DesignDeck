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
  border: `2px solid ${borderColor}`,
  borderRadius: '8px',
  padding: '8px',
  paddingTop: '12px', // Space for scene label
  background: 'rgba(0, 0, 0, 0.1)',
  minWidth: totalWidth + 16, // Add padding width
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
  const totalWidth = segments.length * (segmentWidth + 4); // Include gap between segments

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
        {segments.map(({ segmentIndex, frame, sceneRelativeIndex }) => (
          <div
            key={segmentIndex}
            css={{
              position: 'relative',
              width: segmentWidth,
              height: '80px',
              background: 'rgba(64, 87, 109, 0.1)',
              border: `2px solid ${borderColor}`,
              borderRadius: '6px',
              overflow: 'hidden',
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
        ))}
      </div>
    </div>
  );
};
