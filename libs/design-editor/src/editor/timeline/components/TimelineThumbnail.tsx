import React, { useState, useEffect } from 'react';
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
  invalidImageStyles,
  progressBarStyles,
  progressBarFillStyles
} from '../styles/timelineStyles';

interface TimelineThumbnailProps {
  frame: {
    id: string;
    elementId: string;
    parentFrameId: string;
    imageDataUrl?: string;
    resultUrl?: string;
    progress?: number;
    settings?: {
      sketchingDuration: number;
    };
  };
  startTime: number;
  sceneRelativeIndex?: number;
  sceneIndex?: number;
  elementIndex?: number;
  isDraggable?: boolean;
  isDragOver?: boolean;
  isBeingDragged?: boolean;
  onDragStart?: (elementId: string, sceneIndex: number, elementIndex: number, event: React.DragEvent) => void;
  onDragOver?: (sceneIndex: number, elementIndex: number, event: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (sceneId: string, sceneIndex: number, elementIndex: number, event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export const TimelineThumbnail: React.FC<TimelineThumbnailProps> = ({
  frame,
  startTime,
  sceneRelativeIndex,
  sceneIndex,
  elementIndex,
  isDraggable = false,
  isDragOver = false,
  isBeingDragged = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const hasResultUrl = !!frame.resultUrl;
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Track video progress for this specific element
  useEffect(() => {
    if (!hasResultUrl) return;

    const handleVideoProgress = (event: CustomEvent) => {
      const { elementId, progress, isPlaying } = event.detail;
      if (elementId === frame.elementId) {
        setVideoProgress(progress);
        setIsVideoPlaying(isPlaying);
      }
    };

    const handleVideoPlay = (event: CustomEvent) => {
      const { elementId } = event.detail;
      if (elementId === frame.elementId) {
        setIsVideoPlaying(true);
      }
    };

    const handleVideoPause = (event: CustomEvent) => {
      const { elementId } = event.detail;
      if (elementId === frame.elementId) {
        setIsVideoPlaying(false);
      }
    };

    const handleVideoEnd = (event: CustomEvent) => {
      const { elementId } = event.detail;
      if (elementId === frame.elementId) {
        setIsVideoPlaying(false);
        setVideoProgress(0);
      }
    };

    // Listen for video progress events
    document.addEventListener('videoProgress', handleVideoProgress as EventListener);
    document.addEventListener('videoPlay', handleVideoPlay as EventListener);
    document.addEventListener('videoPause', handleVideoPause as EventListener);
    document.addEventListener('videoEnd', handleVideoEnd as EventListener);

    return () => {
      document.removeEventListener('videoProgress', handleVideoProgress as EventListener);
      document.removeEventListener('videoPlay', handleVideoPlay as EventListener);
      document.removeEventListener('videoPause', handleVideoPause as EventListener);
      document.removeEventListener('videoEnd', handleVideoEnd as EventListener);
    };
  }, [hasResultUrl, frame.elementId]);

  const handleDragStart = (event: React.DragEvent) => {
    console.log('TimelineThumbnail drag start triggered:', { isDraggable, sceneIndex, elementIndex, hasOnDragStart: !!onDragStart });
    if (isDraggable && onDragStart && sceneIndex !== undefined && elementIndex !== undefined) {
      // Don't prevent default - let the browser handle the drag
      event.stopPropagation();
      onDragStart(frame.elementId, sceneIndex, elementIndex, event);
    }
  };

  // Add a simple test to see if the element is draggable
  React.useEffect(() => {
    console.log('TimelineThumbnail mounted with props:', { 
      isDraggable, 
      sceneIndex, 
      elementIndex, 
      hasOnDragStart: !!onDragStart,
      frameId: frame.elementId 
    });
  }, [isDraggable, sceneIndex, elementIndex, onDragStart, frame.elementId]);

  // Add a simple test to see if drag events work at all
  const handleMouseDown = (event: React.MouseEvent) => {
    console.log('Mouse down on thumbnail:', event);
    // Don't interfere with native drag behavior
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // console.log('Mouse move on thumbnail:', event);
  };

  const handleDragOver = (event: React.DragEvent) => {
    console.log('TimelineThumbnail drag over triggered:', { isDraggable, sceneIndex, elementIndex, hasOnDragOver: !!onDragOver });
    if (isDraggable && onDragOver && sceneIndex !== undefined && elementIndex !== undefined) {
      event.preventDefault(); // This is needed for drop to work
      event.stopPropagation();
      onDragOver(sceneIndex, elementIndex, event);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    console.log('TimelineThumbnail drop triggered:', { isDraggable, sceneIndex, elementIndex, hasOnDrop: !!onDrop });
    if (isDraggable && onDrop && sceneIndex !== undefined && elementIndex !== undefined) {
      event.preventDefault(); // This is needed for drop to work
      event.stopPropagation();
      onDrop(frame.parentFrameId, sceneIndex, elementIndex, event);
    }
  };

  return (
    <div
        css={[
          thumbnailStyles(hasResultUrl),
          isDragOver && {
            border: '2px dashed #007acc',
            backgroundColor: 'rgba(0, 122, 204, 0.1)',
          },
          isBeingDragged && {
            opacity: 0.5,
            transform: 'rotate(5deg)',
          }
        ]}
        draggable={isDraggable}
        style={{
          cursor: isDraggable ? 'grab' : 'default',
        }}
        onDragEnd={(e) => {
          console.log('onDragEnd called');
          onDragEnd?.();
        }}
        onDragLeave={onDragLeave}
        onDragOver={handleDragOver}
        onDragStart={(e) => {
          console.log('Raw onDragStart event fired!', e);
          handleDragStart(e);
        }}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        // onClick={() => {
        //   if (frame.resultUrl) {
        //     window.open(frame.resultUrl, '_blank');
        //   }
        // }}
      >
      {/* Debug info */}
      <div css={debugInfoStyles} draggable={false}>
        {frame.imageDataUrl
          ? `${Math.round(frame.imageDataUrl.length / 1024)}KB`
          : '0KB'}
      </div>

      {/* Animation Order Number - Top Left Corner */}
      {sceneRelativeIndex !== undefined && (
        <div
          css={{
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
          }}
          draggable={false}
        >
          {sceneRelativeIndex + 1}
        </div>
      )}

      {/* Processing Status Overlay */}
      {!frame.resultUrl && frame.progress !== -1 && (
        <div css={processingOverlayStyles} draggable={false}>
          {/* Spinning Animation */}
          <div css={spinningAnimationStyles} />
          {/* Processing Text */}
          <div css={processingTextStyles}>Processing...</div>
        </div>
      )}

      {/* Failed Processing Overlay */}
      {frame.progress === -1 && (
        <div css={failedOverlayStyles} draggable={false}>
          {/* Error Icon */}
          <div css={errorIconStyles}>
            <span aria-label="Error" role="img">❌</span>
          </div>
          {/* Error Text */}
          <div css={errorTextStyles}>Failed</div>
        </div>
      )}

      {/* Success Overlay */}
      {frame.resultUrl && (
        <div css={successOverlayStyles} draggable={false}>
          {/* Play Button Icon - Top Left */}
          <div
            css={playButtonIconStyles}
            onClick={() => {
              if (frame.resultUrl) {
                window.open(frame.resultUrl, '_blank');
              }
            }}
          >
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
            <span aria-label="Success" role="img">✅</span>
          </div>
          {/* Success Text */}
          <div css={successTextStyles}>Ready</div>
        </div>
      )}

      {/* Try to display the image */}
      {frame?.imageDataUrl && frame.imageDataUrl.startsWith('data:image/') ? (
        <img
          alt={`Frame at ${startTime}s`}
          css={imageStyles}
          draggable={false}
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
        <div css={invalidImageStyles} draggable={false}>Invalid Image Data</div>
      )}

      {/* Duration Display - Below Thumbnail */}
      {frame?.settings?.sketchingDuration && (
        <div
          css={{
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
          }}
          draggable={false}
        >
          {frame.settings.sketchingDuration}s
        </div>
      )}

      {/* Video Progress Bar - Bottom of Thumbnail */}
      {hasResultUrl && (isVideoPlaying || videoProgress > 0) && (
        <div css={progressBarStyles}>
          <div 
            css={progressBarFillStyles}
            style={{ width: `${videoProgress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
