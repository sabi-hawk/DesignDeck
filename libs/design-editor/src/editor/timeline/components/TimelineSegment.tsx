import React from 'react';
import { getSegmentStyles } from '../styles/segmentStyles';
import { animationOrderNumberStyles } from '../styles/timelineStyles';
import { SceneLabel } from './SceneLabel';
import { TimelineThumbnail } from './TimelineThumbnail';

interface TimelineSegmentProps {
  segmentIndex: number;
  frame: any;
  segmentWidth: number;
  timelineScale: number;
  parentFrameGroupInfo: any;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  getSceneNumber: (parentFrameId: string) => number;
  hasCompletedAnimation: (parentFrameId: string) => boolean;
  sceneRelativeIndex: number;
}

export const TimelineSegment: React.FC<TimelineSegmentProps> = ({
  segmentIndex,
  frame,
  segmentWidth,
  timelineScale,
  parentFrameGroupInfo,
  isFirstInGroup,
  isLastInGroup,
  getSceneNumber,
  hasCompletedAnimation,
  sceneRelativeIndex
}) => {
  const startTime = segmentIndex * timelineScale;
  const borderColor = frame?.parentFrameBorderColor || '#ff0000';

  return (
    <div
      key={segmentIndex}
      css={getSegmentStyles(segmentWidth, parentFrameGroupInfo, isFirstInGroup, isLastInGroup, frame)}
    >
      {/* Scene Label - Above Timeline Border */}
      {parentFrameGroupInfo && isFirstInGroup && (
        <SceneLabel
          frame={frame}
          getSceneNumber={getSceneNumber}
          hasCompletedAnimation={hasCompletedAnimation}
          parentFrameId={parentFrameGroupInfo.parentFrameId}
        />
      )}

      {/* Animation Order Number - Top Left Corner of each box */}
      <div css={animationOrderNumberStyles(borderColor)}>
        {sceneRelativeIndex + 1}
      </div>

      {/* Thumbnail if frames exist */}
      {frame && (
        <TimelineThumbnail
          frame={frame}
          startTime={startTime}
        />
      )}
    </div>
  );
};
