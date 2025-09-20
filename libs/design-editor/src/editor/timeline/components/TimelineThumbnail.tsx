import React from 'react';
import { 
  thumbnailStyles, 
  debugInfoStyles, 
  processingOverlayStyles, 
  spinningAnimationStyles, 
  processingTextStyles,
  failedOverlayStyles,
  errorIconStyles,
  errorTextStyles,
  successOverlayStyles,
  playButtonIconStyles,
  successIconStyles,
  successTextStyles,
  imageStyles,
  invalidImageStyles
} from '../styles/timelineStyles';

interface TimelineThumbnailProps {
  frame: any;
  startTime: number;
}

export const TimelineThumbnail: React.FC<TimelineThumbnailProps> = ({
  frame,
  startTime
}) => {
  const hasResultUrl = !!frame.resultUrl;

  return (
    <div
      css={thumbnailStyles(hasResultUrl)}
      onClick={() => {
        if (frame.resultUrl) {
          window.open(frame.resultUrl, '_blank');
        }
      }}
    >
      {/* Debug info */}
      <div css={debugInfoStyles}>
        {frame.imageDataUrl
          ? `${Math.round(frame.imageDataUrl.length / 1024)}KB`
          : '0KB'}
      </div>

      {/* Processing Status Overlay */}
      {!frame.resultUrl && frame.progress !== -1 && (
        <div css={processingOverlayStyles}>
          {/* Spinning Animation */}
          <div css={spinningAnimationStyles} />
          {/* Processing Text */}
          <div css={processingTextStyles}>
            Processing...
          </div>
        </div>
      )}

      {/* Failed Processing Overlay */}
      {frame.progress === -1 && (
        <div css={failedOverlayStyles}>
          {/* Error Icon */}
          <div css={errorIconStyles}>
            ❌
          </div>
          {/* Error Text */}
          <div css={errorTextStyles}>
            Failed
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {frame.resultUrl && (
        <div css={successOverlayStyles}>
          {/* Play Button Icon - Top Left */}
          <div css={playButtonIconStyles}>
            <svg
              fill="none"
              height="10"
              viewBox="0 0 24 24"
              width="10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5V19L19 12L8 5Z" fill="white" />
            </svg>
          </div>

          {/* Success Icon */}
          <div css={successIconStyles}>
            ✅
          </div>
          {/* Success Text */}
          <div css={successTextStyles}>
            Ready
          </div>
        </div>
      )}

      {/* Try to display the image */}
      {frame?.imageDataUrl && frame.imageDataUrl.startsWith('data:image/') ? (
        <img
          alt={`Frame at ${startTime}s`}
          css={imageStyles}
          src={frame.imageDataUrl}
          onAbort={() => {
            // Image loading aborted
          }}
          onError={(e) => {
            console.warn(`Failed to load image for segment ${startTime}s`);
          }}
          onLoad={() => {
            // Image loaded successfully
          }}
        />
      ) : (
        <div css={invalidImageStyles}>
          Invalid Image Data
        </div>
      )}
    </div>
  );
};
