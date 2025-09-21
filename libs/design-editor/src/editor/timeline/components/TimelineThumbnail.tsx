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
  sceneRelativeIndex?: number;
}

export const TimelineThumbnail: React.FC<TimelineThumbnailProps> = ({
  frame,
  startTime,
  sceneRelativeIndex
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

      {/* Animation Order Number - Top Left Corner */}
      {sceneRelativeIndex !== undefined && (
        <div css={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: '3px',
          zIndex: 20,
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}>
          {sceneRelativeIndex + 1}
        </div>
      )}

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

      {/* Duration Display - Below Thumbnail */}
      {frame?.settings?.sketchingDuration && (
        <div css={{
          position: 'absolute',
          bottom: '-32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: '6px',
          zIndex: 50,
          border: '2px solid rgba(255, 255, 255, 0.6)',
          whiteSpace: 'nowrap',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.7)',
          minWidth: '30px',
          textAlign: 'center',
        }}>
          {frame.settings.sketchingDuration}s
        </div>
      )}
    </div>
  );
};
