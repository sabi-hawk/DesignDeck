import React from 'react';
import { 
  timelineRulerStyles, 
  timelineScrollContainerStyles, 
  timelineContentContainerStyles 
} from '../styles/timelineStyles';
import { 
  getFramesByParentFrame, 
  getSceneNumber,
  hasCompletedAnimation,
  getAnimatedSegments
} from '../utils/timelineUtils';
import { SceneWrapper } from './SceneWrapper';

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
  const animatedSegments = getAnimatedSegments(framesByIndex);

  // Group segments by parent frame (scene)
  const sceneGroups = new Map<string, Array<{
    segmentIndex: number;
    frame: any;
    sceneRelativeIndex: number;
  }>>();

  // Organize segments by parent frame
  animatedSegments.forEach(({ segmentIndex, frame, sceneRelativeIndex }) => {
    const parentFrameId = frame.parentFrameId;
    if (!sceneGroups.has(parentFrameId)) {
      sceneGroups.set(parentFrameId, []);
    }
    sceneGroups.get(parentFrameId)!.push({
      segmentIndex,
      frame,
      sceneRelativeIndex
    });
  });

  // Sort scenes by their first segment index to maintain order
  const sortedScenes = Array.from(sceneGroups.entries()).sort(([, segmentsA], [, segmentsB]) => {
    const minIndexA = Math.min(...segmentsA.map(s => s.segmentIndex));
    const minIndexB = Math.min(...segmentsB.map(s => s.segmentIndex));
    return minIndexA - minIndexB;
  });

  // Calculate dynamic segment width based on duration
  const calculateSegmentWidth = (duration: number): number => {
    const minWidth = 60; // Minimum visible width
    const maxWidth = 200; // Maximum width for 10 seconds
    
    // Scale from 1-10 seconds to minWidth-maxWidth
    const scale = (duration - 1) / (10 - 1); // 0 to 1 scale
    const dynamicWidth = minWidth + (scale * (maxWidth - minWidth));
    
    return Math.max(dynamicWidth, minWidth); // Ensure minimum width
  };

  // Calculate total width for all scenes based on dynamic segment widths
  const totalSceneWidth = sortedScenes.reduce((total, [, segments]) => {
    const sceneWidth = segments.reduce((sceneTotal, segment) => {
      const duration = segment.frame?.settings?.sketchingDuration || 5; // Default to 5 seconds
      return sceneTotal + calculateSegmentWidth(duration) + 4; // Include gap
    }, 0);
    return total + sceneWidth + 40; // Add margin between scenes
  }, 0);
  
  const timelineWidth = Math.max(totalSceneWidth, 800);

  return (
    <div css={timelineRulerStyles}>
      <div css={timelineScrollContainerStyles}>
        <div css={timelineContentContainerStyles(timelineWidth)}>
          {/* Scene Wrappers */}
          {sortedScenes.map(([parentFrameId, segments]) => {
            const firstFrame = segments[0]?.frame;
            const borderColor = firstFrame?.parentFrameBorderColor || '#ff0000';
            const sceneNumber = getSceneNumber(parentFrameId, pages);
            const hasCompleted = hasCompletedAnimation(parentFrameId, framesByParent);

            return (
              <SceneWrapper
                key={parentFrameId}
                animationService={animationService}
                borderColor={borderColor}
                getSceneNumber={(id) => getSceneNumber(id, pages)}
                hasCompletedAnimation={hasCompleted}
                hasCompletedAnimationFn={(id) => hasCompletedAnimation(id, framesByParent)}
                pages={pages}
                parentFrameId={parentFrameId}
                sceneNumber={sceneNumber}
                segmentWidth={segmentWidth}
                segments={segments}
                timelineScale={timelineScale}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
