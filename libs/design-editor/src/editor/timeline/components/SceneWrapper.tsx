import { css } from '@emotion/react';
import React from 'react';
import { useTimelineDragDrop } from '../hooks/useTimelineDragDrop';
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
  animationService: any;
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
  pointerEvents: 'auto',
});

export const SceneWrapper: React.FC<SceneWrapperProps> = ({
  animationService,
  borderColor,
  getSceneNumber,
  hasCompletedAnimation,
  hasCompletedAnimationFn,
  pages,
  parentFrameId,
  sceneNumber,
  segments,
  segmentWidth,
  timelineScale
}) => {
  const handleReorder = React.useCallback((sceneId: string, fromIndex: number, toIndex: number) => {
    animationService.reorderFramesInScene(sceneId, fromIndex, toIndex);
  }, [animationService]);

  const {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragOver,
    isBeingDragged,
  } = useTimelineDragDrop({
    animationService,
    onReorder: handleReorder,
  });

  // Debug: Log when handlers are created
  React.useEffect(() => {
    console.log('SceneWrapper handlers created:', {
      hasHandleDragStart: !!handleDragStart,
      hasHandleDragOver: !!handleDragOver,
      hasHandleDrop: !!handleDrop,
      sceneNumber,
      parentFrameId
    });
  }, [handleDragStart, handleDragOver, handleDrop, sceneNumber, parentFrameId]);
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
          const isDragOverThis = isDragOver(sceneNumber, sceneRelativeIndex);
          const isBeingDraggedThis = isBeingDragged(sceneNumber, sceneRelativeIndex);
          
          
          return (
            <div
              key={segmentIndex}
              css={[
                {
                  position: 'relative',
                  width: `${dynamicWidth}px`,
                  height: '80px',
                  background: 'rgba(64, 87, 109, 0.1)',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '6px',
                  // overflow: 'hidden',
                },
                isDragOverThis && {
                  border: '2px dashed #007acc',
                  backgroundColor: 'rgba(0, 122, 204, 0.1)',
                }
              ]}
              onDragStart={(e) => {
                console.log('Parent div drag start intercepted:', e);
                // Don't prevent default here, let it bubble to child
              }}
              onMouseDown={(e) => {
                console.log('Parent div mouse down:', e);
              }}
            >

              {/* Thumbnail Content */}
              {frame && (
                <TimelineThumbnail
                  elementIndex={sceneRelativeIndex}
                  frame={frame}
                  isBeingDragged={isBeingDraggedThis}
                  isDraggable={true}
                  isDragOver={isDragOverThis}
                  sceneIndex={sceneNumber}
                  sceneRelativeIndex={sceneRelativeIndex}
                  startTime={segmentIndex * timelineScale}
                  onDragEnd={handleDragEnd}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
