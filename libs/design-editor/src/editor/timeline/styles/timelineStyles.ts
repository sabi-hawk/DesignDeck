import { css } from '@emotion/react';

export const timelineContainerStyles = css`
  position: fixed;
  bottom: 0;
  left: 433px;
  right: 0;
  background: #1a202c;
  border-top: 2px solid #667eea;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  height: 220px;
  transition: bottom 0.3s ease;
  margin: 0 auto;
  max-width: calc(100vw - 146px);
`;

export const timelineContainerHiddenStyles = css`
  bottom: -220px;
`;

export const arrowButtonStyles = css`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 24px;
  background: #667eea;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.3);
  color: white;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: #5a67d8;
    transform: translateX(-50%) translateY(-2px);
  }
`;

export const timelineHeaderStyles = css`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #4a5568;
  background: rgba(255, 255, 255, 0.05);
`;

export const timelineHeaderTextStyles = css`
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

export const timelineContentStyles = css`
  padding: 8px 16px 8px 16px;
  height: 188px;
`;

export const timelineRulerStyles = css`
  height: 130px;
  border-radius: 8px;
  position: relative;
  overflow: visible;
  margin-bottom: 20px;
  padding-top: 30px;
`;

export const timelineScrollContainerStyles = css`
  width: 100%;
  height: 100%;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

export const timelineContentContainerStyles = (timelineWidth: number) => css`
  width: ${timelineWidth}px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
`;

export const sceneLabelContainerStyles = css`
  position: absolute;
  top: -25px;
  left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 30;
`;

export const sceneTextStyles = (borderColor: string) => css`
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border: 1px solid ${borderColor};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

export const scenePlayButtonStyles = (borderColor: string) => css`
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid ${borderColor};
  border-radius: 3px;
  color: white;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const animationOrderNumberStyles = (borderColor: string) => css`
  position: absolute;
  top: 4px;
  left: 11px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border: 2px solid ${borderColor};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

export const thumbnailStyles = (hasResultUrl: boolean) => css`
  height: 70px;
  width: 100px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: absolute;
  top: 25px;
  cursor: ${hasResultUrl ? 'pointer' : 'default'};

  ${hasResultUrl && css`
    &:hover {
      border: 1px solid #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  `}
`;

export const debugInfoStyles = css`
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 8px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 1px 2px;
  border-radius: 2px;
  z-index: 10;
`;

export const processingOverlayStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 15;
  border-radius: 4px;
`;

export const spinningAnimationStyles = css`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 4px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const processingTextStyles = css`
  color: white;
  font-size: 8px;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const failedOverlayStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(220, 38, 38, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 15;
  border-radius: 4px;
`;

export const errorIconStyles = css`
  color: white;
  font-size: 16px;
  margin-bottom: 4px;
`;

export const errorTextStyles = css`
  color: white;
  font-size: 8px;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const successOverlayStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 185, 129, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 15;
  border-radius: 4px;
`;

export const playButtonIconStyles = css`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 16;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

export const successIconStyles = css`
  color: white;
  font-size: 16px;
  margin-bottom: 4px;
`;

export const successTextStyles = css`
  color: white;
  font-size: 8px;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

export const imageStyles = css`
  height: 100%;
  object-fit: contain;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  display: block;
`;

export const invalidImageStyles = css`
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 4px;
`;
