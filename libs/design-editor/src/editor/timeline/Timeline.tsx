import React, { FC } from 'react';
import { useEditor } from '../../hooks';
import AnimationPopup from '../AnimationPopup';
import { TimelineContent } from './components/TimelineContent';
import { useTimelineAnimation } from './hooks/useTimelineAnimation';
import { useTimelineData } from './hooks/useTimelineData';
import { 
  timelineContainerStyles, 
  timelineContainerHiddenStyles,
  arrowButtonStyles,
  timelineHeaderStyles,
  timelineHeaderTextStyles,
  timelineContentStyles
} from './styles/timelineStyles';

interface TimelineProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const Timeline: FC<TimelineProps> = ({ isVisible, onToggle }) => {
  const {
    state: { pages },
  } = useEditor();

  const { animationService, currentFrames } = useTimelineData(pages);
  const {
    showAnimationPopup,
    selectedElementId,
    selectedElementType,
    selectedElementName,
    setShowAnimationPopup,
    handleAnimateWithSettings
  } = useTimelineAnimation(animationService);

  // Calculate timeline scale and duration based on captured frames
  const timelineScale = 10; // Fixed 10-second intervals
  const totalTimelineDuration = Math.max(
    currentFrames.length * timelineScale,
    100
  ); // Show at least 100 seconds

  // Calculate the width needed for each 10-second segment
  const segmentWidth = 120; // 120px per 10-second segment

  return (
    <>
      {/* Animation Popup */}
      <AnimationPopup
        elementId={selectedElementId}
        elementName={selectedElementName}
        elementType={selectedElementType}
        isVisible={showAnimationPopup}
        onAnimate={handleAnimateWithSettings}
        onClose={() => setShowAnimationPopup(false)}
      />

      {/* Timeline Container - Always present but slides up/down */}
      <div
        css={[
          timelineContainerStyles,
          !isVisible && timelineContainerHiddenStyles
        ]}
      >
        {/* Arrow Button - Positioned at top center of timeline */}
        <div
          css={arrowButtonStyles}
          onClick={onToggle}
        >
          {isVisible ? '▼' : '▲'}
        </div>

        {/* Timeline Header */}
        <div css={timelineHeaderStyles}>
          <div css={timelineHeaderTextStyles}>
            Timeline ({animationService.getAnimatedElementIds().length} animated)
          </div>
        </div>

        {/* Timeline Content */}
        <div css={timelineContentStyles}>
          <TimelineContent
            animationService={animationService}
            pages={pages}
            segmentWidth={segmentWidth}
            timelineScale={timelineScale}
          />
        </div>
      </div>
    </>
  );
};

export { Timeline as default };
