import { css } from '@emotion/react';

export const getSegmentStyles = (
  segmentWidth: number,
  parentFrameGroupInfo: any,
  isFirstInGroup: boolean,
  isLastInGroup: boolean,
  frame: any
) => {
  const baseStyles = css`
    width: ${segmentWidth}px;
    height: 100%;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  `;

  if (!parentFrameGroupInfo) {
    return baseStyles;
  }

  const borderColor = frame?.parentFrameBorderColor || '#ff0000';

  return css`
    ${baseStyles}
    border: none;
    border-left: ${isFirstInGroup ? `2px solid ${borderColor}` : 'none'};
    border-top: 2px solid ${borderColor};
    border-bottom: 2px solid ${borderColor};
    border-right: ${isLastInGroup ? `2px solid ${borderColor}` : 'none'};
    border-radius: ${isFirstInGroup && isLastInGroup
      ? '8px'
      : isFirstInGroup
      ? '8px 0 0 8px'
      : isLastInGroup
      ? '0 8px 8px 0'
      : '0'};
    margin-left: ${isFirstInGroup ? '2px' : '0'};
    margin-right: ${isLastInGroup ? '2px' : '0'};
    margin-top: 2px;
    margin-bottom: 2px;
    z-index: 10;

    ${isLastInGroup && css`
      border-right: 2px solid ${borderColor} !important;
    `}
  `;
};
