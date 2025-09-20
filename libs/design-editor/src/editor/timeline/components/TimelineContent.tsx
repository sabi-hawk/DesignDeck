import React from 'react';
import { 
  timelineRulerStyles, 
  timelineScrollContainerStyles, 
  timelineContentContainerStyles 
} from '../styles/timelineStyles';
import { 
  getFramesByParentFrame, 
  getParentFrameGroupMapping, 
  getParentFrameGroupInfo,
  getSceneNumber,
  hasCompletedAnimation,
  isFirstInParentFrameGroup,
  isLastInParentFrameGroup,
  getAnimatedSegments
} from '../utils/timelineUtils';
import { TimelineSegment } from './TimelineSegment';

interface TimelineContentProps {
  animationService: any;
  pages: any[];
  segmentWidth: number;
  timelineScale: number;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({
  animationService,
  pages,
  segmentWidth,
  timelineScale
}) => {
  const framesByIndex = animationService.getFramesByIndex();
  const framesByParent = getFramesByParentFrame(framesByIndex);
  const parentFrameGroupMapping = getParentFrameGroupMapping(framesByParent);
  const animatedSegments = getAnimatedSegments(framesByIndex);
  const timelineWidth = animatedSegments.length > 0 ? animatedSegments.length * segmentWidth : 800;

  return (
    <div css={timelineRulerStyles}>
      <div css={timelineScrollContainerStyles}>
        <div css={timelineContentContainerStyles(timelineWidth)}>
          {/* Timeline Segments with Thumbnails */}
          {animatedSegments.map(({ segmentIndex, frame, sceneRelativeIndex }) => {
            const parentFrameGroupInfo = getParentFrameGroupInfo(segmentIndex, parentFrameGroupMapping);
            const isFirstInGroup = isFirstInParentFrameGroup(segmentIndex, parentFrameGroupMapping);
            const isLastInGroup = isLastInParentFrameGroup(segmentIndex, parentFrameGroupMapping);

            return (
              <TimelineSegment
                key={segmentIndex}
                frame={frame}
                getSceneNumber={(parentFrameId) => getSceneNumber(parentFrameId, pages)}
                hasCompletedAnimation={(parentFrameId) => hasCompletedAnimation(parentFrameId, framesByParent)}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                parentFrameGroupInfo={parentFrameGroupInfo}
                sceneRelativeIndex={sceneRelativeIndex}
                segmentIndex={segmentIndex}
                segmentWidth={segmentWidth}
                timelineScale={timelineScale}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
