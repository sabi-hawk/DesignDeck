import { css } from '@emotion/react';
import React from 'react';
import { SceneLabel } from './SceneLabel';

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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Animation Order Number - Top Left Corner */}
            <div css={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '3px',
              zIndex: 10,
              border: `1px solid ${borderColor}`,
            }}>
              {sceneRelativeIndex + 1}
            </div>

            {/* Thumbnail Content */}
            {frame && (
              <div css={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {frame.progress === 100 && frame.resultUrl ? (
                  <div css={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    <div css={{ textAlign: 'center' }}>
                      <div>✓</div>
                      <div style={{ fontSize: '8px', marginTop: '2px' }}>Ready</div>
                    </div>
                  </div>
                ) : frame.progress > 0 ? (
                  <div css={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}>
                    {frame.progress}%
                  </div>
                ) : (
                  <div css={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(107, 114, 128, 0.2)',
                    color: '#6b7280',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}>
                    Processing...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
