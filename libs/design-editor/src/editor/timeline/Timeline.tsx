import { css } from '@emotion/react';
import React, { FC } from 'react';
import { useEditor } from '../../hooks';
import AnimationPopup from '../AnimationPopup';
import { TimelineContent } from './components/TimelineContent';
import { useTimelineAnimation } from './hooks/useTimelineAnimation';
import { useTimelineData } from './hooks/useTimelineData';
import {
  timelineContainerHiddenStyles,
  arrowButtonStyles,
  timelineHeaderStyles,
  timelineHeaderTextStyles,
  timelineContentStyles,
} from './styles/timelineStyles';

interface TimelineProps {
  isVisible: boolean;
  onToggle: () => void;
  isSidebarPopupOpen?: boolean;
}

export const Timeline: FC<TimelineProps> = ({
  isVisible,
  onToggle,
  isSidebarPopupOpen = true,
}) => {
  const {
    state: { pages },
  } = useEditor();

  const { animationService, refreshKey } = useTimelineData(pages);
  const {
    showAnimationPopup,
    selectedElementId,
    selectedElementType,
    selectedElementName,
    setShowAnimationPopup,
    handleAnimateWithSettings,
  } = useTimelineAnimation(animationService);

  // Calculate timeline scale and duration based on captured frames
  const timelineScale = 10; // Fixed 10-second intervals

  // Calculate the width needed for each 10-second segment
  const segmentWidth = 120; // 120px per 10-second segment

  // Dynamic timeline container styles based on sidebar popup state
  // Calculate responsive sidebar widths using viewport units with minimum values
  const sidebarClosedWidth = 'max(73px, 3.8vw)'; // Tab bar only
  const sidebarOpenWidth = 'max(433px, 22.5vw)'; // Tab bar + popup

  const dynamicTimelineStyles = css`
    position: fixed;
    bottom: 0;
    left: ${isSidebarPopupOpen ? sidebarOpenWidth : sidebarClosedWidth};
    right: 0;
    background: #1a202c;
    border-top: 2px solid #667eea;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    height: 220px;
    transition: left 0.3s ease, bottom 0.3s ease;
    pointer-events: auto;
  `;

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
          dynamicTimelineStyles,
          !isVisible && timelineContainerHiddenStyles,
        ]}
      >
        {/* Arrow Button - Positioned at top center of timeline */}
        <div css={arrowButtonStyles} onClick={onToggle}>
          {isVisible ? '▼' : '▲'}
        </div>

        {/* Timeline Header */}
        <div css={timelineHeaderStyles}>
          <div css={timelineHeaderTextStyles}>
            Timeline ({animationService.getAnimatedElementIds().length}{' '}
            animated)
          </div>
        </div>

        {/* Timeline Content */}
        <div css={timelineContentStyles}>
          <TimelineContent
            key={refreshKey}
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
