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

  // Calculate total width for all scenes
  const totalSceneWidth = sortedScenes.reduce((total, [, segments]) => {
    return total + (segments.length * segmentWidth) + 40; // Add margin between scenes
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
                parentFrameId={parentFrameId}
                sceneNumber={sceneNumber}
                segments={segments}
                segmentWidth={segmentWidth}
                timelineScale={timelineScale}
                borderColor={borderColor}
                hasCompletedAnimation={hasCompleted}
                getSceneNumber={(id) => getSceneNumber(id, pages)}
                hasCompletedAnimationFn={(id) => hasCompletedAnimation(id, framesByParent)}
                pages={pages}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
